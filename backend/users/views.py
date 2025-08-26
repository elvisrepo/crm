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

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
     queryset = User.objects.all()
     serializer_class = UserSerializer
     permission_classes = [IsAuthenticated, IsAdminOrIsSelf]

     def _check_version(self, request, instance):
        """
        Performs optimistic locking check.
        Returns the locked instance on success or an error Response on failure.
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
            locked_instance = User.objects.select_for_update().get(pk=instance.pk)
        except User.DoesNotExist:
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

        return super().update(request, *args, **kwargs)

     @transaction.atomic
     def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        check_result = self._check_version(request, instance)
        if isinstance(check_result, Response):
            return check_result

        locked_instance = check_result
        return self.perform_destroy(locked_instance)
    
