from rest_framework import serializers
from .models import Order, OrderLineItem
from products.models import Product # Import Product

# A simple serializer to show product details within a line item
class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'standard_list_price']

class OrderLineItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderLineItem model."""
    product = ProductSummarySerializer(read_only=True)

    class Meta:
        model = OrderLineItem
        fields = [
            'id', 'product', 'quantity', 'price_at_purchase',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'created_at', 'updated_at']

    


class OrderSerializer(serializers.ModelSerializer):
    line_items = OrderLineItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField( read_only=True, max_digits=12, decimal_places=2)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_date', 'status', 'account', 'account_name', 'opportunity',
            'version', 'created_at', 'updated_at', 'line_items', 'total_amount'
        ]
        read_only_fields = ['id', 'order_date', 'created_at', 'updated_at', 'total_amount', 'account_name'
                            ,'opportunity']

    def update(self, instance, validated_data):
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)
