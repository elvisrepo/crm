from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Contract
from .serializers import ContractSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin

class ContractList(generics.ListAPIView):
    """
    API view for listing contracts.
    """
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users can only see contracts related to accounts they own.
        """
        return Contract.objects.filter(account__owner=self.request.user).select_related('account').prefetch_related('line_items__product')

class ContractDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating a single contract.
    """
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Users can only see contracts related to accounts they own.
        """
        return Contract.objects.filter(account__owner=self.request.user)