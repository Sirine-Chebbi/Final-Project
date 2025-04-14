from django.contrib import admin
from .models import TestCondition
# Register your models here.


@admin.register(TestCondition)  # Enregistrement du modèle avec le décorateur
class TestVersionAdmin(admin.ModelAdmin):
    list_display =('APPLICATION_VERSION','IQFACT','BOOTFS1', 'MCU_FIRMWARE', 'SROM', 'IQMEASURE_VERSION', 'IQTESTER_HW_VERSION_01', 
                   'Tester_1_SN', 'Firmware_revision')
