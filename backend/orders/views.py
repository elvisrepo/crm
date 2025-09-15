from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin

class OrderList(generics.ListAPIView):
    """
    API view for listing orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users can only see orders related to accounts they own.
        """
        return Order.objects.filter(account__owner=self.request.user).select_related('account').prefetch_related('line_items__product')

class OrderDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating a single order.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Users can only see orders related to accounts they own.
        """
        return Order.objects.filter(account__owner=self.request.user)