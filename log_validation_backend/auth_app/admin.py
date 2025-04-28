from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Role

class CustomUserAdmin(UserAdmin):
    list_display = ('matricule', 'nom', 'prenom', 'poste', 'role', 'is_staff')
    search_fields = ('matricule', 'nom', 'prenom')
    ordering = ('matricule',)
    
    fieldsets = (
        (None, {'fields': ('matricule', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'prenom', 'poste', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('matricule', 'nom', 'prenom', 'poste', 'role', 'password1', 'password2'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Role)