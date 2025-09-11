from django.db import models
from django.conf import settings

class Product(models.Model):
    """
    Represents a product or service that the company sells.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    # Use DecimalField for currency to avoid floating-point rounding errors
    standard_list_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00
    )
    is_retainer_product = models.BooleanField(default=False)
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='products'
    )

    # Standard metadata fields
    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        # Add a unique constraint for name and owner
        unique_together = ['owner', 'name']
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name