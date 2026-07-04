from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Standard AbstractUser is clean and robust.
    pass

class WeeklyGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weekly_goals')
    hours = models.IntegerField(default=40)
    effective_from = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.user.username} - {self.hours}h (from {self.effective_from})"
