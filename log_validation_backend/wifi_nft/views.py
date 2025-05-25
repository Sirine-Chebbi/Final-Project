import re
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from rapports_activite.models import Rapports_activite
from auth_app.models import CustomUser
from .models import NftResults

def extract_measure_data(content, filename=None):
    # Pattern principal pour détecter les mesures
    measure_pattern = re.compile(
        r'Mesure <(?P<mesure>[^>]+)>\s*:(?P<description>[^\n]*)\s*Status\s*(?P<status>\d+).*?'
        r'(?P<lim_min>-?\d+\.\d+)\s*(?P<unite_min>[^\s<]+)\s*<\s*\.\.\.\s*<\s*(?P<lim_max>-?\d+\.\d+)\s*(?P<unite_max>[^\s>]+).*?'
        r'(?:\n\s*(?P<valeur>-?\d+\.\d+))\s*(?P<unite_valeur>)?',
        re.DOTALL
    )
    
    # Pattern spécifique pour la durée
    duree_pattern = re.compile(r'Duree\s*(\d+)\s*ms')

    measures = []
    
    # On sépare d'abord chaque mesure individuelle
    raw_measures = re.split(r'(?=\n\s*Mesure <)', content)
    
    for raw_measure in raw_measures:
        if not raw_measure.strip():
            continue
            
        match = measure_pattern.search(raw_measure)
        if not match:
            continue
            
        status_val = int(match.group('status'))
        if status_val == 2:  
            continue
            
        bande, antenne = None, None
        mesure_name = match.group('mesure')
        if '_PWR' in mesure_name:
            parts = mesure_name.split('_')
            for part in parts:
                if part.startswith('PWR'):
                    antenne = int(part[3:]) if part[3:].isdigit() else None
                elif part in ['2G', '5G', '6G', 'ZIGBEE']:
                    bande = part
        
        unite = match.group('unite_valeur') or match.group('unite_max') or match.group('unite_min')
        
        duree_match = duree_pattern.search(raw_measure)
        duree = int(duree_match.group(1)) if duree_match else None
        
        measures.append({
            'mesure': mesure_name,
            'status': status_val,
            'valeur': float(match.group('valeur')),
            'lim_min': float(match.group('lim_min')),
            'lim_max': float(match.group('lim_max')),
            'bande': bande,
            'antenne': antenne,
            'duree': duree,
            'unite': unite if unite != '0' else None,
            'source_file': filename,
        })
    
    return measures

@api_view(['POST'])
def upload_nft_results(request):
    if request.method != 'POST':
        return Response({'status': 'error', 'message': 'Méthode non autorisée'}, 
                       status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    if not request.FILES:
        return Response({'status': 'error', 'message': 'Aucun fichier fourni'},
                       status=status.HTTP_400_BAD_REQUEST)

    total_count = 0
    errors = []
    successful_files = []
    
    # Optionnel: vider les anciennes données
    try:
        user = request.user    
    except CustomUser.DoesNotExist:
        return Response({"error": "Utilisateur non trouvé"}, status=404)

    # Suppression des anciennes données pour cet utilisateur
    NftResults.objects.filter(created_by=user).delete()


    for uploaded_file in request.FILES.getlist('nft_files'):
        try:
            content = uploaded_file.read().decode('latin-1')
            measures = extract_measure_data(content, uploaded_file.name)

            if not measures:
                errors.append(f"Fichier {uploaded_file.name}: aucune mesure valide trouvée")
                continue
                
            objs = [
                NftResults(**measure_data, created_by=user)
                for measure_data in measures
            ]

            created = NftResults.objects.bulk_create(objs)
            total_count += len(created)
            successful_files.append(uploaded_file.name)
            
        except Exception as e:
            errors.append(f"Erreur avec {uploaded_file.name}: {str(e)}")

    if not successful_files:
        return Response({
            'status': 'error',
            'message': 'Aucun fichier valide traité',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    today_date = timezone.localdate()

    try:
        with transaction.atomic():
            rapport_quotidien, created = Rapports_activite.objects.get_or_create(
                utilisateur=user,
                date_rapport=today_date,
                defaults={
                    'nombre_logs_Conduit' : 0,
                    'nombre_logs_Divers'  : 0,
                    'nombre_logs_Temps' : 0,
                    'nombre_logs_Env' : 0,
                }
            )

            # Mettre à jour SEULEMENT le compteur du Test 1
            rapport_quotidien.nombre_logs_Divers += len(successful_files)
            rapport_quotidien.save()

    except Exception as e:
        print(f"Erreur lors de la mise à jour du rapport quotidien: {e}")

    return Response({
        'status': 'success',
        'count': total_count,
        'processed_files': successful_files,
        'errors': errors if errors else None,
        'message': f"{total_count} mesures importées depuis {len(successful_files)} fichier(s)"
    })

@api_view(['GET'])
def get_nft_results(request):
    queryset = NftResults.objects.filter(created_by=request.user).exclude(status=2)
    
    if not queryset.exists():
        return Response({"message": "Aucune donnée disponible"}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    results = []
    for result in queryset:
        res = {
            "mesure": result.mesure,
            "status": result.status,
            "valeur": result.valeur,
            "lim_min": result.lim_min,
            "lim_max": result.lim_max,
            "unite": result.unite,
            "source_file": result.source_file,
        }
        if result.bande:
            res["bande"] = result.bande
        if result.antenne is not None:
            res["antenne"] = result.antenne
        if result.duree:
            res["duree"] = result.duree
        results.append(res)
    
    return Response({
        'count': len(results),
        'results': results
    }, status=status.HTTP_200_OK)
