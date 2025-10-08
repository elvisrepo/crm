from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
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
     filter_backends = [SearchFilter]
     search_fields = ['email', 'first_name', 'last_name']
     
     def get_queryset(self):
         queryset = User.objects.all()
         # Support loading all users for dropdown (limit to reasonable number)
         load_all = self.request.query_params.get('_load_all')
         search_term = self.request.query_params.get('search')
         
         if load_all and not search_term:
             # Only return limited results if no search term
             return queryset.order_by('email')[:100]
         
         # If there's a search term, let SearchFilter handle it (don't slice before filtering)
         return queryset
    
from django.db import transaction

class UserDetail(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
     queryset = User.objects.all()
     serializer_class = UserSerializer
     permission_classes = [IsAuthenticated, IsAdminOrIsSelf]
    
