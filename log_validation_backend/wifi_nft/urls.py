from django.urls import path
from . import views

urlpatterns = [
    # path('your-endpoint/', views.YourView.as_view())
        path('upload-nft-results/', views.upload_nft_results, name='upload_nft_results'),
        path('get-nft-results/', views.get_nft_results, name='get_nft_results'),

]
