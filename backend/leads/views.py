from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from common.mixins import OptimisticLockingSoftDeleteMixin
from .models import Lead
from .serializers import LeadSerializer, LeadConversionSerializer
from accounts.models import Account
from contacts.models import Contact
from opportunities.models import Opportunity

class LeadList(generics.ListCreateAPIView):
    """
    View for listing and creating leads.
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        By default, only show active leads that have not been converted, owned by the current user.
        """
        return Lead.objects.filter(
            owner=self.request.user, 
            is_active=True
        ).exclude(status=Lead.Status.CONVERTED).order_by('-created_at')

    # def perform_create(self, serializer):
    #     """Ensures the lead is created with the current user as the owner."""
    #     serializer.save(owner=self.request.user)

class LeadDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and soft-deleting a single lead.
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    queryset = Lead.objects.all()

    def get_queryset(self):
        """Ensure users can only access leads they own."""
        return super().get_queryset().filter(owner=self.request.user)

class LeadConvertView(generics.GenericAPIView):
    """
    A dedicated view to handle the business logic of converting a lead.
    """
    serializer_class = LeadConversionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Lead.objects.all()

    def get_queryset(self):
        """Ensure users can only access leads they own."""
        return super().get_queryset().filter(owner=self.request.user)

    def post(self, request, *args, **kwargs):
        """
        Converts a qualified Lead into an Account, a Contact, and optionally an Opportunity.
        This is an atomic transaction. If any part fails, the entire operation is rolled back.
        """
        lead = self.get_object()
        if lead.status == Lead.Status.CONVERTED:
            return Response({'error': 'This lead has already been converted.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            with transaction.atomic():
                # 1. Create Account
                account, _ = Account.objects.get_or_create(
                    name=lead.company,
                    defaults={
                        'phone': lead.phone,
                        'website': lead.website,
                        'billing_address': lead.billing_address,
                        'shipping_address': lead.shipping_address,
                        'owner': request.user
                    }
                )

                # 2. Create Contact
                contact_defaults = {
                    'account': account,
                    'first_name': lead.first_name,
                    'last_name': lead.last_name,
                    'phone': lead.phone,
                    'title': lead.title,
                    'owner': request.user
                }
                if lead.email:
                    contact, _ = Contact.objects.get_or_create(
                        email__iexact=lead.email.lower(), defaults=contact_defaults
                    )
                else:
                    contact = Contact.objects.create(**contact_defaults)

                response_data = {
                    'message': 'Lead converted successfully.',
                    'account_id': account.id,
                    'contact_id': contact.id
                }

                # 3. Optionally Create Opportunity
                if validated_data.get('create_opportunity'):
                    opportunity = Opportunity.objects.create(
                        account=account,
                        name=validated_data.get('opportunity_name'),
                        stage=Opportunity.Stage.QUALIFICATION,
                        close_date=validated_data.get('opportunity_close_date'),
                        owner=request.user
                    )
                    # OpportunityContactRole.objects.create(
                    #     opportunity=opportunity, contact=contact, role='Primary Contact'
                    # )
                    response_data['opportunity_id'] = opportunity.id

                # 5. Update Lead Status
                lead.status = Lead.Status.CONVERTED
                lead.is_active = False
                lead.save()

                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'An error occurred during conversion: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)