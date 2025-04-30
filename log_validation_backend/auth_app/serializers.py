from rest_framework import serializers
from .models import CustomUser, Role
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    
    class Meta:
        model = CustomUser
        fields = ('matricule', 'nom', 'prenom', 'poste', 'role', 'is_active', 'is_staff')

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['matricule'] = user.matricule
        token['role'] = user.role.name if user.role else None
        return token

    def validate(self, attrs):
        matricule = attrs.get('matricule')
        password = attrs.get('password')

        try:
            user = CustomUser.objects.get(matricule=matricule)
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed('Matricule incorrect ou inexistant.')

        if not user.check_password(password):
            raise AuthenticationFailed('Mot de passe incorrect.')

        if not user.is_active:
            raise AuthenticationFailed('Compte désactivé.')

        data = super().validate(attrs)

        # Ajout des données custom dans la réponse
        data.update({
            'matricule': self.user.matricule,
            'role': self.user.role.name if self.user.role else None
        })
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
        required=False
    )
    
    class Meta:
        model = CustomUser
        fields = ('matricule', 'nom', 'prenom', 'poste', 'role_id', 'password')
    
    def create(self, validated_data):
        # If role_id not provided, it will be handled by create_user
        return CustomUser.objects.create_user(**validated_data)
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=False)
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate(self, data):
        # Check if new_password and confirm_password match
        if data.get('new_password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Les mots de passe ne correspondent pas."})
        return data

    def validate_old_password(self, value):
        # If it's an admin changing another user's password, skip the old_password check
        if not self.context.get('is_admin') and not value:
            raise serializers.ValidationError("L'ancien mot de passe est requis.")
        return value