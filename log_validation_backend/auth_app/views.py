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
from .permissions import IsAdminUser, IsAdminOrSelf




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
    permission_classes = [IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminOrSelf]  # Changed from IsAdminUser
    lookup_field = 'matricule'

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return super().get_permissions()

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
        
        # Set is_admin context to the serializer if the user is admin
        is_admin = self.object.role and self.object.role.is_admin
        serializer = self.get_serializer(data=request.data, context={'is_admin': is_admin})

        if serializer.is_valid():
            # Handle admin changing another user's password
            if 'matricule' in request.data and request.data['matricule'] != self.object.matricule:
                if not is_admin:
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
            
            # Handle regular user changing their own password
            if not self.object.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Mot de passe incorrect."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            self.object.set_password(serializer.validated_data['new_password'])
            self.object.save()
            return Response({"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class VerifyTokenAndPermissions(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'matricule': user.matricule,
            'role': user.role.name if hasattr(user, 'role') else None,
            'is_admin': user.role.is_admin if hasattr(user, 'role') else False,
            'permissions': {
                'can_view_users': IsAdminUser().has_permission(request, self),
                'can_edit_users': IsAdminOrSelf().has_permission(request, self)
            }
        })