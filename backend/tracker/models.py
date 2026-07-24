from django.db import models
from django.conf import settings

class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3B82F6')  # hex color code
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name')
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0)  # in seconds
    worked_on = models.TextField(blank=True, default='')
    next_task = models.TextField(blank=True, default='')
    stop_reason = models.TextField(blank=True, default='')
    is_deleted = models.BooleanField(default=False)
    is_paused = models.BooleanField(default=False)
    last_start_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.user.username} - {self.category.name if self.category else 'No Category'} ({self.duration}s)"

class SessionEditHistory(models.Model):
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='edit_histories')
    edited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # String descriptions of changes to handle deleted categories elegantly
    previous_category = models.CharField(max_length=200, null=True, blank=True)
    new_category = models.CharField(max_length=200, null=True, blank=True)
    
    previous_duration = models.IntegerField(null=True, blank=True)
    new_duration = models.IntegerField(null=True, blank=True)
    
    previous_notes = models.TextField(null=True, blank=True)
    new_notes = models.TextField(null=True, blank=True)
    
    reason = models.TextField()
    edited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-edited_at']

    def __str__(self):
        return f"Edit for Session {self.session_id} on {self.edited_at.date()}"

class VideoEntry(models.Model):
    session = models.OneToOneField(StudySession, on_delete=models.CASCADE, related_name='video')
    file = models.FileField(upload_to='session_videos/')
    duration = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video for Session {self.session_id}"

import uuid

class Project(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Handed_Off', 'Handed Off'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    smart_goal = models.TextField(help_text="Explicit target & definition of done evaluated by AI")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    # Tracks whether an async AI audit is currently running for this project
    audit_pending = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.status})"

class TextDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='logs')
    created_at = models.DateTimeField(auto_now_add=True)
    log_text = models.TextField()
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    achievement = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Log for {self.project.name} on {self.created_at.strftime('%Y-%m-%d')}"

class ProjectFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    file_format = models.CharField(max_length=50)
    file = models.FileField(upload_to='project_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"File {self.file_format} for {self.project.name}"

class ProjectSummary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='summaries')
    week_number = models.IntegerField(default=1)
    summary_text = models.TextField()
    blindspots_detected = models.TextField(blank=True, default='')
    goal_completion_progress = models.IntegerField(default=0)  # 0 - 100 percentage
    actionable_tips = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Summary W{self.week_number} for {self.project.name}"

