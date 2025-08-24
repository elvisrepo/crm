from rest_framework import serializers
from .models import Account
from users.serializers import UserSerializer


class AccountSerializer(serializers.ModelSerializer):
    """Main Account serializer for API operations."""
    class Meta:
        model = Account
        fields = [
            'id', 'name', 'phone', 'website', 'type', 'description',
            'billing_address', 'shipping_address', 'parent_account','owner',
            'is_active', 'version', 'created_at', 'updated_at'
        ]
        
        read_only_fields = ['id', 'created_at', 'updated_at', 'version','owner']