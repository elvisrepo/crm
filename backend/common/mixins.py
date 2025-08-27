from rest_framework import status
from rest_framework.response import Response
from django.db import transaction


class OptimisticLockingMixin:
    """
    Mixin that provides optimistic locking functionality for Django REST Framework views.
    
    This mixin should be used with views that handle models with a 'version' field.
    It provides version checking to prevent concurrent modification conflicts.
    
    For CRM systems, this mixin performs HARD DELETE with version checking.
    Use OptimisticLockingSoftDeleteMixin for soft delete functionality.
    
    Usage:
        class MyDetailView(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
            queryset = MyModel.objects.all()
            serializer_class = MyModelSerializer
    """
    
    def _check_version(self, request, instance):
        """
        Performs optimistic locking check.
        
        Args:
            request: The HTTP request object containing version data
            instance: The model instance to check version against
            
        Returns:
            The locked instance on success, or an error Response on failure
        """
        client_version = request.data.get("version")
        if client_version is None:
            return Response(
                {"error": "Version field is required for this operation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            client_version = int(client_version)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid version format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Use the queryset's model to be generic across different models
            model = self.get_queryset().model
            locked_instance = model.objects.select_for_update().get(pk=instance.pk)
        except model.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if locked_instance.version != client_version:
            return Response(
                {
                    "error": "Conflict: The record has been modified by another user. Please refresh and try again.",
                    "server_version": locked_instance.version,
                },
                status=status.HTTP_409_CONFLICT,
            )

        return locked_instance

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Override update method to include optimistic locking check.
        """
        instance = self.get_object()
        check_result = self._check_version(request, instance)
        if isinstance(check_result, Response):
            return check_result
        
        # If check passes, proceed with the update logic from the parent class
        return super().update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to include optimistic locking check.
        """
        instance = self.get_object()
        check_result = self._check_version(request, instance)
        if isinstance(check_result, Response):
            return check_result

        locked_instance = check_result
        return self.perform_destroy(locked_instance)

class OptimisticLockingSoftDeleteMixin(OptimisticLockingMixin):
    """
    Mixin that provides optimistic locking with soft delete functionality.
    
    This mixin should be used with models that have both 'version' and 'is_active' fields.
    It performs version checking before soft deletion to ensure data integrity.
    
    In CRM systems, soft delete is preferred for business entities (Accounts, Contacts, etc.)
    to preserve historical data and relationships while maintaining referential integrity.
    
    Usage:
        class AccountDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
            queryset = Account.objects.all()
            serializer_class = AccountSerializer
    """
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """Soft delete with optimistic locking check"""
        instance = self.get_object()
        check_result = self._check_version(request, instance)
        if isinstance(check_result, Response):
            return check_result
        
        locked_instance = check_result
        locked_instance.is_active = False
        locked_instance.save()
        
        return Response(
            {"message": f"{locked_instance.__class__.__name__} deactivated successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
        