from django.contrib import admin
from .models import Rapports_activite

@admin.register(Rapports_activite)
class Rapports_activiteAdmin(admin.ModelAdmin):
    list_display = (
        'utilisateur',
        'date_rapport',
        'nombre_logs_Conduit',
        'nombre_logs_Divers',
        'nombre_logs_Temps',
        'nombre_logs_Env',
    )
    list_filter = ('date_rapport', 'utilisateur')
    search_fields = ('utilisateur__username',) # Permet de chercher par nom d'utilisateur
    date_hierarchy = 'date_rapport' # Permet de naviguer par date