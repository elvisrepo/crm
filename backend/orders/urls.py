from django.urls import path
from .views import OrderList, OrderDetail, GenerateInvoiceFromOrderView

urlpatterns = [
    path('orders/', OrderList.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),
    path('orders/<int:pk>/generate-invoice/', GenerateInvoiceFromOrderView.as_view(), name='order-generate-invoice'),
]
