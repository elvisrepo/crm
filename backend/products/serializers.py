from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model.
    """
    owner_username = serializers.CharField(source='owner.first_name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'standard_list_price', 
            'is_retainer_product', 'owner', 'owner_username', 'is_active', 'version', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'owner_username', 'created_at', 'updated_at']
        extra_kwargs = {
            'version': {'read_only': False}  # Required for optimistic locking
        }


    def update(self, instance, validated_data):
        """
        Handle version increment for optimistic locking.
        """
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)
