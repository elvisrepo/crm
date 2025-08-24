from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Account
from accounts.serializers import AccountSerializer

from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def account_list(request, format=None):

    if request.method == 'GET':
        accounts = Account.objects.all()
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET','PUT','DELETE'])
@permission_classes([IsAuthenticated])
def account_detail(request, pk, format=None):

    try:
        account = Account.objects.get(pk=pk)


    except Account.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    ## permissions ? 
    if not(request.user.role == 'ADMIN' or request.user == account.owner):
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    

    if request.method == 'GET':
        serializer = AccountSerializer(account)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        ## update the serializer  -- account to update, the data we want to update it with
        serializer = AccountSerializer(account, request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        account.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)