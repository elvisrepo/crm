from django.db import models
from django.conf import settings
from accounts.models import Account

class Opportunity(models.Model):
    """
    Opportunity model representing potential revenue-generating events.
    """
    
    STAGE_CHOICES = [
        ('qualification', 'Qualification'),
        ('meet_present', 'Meet_Present'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
    ]

    name = models.CharField(max_length=255)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='qualification')
    close_date = models.DateField(null=True, blank=True)
    next_step = models.TextField(blank=True)
    description = models.TextField(blank=True)

    account = models.ForeignKey(
        Account, 
        on_delete=models.CASCADE, 
        related_name='opportunities'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='owned_opportunities'
    )

    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['stage']),
        ]

    def __str__(self):
        return self.name