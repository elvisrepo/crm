from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Account
from opportunities.models import Opportunity
from products.models import Product

User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending Fulfillment', 'Pending Fulfillment'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    order_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='Pending Fulfillment')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='orders')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    owner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='owned_orders'
    )

    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f"Order {self.id} for {self.account.name}"

    @property
    def total_amount(self):
        return sum(item.price_at_purchase * item.quantity for item in self.line_items.all())


class OrderLineItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='line_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity} of {self.product.name} for Order {self.order.id}"