from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
import uuid

from .models import Contract
from .serializers import ContractSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin
from invoices.models import Invoice, InvoiceLineItem
from invoices.serializers import InvoiceSerializer


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

class GenerateInvoiceFromContractView(generics.GenericAPIView):
    """
    A view to generate an invoice from a Contract.
    This is intended for retainer products.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users can only generate invoices for contracts they own.
        """
        return Contract.objects.filter(account__owner=self.request.user)

    def post(self, request, *args, **kwargs):
        contract = self.get_object()

        # Use the model method to get the current billing cycle
        cycle_start, cycle_end = contract.get_current_billing_cycle()
        if not all([cycle_start, cycle_end]):
            return Response(
                {'error': 'Invalid billing cycle on contract.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if an invoice for the current billing cycle already exists.
        existing_invoice = Invoice.objects.filter(
            contract=contract,
            issue_date__gte=cycle_start,
            issue_date__lte=cycle_end
        ).first()

        if existing_invoice:
            return Response(
                {'error': f'An invoice for the current billing cycle already exists: {existing_invoice.invoice_number}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Defensive check for retainer products
        line_items_to_invoice = contract.line_items.filter(product__is_retainer_product=True)
        if not line_items_to_invoice.exists():
            return Response(
                {'error': 'This contract has no retainer products to create an invoice from.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get due_date from request, with validation and a default
        due_date_str = request.data.get('due_date')
        today = timezone.now().date()
        due_date = today + timedelta(days=30)  # Default value

        if due_date_str:
            try:
                parsed_date = date.fromisoformat(due_date_str)
                if parsed_date < today:
                    return Response(
                        {'error': 'Due date cannot be in the past.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                due_date = parsed_date
            except ValueError:
                return Response(
                    {'error': 'Invalid due_date format. Please use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        with transaction.atomic():
            # Calculate the total for the billing cycle.
            total = sum(item.quantity * item.price_per_cycle for item in line_items_to_invoice)

            invoice = Invoice.objects.create(
                account=contract.account,
                contract=contract,
                issue_date=today,
                due_date=due_date,
                balance_due=total,
                invoice_number=f'INV-C-{contract.id}-{uuid.uuid4().hex[:6].upper()}'
            )

            for item in line_items_to_invoice:
                InvoiceLineItem.objects.create(
                    invoice=invoice,
                    product=item.product,
                    quantity=item.quantity,
                    unit_price=item.price_per_cycle
                )
            
            invoice.refresh_from_db()

            serializer = self.get_serializer(invoice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
