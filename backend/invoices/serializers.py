from rest_framework import serializers
from .models import Invoice, InvoiceLineItem
from products.models import Product

# A simple serializer to show product details within a line item
class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'standard_list_price']

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    """Serializer for InvoiceLineItem model."""
    product = ProductSummarySerializer(read_only=True)
    

    class Meta:
        model = InvoiceLineItem
        fields = [
            'id', 'product', 'quantity', 'unit_price',
            'is_active', 'version', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'product', 'created_at', 'updated_at'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for the Invoice model."""
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    order_str = serializers.StringRelatedField(source='order', read_only=True)
    contract_str = serializers.StringRelatedField(source='contract', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'issue_date', 'due_date', 'total_amount',
            'balance_due', 'status', 'status_display', 'order', 'contract',
            'order_str', 'contract_str', 'notes', 'is_active', 'version',
            'created_at', 'updated_at', 'line_items'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'total_amount', 'balance_due',
            'status_display', 'order_str', 'contract_str',
            'created_at', 'updated_at', 'line_items'
        ]
        extra_kwargs = {
            'version': {'read_only': False},
            # Make FKs write-only as we have string representations for reading
            'order': {'write_only': True, 'required': False, 'allow_null': True},
            'contract': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def update(self, instance, validated_data):
        """Handle version increment for optimistic locking."""
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)
