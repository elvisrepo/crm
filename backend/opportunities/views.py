from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.response import Response
from datetime import date, timedelta

from .models import Opportunity, OpportunityLineItem
from .serializers import OpportunitySerializer, OpportunityLineItemSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin
from orders.models import Order, OrderLineItem
from orders.serializers import OrderSerializer
from contracts.models import Contract, ContractLineItem
from contracts.serializers import ContractSerializer

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

## this view uses serializer only for serialization(output)
class GenerateOrderFromOpportunity(generics.GenericAPIView):
    """
    A view to generate an order from a 'Closed Won' opportunity.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Opportunity.objects.all()

    def post(self, request, *args, **kwargs):
        opportunity = self.get_object()

        if opportunity.stage != 'closed_won':
            return Response(
                {'error': 'Order can only be generated for opportunities that are "closed_won".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Order.objects.filter(opportunity=opportunity).exists():
            return Response(
                {'error': 'An order has already been generated for this opportunity.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if there are any non-retainer products to create an order from
        line_items = opportunity.line_items.filter(product__is_retainer_product=False)
        if not line_items.exists():
            return Response(
                {'error': 'This opportunity has no non-retainer products to create an order from.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Create the Order
            order = Order.objects.create(
                account=opportunity.account,
                opportunity=opportunity,
                status='Awaiting Payment'
            )

            # Create OrderLineItems from the filtered list
            for item in line_items:
                OrderLineItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase=item.sale_price
                )

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class GenerateContractFromOpportunity(generics.GenericAPIView):
    """
    A view to generate a contract from a 'Closed Won' opportunity,
    including only line items for products marked as 'retainer' products.
    """
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]
    queryset = Opportunity.objects.all()

    def post(self, request, *args, **kwargs):
        opportunity = self.get_object()

        if opportunity.stage != 'closed_won':
            return Response(
                {'error': 'Contract can only be generated for opportunities that are "closed_won".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Contract.objects.filter(opportunity=opportunity).exists():
            return Response(
                {'error': 'A contract has already been generated for this opportunity.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        retainer_line_items = opportunity.line_items.filter(product__is_retainer_product=True)
        if not retainer_line_items.exists():
            return Response(
                {'error': 'This opportunity has no retainer products to create a contract from.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Create the Contract
            today = date.today()
            contract = Contract.objects.create(
                account=opportunity.account,
                opportunity=opportunity,
                owner=request.user,
                status='Awaiting Payment',
                start_date=today,
                end_date=today + timedelta(days=365), # Default to a 1-year contract
                billing_cycle='Monthly' # Default to monthly billing
            )

            # Create ContractLineItems from retainer OpportunityLineItems
            for item in retainer_line_items:
                ContractLineItem.objects.create(
                    contract=contract,
                    product=item.product,
                    quantity=item.quantity,
                    price_per_cycle=item.product.standard_list_price
                )

            serializer = self.get_serializer(contract)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


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