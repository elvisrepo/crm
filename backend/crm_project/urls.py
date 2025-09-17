from django.contrib import admin
from django.urls import path, include

from users.views_auth import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView
)

urlpatterns = [
    path('', include('users.urls')),
    path('', include('contacts.urls')),
    path('', include('accounts.urls')), # Add this line
    path('', include('opportunities.urls')),
    path('', include('leads.urls')),
    path('', include('products.urls')),
    path('', include('orders.urls')),
    path('', include('contracts.urls')),
    path("admin/", admin.site.urls),

    
    path('api/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

]
