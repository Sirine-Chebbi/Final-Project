from django.contrib import admin
from .models import NftResults

# Register your models here.
@admin.register(NftResults)  # Enregistrement du modèle avec le décorateur
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('mesure','bande','antenne','power','lim_min','lim_max')  # Champs affichés
    search_fields = ('mesure','bande','antenne ')  # Champs de recherche