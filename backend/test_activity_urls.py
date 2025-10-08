#!/usr/bin/env python
"""
Test script to verify activity URL routing is configured correctly.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from django.urls import reverse, resolve
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from users.models import User
from activities.views import ActivityList, ActivityDetail

def test_url_routing():
    """Test that activity URLs are properly configured."""
    print("Testing Activity URL Routing")
    print("=" * 60)
    
    # Test URL reverse resolution
    print("\n1. Testing URL Reverse Resolution:")
    try:
        list_url = reverse('activity-list')
        print(f"   ✓ activity-list URL: {list_url}")
        assert list_url == '/activities/', f"Expected '/activities/', got '{list_url}'"
    except Exception as e:
        print(f"   ✗ Failed to reverse activity-list: {e}")
        return False
    
    try:
        detail_url = reverse('activity-detail', kwargs={'pk': 1})
        print(f"   ✓ activity-detail URL: {detail_url}")
        assert detail_url == '/activities/1/', f"Expected '/activities/1/', got '{detail_url}'"
    except Exception as e:
        print(f"   ✗ Failed to reverse activity-detail: {e}")
        return False
    
    # Test URL resolution
    print("\n2. Testing URL Resolution:")
    try:
        match = resolve('/activities/')
        print(f"   ✓ /activities/ resolves to: {match.func.__name__}")
        assert match.func.view_class == ActivityList
    except Exception as e:
        print(f"   ✗ Failed to resolve /activities/: {e}")
        return False
    
    try:
        match = resolve('/activities/1/')
        print(f"   ✓ /activities/1/ resolves to: {match.func.__name__}")
        assert match.func.view_class == ActivityDetail
    except Exception as e:
        print(f"   ✗ Failed to resolve /activities/1/: {e}")
        return False
    
    # Test view accessibility
    print("\n3. Testing View Accessibility:")
    factory = RequestFactory()
    user = User.objects.first()
    
    if not user:
        print("   ⚠ No users found in database, skipping view tests")
        return True
    
    try:
        request = factory.get('/activities/')
        force_authenticate(request, user=user)
        view = ActivityList.as_view()
        response = view(request)
        print(f"   ✓ ActivityList view accessible (status: {response.status_code})")
    except Exception as e:
        print(f"   ✗ Failed to access ActivityList view: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("All URL routing tests passed! ✓")
    return True

if __name__ == '__main__':
    success = test_url_routing()
    exit(0 if success else 1)
