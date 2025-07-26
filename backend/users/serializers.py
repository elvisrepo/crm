from rest_framework import serializers
from .models import User


## Fields we want to expose in our API
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'version', 'is_active','role']

        read_only_fields = ['role', 'is_active']