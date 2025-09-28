from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from datetime import timedelta

from accounts.models import Account
from opportunities.models import Opportunity
from products.models import Product

User = get_user_model()

class Contract(models.Model):
    STATUS_CHOICES = [
        ('Awaiting Payment', 'Awaiting Payment'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid in Full', 'Paid in Full'),
        ('Fulfilled', 'Fulfilled'),
        ('Cancelled', 'Cancelled'),
    ]

    BILLING_CYCLE_CHOICES = [
        ('Monthly', 'Monthly'),
        ('Annually', 'Annually'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Awaiting Payment')
    start_date = models.DateField()
    end_date = models.DateField()
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES)
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='contracts')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, null=True, blank=True, related_name='contracts')
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    owner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='owned_contracts'
    )

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"Contract {self.id} for {self.account.name}"

    @property
    def total_amount_per_cycle(self):
        return sum(item.price_per_cycle * item.quantity for item in self.line_items.all())

    def get_current_billing_cycle(self):
        """
        Calculates the start and end dates of the current billing cycle.
        This method is timezone-aware.
        Returns a tuple (start_date, end_date) or (None, None) if invalid.
        """
        today = timezone.now().date()

        if self.billing_cycle == 'Monthly':
            cycle_start = today.replace(day=1)
            cycle_end = cycle_start + relativedelta(months=1) - timedelta(days=1)
            return cycle_start, cycle_end
        elif self.billing_cycle == 'Annually':
            cycle_start = today.replace(month=1, day=1)
            cycle_end = cycle_start + relativedelta(years=1) - timedelta(days=1)
            return cycle_start, cycle_end
        
        return None, None # Should not be reached with valid data


class ContractLineItem(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='line_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_per_cycle = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity} of {self.product.name} for Contract {self.contract.id}"