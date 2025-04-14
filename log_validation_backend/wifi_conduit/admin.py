from django.contrib import admin
from .models import ConduitResult

# Register your models here.
@admin.register(ConduitResult)  # Enregistrement du modèle avec le décorateur
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('nom_fichier','code', 'type_gega','description', 'frequence', 'ant','delta','limit_max','limit_min','evm','evm_min','evm_max',
                    'rssi','rssi_min','rssi_max','power_rms_avg', 'power_rms_max', 'power_rms_min',
                    'power_dbm_rms_avg', 'power_dbm_rms_max', 'power_dbm_rms_min', 
                    'power_peak_avg', 'power_peak_max', 'power_peak_min', 
                    'power_pre_avg', 'power_pre_max', 'power_pre_min', 
                    'error_message', 'test_time', 'nbrfile')  # Champs affichés
    search_fields = ('code', 'type_gega', 'ant')  # Champs de recherche
