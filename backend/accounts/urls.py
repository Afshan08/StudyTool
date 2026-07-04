from django.urls import path
from .views import RegisterView, CustomAuthToken, UserDetailView, WeeklyGoalView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('goal/', WeeklyGoalView.as_view(), name='user-goal'),
]
