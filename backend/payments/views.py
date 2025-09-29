from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .serializers import PaymentSerializer
from common.mixins import OptimisticLockingMixin

class PaymentList(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users should only see payments related to accounts they own.
        """
        return Payment.objects.filter(account__owner=self.request.user)

class PaymentDetail(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users should only see payments related to accounts they own.
        """
        return Payment.objects.filter(account__owner=self.request.user)
