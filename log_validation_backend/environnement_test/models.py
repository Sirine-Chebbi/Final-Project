from django.db import models
from django.conf import settings

# Create your models here.

class TestCondition(models.Model):
    APPLICATION_VERSION = models.CharField(max_length=100, null=True)
    IQFACT = models.CharField(max_length=100, null=True)
    BOOTFS1 = models.CharField(max_length=100, null=True)
    MCU_FIRMWARE = models.CharField(max_length=100, null=True)
    SROM = models.CharField(max_length=100, null=True)
    IQMEASURE_VERSION = models.CharField(max_length=100, null=True)
    IQTESTER_HW_VERSION_01 = models.CharField(max_length=100, null=True)
    Tester_1_SN = models.CharField(max_length=100, null=True)
    Firmware_revision = models.CharField(max_length=100, null=True)


    # Clé étrangère vers CustomUser
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Cela utilise votre modèle CustomUser
        on_delete=models.CASCADE,  # ou PROTECT / CASCADE selon le besoin
        null=True,
        blank=True,
        related_name='test_conditions'
    )
