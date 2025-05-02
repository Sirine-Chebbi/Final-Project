from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, Role
from .serializers import (
    CustomUserSerializer,
    MyTokenObtainPairSerializer,
    RegisterSerializer,
    RoleSerializer,
    ChangePasswordSerializer
)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

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