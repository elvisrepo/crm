from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db.models import Q
from .models import Activity
from .serializers import ActivitySerializer
from .permissions import IsActivityOwnerOrAdmin
from common.mixins import OptimisticLockingMixin


class ActivityFilter(filters.FilterSet):
    """
    FilterSet for Activity model supporting filtering by:
    - type, status, priority, assigned_to
    - All related entities (account, opportunity, contract, order, invoice, contact, lead)
    - Date range filtering (start_date, end_date)
    """
    start_date = filters.DateFilter(field_name='start_time', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='start_time', lookup_expr='lte')
    
    class Meta:
        model = Activity
        fields = {
            'type': ['exact'],
            'status': ['exact'],
            'priority': ['exact'],
            'assigned_to': ['exact'],
            'account': ['exact'],
            'opportunity': ['exact'],
            'contract': ['exact'],
            'order': ['exact'],
            'invoice': ['exact'],
            'contact': ['exact'],
            'lead': ['exact'],
        }


class ActivityList(generics.ListCreateAPIView):
    """
    List and create activities.
    
    GET: Returns activities filtered by assigned_to (current user) by default,
         unless user is admin (staff). Supports filtering by type, status, priority,
         assigned_to, and all related entities. Also supports date range filtering.
    
    POST: Creates a new activity. If assigned_to is not specified, defaults to current user.
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filterset_class = ActivityFilter
    
    def get_queryset(self):
        """
        Filter activities by assigned_to by default unless user is admin.
        Admins can see all activities.
        """
        user = self.request.user
        
        # Select related entities for performance
        queryset = Activity.objects.select_related(
            'assigned_to',
            'account',
            'opportunity',
            'contract',
            'order',
            'invoice',
            'contact',
            'lead'
        ).prefetch_related('attendees')
        
        # If user is not admin, filter to only show their activities, Do we want this behaviour? in bigger organizations maybe.
        if not user.is_staff:
            queryset = queryset.filter(assigned_to=user)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Default assigned_to to current user if not specified.
        """
        # Check if assigned_to_id was provided in the request
        if 'assigned_to' not in serializer.validated_data:
            serializer.save(assigned_to=self.request.user)
        else:
            serializer.save()


class ActivityDetail(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete an activity.
    
    GET: Returns activity details with nested related entities.
    PUT/PATCH: Updates activity with optimistic locking (version check).
    DELETE: Deletes activity with optimistic locking (version check).
    
    Permissions: Only the assigned user or admin can access.
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated, IsActivityOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Select related entities for performance.
        """
        return Activity.objects.select_related(
            'assigned_to',
            'account',
            'opportunity',
            'contract',
            'order',
            'invoice',
            'contact',
            'lead'
        ).prefetch_related('attendees')
