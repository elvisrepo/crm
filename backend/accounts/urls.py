from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from accounts import views

urlpatterns = [
    path('accounts/', views.AccountList.as_view),
    path('accounts/<int:pk>', views.AccountDetail.as_view)
]

urlpatterns = format_suffix_patterns(urlpatterns)