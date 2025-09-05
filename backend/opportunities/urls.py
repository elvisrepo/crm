from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path('opportunities/', views.OpportunityList.as_view(), name='opportunity-list'),
    path('opportunities/<int:pk>/', views.OpportunityDetail.as_view(), name='opportunity-detail'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
