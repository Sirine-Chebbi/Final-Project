from django.db import models
from auth_app.models import CustomUser

# Create your models here.

class TestCondition(models.Model):
    User = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    APPLICATION_VERSION = models.CharField(max_length=100, null=True)
    IQFACT = models.CharField(max_length=100, null=True)
    BOOTFS1 = models.CharField(max_length=100, null=True)
    MCU_FIRMWARE = models.CharField(max_length=100, null=True)
    SROM = models.CharField(max_length=100, null=True)
    IQMEASURE_VERSION = models.CharField(max_length=100, null=True)
    IQTESTER_HW_VERSION_01 = models.CharField(max_length=100, null=True)
    Tester_1_SN = models.CharField(max_length=100, null=True)
    Firmware_revision = models.CharField(max_length=100, null=True)