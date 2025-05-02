# permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.is_admin if hasattr(request.user, 'role') else False

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'role') and request.user.role.is_admin:
            return True
        return obj == request.user