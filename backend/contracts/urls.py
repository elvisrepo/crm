
from django.urls import path
from .views import ContractList, ContractDetail, GenerateInvoiceFromContractView

urlpatterns = [
    path('contracts/', ContractList.as_view(), name='contract-list'),
    path('contracts/<int:pk>/', ContractDetail.as_view(), name='contract-detail'),
    path('contracts/<int:pk>/generate-invoice/', GenerateInvoiceFromContractView.as_view(), name='contract-generate-invoice'),
]
