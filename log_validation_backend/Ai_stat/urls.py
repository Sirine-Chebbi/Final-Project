from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_data, name='analyze_data'),
]
