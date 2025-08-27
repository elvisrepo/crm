from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import User
from users.serializers import UserSerializer
from rest_framework.views import APIView
from django.http import Http404

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .permissions import IsAdminOrIsSelf
from common.mixins import OptimisticLockingMixin

from rest_framework import generics

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request, format=None):
    # return user who made this request
    
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

     
class UserList(generics.ListCreateAPIView):
     queryset = User.objects.all()
     serializer_class = UserSerializer
     permission_classes = [IsAuthenticated]
    
from django.db import transaction

class UserDetail(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
     queryset = User.objects.all()
     serializer_class = UserSerializer
     permission_classes = [IsAuthenticated, IsAdminOrIsSelf]
    
