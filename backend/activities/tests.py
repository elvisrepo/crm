from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request
from datetime import date, datetime, timedelta
from decimal import Decimal

from .models import Activity
from .serializers import ActivitySerializer, ActivityTimelineSerializer
from accounts.models import Account
from opportunities.models import Opportunity
from contracts.models import Contract
from orders.models import Order
from invoices.models import Invoice
from contacts.models import Contact
from leads.models import Lead

User = get_user_model()


class ActivitySerializerTestCase(TestCase):
    """Test cases for ActivitySerializer."""

    def setUp(self):
        """Set up test data."""
        # Create users
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123',
            first_name='Jane',
            last_name='Smith'
        )

        # Create account
        self.account = Account.objects.create(
            name='Test Account',
            owner=self.user1
        )

        # Create contact
        self.contact = Contact.objects.create(
            first_name='Bob',
            last_name='Johnson',
            email='bob@example.com',
            account=self.account,
            owner=self.user1
        )

        # Create opportunity
        self.opportunity = Opportunity.objects.create(
            name='Test Opportunity',
            stage='Prospecting',
            close_date=date.today() + timedelta(days=30),
            account=self.account,
            owner=self.user1
        )

        # Create lead
        self.lead = Lead.objects.create(
            first_name='Alice',
            last_name='Williams',
            company='Test Company',
            email='alice@example.com',
            owner=self.user1
        )

        # Create contract
        self.contract = Contract.objects.create(
            status='Draft',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
            billing_cycle='Monthly',
            account=self.account,
            opportunity=self.opportunity
        )

        # Create order
        self.order = Order.objects.create(
            order_date=date.today(),
            status='Draft',
            account=self.account,
            opportunity=self.opportunity
        )

        # Create invoice
        self.invoice = Invoice.objects.create(
            invoice_number='INV-001',
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30),
            status='Awaiting Payment',
            balance_due=Decimal('1000.00'),
            order=self.order,
            account=self.account
        )

        # Create API request factory for context
        self.factory = APIRequestFactory()

    def get_request_context(self):
        """Helper to create request context for serializers."""
        request = self.factory.get('/')
        request.user = self.user1
        return {'request': Request(request)}

    def test_serialize_task_with_all_relationships(self):
        """Test serializing a task with both 'what' and 'who' relationships."""
        activity = Activity.objects.create(
            type='Task',
            subject='Test Task',
            description='Test description',
            status='Not Started',
            priority='High',
            due_date=date.today() + timedelta(days=7),
            assigned_to=self.user1,
            account=self.account,
            contact=self.contact
        )

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        # Check basic fields
        self.assertEqual(data['type'], 'Task')
        self.assertEqual(data['subject'], 'Test Task')
        self.assertEqual(data['status'], 'Not Started')
        self.assertEqual(data['priority'], 'High')

        # Check nested representations
        self.assertEqual(data['assigned_to']['id'], self.user1.id)
        self.assertEqual(data['assigned_to']['email'], 'user1@example.com')
        self.assertEqual(data['account']['id'], self.account.id)
        self.assertEqual(data['account']['name'], 'Test Account')
        self.assertEqual(data['contact']['id'], self.contact.id)
        self.assertEqual(data['contact']['first_name'], 'Bob')

        # Check computed fields
        self.assertEqual(data['related_to_type'], 'account')
        self.assertEqual(data['related_to_name'], 'Test Account')
        self.assertEqual(data['name_type'], 'contact')
        self.assertEqual(data['name_display'], 'Bob Johnson')

    def test_serialize_event_with_opportunity(self):
        """Test serializing an event with opportunity relationship."""
        activity = Activity.objects.create(
            type='Event',
            subject='Client Meeting',
            description='Discuss project requirements',
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=1),
            location='Conference Room A',
            assigned_to=self.user1,
            opportunity=self.opportunity,
            contact=self.contact
        )
        activity.attendees.add(self.user1, self.user2)

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        # Check event-specific fields
        self.assertEqual(data['type'], 'Event')
        self.assertEqual(data['location'], 'Conference Room A')
        self.assertIsNotNone(data['start_time'])
        self.assertIsNotNone(data['end_time'])

        # Check opportunity relationship
        self.assertEqual(data['opportunity']['id'], self.opportunity.id)
        self.assertEqual(data['opportunity']['name'], 'Test Opportunity')
        self.assertEqual(data['related_to_type'], 'opportunity')
        self.assertEqual(data['related_to_name'], 'Test Opportunity')

        # Check attendees
        self.assertEqual(len(data['attendees']), 2)

    def test_create_task_with_writable_ids(self):
        """Test creating a task using writable ID fields."""
        data = {
            'type': 'Task',
            'subject': 'New Task',
            'status': 'Not Started',
            'priority': 'Normal',
            'due_date': str(date.today() + timedelta(days=5)),
            'assigned_to_id': self.user1.id,
            'account_id': self.account.id,
            'contact_id': self.contact.id
        }

        serializer = ActivitySerializer(data=data, context=self.get_request_context())
        self.assertTrue(serializer.is_valid(), serializer.errors)

        activity = serializer.save()

        # Verify the activity was created correctly
        self.assertEqual(activity.type, 'Task')
        self.assertEqual(activity.subject, 'New Task')
        self.assertEqual(activity.assigned_to, self.user1)
        self.assertEqual(activity.account, self.account)
        self.assertEqual(activity.contact, self.contact)

    def test_create_event_with_attendees(self):
        """Test creating an event with attendees."""
        start = datetime.now() + timedelta(days=2)
        end = start + timedelta(hours=2)

        data = {
            'type': 'Event',
            'subject': 'Team Meeting',
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
            'assigned_to_id': self.user1.id,
            'attendees_ids': [self.user1.id, self.user2.id]
        }

        serializer = ActivitySerializer(data=data, context=self.get_request_context())
        self.assertTrue(serializer.is_valid(), serializer.errors)

        activity = serializer.save()

        # Verify attendees were added
        self.assertEqual(activity.attendees.count(), 2)
        self.assertIn(self.user1, activity.attendees.all())
        self.assertIn(self.user2, activity.attendees.all())

    def test_validation_multiple_what_relationships(self):
        """Test that validation fails when multiple 'what' relationships are set."""
        data = {
            'type': 'Task',
            'subject': 'Invalid Task',
            'assigned_to_id': self.user1.id,
            'account_id': self.account.id,
            'opportunity_id': self.opportunity.id  # Multiple 'what' relationships
        }

        serializer = ActivitySerializer(data=data, context=self.get_request_context())
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertIn('Related To', str(serializer.errors['non_field_errors']))

    def test_validation_multiple_who_relationships(self):
        """Test that validation fails when multiple 'who' relationships are set."""
        data = {
            'type': 'Task',
            'subject': 'Invalid Task',
            'assigned_to_id': self.user1.id,
            'contact_id': self.contact.id,
            'lead_id': self.lead.id  # Multiple 'who' relationships
        }

        serializer = ActivitySerializer(data=data, context=self.get_request_context())
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertIn('Name', str(serializer.errors['non_field_errors']))

    def test_validation_end_time_before_start_time(self):
        """Test that validation fails when end_time is before start_time."""
        start = datetime.now() + timedelta(days=1)
        end = start - timedelta(hours=1)  # End before start

        data = {
            'type': 'Event',
            'subject': 'Invalid Event',
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
            'assigned_to_id': self.user1.id
        }

        serializer = ActivitySerializer(data=data, context=self.get_request_context())
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertIn('after start time', str(serializer.errors['non_field_errors']))

    def test_update_increments_version(self):
        """Test that updating an activity increments the version."""
        activity = Activity.objects.create(
            type='Task',
            subject='Original Task',
            assigned_to=self.user1,
            version=1
        )

        data = {
            'subject': 'Updated Task',
            'status': 'In Progress'
        }

        serializer = ActivitySerializer(activity, data=data, partial=True, context=self.get_request_context())
        self.assertTrue(serializer.is_valid())

        updated_activity = serializer.save()

        # Verify version was incremented
        self.assertEqual(updated_activity.version, 2)
        self.assertEqual(updated_activity.subject, 'Updated Task')

    def test_serialize_with_contract_relationship(self):
        """Test serializing activity with contract relationship."""
        activity = Activity.objects.create(
            type='Task',
            subject='Contract Review',
            assigned_to=self.user1,
            contract=self.contract
        )

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        self.assertEqual(data['contract']['id'], self.contract.id)
        self.assertEqual(data['contract']['status'], 'Draft')
        self.assertEqual(data['related_to_type'], 'contract')

    def test_serialize_with_order_relationship(self):
        """Test serializing activity with order relationship."""
        activity = Activity.objects.create(
            type='Task',
            subject='Process Order',
            assigned_to=self.user1,
            order=self.order
        )

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        self.assertEqual(data['order']['id'], self.order.id)
        self.assertEqual(data['order']['status'], 'Draft')
        self.assertEqual(data['related_to_type'], 'order')

    def test_serialize_with_invoice_relationship(self):
        """Test serializing activity with invoice relationship."""
        activity = Activity.objects.create(
            type='Task',
            subject='Review Invoice',
            assigned_to=self.user1,
            invoice=self.invoice
        )

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        self.assertEqual(data['invoice']['id'], self.invoice.id)
        self.assertEqual(data['invoice']['invoice_number'], 'INV-001')
        self.assertEqual(data['related_to_type'], 'invoice')
        self.assertEqual(data['related_to_name'], 'INV-001')

    def test_serialize_with_lead_relationship(self):
        """Test serializing activity with lead relationship."""
        activity = Activity.objects.create(
            type='Task',
            subject='Follow up with Lead',
            assigned_to=self.user1,
            lead=self.lead
        )

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        self.assertEqual(data['lead']['id'], self.lead.id)
        self.assertEqual(data['lead']['first_name'], 'Alice')
        self.assertEqual(data['lead']['company'], 'Test Company')
        self.assertEqual(data['name_type'], 'lead')
        self.assertEqual(data['name_display'], 'Alice Williams')

    def test_serialize_activity_without_relationships(self):
        """Test serializing a personal activity with no relationships."""
        activity = Activity.objects.create(
            type='Task',
            subject='Personal Task',
            assigned_to=self.user1
        )

        serializer = ActivitySerializer(activity, context=self.get_request_context())
        data = serializer.data

        # Verify computed fields are None
        self.assertIsNone(data['related_to_type'])
        self.assertIsNone(data['related_to_name'])
        self.assertIsNone(data['name_type'])
        self.assertIsNone(data['name_display'])


class ActivityTimelineSerializerTestCase(TestCase):
    """Test cases for ActivityTimelineSerializer."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )

        self.account = Account.objects.create(
            name='Test Account',
            owner=self.user
        )

        self.contact = Contact.objects.create(
            first_name='Jane',
            last_name='Smith',
            email='jane@example.com',
            account=self.account,
            owner=self.user
        )

    def test_timeline_serializer_basic_fields(self):
        """Test that timeline serializer includes basic fields."""
        activity = Activity.objects.create(
            type='Task',
            subject='Test Task',
            description='Test description',
            status='Not Started',
            priority='High',
            due_date=date.today(),
            assigned_to=self.user,
            account=self.account,
            contact=self.contact
        )

        serializer = ActivityTimelineSerializer(activity)
        data = serializer.data

        # Check basic fields
        self.assertEqual(data['type'], 'Task')
        self.assertEqual(data['subject'], 'Test Task')
        self.assertEqual(data['status'], 'Not Started')
        self.assertEqual(data['priority'], 'High')

    def test_timeline_serializer_assigned_to_name(self):
        """Test assigned_to_name computed field."""
        activity = Activity.objects.create(
            type='Task',
            subject='Test Task',
            assigned_to=self.user
        )

        serializer = ActivityTimelineSerializer(activity)
        data = serializer.data

        self.assertEqual(data['assigned_to_name'], 'John Doe')

    def test_timeline_serializer_related_to_display(self):
        """Test related_to_display computed field."""
        activity = Activity.objects.create(
            type='Task',
            subject='Test Task',
            assigned_to=self.user,
            account=self.account
        )

        serializer = ActivityTimelineSerializer(activity)
        data = serializer.data

        self.assertEqual(data['related_to_display'], 'Account: Test Account')

    def test_timeline_serializer_name_display(self):
        """Test name_display computed field."""
        activity = Activity.objects.create(
            type='Task',
            subject='Test Task',
            assigned_to=self.user,
            contact=self.contact
        )

        serializer = ActivityTimelineSerializer(activity)
        data = serializer.data

        self.assertEqual(data['name_display'], 'Jane Smith')

    def test_timeline_serializer_type_icon(self):
        """Test type_icon computed field."""
        task = Activity.objects.create(
            type='Task',
            subject='Test Task',
            assigned_to=self.user
        )

        event = Activity.objects.create(
            type='Event',
            subject='Test Event',
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(hours=1),
            assigned_to=self.user
        )

        task_serializer = ActivityTimelineSerializer(task)
        event_serializer = ActivityTimelineSerializer(event)

        self.assertEqual(task_serializer.data['type_icon'], 'task')
        self.assertEqual(event_serializer.data['type_icon'], 'event')

    def test_timeline_serializer_lightweight(self):
        """Test that timeline serializer doesn't include heavy nested objects."""
        activity = Activity.objects.create(
            type='Task',
            subject='Test Task',
            assigned_to=self.user,
            account=self.account
        )

        serializer = ActivityTimelineSerializer(activity)
        data = serializer.data

        # Verify it doesn't include full nested objects
        self.assertNotIn('account', data)
        self.assertNotIn('contact', data)
        self.assertNotIn('assigned_to', data)

        # But includes computed display fields
        self.assertIn('assigned_to_name', data)
        self.assertIn('related_to_display', data)


# --- Integration Tests for Views and Permissions ---

from rest_framework.test import APITestCase, APIClient
from rest_framework import status


class ActivityViewsTestCase(APITestCase):
    """Integration tests for Activity views, permissions, and filtering."""
    
    def setUp(self):
        """Set up test data."""
        # Create users
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            is_staff=True
        )
        
        self.user1 = User.objects.create_user(
            email='user1@test.com',
            password='testpass123',
            first_name='User',
            last_name='One'
        )
        
        self.user2 = User.objects.create_user(
            email='user2@test.com',
            password='testpass123',
            first_name='User',
            last_name='Two'
        )
        
        # Create related entities
        self.account = Account.objects.create(
            name='Test Account',
            owner=self.user1
        )
        
        self.contact = Contact.objects.create(
            first_name='John',
            last_name='Doe',
            email='john@test.com',
            account=self.account,
            owner=self.user1
        )
        
        self.opportunity = Opportunity.objects.create(
            name='Test Opportunity',
            account=self.account,
            stage='Prospecting',
            amount=Decimal('10000.00'),
            close_date=date.today() + timedelta(days=30),
            owner=self.user1
        )
        
        # Create test activities
        self.task1 = Activity.objects.create(
            type='Task',
            subject='Task for User 1',
            status='Not Started',
            priority='High',
            due_date=date.today() + timedelta(days=7),
            assigned_to=self.user1,
            account=self.account,
            contact=self.contact
        )
        
        self.task2 = Activity.objects.create(
            type='Task',
            subject='Task for User 2',
            status='In Progress',
            priority='Normal',
            due_date=date.today() + timedelta(days=14),
            assigned_to=self.user2
        )
        
        self.event1 = Activity.objects.create(
            type='Event',
            subject='Meeting with Client',
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=1),
            location='Conference Room A',
            assigned_to=self.user1,
            account=self.account
        )
        
        self.client = APIClient()
    
    # --- CRUD Operation Tests ---
    
    def test_list_activities_authenticated(self):
        """Test that authenticated users can list their activities."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/activities/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # User1 should see only their activities (task1 and event1)
        self.assertEqual(len(response.data), 2)
    
    def test_list_activities_unauthenticated(self):
        """Test that unauthenticated users cannot list activities."""
        response = self.client.get('/activities/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_activities_admin_sees_all(self):
        """Test that admin users can see all activities."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/activities/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin should see all activities
        self.assertEqual(len(response.data), 3)
    
    def test_create_activity_with_default_assigned_to(self):
        """Test creating an activity defaults assigned_to to current user."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'type': 'Task',
            'subject': 'New Task',
            'status': 'Not Started',
            'priority': 'Normal',
            'due_date': str(date.today() + timedelta(days=5))
        }
        
        response = self.client.post('/activities/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['assigned_to']['id'], self.user1.id)
        self.assertEqual(response.data['subject'], 'New Task')
    
    def test_create_activity_with_explicit_assigned_to(self):
        """Test creating an activity with explicit assigned_to."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'type': 'Task',
            'subject': 'Task for User 2',
            'assigned_to_id': self.user2.id,
            'status': 'Not Started',
            'priority': 'High'
        }
        
        response = self.client.post('/activities/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['assigned_to']['id'], self.user2.id)
    
    def test_create_activity_with_relationships(self):
        """Test creating an activity with account and contact relationships."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'type': 'Task',
            'subject': 'Follow up with client',
            'account_id': self.account.id,
            'contact_id': self.contact.id,
            'status': 'Not Started',
            'priority': 'High',
            'due_date': str(date.today() + timedelta(days=3))
        }
        
        response = self.client.post('/activities/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['account']['id'], self.account.id)
        self.assertEqual(response.data['contact']['id'], self.contact.id)
        self.assertEqual(response.data['related_to_type'], 'account')
        self.assertEqual(response.data['name_type'], 'contact')
    
    def test_create_event_with_time_validation(self):
        """Test that end_time must be after start_time for events."""
        self.client.force_authenticate(user=self.user1)
        
        start = datetime.now() + timedelta(days=1)
        end = start - timedelta(hours=1)  # End before start
        
        data = {
            'type': 'Event',
            'subject': 'Invalid Event',
            'start_time': start.isoformat(),
            'end_time': end.isoformat()
        }
        
        response = self.client.post('/activities/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('after start time', str(response.data).lower())
    
    def test_retrieve_activity_owner(self):
        """Test that activity owner can retrieve their activity."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/activities/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task1.id)
        self.assertEqual(response.data['subject'], 'Task for User 1')
    
    def test_retrieve_activity_non_owner(self):
        """Test that non-owner cannot retrieve activity."""
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/activities/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_retrieve_activity_admin(self):
        """Test that admin can retrieve any activity."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'/activities/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task1.id)
    
    def test_update_activity_with_optimistic_locking(self):
        """Test updating an activity with correct version."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'subject': 'Updated Task',
            'status': 'In Progress',
            'version': self.task1.version
        }
        
        response = self.client.patch(f'/activities/{self.task1.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], 'Updated Task')
        self.assertEqual(response.data['status'], 'In Progress')
        self.assertEqual(response.data['version'], self.task1.version + 1)
    
    def test_update_activity_version_conflict(self):
        """Test that updating with wrong version returns conflict error."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'subject': 'Updated Task',
            'version': 999  # Wrong version
        }
        
        response = self.client.patch(f'/activities/{self.task1.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('Conflict', str(response.data))
    
    def test_update_activity_non_owner(self):
        """Test that non-owner cannot update activity."""
        self.client.force_authenticate(user=self.user2)
        
        data = {
            'subject': 'Hacked Task',
            'version': self.task1.version
        }
        
        response = self.client.patch(f'/activities/{self.task1.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_activity_with_optimistic_locking(self):
        """Test deleting an activity with correct version."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'version': self.task1.version
        }
        
        response = self.client.delete(f'/activities/{self.task1.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Activity.objects.filter(id=self.task1.id).exists())
    
    def test_delete_activity_version_conflict(self):
        """Test that deleting with wrong version returns conflict error."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'version': 999  # Wrong version
        }
        
        response = self.client.delete(f'/activities/{self.task1.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
    
    def test_delete_activity_non_owner(self):
        """Test that non-owner cannot delete activity."""
        self.client.force_authenticate(user=self.user2)
        
        data = {
            'version': self.task1.version
        }
        
        response = self.client.delete(f'/activities/{self.task1.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    # --- Filtering Tests ---
    
    def test_filter_by_type(self):
        """Test filtering activities by type."""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get('/activities/?type=Task')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'Task')
    
    def test_filter_by_status(self):
        """Test filtering activities by status."""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get('/activities/?status=Not Started')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'Not Started')
    
    def test_filter_by_priority(self):
        """Test filtering activities by priority."""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get('/activities/?priority=High')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['priority'], 'High')
    
    def test_filter_by_account(self):
        """Test filtering activities by account."""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get(f'/activities/?account={self.account.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # task1 and event1
        for activity in response.data:
            self.assertEqual(activity['account']['id'], self.account.id)
    
    def test_filter_by_contact(self):
        """Test filtering activities by contact."""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get(f'/activities/?contact={self.contact.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['contact']['id'], self.contact.id)
    
    def test_filter_by_opportunity(self):
        """Test filtering activities by opportunity."""
        # Create activity with opportunity
        activity = Activity.objects.create(
            type='Task',
            subject='Opportunity Task',
            assigned_to=self.user1,
            opportunity=self.opportunity
        )
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/activities/?opportunity={self.opportunity.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['opportunity']['id'], self.opportunity.id)
    
    def test_filter_by_date_range(self):
        """Test filtering events by date range."""
        self.client.force_authenticate(user=self.user1)
        
        start_date = date.today()
        end_date = date.today() + timedelta(days=2)
        
        response = self.client.get(
            f'/activities/?start_date={start_date}&end_date={end_date}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include event1 which is tomorrow
        self.assertTrue(len(response.data) >= 1)
    
    def test_filter_by_assigned_to_admin(self):
        """Test that admin can filter by any assigned_to."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get(f'/activities/?assigned_to={self.user2.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['assigned_to']['id'], self.user2.id)
    
    # --- Permission Tests ---
    
    def test_permission_owner_can_access(self):
        """Test that activity owner has full access."""
        self.client.force_authenticate(user=self.user1)
        
        # Can retrieve
        response = self.client.get(f'/activities/{self.task1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Can update
        response = self.client.patch(
            f'/activities/{self.task1.id}/',
            {'subject': 'Updated', 'version': self.task1.version},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_permission_non_owner_denied(self):
        """Test that non-owner is denied access."""
        self.client.force_authenticate(user=self.user2)
        
        # Cannot retrieve
        response = self.client.get(f'/activities/{self.task1.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Cannot update
        response = self.client.patch(
            f'/activities/{self.task1.id}/',
            {'subject': 'Hacked', 'version': self.task1.version},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Cannot delete
        response = self.client.delete(
            f'/activities/{self.task1.id}/',
            {'version': self.task1.version},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_permission_admin_full_access(self):
        """Test that admin has full access to all activities."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Can retrieve any activity
        response = self.client.get(f'/activities/{self.task1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response = self.client.get(f'/activities/{self.task2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Can update any activity
        response = self.client.patch(
            f'/activities/{self.task1.id}/',
            {'subject': 'Admin Updated', 'version': self.task1.version},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    # --- Nested Serialization Tests ---
    
    def test_nested_serialization_includes_related_entities(self):
        """Test that response includes nested related entity data."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/activities/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check nested account data
        self.assertIn('account', response.data)
        self.assertEqual(response.data['account']['id'], self.account.id)
        self.assertEqual(response.data['account']['name'], 'Test Account')
        
        # Check nested contact data
        self.assertIn('contact', response.data)
        self.assertEqual(response.data['contact']['id'], self.contact.id)
        self.assertEqual(response.data['contact']['first_name'], 'John')
        
        # Check computed fields
        self.assertEqual(response.data['related_to_type'], 'account')
        self.assertEqual(response.data['related_to_name'], 'Test Account')
        self.assertEqual(response.data['name_type'], 'contact')
        self.assertEqual(response.data['name_display'], 'John Doe')
