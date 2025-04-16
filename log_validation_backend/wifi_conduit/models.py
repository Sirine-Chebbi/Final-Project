from django.db import models

# Create your models here.
class ConduitResult(models.Model):
    nom_fichier = models.CharField(max_length=150, null=True)     
    nbrfile = models.FloatField()
    code = models.CharField(max_length=50, null=True)  # Code du log
    type_gega = models.CharField(max_length=10, null=True)  # 2G, 5G, 6G
    description = models.CharField(max_length=30,null=True)
    frequence = models.IntegerField(null=True)  # Fréquence en MHz
    delta = models.IntegerField(null=True)
    limit_min = models.FloatField(null=True)
    limit_max = models.FloatField(null=True)
    ant = models.IntegerField(null=True)  # Numéro d’antenne
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

    def __str__(self):
        return f"{self.code} - {self.type_gega} - {self.frequence}MHz - ANT{self.ant}"
    

    class Meta:
        indexes = [
            # Index basique pour les champs de filtrage
            models.Index(fields=['delta'], name='conduit_delta_idx'),
            models.Index(fields=['description'], name='conduit_desc_idx'),
            
            # Index pour l'analyse statistique
            models.Index(fields=['rssi'], name='conduit_rssi_idx'),
            models.Index(fields=['power_rms_avg'], name='conduit_power_idx'),
            models.Index(fields=['evm'], name='conduit_evm_idx'),
            
            # Index composite (exemple)
            models.Index(
                fields=['delta', 'description'], 
                name='conduit_delta_desc_idx'
            ),
        ]


