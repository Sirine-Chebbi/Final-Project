from django.db import models

# Create your models here.
class NftResults(models.Model):
    mesure = models.CharField(max_length=50, null=True)
    bande  = models.CharField(max_length=10, null=True)
    antenne = models.IntegerField(null=True, blank=True)
    power = models.IntegerField(null=True, blank=True) 
    lim_min = models.IntegerField(null=True, blank=True) 
    lim_max = models.IntegerField(null=True, blank=True) 