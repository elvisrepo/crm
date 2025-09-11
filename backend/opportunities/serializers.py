from rest_framework import serializers
from .models import Opportunity, OpportunityLineItem
from products.models import Product
from users.serializers import UserSerializer
from accounts.serializers import AccountSerializer
from accounts.models import Account

# A simple serializer to show opportunity details within a line item
class OpportunitySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = ['id', 'name']

# A simple serializer to show product details within a line item
class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'standard_list_price']

class OpportunityLineItemSerializer(serializers.ModelSerializer):
    """Serializer for OpportunityLineItem model."""
    opportunity = OpportunitySummarySerializer(read_only=True)
    product = ProductSummarySerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = OpportunityLineItem
        fields = [
            'id', 'opportunity', 'product', 'product_id', 'quantity', 'sale_price', 
            'is_active', 'version', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'opportunity', 'created_at', 'updated_at']
        extra_kwargs = {
            'version': {'read_only': False} # Required for optimistic locking
        }

    def create(self, validated_data):
        """
        When creating a line item, if the sale_price is not provided,
        default to the product's standard_list_price.
        """
        product = validated_data.get('product')
        if 'sale_price' not in validated_data:
            validated_data['sale_price'] = product.standard_list_price
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Handle version increment for optimistic locking."""
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)

class OpportunitySerializer(serializers.ModelSerializer):
    """Serializer for the Opportunity model."""
    owner = UserSerializer(read_only=True)
    account = AccountSerializer(read_only=True)
    line_items = OpportunityLineItemSerializer(many=True, read_only=True)

    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source='account', write_only=True
    )

    class Meta:
        model = Opportunity
        fields = [
            'id', 'name', 'stage', 'close_date', 'next_step',
            'description', 'account', 'owner', 'is_active', 'version',
            'created_at', 'updated_at', 'account_id', 'line_items'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'account', 'line_items']
        extra_kwargs = {
            'version': {'read_only': False}
        }

    def update(self, instance, validated_data):
        """
        Handle version increment for optimistic locking.
        The version check is performed by the OptimisticLockingMixin in the view.
        """
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)
