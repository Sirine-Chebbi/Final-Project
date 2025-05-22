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
    rssi = models.FloatField(null=True)
    rssi_min = models.FloatField(null=True)
    rssi_max = models.FloatField(null=True)
    evm_min = models.FloatField(null=True)
    evm_max = models.FloatField(null=True)
    freq_error_avg = models.FloatField(null=True)
    lo_leakage_dbc = models.FloatField(null=True)
    lo_leakage_margin = models.FloatField(null=True)
    margin_db_lo_a = models.FloatField(null=True)
    margin_db_lo_b = models.FloatField(null=True)
    margin_db_up_a = models.FloatField(null=True)
    margin_db_up_b = models.FloatField(null=True)
    obw_mhz = models.FloatField(null=True)
    violation_percentage = models.FloatField(null=True)
    number_of_avg = models.IntegerField(null=True)
    spatial_stream = models.IntegerField(null=True)
    amp_err_db = models.FloatField(null=True)
    cable_loss_db = models.FloatField(null=True)
    data_rate = models.FloatField(null=True)
    evm_avg_db = models.FloatField(null=True)
    evm_db_avg = models.FloatField(null=True)
    evm_db_max = models.FloatField(null=True)
    evm_db_min = models.FloatField(null=True)
    freq_at_margin_lo_a = models.FloatField(null=True)
    freq_at_margin_lo_b = models.FloatField(null=True)
    freq_at_margin_up_a = models.FloatField(null=True)
    freq_at_margin_up_b = models.FloatField(null=True)
    freq_error_max = models.FloatField(null=True)
    freq_error_min = models.FloatField(null=True)
    lo_leakage = models.FloatField(null=True)
    obw_freq_start = models.FloatField(null=True)
    obw_freq_stop = models.FloatField(null=True)
    obw_percentage_11ac = models.FloatField(null=True)
    obw_percentage_lower = models.FloatField(null=True)
    obw_percentage_upper = models.FloatField(null=True)
    obw_percentage = models.FloatField(null=True)
    phase_err = models.FloatField(null=True)
    phase_noise_rms = models.FloatField(null=True)
    symbol_clk_err = models.FloatField(null=True)
    tx_power_dbm = models.FloatField(null=True)
        

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE, 
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


