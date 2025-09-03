from django.db import models
from django.conf import settings
from accounts.models import Account # Assuming Account model is in accounts app

class Contact(models.Model):
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100) # Required
    title = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=False, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Self-referencing FK for 'reports_to'
    reports_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates'
    )

    # FK to Account
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE, # If account is deleted, contacts associated with it are also deleted
        related_name='contacts'
    )

    # FK to User (Owner)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, # Refers to the custom User model
        on_delete=models.SET_NULL, # If owner is deleted, contact's owner becomes NULL
        null=True,
        related_name='owned_contacts'
    )

    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1) # For optimistic locking

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name or ''} {self.last_name}".strip()