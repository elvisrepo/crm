from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django.db import transaction
from .models import Contact
from .serializers import ContactSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin # Import the mixin

class ContactList(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    def get_queryset(self):
        # Only show active contacts by default
        queryset = Contact.objects.filter(is_active=True)
        
        # Filter by account if account_id is provided in query params
        account_id = self.request.query_params.get('account_id')
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        
        return queryset

    def perform_create(self, serializer):
        # Automatically set the owner to the requesting user
        serializer.save(owner=self.request.user)

class ContactDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show active contacts by default
        return Contact.objects.filter(is_active=True)

