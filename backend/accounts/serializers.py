from rest_framework import serializers
from .models import Account
from users.serializers import UserSerializer
from contacts.models import Contact # Import Contact model
from opportunities.models import Opportunity

# Define a minimal ContactSummarySerializer here
class ContactSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name']


class OpportunitySummarySerializer(serializers.ModelSerializer):
     class Meta:
         model =  Opportunity
         fields =['id','name', 'stage','close_date']

class AccountSerializer(serializers.ModelSerializer):
    """Main Account serializer for API operations."""
    child_accounts = serializers.SerializerMethodField()
    contacts = serializers.SerializerMethodField() # Use SerializerMethodField for contacts
    opportunities = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'id', 'name', 'phone', 'website', 'type', 'description',
            'billing_address', 'shipping_address', 'parent_account','owner',
            'is_active', 'version', 'created_at', 'updated_at', 'child_accounts',
            'contacts', 'opportunities'
        ]

        read_only_fields = ['id', 'created_at', 'updated_at','owner', 'child_accounts', 'contacts']
        extra_kwargs = {
            'version': {'read_only': False} 
        }

    def get_child_accounts(self, obj):
        """Return child accounts for this account."""
        child_accounts = obj.child_accounts.filter(is_active=True)
        return [{'id': child.id, 'name': child.name} for child in child_accounts]

    def get_contacts(self, obj):
        """Return related contacts for this account."""
        # obj.contacts.all() uses the related_name defined in Contact model
        contacts = obj.contacts.filter(is_active=True)
        return ContactSummarySerializer(contacts, many=True).data
    
    def get_opportunities(self, obj):
        '''Return related opportunities for this account'''
        opportunities = obj.opportunities.filter(is_active=True)
        return OpportunitySummarySerializer(opportunities, many=True).data
        

    def update(self, instance, validated_data):
       validated_data['version'] = instance.version + 1
       return super().update(instance, validated_data)