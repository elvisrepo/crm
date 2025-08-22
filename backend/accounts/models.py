from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Account(models.Model):
    """
    Account model representing companies/organizations in the CRM system.
    Based on the ERD specification with optimistic locking support.
    """
    
    TYPE_CHOICES = [
        ('prospect', 'Prospect'),
        ('customer', 'Customer'),
        ('partner', 'Partner'),
        ('competitor', 'Competitor'),
    ]

    name = models.CharField(blank=False, max_length=255)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank = True)
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='prospect'
    )

    # Multiple addresses
    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)


    parent_account = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_accounts'
    )

    owner = models.ForeignKey(
        'User',
        on_delete=models.PROTECT,
        related_name='accounts'
    )

    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)


    #system fields
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['type']),
            models.Index(fields=['is_active'])
        ]

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Increment version for optimistic locking on updates."""
        if self.pk:  # If updating existing record
            self.version += 1
        super().save(*args, **kwargs)


    @property
    def child_accounts_count(self):

        # self.child_accounts  ['1','2']
        return self.child_accounts.filter(is_active=True).count()
    
    @property
    def hiearchy_path(self):
        '''full hiearchy path: parent -> child -> This account'''

        # account (id:3, parent:2)   parent(2) -> parent(1) return 1 -> 2 -> 3
        # stack -> curr.pk then its parent and so on
        #check if current account has parent

        acc = self
        stack = []   # first in last out   3-2-1

        while acc:
            stack.append(acc.name)
            acc = acc.parent_account
        stack.reverse()

        return '->'.join(stack)
    
    