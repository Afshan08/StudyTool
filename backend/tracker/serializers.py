from rest_framework import serializers
from .models import Category, StudySession, SessionEditHistory, VideoEntry

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
