from django.db import models

class NftResults(models.Model):
    mesure = models.CharField(max_length=50, null=True)
    bande  = models.CharField(max_length=10, null=True)
    antenne = models.IntegerField(null=True, blank=True)
    power = models.FloatField(null=True, blank=True) 
    lim_min = models.IntegerField(null=True, blank=True) 
    lim_max = models.IntegerField(null=True, blank=True) 
    source_file = models.CharField(max_length=100, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['power']),
        ]