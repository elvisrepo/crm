from rest_framework import serializers
from .models import Opportunity
from users.serializers import UserSerializer
from accounts.serializers import AccountSerializer
from accounts.models import Account

class OpportunitySerializer(serializers.ModelSerializer):
    """Serializer for the Opportunity model."""
    owner = UserSerializer(read_only=True)
    account = AccountSerializer(read_only=True)

    # Writable field for the account foreign key
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source='account', write_only=True
    )

    class Meta:
        model = Opportunity
        fields = [
            'id', 'name', 'stage', 'close_date', 'next_step',
            'description', 'account', 'owner', 'is_active', 'version',
            'created_at', 'updated_at', 'account_id'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'account']
        extra_kwargs = {
            'version': {'read_only': True}
        }

    def update(self, instance, validated_data):
        """Handle optimistic locking on update."""
        instance.version += 1
        return super().update(instance, validated_data)
