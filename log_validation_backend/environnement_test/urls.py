from django.urls import path
from .views import upload_test_condition, get_test_condition

urlpatterns = [
    # path('your-endpoint/', views.YourView.as_view())

    path('upload_test_condition/', upload_test_condition, name='upload_test_condition'),
    path('test_environnement/', get_test_condition, name='get_test_condition'),

]
