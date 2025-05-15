from django.db import models
from django.conf import settings


class TempsTest(models.Model):
    reference = models.IntegerField()
    nom = models.CharField(max_length=300)
    mesure = models.CharField(max_length=50)
    status = models.IntegerField()
    valeur = models.FloatField(null=True, blank=True)
    heure = models.IntegerField(null=True)
    unite = models.CharField(max_length=10, null=True, blank=True)  
    source_file = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateField(null=True, blank=True)

        # Clé étrangère vers CustomUser
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Cela utilise votre modèle CustomUser
        on_delete=models.CASCADE,  
        null=True,
        blank=True,
        related_name='temps_test'
    )
