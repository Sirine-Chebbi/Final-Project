from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth_app.urls')),
    path('api/wifi-conduit/', include('wifi_conduit.urls')),
    path('api/wifi-nft/', include('wifi_nft.urls')),
    path('api/environnement-test/', include('environnement_test.urls')),
    path('api/temps-test/', include('temps_test.urls')),
]
