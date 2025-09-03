from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import ContactList, ContactDetail

urlpatterns = [
    path('contacts/', ContactList.as_view(), name='contact_list'),
    path('contacts/<int:pk>/', ContactDetail.as_view(), name='contact_detail'),
]

urlpatterns = format_suffix_patterns(urlpatterns)