from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

User = get_user_model()

# Create your tests here.

class UserManagerTests(TestCase):

    def test_create_user(self):
        '''
            Test that the custom user manager can create a user correctly.
        '''
        
        user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )

        ## assertions
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.role, 'USER')

    def test_create_superUser(self):

        """
        Test that the custom user manager can create a superuser correctly.
        """
        superuser = User.objects.create_superuser(
            email='superuser@example.com',
            password='password123',
            first_name='Super',
            last_name='User'
        )

        self.assertEqual(superuser.email, 'superuser@example.com')
        self.assertTrue(superuser.check_password('password123'))
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.role, 'ADMIN')

    def test_user_no_email(self):
        """Test creating a user without an email raises a ValueError."""

        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                password='password123',
                first_name='Super',
                last_name='User'
            )

    def test_create_superuser_is_staff_false(self):
        '''Test is_staff is true '''

        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='superuser@example.com',
                password='password123',
                first_name='Super',
                last_name='User',
                is_staff = False
            )

class UserModelTests(TestCase):
    """Essential tests for User model"""

    def test_user_str_representation(self):
        """Test the string representation of User model."""
        user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(str(user), 'test@example.com')

    def test_email_unique_constraint(self):
        """Test that email field has unique constraint."""
        User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                email='test@example.com',  # Same email
                password='different_password',
                first_name='Another',
                last_name='User'
            )

    def test_username_field_is_email(self):
        """Test that USERNAME_FIELD is set to email."""
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_default_values(self):
        """Test that model fields have correct default values."""
        user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.role, User.Role.USER)
        self.assertEqual(user.version, 1)
        self.assertTrue(user.is_active)