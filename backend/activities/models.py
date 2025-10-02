from django.db import models
from django.conf import settings
from django.db.models import Q, CheckConstraint, Case, When, Value, IntegerField

class Activity(models.Model):
    """
    Represents an activity (Task or Event) using a normalized data model.
    This model can link to various other CRM objects like Accounts, Contracts, etc.
    """
    TYPE_CHOICES = (
        ('Task', 'Task'),
        ('Event', 'Event'),
    )
    STATUS_CHOICES = (
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Waiting on someone else', 'Waiting on someone else'),
        ('Deferred', 'Deferred'),
    )
    PRIORITY_CHOICES = (
        ('High', 'High'),
        ('Normal', 'Normal'),
        ('Low', 'Low'),
    )

    type = models.CharField(max_length=10, choices=TYPE_CHOICES, help_text="Type of activity: Task or Event.")
    subject = models.CharField(max_length=255, help_text="The subject of the task or event.")
    description = models.TextField(blank=True, null=True, help_text="Detailed description of the activity.")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True, null=True, help_text="Status of the task.")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, blank=True, null=True, help_text="Priority of the task.")
    due_date = models.DateField(blank=True, null=True, help_text="Due date for tasks.")
    start_time = models.DateTimeField(blank=True, null=True, help_text="Start time for events.")
    end_time = models.DateTimeField(blank=True, null=True, help_text="End time for events.")
    is_all_day_event = models.BooleanField(default=False, help_text="Indicates if the event is an all-day event.")
    location = models.CharField(max_length=255, blank=True, null=True, help_text="Location of the event.")
    
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='activities',
        help_text="User to whom the activity is assigned."
    )

    # --- Normalized Relationships ---
    # "What" relationship (business objects)
    account = models.ForeignKey('accounts.Account', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)
    opportunity = models.ForeignKey('opportunities.Opportunity', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)
    contract = models.ForeignKey('contracts.Contract', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey('orders.Order', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)
    invoice = models.ForeignKey('invoices.Invoice', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)
    
    # "Who" relationship (people)
    contact = models.ForeignKey('contacts.Contact', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)
    lead = models.ForeignKey('leads.Lead', related_name='activities', on_delete=models.CASCADE, null=True, blank=True)

    version = models.IntegerField(default=1, help_text="Version number for optimistic locking.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- Dynamic Handling Configuration ---
    WHAT_FIELDS = ['account', 'opportunity', 'contract', 'order', 'invoice']
    WHO_FIELDS = ['contact', 'lead']

    @property
    def what_object(self):
        """Returns the related 'what' object dynamically."""
        for field_name in self.WHAT_FIELDS:
            obj = getattr(self, field_name, None)
            if obj:
                return obj
        return None

    @property
    def who_object(self):
        """Returns the related 'who' object dynamically."""
        for field_name in self.WHO_FIELDS:
            obj = getattr(self, field_name, None)
            if obj:
                return obj
        return None

    def __str__(self):
        return f"{self.get_type_display()}: {self.subject}"

    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"
        ordering = ['-created_at']
        
        indexes = [
            models.Index(fields=['assigned_to', 'due_date']),
            models.Index(fields=['account']),
            models.Index(fields=['opportunity']),
            models.Index(fields=['contract']),
            models.Index(fields=['order']),
            models.Index(fields=['invoice']),
            models.Index(fields=['contact']),
            models.Index(fields=['lead']),
        ]
        
        constraints = [
            # Ensures that at most one "what" relationship is set (DB level).
            CheckConstraint(
                check=Q(
                    Case(When(account__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField()) +
                    Case(When(opportunity__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField()) +
                    Case(When(contract__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField()) +
                    Case(When(order__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField()) +
                    Case(When(invoice__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField())
                    <= 1
                ),
                name='only_one_what_fk'
            ),
            # Ensures that at most one "who" relationship is set (DB level).
            CheckConstraint(
                check=Q(
                    Case(When(contact__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField()) +
                    Case(When(lead__isnull=False, then=Value(1)), default=Value(0), output_field=IntegerField())
                    <= 1
                ),
                name='only_one_who_fk'
            ),
        ]
