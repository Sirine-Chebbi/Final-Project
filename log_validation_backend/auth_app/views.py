from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser, Role
from .serializers import (
    CustomUserSerializer,
    MyTokenObtainPairSerializer,
    RegisterSerializer,
    RoleSerializer,
    ChangePasswordSerializer,
    CookieTokenRefreshSerializer
)

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated



class VerifyAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'status': 'authenticated',
            'matricule': request.user.matricule,
            'role': request.user.role.name if hasattr(request.user, 'role') else None
        })


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Formatage standard pour le frontend
            response.data = {
                'access': response.data['access'],
                'refresh': response.data['refresh'],
                'matricule': response.data['matricule'],
                'role': response.data['role'],
                'is_admin': response.data['is_admin']
            }
        return response

class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data={})
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
        access_token = serializer.validated_data.get('access')
        
        response = Response(status=status.HTTP_200_OK)
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=60 * 15  # 15 minutes
        )
        
        return response

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            response = Response({"detail": "Déconnexion réussie."}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAdminUser,]

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'matricule'

class RoleListView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]

class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Vérifier que seul un admin peut changer le mot de passe d'un autre utilisateur
            if 'matricule' in request.data and request.data['matricule'] != self.object.matricule:
                if not (self.object.role and self.object.role.is_admin):
                    return Response(
                        {"detail": "Seul un administrateur peut changer le mot de passe d'un autre utilisateur."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                try:
                    user = CustomUser.objects.get(matricule=request.data['matricule'])
                except CustomUser.DoesNotExist:
                    return Response(
                        {"detail": "Utilisateur non trouvé."},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)
            
            # Vérifier l'ancien mot de passe pour les changements personnels
            if not self.object.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Mot de passe incorrect."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            self.object.set_password(serializer.validated_data['new_password'])
            self.object.save()
            return Response({"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
