from django.contrib import admin
from .models import ConduitResult

# Register your models here.


@admin.register(ConduitResult)  # Enregistrement du modèle avec le décorateur
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('nom_fichier', 'code', 'bande', 'description', 'frequence', 'ant', 'ressource', 'delta', 'limit_max', 'limit_min', 'evm', 'evm_min', 'evm_max',
                    'rssi', 'rssi_min', 'rssi_max', 'power_rms_avg', 'power_rms_max', 'power_rms_min',
                    'power_dbm_rms_avg', 'power_dbm_rms_max', 'power_dbm_rms_min',
                    'power_peak_avg', 'power_peak_max', 'power_peak_min',
                    'power_pre_avg', 'power_pre_max', 'power_pre_min',
                    'error_message', 'test_time', 'nbrfile', 'freq_error_avg', 'lo_leakage_dbc', 'lo_leakage_margin',
                    'margin_db_lo_a', 'margin_db_lo_b', 'margin_db_up_a', 'margin_db_up_b',
                    'obw_mhz', 'violation_percentage', 'number_of_avg', 'spatial_stream',
                    'amp_err_db', 'cable_loss_db', 'data_rate', 'evm_avg_db', 'evm_db_avg',
                    'evm_db_max', 'evm_db_min', 'freq_at_margin_lo_a', 'freq_at_margin_lo_b',
                    'freq_at_margin_up_a', 'freq_at_margin_up_b', 'freq_error_max',
                    'freq_error_min', 'lo_leakage', 'obw_freq_start', 'obw_freq_stop',
                    'obw_percentage_11ac', 'obw_percentage_lower', 'obw_percentage_upper',
                    'obw_percentage', 'phase_err', 'phase_noise_rms', 'symbol_clk_err',
                    'tx_power_dbm')
