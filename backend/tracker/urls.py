from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    ActiveSessionView, StopActiveSessionView,
    SessionListView, SessionDetailView, SessionRestoreView,
    UploadSessionVideoView, StatisticsView,
    PauseActiveSessionView, ResumeActiveSessionView,
    ProjectListCreateView, ProjectDetailView,
    ProjectLogListCreateView, ProjectFileListCreateView,
    ProjectAIAuditView, VoiceTranscribeView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    path('sessions/', SessionListView.as_view(), name='session-list'),
    # Specific sub-paths MUST come before the generic active/ route
    path('sessions/active/pause/', PauseActiveSessionView.as_view(), name='session-active-pause'),
    path('sessions/active/resume/', ResumeActiveSessionView.as_view(), name='session-active-resume'),
    path('sessions/active/stop/', StopActiveSessionView.as_view(), name='session-active-stop'),
    path('sessions/active/', ActiveSessionView.as_view(), name='session-active'),
    path('sessions/<int:pk>/restore/', SessionRestoreView.as_view(), name='session-restore'),
    path('sessions/<int:pk>/video/', UploadSessionVideoView.as_view(), name='session-video-upload'),
    path('sessions/<int:pk>/', SessionDetailView.as_view(), name='session-detail'),

    path('statistics/', StatisticsView.as_view(), name='statistics'),

    # Project Tracking & AI Optimization Endpoints
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/transcribe-voice/', VoiceTranscribeView.as_view(), name='voice-transcribe'),
    path('projects/<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<uuid:project_id>/logs/', ProjectLogListCreateView.as_view(), name='project-log-list-create'),
    path('projects/<uuid:project_id>/files/', ProjectFileListCreateView.as_view(), name='project-file-list-create'),
    path('projects/<uuid:project_id>/ai-audit/', ProjectAIAuditView.as_view(), name='project-ai-audit'),
]

