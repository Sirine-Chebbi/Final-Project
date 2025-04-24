from django.urls import path
from . import views

urlpatterns = [
        path('upload-temps-test/', views.upload_test_time_results, name='upload-temps-test'),
        path('get-temps-test/', views.get_test_time_results, name='get-temps-test'),
]
