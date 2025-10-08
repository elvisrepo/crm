from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from .models import Account
from .serializers import AccountSerializer
from .permissions import IsAdminOrAccountOwner
from common.mixins import OptimisticLockingSoftDeleteMixin

from django.db import transaction

    
class AccountList(generics.ListCreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAccountOwner]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'website']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    
class AccountDetail(OptimisticLockingSoftDeleteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAccountOwner]
   
        