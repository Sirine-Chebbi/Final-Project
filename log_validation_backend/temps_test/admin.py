from django.contrib import admin
from .models import TempsTest

@admin.register(TempsTest)
class TempsTestAdmin(admin.ModelAdmin):
    list_display = (
        'reference',
        'nom',
        'mesure',
        'status',
        'valeur',
        'heure',
        'unite',
        'source_file',
    )
    