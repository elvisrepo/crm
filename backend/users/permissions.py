from rest_framework import permissions

class IsAdminOrIsSelf(permissions.BasePermission):
    """Custom permission to only allow admins or the user themselves to edit their own profile."""
     
    def has_object_permission(self, request, view, obj):
        '''
            Method called by DRF to check permissions for a specific object
            - view that is being accessed
            - objectobj - Database object that the request is targetting (User instance)
        '''
        
        return request.user.role == 'ADMIN' or request.user == obj