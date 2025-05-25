from django.db import models
from django.conf import settings # Pour référencer le modèle User de manière flexible
from django.utils import timezone

class Rapports_activite(models.Model):
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rapports_quotidiens'
    )
    date_rapport = models.DateField(default=timezone.now)

    nombre_logs_Conduit = models.IntegerField(default=0)
    nombre_logs_Divers = models.IntegerField(default=0)
    nombre_logs_Temps = models.IntegerField(default=0)
    nombre_logs_Env = models.IntegerField(default=0)

    class Meta:
        unique_together = ('utilisateur', 'date_rapport')
        verbose_name = "Rapport Quotidien Utilisateur"
        verbose_name_plural = "Rapports Quotidiens Utilisateurs"

    def __str__(self):
        return f"Rapport de {self.utilisateur.matricule} - {self.date_rapport}"