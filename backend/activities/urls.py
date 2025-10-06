from django.urls import path
from .views import ActivityList, ActivityDetail

urlpatterns = [
    path('', ActivityList.as_view(), name='activity-list'),
    path('<int:pk>/', ActivityDetail.as_view(), name='activity-detail'),
]
