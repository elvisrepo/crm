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

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request, format=None):
    # return user who made this request
    
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


     
class UserList(APIView):
     '''List all users, or create a new user'''
     permission_classes = [IsAuthenticated]
     def get(self, request, format=None):
          users = User.objects.all()
          serializer = UserSerializer(users, many=True)
          return Response(serializer.data)
     
     def post(self, request, format= None):
          serializer = UserSerializer(data=request.data)
          if serializer.is_valid():
               serializer.save()
               return Response(serializer.data, status=status.HTTP_201_CREATED)
          return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    
class UserDetail(APIView):
    '''Retreive, update or delete a user instance'''
    permission_classes = [IsAuthenticated, IsAdminOrIsSelf]

   
    def get_object(self,pk):
          try:
               return User.objects.get(pk=pk)
          except User.DoesNotExist:
               raise Http404
          
          
    def get(self, request,pk, format = None):
         user = self.get_object(pk)
         serializer = UserSerializer(user)
         return Response(serializer.data)

    def put(self, request, pk, format=None):
         user = self.get_object(pk)
         serializer = UserSerializer(user, data = request.data)
         if serializer.is_valid():
              serializer.save()
              return Response(serializer.data)
         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk, format=None):
         user = self.get_object(pk)
         serializer = UserSerializer(user, data=request.data, partial= True)
         if serializer.is_valid():
              serializer.save()
              return Response(serializer.data)
         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, format=None):
         user = self.get_object(pk)
         user.delete()
         return Response(status=status.HTTP_204_NO_CONTENT)