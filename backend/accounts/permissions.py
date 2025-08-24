from rest_framework import permissions

class IsAdminOrAccountOwner(permissions.BasePermission):
    """Custom permission to only allow admins or account owners to access/modify accounts."""
     
    def has_object_permission(self, request, view, obj):
        '''
            Method called by DRF to check permissions for a specific Account object.
        
            Args:
                request: The HTTP request
                view: The view being accessed  
                obj: The Account instance being accessed
                
            Returns:
                bool: True if user has permission, False otherwise
        '''
        
        return request.user.role == 'ADMIN' or request.user == obj.owner