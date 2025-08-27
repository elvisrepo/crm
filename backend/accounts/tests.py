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

    def test_account_creation_with_all_fields(self):
        """Test creating an account with all optional fields."""
        account = Account.objects.create(
            name='Full Company',
            phone='+1234567890',
            website='https://example.com',
            type='customer',
            billing_address='123 Main St, City, State',
            shipping_address='456 Oak Ave, City, State',
            description='A test company with all fields',
            owner=self.user
        )
        
        self.assertEqual(account.name, 'Full Company')
        self.assertEqual(account.phone, '+1234567890')
        self.assertEqual(account.website, 'https://example.com')
        self.assertEqual(account.type, 'customer')
        self.assertEqual(account.billing_address, '123 Main St, City, State')
        self.assertEqual(account.shipping_address, '456 Oak Ave, City, State')
        self.assertEqual(account.description, 'A test company with all fields')
        self.assertEqual(account.owner, self.user)
        self.assertEqual(account.version, 1)

    def test_parent_child_account_relationship(self):
        """Test parent-child account relationship."""
        parent_account = Account.objects.create(
            name='Parent Company',
            owner=self.user
        )
        
        child_account = Account.objects.create(
            name='Child Company',
            parent_account=parent_account,
            owner=self.user
        )
        
        self.assertEqual(child_account.parent_account, parent_account)
        self.assertIn(child_account, parent_account.child_accounts.all())

    def test_child_accounts_count_property(self):
        """Test the child_accounts_count property."""
        parent_account = Account.objects.create(
            name='Parent Company',
            owner=self.user
        )
        
        # Initially no children
        self.assertEqual(parent_account.child_accounts_count, 0)
        
        # Add active child
        child1 = Account.objects.create(
            name='Child 1',
            parent_account=parent_account,
            owner=self.user
        )
        self.assertEqual(parent_account.child_accounts_count, 1)
        
        # Add inactive child (should not be counted)
        child2 = Account.objects.create(
            name='Child 2',
            parent_account=parent_account,
            owner=self.user,
            is_active=False
        )
        self.assertEqual(parent_account.child_accounts_count, 1)  # Still 1, not 2

    def test_hierarchy_path_property(self):
        """Test the hierarchy_path property."""
        # Single account (no parent)
        root_account = Account.objects.create(
            name='Root Company',
            owner=self.user
        )
        self.assertEqual(root_account.hiearchy_path, 'Root Company')
        
        # Two-level hierarchy
        child_account = Account.objects.create(
            name='Child Company',
            parent_account=root_account,
            owner=self.user
        )
        self.assertEqual(child_account.hiearchy_path, 'Root Company->Child Company')
        
        # Three-level hierarchy
        grandchild_account = Account.objects.create(
            name='Grandchild Company',
            parent_account=child_account,
            owner=self.user
        )
        self.assertEqual(grandchild_account.hiearchy_path, 'Root Company->Child Company->Grandchild Company')

    def test_account_version_increment_on_save(self):
        """Test that version increments when account is updated."""
        account = Account.objects.create(
            name='Test Company',
            owner=self.user
        )
        
        initial_version = account.version
        self.assertEqual(initial_version, 1)
        
        # Update the account
        account.name = 'Updated Company'
        account.save()
        
        # Version should increment
        self.assertEqual(account.version, initial_version + 1)


