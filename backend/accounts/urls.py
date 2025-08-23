from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from accounts import views

urlpatterns = [
    path('accounts/', views.account_list),
]

urlpatterns = format_suffix_patterns(urlpatterns)