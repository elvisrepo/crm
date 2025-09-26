from django.db import models

class Invoice(models.Model):
    class Status(models.TextChoices):
        AWAITING_PAYMENT = 'Awaiting Payment', 'Awaiting Payment'
        PARTIALLY_PAID = 'Partially Paid', 'Partially Paid'
        PAID_IN_FULL = 'Paid in Full', 'Paid in Full'
        FULFILLED = 'Fulfilled', 'Fulfilled'
        CANCELLED = 'Cancelled', 'Cancelled'

    invoice_number = models.CharField(max_length=255, unique=True)
    issue_date = models.DateField()
    due_date = models.DateField()
    
    balance_due = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.AWAITING_PAYMENT
    )

    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='invoices',
        null=True,
        blank=True
    )

    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='invoices'
    )
    contract = models.ForeignKey(
        'contracts.Contract', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='invoices'
    )
    
    notes = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-issue_date', '-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['issue_date']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.get_status_display()}"
    
    @property
    def total_amount(self):
        return sum(item.quantity * item.unit_price for item in self.line_items.all())

class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(
        Invoice, 
        on_delete=models.CASCADE, 
        related_name='line_items'
    )
    product = models.ForeignKey(
        'products.Product', 
        on_delete=models.PROTECT,
        related_name='invoice_line_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['invoice', 'product']
        ordering = ['created_at']

    def __str__(self):
        return f"{self.quantity} of {self.product.name} for Invoice {self.invoice.invoice_number}"
