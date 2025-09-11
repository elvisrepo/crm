from django.urls import path
from . import views

urlpatterns = [
    # Main opportunity routes
    path('opportunities/', views.OpportunityList.as_view(), name='opportunity-list'),
    path('opportunities/<int:pk>/', views.OpportunityDetail.as_view(), name='opportunity-detail'),

    # Nested line item routes
    path(
        'opportunities/<int:opportunity_pk>/line_items/',
        views.OpportunityLineItemList.as_view(),
        name='opportunity-line-item-list'
    ),
    path(
        'opportunities/<int:opportunity_pk>/line_items/<int:pk>/',
        views.OpportunityLineItemDetail.as_view(),
        name='opportunity-line-item-detail'
    ),
]
