#!/usr/bin/env python
"""
Quick test script to verify search functionality on various endpoints.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from users.models import User
from contacts.views import ContactList
from accounts.views import AccountList
from users.views import UserList
from opportunities.views import OpportunityList
from contracts.views import ContractList
from orders.views import OrderList
from invoices.views import InvoiceList
from leads.views import LeadList

def test_search(view_class, endpoint_name, search_term):
    """Test search functionality for a given view."""
    factory = RequestFactory()
    user = User.objects.first()
    
    # Test with search parameter
    request = factory.get(f'/?search={search_term}')
    force_authenticate(request, user=user)
    
    view = view_class.as_view()
    response = view(request)
    
    print(f"\n{endpoint_name} - Search for '{search_term}':")
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        result_count = len(response.data) if isinstance(response.data, list) else 'N/A'
        print(f"  Results: {result_count}")
        if isinstance(response.data, list) and len(response.data) > 0:
            # Show first result summary
            first = response.data[0]
            if 'first_name' in first:
                print(f"  Sample: {first.get('first_name')} {first.get('last_name')}")
            elif 'name' in first:
                print(f"  Sample: {first.get('name')}")
            elif 'username' in first:
                print(f"  Sample: {first.get('username')}")
            elif 'invoice_number' in first:
                print(f"  Sample: {first.get('invoice_number')}")
    else:
        print(f"  Error: {response.status_code}")
    
    return response.status_code == 200

if __name__ == '__main__':
    print("Testing Search Functionality for Task 5")
    print("=" * 60)
    
    results = []
    
    # Test Contacts (5.1)
    results.append(("Contacts", test_search(ContactList, "Contacts", "bob")))
    
    # Test Accounts (5.2)
    results.append(("Accounts", test_search(AccountList, "Accounts", "acme")))
    
    # Test Users (5.3)
    results.append(("Users", test_search(UserList, "Users", "admin")))
    
    # Test Opportunities (5.4)
    results.append(("Opportunities", test_search(OpportunityList, "Opportunities", "deal")))
    
    # Test Contracts (5.5)
    results.append(("Contracts", test_search(ContractList, "Contracts", "active")))
    
    # Test Orders (5.6)
    results.append(("Orders", test_search(OrderList, "Orders", "pending")))
    
    # Test Invoices (5.7)
    results.append(("Invoices", test_search(InvoiceList, "Invoices", "inv")))
    
    # Test Leads (5.8)
    results.append(("Leads", test_search(LeadList, "Leads", "smith")))
    
    print("\n" + "=" * 60)
    print("Summary:")
    for name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"  {status} - {name}")
    
    all_passed = all(success for _, success in results)
    print("\n" + "=" * 60)
    if all_passed:
        print("All search endpoints are working correctly!")
    else:
        print("Some search endpoints failed. Check the output above.")
    print("=" * 60)
