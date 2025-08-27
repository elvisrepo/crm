from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Account

User = get_user_model()

# Create your tests here.

class AccountModelTests(TestCase):
    """Tests for Account model"""

    def setUp(self):
        """Create a user that can be used as account owner."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )

    def test_account_creation_with_required_fields(self):
        """Test creating an account with only required fields."""
        account = Account.objects.create(
            name='Test Company',
            owner=self.user
        )
        
        self.assertEqual(account.name, 'Test Company')
        self.assertEqual(account.owner, self.user)
        self.assertEqual(account.type, 'prospect')  # default value
        self.assertTrue(account.is_active)  # default value
        self.assertEqual(account.version, 1)  # default value
        self.assertIsNotNone(account.created_at)
        self.assertIsNotNone(account.updated_at)

    def test_account_str_representation(self):
        """Test the string representation of Account model."""
        account = Account.objects.create(
            name='Test Company',
            owner=self.user
        )
        
        self.assertEqual(str(account), 'Test Company')

    