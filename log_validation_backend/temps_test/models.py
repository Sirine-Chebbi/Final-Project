from django.db import models

class TempsTest(models.Model):
    reference = models.IntegerField()
    nom = models.CharField(max_length=300)
    mesure = models.CharField(max_length=50)
    status = models.IntegerField()
    valeur = models.FloatField(null=True, blank=True)
    heure = models.IntegerField(null=True)
    unite = models.CharField(max_length=10, null=True, blank=True)  
    source_file = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['mesure']),
        ]
