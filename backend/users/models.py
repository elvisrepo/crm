# backend/users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager

# Extening AbstractUser, use email instead of username, add role, version custom fields.

class User(AbstractUser):
    """
    Custom User model where email is the unique identifier for authentication,
    as defined in our ERD.
    """
    # Disable the default username field from AbstractUser
    username = None
    email = models.EmailField(_("email address"), unique=True)

    # These fields are already in AbstractUser, but we ensure they are not blank.
    first_name = models.CharField(_("first name"), max_length=150, blank=False)
    last_name = models.CharField(_("last name"), max_length=150, blank=False)

    # --- Our Custom Fields from the ERD ---
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'User'

    role = models.CharField(
        _("role"),
        max_length=50,
        choices=Role.choices,
        default=Role.USER
    )

    # is_active is already provided by AbstractUser, so we don't need to add it again.

    version = models.IntegerField(
        _("version"),
        default=1,
        help_text="For optimistic locking"
    )

    # --- Set the login field to email ---
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email