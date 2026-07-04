from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import WeeklyGoal

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        # Default weekly goal of 40 hours on registration
        WeeklyGoal.objects.create(user=user, hours=40)
        return user

class WeeklyGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyGoal
        fields = ['id', 'hours', 'effective_from']
        read_only_fields = ['id', 'effective_from']
