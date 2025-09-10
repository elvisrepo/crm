from django.urls import path
from . import views

urlpatterns = [
    path('leads/', views.LeadList.as_view(), name='lead-list'),
    path('leads/<int:pk>/', views.LeadDetail.as_view(), name='lead-detail'),
    path('leads/<int:pk>/convert/', views.LeadConvertView.as_view(), name='lead-convert'),
]



