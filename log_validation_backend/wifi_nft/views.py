# views.py
import re
from django.shortcuts import render
from django.http import JsonResponse
from .models import NftResults
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

def process_nft_file(file_content):
    # Pattern pour extraire les informations des mesures RF (2G, 5G, 6G, ZIGBEE)
    rf_pattern = re.compile(
        r'Mesure <(?P<mesure>MES_BNFT_PWR(\d)_(\w+))>\s*:.*?Status\s*(?P<status>\d+).*?'
        r'(?P<lim_min>\d+\.\d+)\s*dBm\s*<\s*\.\.\.\s*<\s*(?P<lim_max>\d+\.\d+)\s*dBm.*?'
        r'(?P<power>\d+\.\d+)\s*dBm',
        re.DOTALL
    )
    
    # Nettoyer la base existante
    NftResults.objects.all().delete()
    
    # Traitement des mesures RF
    for match in rf_pattern.finditer(file_content):
        antenne = int(match.group(2))
        bande = match.group(3)
        
        NftResults.objects.create(
            mesure=match.group('mesure'),
            bande=bande,
            antenne=antenne,
            power=float(match.group('power')),  # Conversion en entier
            lim_min=int(float(match.group('lim_min'))),
            lim_max=int(float(match.group('lim_max')))
        )
    
    return NftResults.objects.count()

@api_view(['POST'])
def upload_nft_results(request):
    if request.method == 'POST' and 'nft_file' in request.FILES:
        file = request.FILES['nft_file']
        content = file.read().decode('utf-8')
        count = process_nft_file(content)
        return Response({'status': 'success', 'count': count})
    
    return Response({'status': 'error', 'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

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