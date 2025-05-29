from django.shortcuts import render
import json
import httpx
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv

load_dotenv()

from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    http_client=httpx.Client(  # Explicit HTTP client configuration
        headers={
            "HTTP-Referer": "http://localhost:8000",  # Optional
            "X-Title": "My QA App",  # Optional
        }
    )
)


@api_view(['POST'])
def analyze_data(request):
    data = request.data

    prompt = f"""
        Vous êtes une IA de contrôle qualité. Analysez les données suivantes et prenez une décision maximum 10 lignes:

        Données JSON :
        {json.dumps(data, indent=2, ensure_ascii=False)}

        Commentaire de l'utilisateur : {data.get('comment', 'Aucun')}.
    """

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-prover-v2:free", 
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        ai_reply = response.choices[0].message.content
        return Response({"ai_decision": ai_reply}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)