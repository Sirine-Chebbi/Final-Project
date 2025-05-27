import re
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from rapports_activite.models import Rapports_activite
from auth_app.models import CustomUser
from .models import TempsTest

def extract_test_time_data(content, filename=None):
    cie_pattern = re.compile(
        r'<CIE>\s*Nom\s*:\s*(?P<nom>[^\n]+)\s*\n\s*<CIE>\s*R\S*f\S*rence\s*:\s*(?P<reference>\d+)',
        re.IGNORECASE
    )

    # Pattern for the primary test time (e.g., MES_XXX_Temps_Test)
    time_pattern = re.compile(
        r'\[(?P<heure>\d{2}):\d{2}:\d{2}:\d{3}\].*?'
        r'Mesure\s*<(?P<mesure>MES_\w+_Temps_Test)>\s*:[^\n]+?Status\s(?P<status>\d+).*?\n'
        r'(?:.*?\n)+?'
        r'\s*(?P<valeur>-?\d+\.\d+)\s*(?P<unite>[a-zA-Z/%°]+)?\s*(?:\n|$)',
        re.DOTALL
    )

    # Pattern for the alternative test duration (MES_BTX_DUREE_TEST)
    duree_pattern = re.compile(
        r'\[(?P<heure>\d{2}):\d{2}:\d{2}:\d{3}\].*?'
        r'Mesure\s*<(?P<mesure>MES_BTX_DUREE_TEST)>\s*:[^\n]+?Status\s(?P<status>\d+).*?\n'
        r'(?:.*?\n)+?'
        r'\s*(?P<valeur>-?\d+\.\d+)\s*s\s*(?:\n|$)',
        re.DOTALL
    )

    # --- MODIFICATION HERE ---
    # Pattern to extract the date from the filename (format DD_MM_YY)
    # Changed to .*?SLOT1_ to match any characters non-greedily before SLOT1_
    date_pattern = re.compile(r'.*?SLOT\d+(\d{2})(\d{2})(\d{2})_') 
    # --- END MODIFICATION ---

    cie_match = cie_pattern.search(content)
    if not cie_match:
        return []

    reference = int(cie_match.group('reference'))
    nom = cie_match.group('nom').strip()

    date = None
    if filename:
        # --- MODIFICATION HERE ---
        date_match = date_pattern.search(filename) # Use .search() instead of .match()
        # --- END MODIFICATION ---
        if date_match:
            day, month, year = date_match.groups()
            date = f"20{year}-{month}-{day}"

    results = []
    
    # First, look for primary test time measures
    time_matches = list(time_pattern.finditer(content))
    
    if time_matches:
        # Process primary measures if found
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
            except (ValueError, AttributeError) as e:
                print(f"Error processing primary time match: {e} - Match: {match.groups()}")
                continue
    else:
        # If no primary measures are found, look for alternative duration measures
        for match in duree_pattern.finditer(content):
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
                    'unite': 's',
                    'source_file': filename,
                    'date': date
                })
            except (ValueError, AttributeError) as e:
                print(f"Error processing BTX duration match: {e} - Match: {match.groups()}")
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

    # Delete old data from the connected user
    TempsTest.objects.filter(created_by=user).delete()

    files = request.FILES.getlist('files')

    for uploaded_file in files:
        try:
            content = uploaded_file.read().decode('latin-1')
            time_data = extract_test_time_data(content, uploaded_file.name)

            if not time_data:
                errors.append(f"Fichier {uploaded_file.name}: aucune mesure de temps valide trouvée")
                continue

            # Add created_by=user to each item
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
            rapport_quotidien.nombre_logs_Temps += len(successful_files)
            rapport_quotidien.save()

    except Exception as e:
        print(f"Erreur lors de la mise à jour du rapport quotidien: {e}")

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
    group_by = request.GET.get('group_by', 'hour')
    
    queryset = TempsTest.objects.filter(created_by=user).exclude(status=2)

    if not queryset.exists():
        return Response({"message": "Aucune donnée disponible"},
                        status=status.HTTP_404_NOT_FOUND)

    if group_by == 'day':
        results = []
        # Implement daily grouping logic here
    elif group_by == 'month':
        results = []
        # Implement monthly grouping logic here
    else:
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