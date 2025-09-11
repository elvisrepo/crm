from django.db import models
from django.conf import settings
from accounts.models import Account
from products.models import Product

class Opportunity(models.Model):
    """
    Opportunity model representing potential revenue-generating events.
    """
    class Stage(models.TextChoices):
        QUALIFICATION = 'qualification', 'Qualification'
        MEET_PRESENT = 'meet_present', 'Meet/Present'
        PROPOSAL = 'proposal', 'Proposal'
        NEGOTIATION = 'negotiation', 'Negotiation'
        CLOSED_WON = 'closed_won', 'Closed Won'
        CLOSED_LOST = 'closed_lost', 'Closed Lost'

    name = models.CharField(max_length=255)
    stage = models.CharField(
        max_length=20, 
        choices=Stage.choices, 
        default=Stage.QUALIFICATION
    )
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

class OpportunityLineItem(models.Model):
    """
    A through model representing a Product included in an Opportunity.
    """
    opportunity = models.ForeignKey(
        Opportunity, 
        on_delete=models.CASCADE, 
        related_name='line_items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.PROTECT, # Don't delete a line item just because a product is deleted
        related_name='opportunity_line_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    # Price at the time of adding to the opportunity
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['opportunity', 'product'] # Prevent adding the same product twice
        ordering = ['created_at']

    def __str__(self):
        return f"{self.quantity} of {self.product.name} in {self.opportunity.name}"