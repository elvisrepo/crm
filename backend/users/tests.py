from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

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