from django.utils.functional import cached_property
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip middleware for auth endpoints
        if request.path in ['/api/login/', '/api/token/refresh/', '/api/logout/']:
            return self.get_response(request)
            
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        
        response = self.get_response(request)
        return response