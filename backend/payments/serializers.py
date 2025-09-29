from rest_framework import serializers
from .models import Payment
from accounts.serializers import AccountSerializer
from invoices.serializers import InvoiceSerializer

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for the Payment model."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    invoice = InvoiceSerializer(read_only=True)
    account = AccountSerializer(read_only=True)
    invoice_id = serializers.IntegerField(write_only=True)
    account_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_date', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'transaction_id', 'notes', 'invoice', 'account',
            'version', 'created_at', 'updated_at', 'invoice_id', 'account_id'
        ]
        read_only_fields = [
            'id', 'status_display', 'payment_method_display', 'invoice', 'account',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'version': {'read_only': False}
        }

    def update(self, instance, validated_data):
        """Handle version increment for optimistic locking."""
        instance.version += 1
        return super().update(instance, validated_data)