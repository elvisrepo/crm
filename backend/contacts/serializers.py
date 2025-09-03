from rest_framework import serializers
from .models import Contact
from django.conf import settings
from django.contrib.auth import get_user_model
from accounts.models import Account

# Assuming UserSerializer is in users.serializers
# You might need to adjust this import based on your actual UserSerializer location
from users.serializers import UserSerializer

# Assuming AccountSerializer is in accounts.serializers
from accounts.serializers import AccountSerializer

class ContactSerializer(serializers.ModelSerializer):
    # Nested serializer for owner to display user details instead of just ID
    owner = UserSerializer(read_only=True)
    # Nested serializer for account to display account details instead of just ID
    account = AccountSerializer(read_only=True)

    # Writable fields for FKs when creating/updating
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(), source='owner', write_only=True, required=False
    )
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source='account', write_only=True
    )
    reports_to_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), source='reports_to', write_only=True, allow_null=True, required=False
    )


    class Meta:
        model = Contact
        fields = [
            'id', 'first_name', 'last_name', 'title', 'email', 'phone',
            'description', 'reports_to', 'account', 'owner', 'is_active', 'version',
            'owner_id', 'account_id', 'reports_to_id' # Include writable FK fields
        ]
        read_only_fields = ['owner', 'account', 'reports_to'] # Make nested objects read-only
        extra_kwargs = {
            'version': {'read_only': True} # Version is managed by the backend
        }

    def update(self, instance, validated_data):
        # Increment version first
        instance.version += 1
        # Then call super().update, which will apply validated_data and save the instance
        # The incremented version will be saved along with other changes
        return super().update(instance, validated_data)
