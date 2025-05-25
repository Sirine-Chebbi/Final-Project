from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Rapports_activite
from .serializers import RapportsSerializer

class TrackListView(APIView):
    def get(self, request):
        data = Rapports_activite.objects.all()
        serializer = RapportsSerializer(data, many=True)
        return Response(serializer.data)
