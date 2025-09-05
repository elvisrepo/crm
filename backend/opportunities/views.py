from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Opportunity
from .serializers import OpportunitySerializer
from common.mixins import OptimisticLockingSoftDeleteMixin

class OpportunityList(generics.ListCreateAPIView):
    """API view for listing and creating opportunities."""
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only show active opportunities."""
        return Opportunity.objects.filter(is_active=True)

    def perform_create(self, serializer):
        """Automatically set the owner to the requesting user."""
        serializer.save(owner=self.request.user)

class OpportunityDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    """API view for retrieving, updating, and deleting a single opportunity."""
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only allow operations on active opportunities."""
        return Opportunity.objects.filter(is_active=True)