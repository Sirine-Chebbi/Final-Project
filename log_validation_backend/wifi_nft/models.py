from django.db import models
from django.conf import settings


class NftResults(models.Model):
    mesure = models.CharField(max_length=50)
    status = models.IntegerField()  # 0: OK, 1: KO, 2: Non fait (à exclure)
    valeur = models.FloatField(null=True, blank=True)
    lim_min = models.FloatField(null=True, blank=True)
    lim_max = models.FloatField(null=True, blank=True)
    bande = models.CharField(max_length=10, null=True, blank=True)
    antenne = models.IntegerField(null=True, blank=True)
    duree = models.IntegerField(null=True, blank=True)  # en ms
    source_file = models.CharField(max_length=100, null=True, blank=True)
    unite = models.CharField(max_length=10, null=True, blank=True)  # dBm, s, C, etc.

    # Clé étrangère vers CustomUser
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Cela utilise votre modèle CustomUser
        on_delete=models.CASCADE,  # ou PROTECT / CASCADE selon le besoin
        null=True,
        blank=True,
        related_name='wifi_nft'
    )


    class Meta:
        indexes = [
            models.Index(fields=['mesure']),
            models.Index(fields=['bande']),
            models.Index(fields=['antenne']),
        ]