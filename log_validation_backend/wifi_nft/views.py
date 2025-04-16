# views.py
import re
import numpy as np

from django.shortcuts import render
from django.http import JsonResponse
from .models import NftResults
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage

from .statistics import calculate_gaussian


def process_nft_file(content, filename=None):
    rf_pattern = re.compile(
        r'Mesure <(?P<mesure>MES_BNFTPWR(\d)(\w+))>\s:.?Status\s(?P<status>\d+).?'
        r'(?P<lim_min>\d+.\d+)\sdBm\s<\s...\s<\s(?P<lim_max>\d+.\d+)\sdBm.?'
        r'(?P<power>\d+.\d+)\sdBm',
        re.DOTALL
    )

    matches = list(rf_pattern.finditer(content))
    
    for match in matches:
        try:
            NftResults.objects.create(
                mesure=match.group('mesure'),
                bande=match.group(3),
                antenne=int(match.group(2)),
                power=float(match.group('power')),
                lim_min=float(match.group('lim_min')),
                lim_max=float(match.group('lim_max')),
                source_file=filename
            )
        except Exception as e:
            print(f"Erreur création objet pour {match.group()}: {str(e)}")
            continue

    return len(matches)

@api_view(['POST'])
def upload_nft_results(request):
    if request.method == 'POST':
        if not request.FILES:
            return Response(
                {'status': 'error', 'message': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_count = 0
        errors = []
        successful_files = []
        uploaded_files = request.FILES.getlist('nft_files')

        # 💥 Supprimer les anciennes données une seule fois ici
        if NftResults.objects.exists():
            NftResults.objects.all().delete()

        for uploaded_file in uploaded_files:
            try:
                raw_content = uploaded_file.read()
                try:
                    content = raw_content.decode('utf-8')
                except UnicodeDecodeError:
                    errors.append(f"Fichier {uploaded_file.name}: encodage non-UTF8")
                    continue

                # Pour debug : on peut enlever plus tard
                with open(f'debug_{uploaded_file.name}.txt', 'w') as f:
                    f.write(content)

                count = process_nft_file(content, uploaded_file.name)

                if count == 0:
                    errors.append(f"Fichier {uploaded_file.name}: aucun pattern valide trouvé")
                else:
                    total_count += count
                    successful_files.append(uploaded_file.name)

            except Exception as e:
                errors.append(f"Erreur avec {uploaded_file.name}: {str(e)}")

        if not successful_files:
            return Response({
                'status': 'error',
                'message': 'Aucun fichier valide traité',
                'errors': errors,
                'received_files': [f.name for f in uploaded_files]
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'status': 'success',
            'count': total_count,
            'processed_files': successful_files,
            'errors': errors if errors else None,
            'message': f"{total_count} mesures traitées dans {len(successful_files)} fichier(s)"
        })


@api_view(['GET'])
def get_nft_results(request):
    queryset = NftResults.objects.all()
    
    if not queryset.exists():
        return Response({"message": "Aucune donnée disponible"}, status=status.HTTP_404_NOT_FOUND)
    
    # Données de base
    results = [{
        "mesure": result.mesure,
        "bande": result.bande,
        "antenne": result.antenne,
        "power": result.power,
        "lim_min": result.lim_min,
        "lim_max": result.lim_max,
    } for result in queryset]
    
    # Calculs statistiques
    power_values = [r['power'] for r in results if r['power'] is not None]
    stats = {
        'count': len(power_values),
        'mean': np.mean(power_values) if power_values else None,
        'std': np.std(power_values) if power_values else None,
        'min': np.min(power_values) if power_values else None,
        'max': np.max(power_values) if power_values else None,
    }
    
    # Courbe gaussienne
    gaussian = calculate_gaussian(power_values)
    
    return Response({
        'results': results,
        'statistics': stats,
        'gaussian': gaussian
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_power_statistics(request):
    try:
        power_values = list(NftResults.objects.exclude(power__isnull=True).values_list('power', flat=True))
        
        if not power_values:
            return Response(
                {"message": "Aucune donnée power disponible"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        gaussian_data = calculate_gaussian(power_values)
        
        return Response({
            'statistics': {
                'count': len(power_values),
                'mean': float(np.mean(power_values)),
                'std': float(np.std(power_values)),
                'min': float(np.min(power_values)),
                'max': float(np.max(power_values)),
            },
            'gaussian_curve': {
                'x': [float(x) for x in gaussian_data['curve']['x']],
                'y': [float(y) for y in gaussian_data['curve']['y']]
            },
            'original_data': [float(x) for x in power_values],
            'histogram': {
                'bins': [int(x) for x in np.histogram(power_values, bins=10)[0].tolist()],
                'edges': [float(x) for x in np.histogram(power_values, bins=10)[1].tolist()]
            }
        })
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )