
from django.urls import path
from .views import ContractList, ContractDetail

urlpatterns = [
    path('contracts/', ContractList.as_view(), name='contract-list'),
    path('contracts/<int:pk>/', ContractDetail.as_view(), name='contract-detail'),
]
