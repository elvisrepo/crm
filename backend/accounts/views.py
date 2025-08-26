from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Account
from .serializers import AccountSerializer
from .permissions import IsAdminOrAccountOwner

from django.db import transaction

    
class AccountList(generics.ListCreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAccountOwner]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    
class AccountDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAccountOwner]

    def _check_version(self,request, instance):
        '''
            Performs optimistic locking check.
            Returns the locked instance on success or an error Response on failure.
        '''

        client_version = request.data.get('version')
        if client_version is None:
            return Response(
                {"error": "Version field is required for this operation."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        ## client version convert to int, check for wrong format since the version will be sent by the user when updating/deleting
        try:
            client_version = int(client_version)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid version format"},
                status= status.HTTP_400_BAD_REQUEST
            )

        ## fetch the instance which we want to update, make the update -> version must match, then increase version by 1
        try:
            locked_instance = Account.objects.select_for_update().get(pk=instance.pk)
        except Account.DoesNotExist:
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

        instance = self.get_object()
        check_result = self._check_version(request, instance)
        if isinstance(check_result, Response):
            return check_result
        
        # If check passes, proceed with the update logic from the parent class
        return super().update(request, *args, **kwargs)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        ''' soft delete an account, is_active --> False'''  
        instance = self.get_object() # accounts/5  get account with pk=5
        check_result = self._check_version(request, instance)
        if instance(check_result, Response):
            return check_result
        
        locked_instance = check_result
        locked_instance.is_active = False
        locked_instance.save()
        
    
        return Response(
            {"message:":"Account deactivated successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
   
        