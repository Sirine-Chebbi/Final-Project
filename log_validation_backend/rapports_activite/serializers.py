from rest_framework import serializers
from .models import Rapports_activite

class RapportsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapports_activite
        fields = '__all__'