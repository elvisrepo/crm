from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from common.mixins import OptimisticLockingSoftDeleteMixin
from .models import Product
from .serializers import ProductSerializer

class ProductList(generics.ListCreateAPIView):
    """
    View for listing and creating products.
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own active products."""
        return Product.objects.filter(owner=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ProductDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and soft-deleting a single product.
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only access products they own."""
        return Product.objects.filter(owner=self.request.user)