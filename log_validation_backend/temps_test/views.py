import re
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import TempsTest


def extract_test_time_data(content, filename=None):
    # Pattern pour détecter la référence et le nom
    cie_pattern = re.compile(
        r'<CIE>\s*Nom\s*:\s*(?P<nom>[^\n]+)\s*\n\s*<CIE>\s*R\S*f\S*rence\s*:\s*(?P<reference>\d+)',
        re.IGNORECASE
    )

    # Pattern optimisé pour extraire juste l'heure (premier nombre du timestamp)
    time_pattern = re.compile(
        r'\[(?P<heure>\d{2}):\d{2}:\d{2}:\d{3}\].*?'  # Capture juste l'heure (HH)
        r'Mesure\s*<(?P<mesure>MES_\w+)>\s*:.*?Status\s*(?P<status>\d+)\s*'
        r'(?:.*?\n)+?'  # Skip any lines in between
        r'\s*(?P<valeur>-?\d+\.\d+)\s*(?P<unite>[a-zA-Z/%°]+)?\s*(?:\n|$)',
        re.DOTALL
    )

    # Extraction des infos CIE
    cie_match = cie_pattern.search(content)
    if not cie_match:
        return []

    reference = int(cie_match.group('reference'))
    nom = cie_match.group('nom').strip()

    # Extraction des données avec l'heure
    results = []
    for match in time_pattern.finditer(content):
        try:
            full_time = match.group('heure')
            hour_only = full_time.split(':')[0]  # On prend juste le premier nombre (12)
            
            results.append({
                'reference': reference,
                'nom': nom,
                'heure': hour_only,  
                'mesure': match.group('mesure'),
                'status': int(match.group('status')),
                'valeur': float(match.group('valeur')),
                'unite': match.group('unite') if match.group('unite') else None,
                'source_file': filename
            })
        except (ValueError, AttributeError):
            continue

    return results


@api_view(['POST'])
def upload_test_time_results(request):
    if request.method != 'POST':
        return Response({'status': 'error', 'message': 'Méthode non autorisée'},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # Vérification plus robuste des fichiers
    if 'files' not in request.FILES:
        return Response({'status': 'error', 'message': 'Aucun fichier fourni'},
                        status=status.HTTP_400_BAD_REQUEST)

    total_count = 0
    errors = []
    successful_files = []

    # Optionnel: vider les anciennes données
    TempsTest.objects.all().delete()

    # Gestion des noms de champs différents
    files = request.FILES.getlist('files')

    for uploaded_file in files:
        try:
            content = uploaded_file.read().decode('latin-1')
            time_data = extract_test_time_data(content, uploaded_file.name)

            if not time_data:
                errors.append(
                    f"Fichier {uploaded_file.name}: aucune mesure de temps valide trouvée")
                continue

            # Création des objets en bulk
            objs = [
                TempsTest(**data)
                for data in time_data
            ]
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
    queryset = TempsTest.objects.exclude(status=2)

    if not queryset.exists():
        return Response({"message": "Aucune donnée disponible"},
                        status=status.HTTP_404_NOT_FOUND)

    results = []
    for result in queryset:
        res = {
            "reference": result.reference,
            "nom": result.nom,
            "mesure": result.mesure,
            "status": result.status,
            "valeur": result.valeur,
            "unite": result.unite,
            "source_file": result.source_file,
        }
        results.append(res)

    return Response({
        'count': len(results),
        'results': results
    }, status=status.HTTP_200_OK)
