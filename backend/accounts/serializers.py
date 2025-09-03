from rest_framework import serializers
from .models import Account
from users.serializers import UserSerializer


class AccountSerializer(serializers.ModelSerializer):
    """Main Account serializer for API operations."""
    child_accounts = serializers.SerializerMethodField() # call a method to get a value
    
    class Meta:
        model = Account
        fields = [
            'id', 'name', 'phone', 'website', 'type', 'description',
            'billing_address', 'shipping_address', 'parent_account','owner',
            'is_active', 'version', 'created_at', 'updated_at', 'child_accounts'
        ]
        
        read_only_fields = ['id', 'created_at', 'updated_at', 'version','owner', 'child_accounts']
    
    def get_child_accounts(self, obj):
        """Return child accounts for this account."""
        child_accounts = obj.child_accounts.filter(is_active=True)
        return [{'id': child.id, 'name': child.name} for child in child_accounts]

    def update(self, instance, validated_data):
        # Increment version first
        instance.version += 1
        # Then call super().update, which will apply validated_data and save the instance
        # The incremented version will be saved along with other changes
        return super().update(instance, validated_data)

