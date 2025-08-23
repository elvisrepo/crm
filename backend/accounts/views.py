from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Account
from accounts.serializers import AccountSerializer

@api_view(['GET','POST'])
def account_list(request, format=None):

    if request.method == 'GET':
        accounts = Account.objects.all()
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AccountSerializer(data=Response.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)