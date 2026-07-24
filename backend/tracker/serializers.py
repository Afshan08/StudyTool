from rest_framework import serializers
from .models import Category, StudySession, SessionEditHistory, VideoEntry, Project, TextDetail, ProjectFile, ProjectSummary

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

class SessionEditHistorySerializer(serializers.ModelSerializer):
    edited_by_username = serializers.CharField(source='edited_by.username', read_only=True)

    class Meta:
        model = SessionEditHistory
        fields = [
            'id', 'edited_by_username', 'previous_category', 'new_category',
            'previous_duration', 'new_duration', 'previous_notes', 'new_notes',
            'reason', 'edited_at'
        ]
        read_only_fields = ['id', 'edited_by_username', 'edited_at']

class VideoEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoEntry
        fields = ['id', 'file', 'duration', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class StudySessionSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    video = VideoEntrySerializer(read_only=True)
    edit_histories = SessionEditHistorySerializer(many=True, read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'category', 'category_details', 'start_time', 'end_time',
            'duration', 'worked_on', 'next_task', 'stop_reason',
            'is_deleted', 'created_at', 'updated_at', 'video', 'edit_histories',
            'is_paused', 'last_start_time'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'video', 'edit_histories']

    def validate_category(self, value):
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("Category does not belong to the user.")
        return value

class TextDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextDetail
        fields = ['id', 'project', 'created_at', 'log_text', 'hours_worked', 'achievement']
        read_only_fields = ['id', 'created_at', 'project']

class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = ['id', 'project', 'file_format', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class ProjectSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSummary
        fields = [
            'id', 'project', 'week_number', 'summary_text',
            'blindspots_detected', 'goal_completion_progress',
            'actionable_tips', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ProjectSerializer(serializers.ModelSerializer):
    logs = TextDetailSerializer(many=True, read_only=True)
    files = ProjectFileSerializer(many=True, read_only=True)
    summaries = ProjectSummarySerializer(many=True, read_only=True)
    total_hours_worked = serializers.SerializerMethodField()
    latest_progress = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'smart_goal', 'status', 'audit_pending', 'created_at', 'updated_at',
            'logs', 'files', 'summaries', 'total_hours_worked', 'latest_progress'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'audit_pending']

    def validate_smart_goal(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("SMART Goal Gatekeeper: A project cannot be initialized without a populated SMART Goal defining explicit target & definition of done.")
        return value.strip()

    def get_total_hours_worked(self, obj):
        return sum(float(log.hours_worked) for log in obj.logs.all())

    def get_latest_progress(self, obj):
        latest_summary = obj.summaries.first()
        return latest_summary.goal_completion_progress if latest_summary else 0

