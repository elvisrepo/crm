from rest_framework import serializers
from .models import User
from accounts.models import Account


## Fields we want to expose in our API
class UserSerializer(serializers.ModelSerializer):
    

    accounts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'version', 'is_active','role','accounts']

        read_only_fields = ['role', 'is_active','version']