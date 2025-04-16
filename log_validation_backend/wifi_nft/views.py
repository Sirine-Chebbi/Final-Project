# views.py
import re
from django.shortcuts import render
from django.http import JsonResponse
from .models import NftResults
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

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

    results = []
    for result in queryset:
        results.append({
            "mesure": result.mesure,
            "bande": result.bande,
            "antenne": result.antenne,
            "power": result.power,
            "lim_min": result.lim_min,
            "lim_max": result.lim_max,
        })

    return Response(results, status=status.HTTP_200_OK)