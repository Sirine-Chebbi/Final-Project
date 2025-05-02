from rest_framework import serializers
from .models import CustomUser, Role
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken



class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    
    class Meta:
        model = CustomUser
        fields = ('matricule', 'nom', 'prenom', 'poste', 'role')


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajoutez les claims personnalisés
        token['matricule'] = user.matricule
        token['role'] = user.role.name if user.role else None
        token['is_admin'] = user.role.is_admin if user.role else False
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Ajoutez les données supplémentaires
        data.update({
            'matricule': self.user.matricule,
            'role': self.user.role.name if self.user.role else None,
            'is_admin': self.user.role.is_admin if self.user.role else False
        })
        return data

class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None
    
    def validate(self, attrs):
        attrs['refresh'] = self.context['request'].COOKIES.get('refresh_token')
        if attrs['refresh']:
            return super().validate(attrs)
        else:
            raise InvalidToken('No valid refresh token found')


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
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        return data