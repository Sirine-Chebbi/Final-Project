import re
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rapports_activite.models import Rapports_activite
from django.utils import timezone
from django.db import transaction
from auth_app.models import CustomUser
from .models import TempsTest

def extract_test_time_data(content, filename=None):
    cie_pattern = re.compile(
        r'<CIE>\s*Nom\s*:\s*(?P<nom>[^\n]+)\s*\n\s*<CIE>\s*R\S*f\S*rence\s*:\s*(?P<reference>\d+)',
        re.IGNORECASE
    )

    # Pattern pour le temps de test principal
    time_pattern = re.compile(
        r'\[(?P<heure>\d{2}):\d{2}:\d{2}:\d{3}\].*?'
        r'Mesure\s*<(?P<mesure>MES_\w+_Temps_Test)>\s*:[^\n]Status\s(?P<status>\d+).*?\n'
        r'(?:.*?\n)+?'
        r'\s*(?P<valeur>-?\d+\.\d+)\s*(?P<unite>[a-zA-Z/%°]+)?\s*(?:\n|$)',
        re.DOTALL
    )

    # Pattern pour la durée de test alternative (BTX)
    duree_pattern = re.compile(
        r'\[(?P<heure>\d{2}):\d{2}:\d{2}:\d{3}\].*?'
        r'Mesure\s*<MES_BTX_DUREE_TEST>\s*:[^\n]Status\s(?P<status>\d+).*?\n'
        r'(?:.*?\n)+?'
        r'\s*(?P<valeur>-?\d+\.\d+)\s*s\s*(?:\n|$)',
        re.DOTALL
    )

    # Pattern pour extraire la date du nom de fichier (format JJ_MM_AA)
    date_pattern = re.compile(r'.SLOT1_(\d{2})(\d{2})(\d{2})_.')

    cie_match = cie_pattern.search(content)
    if not cie_match:
        return []

    reference = int(cie_match.group('reference'))
    nom = cie_match.group('nom').strip()

    date = None
    if filename:
        date_match = date_pattern.match(filename)
        if date_match:
            day, month, year = date_match.groups()
            date = f"20{year}-{month}-{day}"  

    results = []
    
    # D'abord chercher les mesures de temps de test principales
    time_matches = list(time_pattern.finditer(content))
    
    # Si aucune mesure principale trouvée, chercher les mesures de durée alternative
    if not time_matches:
        for match in duree_pattern.finditer(content):
            try:
                full_time = match.group('heure')
                hour_only = full_time.split(':')[0]

                results.append({
                    'reference': reference,
                    'nom': nom,
                    'heure': hour_only,
                    'mesure': 'MES_BTX_DUREE_TEST',  # Nom de mesure fixe
                    'status': int(match.group('status')),
                    'valeur': float(match.group('valeur')),
                    'unite': 's',  # Unité fixe pour cette mesure
                    'source_file': filename,
                    'date': date 
                })
            except (ValueError, AttributeError):
                continue
    else:
        # Traiter les mesures principales comme avant
        for match in time_matches:
            try:
                full_time = match.group('heure')
                hour_only = full_time.split(':')[0]

                results.append({
                    'reference': reference,
                    'nom': nom,
                    'heure': hour_only,
                    'mesure': match.group('mesure'),
                    'status': int(match.group('status')),
                    'valeur': float(match.group('valeur')),
                    'unite': match.group('unite') if match.group('unite') else None,
                    'source_file': filename,
                    'date': date 
                })
            except (ValueError, AttributeError):
                continue

    return results

@api_view(['POST'])
def upload_test_time_results(request):
    if request.method != 'POST':
        return Response({'status': 'error', 'message': 'Méthode non autorisée'},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    if 'files' not in request.FILES:
        return Response({'status': 'error', 'message': 'Aucun fichier fourni'},
                        status=status.HTTP_400_BAD_REQUEST)

    total_count = 0
    errors = []
    successful_files = []

    user = request.user

    # Supprimer les anciennes données de l'utilisateur connecté
    TempsTest.objects.filter(created_by=user).delete()

    files = request.FILES.getlist('files')

    for uploaded_file in files:
        try:
            content = uploaded_file.read().decode('latin-1')
            time_data = extract_test_time_data(content, uploaded_file.name)

            if not time_data:
                errors.append(f"Fichier {uploaded_file.name}: aucune mesure de temps valide trouvée")
                continue

            # Ajouter created_by=user à chaque élément
            for item in time_data:
                item['created_by'] = user

            objs = [TempsTest(**data) for data in time_data]
            created = TempsTest.objects.bulk_create(objs)
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

    return Response({
        'status': 'success',
        'count': total_count,
        'processed_files': successful_files,
        'errors': errors if errors else None,
        'message': f"{total_count} mesures de temps importées depuis {len(successful_files)} fichier(s)"
    })


@api_view(['GET'])
def get_test_time_results(request):
    user = request.user
    group_by = request.GET.get('group_by', 'hour')  # Par défaut: regroupement par heure
    
    queryset = TempsTest.objects.filter(created_by=user).exclude(status=2)

    if not queryset.exists():
        return Response({"message": "Aucune donnée disponible"},
                        status=status.HTTP_404_NOT_FOUND)

    if group_by == 'day':
        # Regroupement par jour
        results = []
        # Implémentez la logique de regroupement par jour ici
    elif group_by == 'month':
        # Regroupement par mois
        results = []
        # Implémentez la logique de regroupement par mois ici
    else:
        # Par défaut: regroupement par heure (comportement actuel)
        results = [
            {
                "reference": result.reference,
                "nom": result.nom,
                "mesure": result.mesure,
                "status": result.status,
                "valeur": result.valeur,
                "heure": result.heure,
                "unite": result.unite,
                "source_file": result.source_file,
                "date": result.date.strftime("%Y-%m-%d") if result.date else None
            }
            for result in queryset
        ]

    return Response({
        'count': len(results),
        'results': results,
        'group_by': group_by
    }, status=status.HTTP_200_OK)