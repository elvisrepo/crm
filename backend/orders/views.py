from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from datetime import date, timedelta
import uuid

from .models import Order
from .serializers import OrderSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin
from invoices.models import Invoice, InvoiceLineItem
from invoices.serializers import InvoiceSerializer


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

class GenerateInvoiceFromOrderView(generics.GenericAPIView):
    """
    A view to generate an invoice from an Order.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users can only generate invoices for orders they own.
        """
        return Order.objects.filter(account__owner=self.request.user)

    def post(self, request, *args, **kwargs):
        order = self.get_object()

        if Invoice.objects.filter(order=order).exists():
            return Response(
                {'error': 'An invoice has already been generated for this order.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Defensive check for non-retainer products
        line_items_to_invoice = order.line_items.filter(product__is_retainer_product=False)
        if not line_items_to_invoice.exists():
            return Response(
                {'error': 'This order has no non-retainer products to create an invoice from.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get due_date from request, with validation and a default
        due_date_str = request.data.get('due_date')
        due_date = date.today() + timedelta(days=30)  # Default value

        if due_date_str:
            try:
                # Attempt to parse the date. Assumes YYYY-MM-DD format from DRF browsable API.
                parsed_date = date.fromisoformat(due_date_str)
                if parsed_date < date.today():
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
            # Calculate the total only for the items being invoiced.
            total = sum(item.quantity * item.price_at_purchase for item in line_items_to_invoice)

            invoice = Invoice.objects.create(
                account=order.account,
                order=order,
                issue_date=date.today(),
                due_date=due_date,  # Use the validated or default due_date
                balance_due=total,
                invoice_number=f'INV-{order.id}-{uuid.uuid4().hex[:6].upper()}'
            )

            # Create InvoiceLineItems only from the filtered non-retainer OrderLineItems
            for item in line_items_to_invoice:
                InvoiceLineItem.objects.create(
                    invoice=invoice,
                    product=item.product,
                    quantity=item.quantity,
                    unit_price=item.price_at_purchase
                )
            
            # Refresh the invoice from the DB so the `total_amount` property is calculated correctly
            invoice.refresh_from_db()

            serializer = self.get_serializer(invoice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)