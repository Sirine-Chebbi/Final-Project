from django.contrib import admin
from .models import NftResults

@admin.register(NftResults)
class NftResultsAdmin(admin.ModelAdmin):
    list_display = (
        'mesure',
        'status',
        'valeur',
        'lim_min',
        'lim_max',
        'bande',
        'antenne',
        'duree',
        'unite',
        'source_file'
    )