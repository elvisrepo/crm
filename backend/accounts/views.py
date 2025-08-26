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

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        ''' soft delete an account, is_active --> False'''  
        instance = self.get_object() # accounts/5  get account with pk=5
        instance.is_active = False
        instance.save()

        return Response(
            {"message:":"Account deactivated successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
   
        