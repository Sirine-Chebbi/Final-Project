from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False)  # Nouveau champ pour identifier les admins

    def __str__(self):
        return self.name

class CustomUserManager(BaseUserManager):
    def create_user(self, matricule, nom, prenom, poste, role_id=None, password=None, **extra_fields):
        if not matricule:
            raise ValueError('Le matricule est obligatoire')

        # 💡 Ensure the default 'user' role exists before anything else
        default_role, _ = Role.objects.get_or_create(
            name='user',
            defaults={'description': 'Simple Utilisateur', 'is_admin': False}
        )

        # Determine the role to assign
        if isinstance(role_id, Role):
            role = role_id
        elif isinstance(role_id, int):
            try:
                role = Role.objects.get(pk=role_id)
            except Role.DoesNotExist:
                role = default_role
        else:
            role = default_role

        # If the role is admin, mark is_staff
        if role.is_admin:
            extra_fields.setdefault('is_staff', True)

        user = self.model(
            matricule=matricule,
            nom=nom,
            prenom=prenom,
            poste=poste,
            role=role,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user


    def create_superuser(self, matricule, nom, prenom, poste, password=None, **extra_fields):
        # Get or create admin role
        role, _ = Role.objects.get_or_create(
            name='admin',
            defaults={'description': 'Administrateur système', 'is_admin': True}
        )
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(
            matricule=matricule,
            nom=nom,
            prenom=prenom,
            poste=poste,
            role_id=role,
            password=password,
            **extra_fields
        )
class CustomUser(AbstractBaseUser, PermissionsMixin):
    matricule = models.CharField(max_length=50, primary_key=True    )
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    poste = models.CharField(max_length=100)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['nom', 'prenom', 'poste']  
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"