from django.urls import path
from .views import TrackListView

urlpatterns = [
    path('list/', TrackListView.as_view(), name='Track-list'),
]
