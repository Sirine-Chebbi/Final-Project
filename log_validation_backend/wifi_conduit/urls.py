from django.urls import path
from .views import upload_log,results_without_delta_desc,results_with_delta_desc

urlpatterns = [
    # path('your-endpoint/', views.YourView.as_view())
    path('upload/', upload_log, name='upload_log'),
    path('results/without-delta-desc/', results_without_delta_desc, name='results_without_delta_desc'),
    path('results/with-delta-desc/', results_with_delta_desc, name='results_with_delta_desc'),
]
