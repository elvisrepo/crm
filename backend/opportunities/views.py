from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.shortcuts import get_object_or_404

from .models import Opportunity, OpportunityLineItem
from .serializers import OpportunitySerializer, OpportunityLineItemSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin

# --- Opportunity Views ---

class OpportunityList(generics.ListCreateAPIView):
    """API view for listing and creating opportunities."""
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own active opportunities."""
        return Opportunity.objects.filter(owner=self.request.user, is_active=True)

    def perform_create(self, serializer):
        """Automatically set the owner to the requesting user."""
        serializer.save(owner=self.request.user)

class OpportunityDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    """API view for retrieving, updating, and deleting a single opportunity."""
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only access opportunities they own."""
        return Opportunity.objects.filter(owner=self.request.user)


# --- Nested Opportunity Line Item Views ---

class IsOpportunityOwner(BasePermission):
    """Permission to only allow owners of an opportunity to access its line items."""
    def has_permission(self, request, view):
        opportunity = get_object_or_404(Opportunity, pk=view.kwargs['opportunity_pk'])
        return opportunity.owner == request.user

class OpportunityLineItemList(generics.ListCreateAPIView):
    """View for listing and creating Line Items for a specific Opportunity."""
    serializer_class = OpportunityLineItemSerializer
    permission_classes = [IsAuthenticated, IsOpportunityOwner]

    def get_queryset(self):
        """Filter line items to only those belonging to the specified opportunity."""
        return OpportunityLineItem.objects.filter(opportunity_id=self.kwargs['opportunity_pk'])

    def perform_create(self, serializer):
        """Associate the line item with the parent opportunity from the URL."""
        opportunity = Opportunity.objects.get(pk=self.kwargs['opportunity_pk'])
        serializer.save(opportunity=opportunity)

class OpportunityLineItemDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting a single Line Item."""
    serializer_class = OpportunityLineItemSerializer
    permission_classes = [IsAuthenticated, IsOpportunityOwner]
    
    def get_queryset(self):
        """Filter line items to only those belonging to the specified opportunity."""
        return OpportunityLineItem.objects.filter(opportunity_id=self.kwargs['opportunity_pk'])
