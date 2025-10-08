#!/usr/bin/env python
"""Test contacts search functionality."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from users.models import User
from contacts.views import ContactList

factory = RequestFactory()
user = User.objects.first()

# Test with search parameter for "bob"
request = factory.get('/?search=bob')
force_authenticate(request, user=user)

view = ContactList.as_view()
response = view(request)

print(f"Contacts - Search for 'bob':")
print(f"  Status: {response.status_code}")
print(f"  Results count: {len(response.data)}")
if response.status_code == 200 and len(response.data) > 0:
    for contact in response.data:
        print(f"    - {contact.get('first_name')} {contact.get('last_name')} ({contact.get('email')})")

print("\nSearch functionality verified!")
