from rest_framework import serializers
from .models import Activity
from django.contrib.auth import get_user_model
from accounts.models import Account
from opportunities.models import Opportunity
from contracts.models import Contract
from orders.models import Order
from invoices.models import Invoice
from contacts.models import Contact
from leads.models import Lead

User = get_user_model()

# Summary serializers for nested representations
class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class AccountSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name']


class OpportunitySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = ['id', 'name']


class ContractSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ['id', 'status', 'start_date', 'end_date']


class OrderSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'order_date', 'status']


class InvoiceSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'status']


class ContactSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name']


class LeadSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['id', 'first_name', 'last_name', 'company']


class ActivitySerializer(serializers.ModelSerializer):

    # Nested read representations for all related entities (for serialization - sending to frontend)
    assigned_to = UserSummarySerializer(read_only=True)
    account = AccountSummarySerializer(read_only=True)
    opportunity = OpportunitySummarySerializer(read_only=True)
    contract = ContractSummarySerializer(read_only=True)
    order = OrderSummarySerializer(read_only=True)
    invoice = InvoiceSummarySerializer(read_only=True)
    contact = ContactSummarySerializer(read_only=True)
    lead = LeadSummarySerializer(read_only=True)
    contacts = ContactSummarySerializer(many=True, read_only=True)
    leads = LeadSummarySerializer(many=True, read_only=True)
    attendees = UserSummarySerializer(many=True, read_only=True)

    # Writable ID fields for foreign key relationships (for deserialization - receiving from frontend)
    # These map API field names (e.g., 'account_id') to model field names (e.g., 'account')
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),  # Validates ID exists in User table
        source='assigned_to',  # Maps to model's 'assigned_to' field
        write_only=True
    )
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),  # Validates ID exists in Account table
        source='account',  # Maps to model's 'account' field
        write_only=True,
        allow_null=True,
        required=False
    )

    opportunity_id = serializers.PrimaryKeyRelatedField(
        queryset=Opportunity.objects.all(),
        source='opportunity',
        write_only=True,
        allow_null=True,
        required=False
    )
    contract_id = serializers.PrimaryKeyRelatedField(
        queryset=Contract.objects.all(),
        source='contract',
        write_only=True,
        allow_null=True,
        required=False
    )
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(),
        source='order',
        write_only=True,
        allow_null=True,
        required=False
    )
    invoice_id = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(),
        source='invoice',
        write_only=True,
        allow_null=True,
        required=False
    )
    contact_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(),
        source='contact',
        write_only=True,
        allow_null=True,
        required=False
    )
    lead_id = serializers.PrimaryKeyRelatedField(
        queryset=Lead.objects.all(),
        source='lead',
        write_only=True,
        allow_null=True,
        required=False
    )
    attendees_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='attendees',
        write_only=True,
        many=True,
        required=False
    )
    contacts_ids = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(),
        source='contacts',
        write_only=True,
        many=True,
        required=False
    )
    leads_ids = serializers.PrimaryKeyRelatedField(
        queryset=Lead.objects.all(),
        source='leads',
        write_only=True,
        many=True,
        required=False
    )

    # Computed fields for simplified UI rendering
    related_to_type = serializers.SerializerMethodField()
    related_to_name = serializers.SerializerMethodField()
    name_type = serializers.SerializerMethodField()
    name_display = serializers.SerializerMethodField()



    class Meta:
        model = Activity
        fields = [
            'id', 'type', 'subject', 'description', 'status', 'priority',
            'due_date', 'start_time', 'end_time', 'is_all_day_event', 'location',
            'assigned_to', 'assigned_to_id',
            'account', 'account_id',
            'opportunity', 'opportunity_id',
            'contract', 'contract_id',
            'order', 'order_id',
            'invoice', 'invoice_id',
            'contact', 'contact_id',
            'lead', 'lead_id',
            'contacts', 'contacts_ids',
            'leads', 'leads_ids',
            'attendees', 'attendees_ids',
            'related_to_type', 'related_to_name',
            'name_type', 'name_display',
            'version', 'created_at', 'updated_at'
        ]

        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'version': {'read_only': False}
        }

    # SerializerMethodField methods
    # obj = the Activity instance being serialized
    # self = the serializer instance
    
    def get_related_to_type(self, obj):
        """Return the type of the 'what' relationship.
        Example: If related to Account → returns 'account'
        """
        what_obj = obj.what_object
        if what_obj:
            # what_obj.__class__.__name__ → 'Account', then .lower() → 'account'
            return what_obj.__class__.__name__.lower()
        return None

    def get_related_to_name(self, obj):
        """Return the display name of the 'what' relationship.
        Example: Account → 'Acme Corp', Invoice → 'INV-001'
        """
        what_obj = obj.what_object
        if what_obj:
            # Handle different naming conventions across models
            if hasattr(what_obj, 'name'):
                return what_obj.name  # Account, Opportunity
            elif hasattr(what_obj, 'invoice_number'):
                return what_obj.invoice_number  # Invoice
            return str(what_obj)  # Fallback
        return None



    def get_name_type(self, obj):
        """Return the type of the 'who' relationship.
        Example: If related to Contact → returns 'contact'
        """
        who_obj = obj.who_object
        if who_obj:
            return who_obj.__class__.__name__.lower()
        return None

    def get_name_display(self, obj):
        """Return the display name of the 'who' relationship.
        Example: Contact/Lead → 'John Doe'
        """
        who_obj = obj.who_object
        if who_obj:
            # Handle contacts and leads (both have first_name/last_name)
            if hasattr(who_obj, 'first_name') and hasattr(who_obj, 'last_name'):
                return f"{who_obj.first_name} {who_obj.last_name}"
            return str(who_obj)
        return None

    def validate(self, data):
        """Validate that only one 'what' relationship is set, and handle 'who' relationships.
        data = dictionary of validated field values (IDs already converted to objects)
        """
        # Check "what" relationships
        what_fields = ['account', 'opportunity', 'contract', 'order', 'invoice']
        what_count = sum(1 for field in what_fields if data.get(field) is not None)
        
        if what_count > 1:
            raise serializers.ValidationError(
                "Only one 'Related To' relationship can be set (account, opportunity, contract, order, or invoice)."
            )
        
        # Check "who" relationships - allow multiple via contacts/leads ManyToMany
        # But don't allow mixing single (contact/lead) with multiple (contacts/leads)
        has_single_contact = data.get('contact') is not None
        has_single_lead = data.get('lead') is not None
        has_multiple_contacts = len(data.get('contacts', [])) > 0
        has_multiple_leads = len(data.get('leads', [])) > 0
        
        # Can't mix contact types (contacts vs leads)
        if (has_single_contact or has_multiple_contacts) and (has_single_lead or has_multiple_leads):
            raise serializers.ValidationError(
                "Cannot mix contacts and leads in the 'Name' field."
            )
        
        # Validate end_time is after start_time for events
        if data.get('type') == 'Event':
            start_time = data.get('start_time')
            end_time = data.get('end_time')
            if start_time and end_time and end_time <= start_time:
                raise serializers.ValidationError(
                    "End time must be after start time for events."
                )
        
        return data

    def update(self, instance, validated_data):
        """Handle version increment for optimistic locking.
        instance = existing Activity object from database (OLD values)
        validated_data = dictionary of new values from request (NEW values)
        """
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)

class ActivityTimelineSerializer(serializers.ModelSerializer):
    """Lightweight serializer for timeline display."""
    
    assigned_to_name = serializers.SerializerMethodField()
    related_to_display = serializers.SerializerMethodField()
    name_display = serializers.SerializerMethodField()
    type_icon = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = [
            'id', 'type', 'subject', 'description', 'status', 'priority',
            'due_date', 'start_time', 'end_time', 'assigned_to_name',
            'related_to_display', 'name_display', 'type_icon', 'created_at'
        ]
    
    def get_assigned_to_name(self, obj):
        """Return the assigned user's display name."""
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.email
        return None
    
    def get_related_to_display(self, obj):
        """Return a formatted display string for the 'what' relationship."""
        what_obj = obj.what_object
        if what_obj:
            type_name = what_obj.__class__.__name__
            if hasattr(what_obj, 'name'):
                return f"{type_name}: {what_obj.name}"
            elif hasattr(what_obj, 'invoice_number'):
                return f"{type_name}: {what_obj.invoice_number}"
            return f"{type_name}: {str(what_obj)}"
        return None
    
    def get_name_display(self, obj):
        """Return the display name of the 'who' relationship."""
        who_obj = obj.who_object
        if who_obj:
            if hasattr(who_obj, 'first_name') and hasattr(who_obj, 'last_name'):
                return f"{who_obj.first_name} {who_obj.last_name}"
            return str(who_obj)
        return None
    
    def get_type_icon(self, obj):
        """Return an icon identifier based on activity type."""
        icon_map = {
            'Task': 'task',
            'Event': 'event'
        }
        return icon_map.get(obj.type, 'activity')