from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from .models import WeeklyGoal
from .serializers import UserSerializer, RegisterSerializer, WeeklyGoalSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class CustomAuthToken(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class WeeklyGoalView(APIView):
    def get(self, request):
        goal = WeeklyGoal.objects.filter(user=request.user).first()
        if not goal:
            goal = WeeklyGoal.objects.create(user=request.user, hours=40)
        serializer = WeeklyGoalSerializer(goal)
        return Response(serializer.data)

    def post(self, request):
        hours = request.data.get('hours')
        if hours is None:
            return Response({'error': 'Hours field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            hours = int(hours)
            if hours <= 0 or hours > 168:
                raise ValueError()
        except ValueError:
            return Response({'error': 'Hours must be a valid number between 1 and 168.'}, status=status.HTTP_400_BAD_REQUEST)

        goal = WeeklyGoal.objects.create(user=request.user, hours=hours)
        serializer = WeeklyGoalSerializer(goal)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
