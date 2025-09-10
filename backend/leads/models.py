from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Lead(models.Model):
    """
    Lead model representing potential clients.
    This record is the source for creating an Account, Contact, and Opportunity upon conversion.
    """
    class Status(models.TextChoices):
        NEW = 'New', 'New'
        CONTACTED = 'Contacted', 'Contacted'
        QUALIFIED = 'Qualified', 'Qualified'
        CONVERTED = 'Converted', 'Converted'

    class LeadSource(models.TextChoices):
        WEB = 'Website', 'Website'
        REFERRAL = 'Referral', 'Referral'
        PARTNER = 'Partner', 'Partner'
        COLD_CALL = 'Cold Call', 'Cold Call'
        OTHER = 'Other', 'Other'

    # Core Info
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    title = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)

    # Categorization and Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW
    )
    lead_source = models.CharField(
        max_length=20,
        choices=LeadSource.choices,
        blank=True
    )
    industry = models.CharField(max_length=100, blank=True)

    # Ownership and Metadata
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='leads'
    )

    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company']),
            models.Index(fields=['last_name']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} from {self.company}"

  