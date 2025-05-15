from django.db import models
from django.conf import settings


# Create your models here.
class ConduitResult(models.Model):
    nom_fichier = models.CharField(max_length=150, null=True)     
    nbrfile = models.FloatField()
    code = models.CharField(max_length=50, null=True)  # Code du log
    bande = models.CharField(max_length=10, null=True)  # 2G, 5G, 6G
    description = models.CharField(max_length=30,null=True)
    frequence = models.IntegerField(null=True)  # Fréquence en MHz
    delta = models.IntegerField(null=True)
    limit_min = models.FloatField(null=True)
    limit_max = models.FloatField(null=True)
    ant = models.IntegerField(null=True)  # Numéro d’antenne
    ressource = models.CharField(max_length=300, null=True)
    evm = models.FloatField(null=True)
    power_rms_avg = models.FloatField(null=True)
    power_rms_max = models.FloatField(null=True)
    power_rms_min = models.FloatField(null=True)
    power_dbm_rms_avg = models.FloatField(null=True)
    power_dbm_rms_max = models.FloatField(null=True)
    power_dbm_rms_min = models.FloatField(null=True)
    power_peak_avg = models.FloatField(null=True)
    power_peak_max = models.FloatField(null=True)
    power_peak_min = models.FloatField(null=True)
    power_pre_avg = models.FloatField(null=True)
    power_pre_max = models.FloatField(null=True)
    power_pre_min = models.FloatField(null=True)
    error_message = models.TextField(null=True)
    test_time = models.FloatField(null=True)
    limit_min = models.FloatField(null=True)
    limit_max = models.FloatField(null=True)
    rssi = models.FloatField(null=True)
    rssi_min = models.FloatField(null=True)
    rssi_max = models.FloatField(null=True)
    evm_min = models.FloatField(null=True)
    evm_max = models.FloatField(null=True)

        # Clé étrangère vers CustomUser
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Cela utilise votre modèle CustomUser
        on_delete=models.CASCADE,  # ou PROTECT / CASCADE selon le besoin
        null=True,
        blank=True,
        related_name='wifi_conduit'
    )


    class Meta:
        indexes = [
            models.Index(
                fields=['delta', 'description'], 
                name='conduit_delta_desc_idx'
            ),
        ]


