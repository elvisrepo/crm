from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django.db import transaction
from .models import Invoice
from .serializers import InvoiceSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin
from payments.serializers import PaymentSerializer

class InvoiceList(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['invoice_number']

    def get_queryset(self):
        """
        Users should only see invoices related to accounts they own.
        """
        return Invoice.objects.filter(account__owner=self.request.user, is_active=True)

class InvoiceDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users should only see invoices related to accounts they own.
        """
        return Invoice.objects.filter(account__owner=self.request.user, is_active=True)

class LogPaymentForInvoiceView(generics.CreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        invoice_pk = self.kwargs.get('invoice_pk')
        try:
            invoice = Invoice.objects.get(pk=invoice_pk, account__owner=self.request.user)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        if invoice.status == Invoice.Status.PAID_IN_FULL:
            return Response({"error": "Cannot log payment for a fully paid invoice."}, status=status.HTTP_400_BAD_REQUEST)

        account = invoice.account

        mutable_data = request.data.copy()
        mutable_data['invoice_id'] = invoice.id
        mutable_data['account_id'] = account.id

        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            payment = serializer.save()
            invoice.balance_due -= payment.amount
            if invoice.balance_due <= 0:
                invoice.status = Invoice.Status.PAID_IN_FULL
                invoice.balance_due = 0
            else:
                invoice.status = Invoice.Status.PARTIALLY_PAID
            invoice.save()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)