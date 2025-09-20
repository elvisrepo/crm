
from rest_framework import serializers
from .models import Contract, ContractLineItem
from products.models import Product

# A simple serializer to show product details within a line item
class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'standard_list_price']

class ContractLineItemSerializer(serializers.ModelSerializer):
    """Serializer for ContractLineItem model."""
    product = ProductSummarySerializer(read_only=True)

    class Meta:
        model = ContractLineItem
        fields = [
            'id', 'product', 'quantity', 'price_per_cycle',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'created_at', 'updated_at']

class ContractSerializer(serializers.ModelSerializer):
    line_items = ContractLineItemSerializer(many=True, read_only=True)
    total_amount_per_cycle = serializers.DecimalField(read_only=True, max_digits=12, decimal_places=2)
    account_name = serializers.CharField(source='account.name', read_only=True)
    opportunity_name = serializers.CharField(source='opportunity.name', read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id', 'status', 'start_date', 'end_date', 'billing_cycle', 'account', 'account_name', 
            'opportunity', 'opportunity_name', 'version', 'created_at', 'updated_at', 
            'line_items', 'total_amount_per_cycle'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'total_amount_per_cycle', 'account_name', 'opportunity',
            'opportunity_name'
        ]

    def update(self, instance, validated_data):
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)
