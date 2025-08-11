from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from users import views

urlpatterns = [
    path('users/me/', views.current_user, name="current_user"),
    path('users/', views.users_list),
    path('users/<int:pk>', views.user_detail),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework"))
]

urlpatterns = format_suffix_patterns(urlpatterns)