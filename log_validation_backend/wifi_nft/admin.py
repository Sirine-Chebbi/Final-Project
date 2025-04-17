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
    list_filter = (
        'status',
        'bande',
        'antenne',
    )
    search_fields = (
        'mesure',
        'bande',
        'source_file',
    )
    readonly_fields = ('source_file',)  # Optionnel si le fichier ne doit pas être modifié
    
    fieldsets = (
        (None, {
            'fields': ('mesure', 'status', 'source_file')
        }),
        ('Valeurs', {
            'fields': ('valeur', 'lim_min', 'lim_max', 'unite')
        }),
        ('Configuration', {
            'fields': ('bande', 'antenne', 'duree'),
            'classes': ('collapse',)  # Optionnel: permet de replier cette section
        }),
    )