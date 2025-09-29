from django.urls import path
from .views import InvoiceList, InvoiceDetail, LogPaymentForInvoiceView

urlpatterns = [
    path('invoices/', InvoiceList.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetail.as_view(), name='invoice-detail'),
    path('invoices/<int:invoice_pk>/log_payment/', LogPaymentForInvoiceView.as_view(), name='log-payment-for-invoice'),
]