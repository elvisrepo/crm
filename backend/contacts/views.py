from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import Contact
from .serializers import ContactSerializer
from common.mixins import OptimisticLockingSoftDeleteMixin # Import the mixin

class ContactList(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show active contacts by default
        return Contact.objects.filter(is_active=True)

    def perform_create(self, serializer):
        # Automatically set the owner to the requesting user
        serializer.save(owner=self.request.user)

class ContactDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show active contacts by default
        return Contact.objects.filter(is_active=True)

