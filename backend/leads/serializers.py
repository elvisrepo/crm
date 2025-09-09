from rest_framework import serializers
from .models import Lead

class LeadSerializer(serializers.ModelSerializer):
    """
    Serializer for the Lead model.
    Handles validation, ownership, and optimistic locking.
    """
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'first_name', 'last_name', 'company', 'title', 'email', 'phone',
            'website', 'billing_address', 'shipping_address', 'status', 'lead_source', 'industry',
            'owner', 'owner_username', 'is_active', 'created_at', 'updated_at', 'version'
        ]
        read_only_fields = ['owner', 'owner_username', 'created_at', 'updated_at']
        extra_kwargs = {
            'version': {'read_only': False}  # Required for optimistic locking mixin
        }

    def create(self, validated_data):
        """On creation, assign the current user as the owner."""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Handle version increment for optimistic locking.
        The version check is performed by the OptimisticLockingMixin in the view.
        """
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)

class LeadConversionSerializer(serializers.Serializer):
    """
    Serializer for the lead conversion action.
    Requires an opportunity_name and allows specifying not to create one.
    """
    opportunity_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    create_opportunity = serializers.BooleanField(default=True)
    opportunity_close_date = serializers.DateField(required=False)

    def validate(self, data):
        """
        Check that if an opportunity is to be created, a name is provided.
        """
        if data.get('create_opportunity') and not data.get('opportunity_name'):
            raise serializers.ValidationError("Opportunity name is required if you choose to create an opportunity.")
        return data