from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()

# Create your tests here.

class UserManagerTests(TestCase):

    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }

        self.superuser_data = {
            'email': 'superuser@example.com',
            'password': 'password123',
            'first_name': 'Super',
            'last_name': 'User'
        }

    def test_create_user(self):
        '''
            Test that the custom user manager can create a user correctly.
        '''
        
        user = User.objects.create_user(**self.user_data)

        ## assertions
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.role, User.Role.USER) # defualt User role is 'User'

    def test_create_superuser(self):

        """
        Test that the custom user manager can create a superuser correctly.
        """
        superuser = User.objects.create_superuser(**self.superuser_data)

        self.assertEqual(superuser.email, 'superuser@example.com')
        self.assertTrue(superuser.check_password('password123'))
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.role, User.Role.ADMIN)

    def test_user_no_email(self):
        """Test creating a user without an email raises a ValueError."""

        data = self.user_data.copy()
        data['email'] = ''

        with self.assertRaises(ValueError):
            User.objects.create_user(**data)

    def test_create_superuser_is_staff_false(self):
        '''Test is_staff is true '''

        data = self.superuser_data.copy()
        data['is_staff']  = False

        with self.assertRaises(ValueError):
            User.objects.create_superuser(**data)

class UserModelTests(TestCase):
    """Essential tests for User model"""

    def setUp(self):
        """Create a user that can be reused across tests."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )


    def test_user_str_representation(self):
        """Test the string representation of User model."""
       
        self.assertEqual(str(self.user), 'test@example.com')

    def test_email_unique_constraint(self):
        """Test that email field has unique constraint."""
        # User already created in setUp(),  create another with same email
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                email=self.user.email,  # Same email as existing user
                password='different_password',
                first_name='Another',
                last_name='User'
            )

    def test_username_field_is_email(self):
        """Test that USERNAME_FIELD is set to email."""
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_default_values(self):
        """Test that model fields have correct default values."""
       
        self.assertEqual(self.user.role, User.Role.USER)
        self.assertEqual(self.user.version, 1)
        self.assertTrue(self.user.is_active)

class AuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)

        # client.login(username='lauren', password='secret')     client.logout()

    def test_login_success(self):
            """Test successful login and token retrieval."""
            url = reverse('token_obtain_pair')
            response = self.client.post(url, self.user_data, format='json')
            self.assertEqual(response.status_code, 200)
            self.assertIn('access', response.data)
            self.assertIn('refresh_token', response.cookies)

    def test_login_failure(self):
        ''' test failing login'''

        ## try to login with wrong email e.g.
        url = reverse('token_obtain_pair')
        data = self.user_data.copy()
        data['password'] = 'wrongpass'

        response = self.client.post(url, data, format='json')
        print(response.status_code, response.data)
        self.assertEqual(response.status_code, 401)

    ## when we have refresh token, and when we don't have it in cookie - return 401
    def test_refresh_token(self):
        """Test token refresh."""
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, self.user_data, format='json')
        refresh_cookie = login_response.cookies['refresh_token']

        refresh_url = reverse('token_refresh')
        self.client.cookies['refresh_token'] = refresh_cookie.value
        response = self.client.post(refresh_url, {}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_logout(self):
        """Test logout and cookie deletion."""
        url = reverse('logout')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.cookies['refresh_token'].value, '')


class UserAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User'
        )

    def test_get_users_list_authenticated(self):
        """Test that authenticated users can list users."""
        url = reverse('users_list')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        print(f'get users list auth: {response.data}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_get_users_list_unauthenticated(self):
        """Test that unauthenticated users cannot list users."""
        url = reverse('users_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    
    def test_get_user_detail(self):
        """Test retrieving a single user's details."""

        url = reverse('user_detail', kwargs = {'pk':self.user.pk})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.data['email'], self.user.email)

    
    def test_delete_user_permission_denied(self):
        """Test that a non-admin user cannot delete another user."""
        url = reverse('user_detail', kwargs={'pk': self.admin.pk})
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_admin_delete_user(self):
        """Test admin deleting a user."""
        url = reverse('user_detail', kwargs={'pk': self.user.pk})
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())

    def test_update_other_user_permission_denied(self):
        """Test that a user cannot update another user's details."""
        url = reverse('user_detail', kwargs={'pk': self.admin.pk})
        self.client.force_authenticate(user=self.user)
        data = {'first_name': 'Updated'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 403)

    def test_update_user_patch(self):
        """Test updating a user's details."""
        url = reverse('user_detail', kwargs={'pk': self.user.pk})
        self.client.force_authenticate(user=self.user)
        data = {'first_name': 'Updated'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    def test_update_user_put(self):
        """Test updating a user's details."""
        url = reverse('user_detail', kwargs={'pk': self.user.pk})
        self.client.force_authenticate(user=self.user)
        data = {
                'first_name': 'Updated',
                'last_name': self.user.last_name,
                'email': self.user.email,
                'version': self.user.version
            }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')