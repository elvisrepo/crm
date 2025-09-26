from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Invoice
from .serializers import InvoiceSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin

class InvoiceList(generics.ListAPIView):

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

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

    