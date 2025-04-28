from django.urls import path
from .views import (
    MyTokenObtainPairView,
    RegisterView,
    UserListView,
    UserDetailView,
    RoleListView,
    RoleDetailView,
    ChangePasswordView,
    LogoutView
)

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:matricule>/', UserDetailView.as_view(), name='user-detail'),
    path('roles/', RoleListView.as_view(), name='role-list'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('logout/', LogoutView.as_view(), name='logout'),

]   