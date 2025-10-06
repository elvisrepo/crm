from rest_framework import permissions


class IsActivityOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins or the assigned user to access/modify activities.
    
    Activities can only be accessed by:
    - The user to whom the activity is assigned (assigned_to)
    - Admin users
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Method called by DRF to check permissions for a specific Activity object.
        
        Args:
            request: The HTTP request
            view: The view being accessed
            obj: The Activity instance being accessed
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        # Allow if user is assigned_to or is admin
        return obj.assigned_to == request.user or request.user.is_staff
