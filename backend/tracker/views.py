from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
import datetime
import zoneinfo

from .models import Category, StudySession, SessionEditHistory, VideoEntry
from .serializers import CategorySerializer, StudySessionSerializer, VideoEntrySerializer
from accounts.models import WeeklyGoal

def get_daily_durations_for_session(session, tz_name='UTC'):
    """
    Splits a study session's duration across the calendar days it spans,
    in the user's local timezone.
    """
    try:
        tz = zoneinfo.ZoneInfo(tz_name)
    except Exception:
        tz = zoneinfo.ZoneInfo('UTC')

    start_local = session.start_time.astimezone(tz)
    end_local = session.end_time.astimezone(tz) if session.end_time else timezone.now().astimezone(tz)
    
    if start_local.date() == end_local.date():
        return {start_local.date(): int((end_local - start_local).total_seconds())}
    
    durations = {}
    current_time = start_local
    while current_time.date() < end_local.date():
        next_day = datetime.datetime.combine(current_time.date() + datetime.timedelta(days=1), datetime.time.min)
        next_day = next_day.replace(tzinfo=tz)
        
        seconds_today = int((next_day - current_time).total_seconds())
        durations[current_time.date()] = seconds_today
        current_time = next_day
        
    seconds_last_day = int((end_local - current_time).total_seconds())
    if seconds_last_day > 0:
        durations[end_local.date()] = durations.get(end_local.date(), 0) + seconds_last_day
        
    return durations

class CategoryListCreateView(APIView):
    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.validated_data['name'].strip()
        
        if Category.objects.filter(user=request.user, name__iexact=name).exists():
            return Response({'error': 'A category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        category = Category.objects.create(
            user=request.user,
            name=name,
            color=serializer.validated_data.get('color', '#3B82F6')
        )
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)

class CategoryDetailView(APIView):
    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk, user=request.user)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ActiveSessionView(APIView):
    def get(self, request):
        active_session = StudySession.objects.filter(
            user=request.user, end_time__isnull=True, is_deleted=False
        ).first()
        if not active_session:
            return Response(None, status=status.HTTP_200_OK)
        serializer = StudySessionSerializer(active_session, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        existing = StudySession.objects.filter(
            user=request.user, end_time__isnull=True, is_deleted=False
        ).first()
        if existing:
            return Response(
                {'error': 'An active timer is already running.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        category_id = request.data.get('category')
        category = None
        if category_id:
            category = get_object_or_404(Category, id=category_id, user=request.user)
            
        now_time = timezone.now()
        session = StudySession.objects.create(
            user=request.user,
            category=category,
            start_time=now_time,
            last_start_time=now_time
        )
        serializer = StudySessionSerializer(session, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class StopActiveSessionView(APIView):
    def post(self, request):
        active_session = StudySession.objects.filter(
            user=request.user, end_time__isnull=True, is_deleted=False
        ).first()
        if not active_session:
            return Response({'error': 'No active session found.'}, status=status.HTTP_404_NOT_FOUND)
            
        worked_on = request.data.get('worked_on', '').strip()
        next_task = request.data.get('next_task', '').strip()
        stop_reason = request.data.get('stop_reason', '').strip()
        
        if not worked_on:
            return Response({'error': 'The field "worked_on" is mandatory.'}, status=status.HTTP_400_BAD_REQUEST)
            
        now_time = timezone.now()
        active_session.end_time = now_time
        
        # If it was running (not paused), add the elapsed time of the final segment.
        if not active_session.is_paused and active_session.last_start_time:
            elapsed = int((now_time - active_session.last_start_time).total_seconds())
            active_session.duration += max(0, elapsed)
            
        active_session.is_paused = False
        active_session.worked_on = worked_on
        active_session.next_task = next_task
        active_session.stop_reason = stop_reason
        active_session.save()
        
        serializer = StudySessionSerializer(active_session, context={'request': request})
        return Response(serializer.data)

class SessionListView(APIView):
    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user, is_deleted=False)
        
        category_id = request.query_params.get('category')
        if category_id:
            sessions = sessions.filter(category_id=category_id)
            
        start_date = request.query_params.get('start_date')
        if start_date:
            sessions = sessions.filter(start_time__gte=start_date)
            
        end_date = request.query_params.get('end_date')
        if end_date:
            sessions = sessions.filter(start_time__lte=end_date)
            
        serializer = StudySessionSerializer(sessions, many=True, context={'request': request})
        return Response(serializer.data)

class SessionDetailView(APIView):
    def get(self, request, pk):
        session = get_object_or_404(StudySession, pk=pk, user=request.user, is_deleted=False)
        serializer = StudySessionSerializer(session, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        session = get_object_or_404(StudySession, pk=pk, user=request.user)
        session.is_deleted = True
        session.save()
        return Response({'message': 'Session soft-deleted successfully.'})

    def patch(self, request, pk):
        session = get_object_or_404(StudySession, pk=pk, user=request.user, is_deleted=False)
        edit_reason = request.data.get('reason', '').strip()
        if not edit_reason:
            return Response({'error': 'An edit reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        old_category_name = session.category.name if session.category else 'None'
        old_duration = session.duration
        old_worked_on = session.worked_on
        
        category_id = request.data.get('category')
        if category_id is not None:
            if category_id == '':
                session.category = None
            else:
                category = get_object_or_404(Category, id=category_id, user=request.user)
                session.category = category
                
        duration = request.data.get('duration')
        if duration is not None:
            try:
                session.duration = int(duration)
                if session.start_time:
                    session.end_time = session.start_time + datetime.timedelta(seconds=session.duration)
            except ValueError:
                return Response({'error': 'Duration must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)
                
        worked_on = request.data.get('worked_on')
        if worked_on is not None:
            session.worked_on = worked_on
            
        next_task = request.data.get('next_task')
        if next_task is not None:
            session.next_task = next_task
            
        stop_reason = request.data.get('stop_reason')
        if stop_reason is not None:
            session.stop_reason = stop_reason
            
        session.save()
        
        new_category_name = session.category.name if session.category else 'None'
        if (old_category_name != new_category_name or 
            old_duration != session.duration or 
            old_worked_on != session.worked_on):
            
            SessionEditHistory.objects.create(
                session=session,
                edited_by=request.user,
                previous_category=old_category_name,
                new_category=new_category_name,
                previous_duration=old_duration,
                new_duration=session.duration,
                previous_notes=old_worked_on,
                new_notes=session.worked_on,
                reason=edit_reason
            )
            
        serializer = StudySessionSerializer(session, context={'request': request})
        return Response(serializer.data)

class SessionRestoreView(APIView):
    def post(self, request, pk):
        session = get_object_or_404(StudySession, pk=pk, user=request.user)
        session.is_deleted = False
        session.save()
        serializer = StudySessionSerializer(session, context={'request': request})
        return Response(serializer.data)

class UploadSessionVideoView(APIView):
    def post(self, request, pk):
        session = get_object_or_404(StudySession, pk=pk, user=request.user, is_deleted=False)
        video_file = request.FILES.get('file')
        if not video_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
        duration = request.data.get('duration', 0)
        try:
            duration = int(duration)
        except ValueError:
            duration = 0
            
        if hasattr(session, 'video'):
            session.video.delete()
            
        video_entry = VideoEntry.objects.create(
            session=session,
            file=video_file,
            duration=duration
        )
        serializer = VideoEntrySerializer(video_entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class StatisticsView(APIView):
    def get(self, request):
        tz_name = request.query_params.get('timezone', 'UTC')
        try:
            tz = zoneinfo.ZoneInfo(tz_name)
        except Exception:
            tz = zoneinfo.ZoneInfo('UTC')

        local_now = timezone.now().astimezone(tz)
        local_today = local_now.date()
        
        week_start = local_today - datetime.timedelta(days=local_today.weekday())
        month_start = local_today.replace(day=1)

        sessions = StudySession.objects.filter(
            user=request.user,
            is_deleted=False,
            end_time__isnull=False
        )

        daily_totals = {}
        category_totals = {}
        category_colors = {}
        total_seconds_lifetime = 0

        for session in sessions:
            day_durations = get_daily_durations_for_session(session, tz_name)
            cat_name = session.category.name if session.category else 'Uncategorized'
            cat_color = session.category.color if session.category else '#9CA3AF'
            
            for day, seconds in day_durations.items():
                daily_totals[day] = daily_totals.get(day, 0) + seconds
                total_seconds_lifetime += seconds
                
                if cat_name not in category_totals:
                    category_totals[cat_name] = 0
                    category_colors[cat_name] = cat_color
                category_totals[cat_name] += seconds

        today_seconds = daily_totals.get(local_today, 0)
        
        week_seconds = sum(
            seconds for day, seconds in daily_totals.items()
            if day >= week_start and day <= local_today
        )
        
        month_seconds = sum(
            seconds for day, seconds in daily_totals.items()
            if day >= month_start and day <= local_today
        )

        study_dates = sorted([d for d, s in daily_totals.items() if s > 0], reverse=True)
        streak = 0
        if study_dates:
            if study_dates[0] == local_today or study_dates[0] == local_today - datetime.timedelta(days=1):
                streak = 1
                curr_date = study_dates[0]
                for next_date in study_dates[1:]:
                    if next_date == curr_date - datetime.timedelta(days=1):
                        streak += 1
                        curr_date = next_date
                    elif next_date == curr_date:
                        continue
                    else:
                        break

        category_dist = []
        for name, seconds in category_totals.items():
            category_dist.append({
                'name': name,
                'color': category_colors[name],
                'hours': round(seconds / 3600.0, 2),
                'seconds': seconds
            })

        daily_chart = []
        for i in range(6, -1, -1):
            day = local_today - datetime.timedelta(days=i)
            daily_chart.append({
                'label': day.strftime('%a'),
                'date': day.isoformat(),
                'hours': round(daily_totals.get(day, 0) / 3600.0, 2)
            })

        weekly_chart = []
        for i in range(3, -1, -1):
            w_start = week_start - datetime.timedelta(weeks=i)
            w_end = w_start + datetime.timedelta(days=6)
            w_seconds = sum(
                seconds for day, seconds in daily_totals.items()
                if day >= w_start and day <= w_end
            )
            weekly_chart.append({
                'label': f"Wk -{i}" if i > 0 else "This Wk",
                'hours': round(w_seconds / 3600.0, 2)
            })

        monthly_chart = []
        for i in range(5, -1, -1):
            year = local_today.year
            month = local_today.month - i
            while month <= 0:
                month += 12
                year -= 1
            
            m_seconds = sum(
                seconds for day, seconds in daily_totals.items()
                if day.year == year and day.month == month
            )
            month_name = datetime.date(year, month, 1).strftime('%b')
            monthly_chart.append({
                'label': f"{month_name} {year}",
                'hours': round(m_seconds / 3600.0, 2)
            })

        current_goal = WeeklyGoal.objects.filter(user=request.user).first()
        goal_hours = current_goal.hours if current_goal else 40

        stats_data = {
            'today_hours': round(today_seconds / 3600.0, 2),
            'week_hours': round(week_seconds / 3600.0, 2),
            'month_hours': round(month_seconds / 3600.0, 2),
            'lifetime_hours': round(total_seconds_lifetime / 3600.0, 2),
            'streak': streak,
            'weekly_goal': goal_hours,
            'goal_progress_percent': min(round((week_seconds / 3600.0) / goal_hours * 100, 1) if goal_hours else 0, 100.0),
            'category_distribution': category_dist,
            'charts': {
                'daily': daily_chart,
                'weekly': weekly_chart,
                'monthly': monthly_chart
            }
        }
        return Response(stats_data)

class PauseActiveSessionView(APIView):
    def post(self, request):
        active_session = StudySession.objects.filter(
            user=request.user, end_time__isnull=True, is_deleted=False
        ).first()
        if not active_session:
            return Response({'error': 'No active session found.'}, status=status.HTTP_404_NOT_FOUND)
        if active_session.is_paused:
            return Response({'error': 'Session is already paused.'}, status=status.HTTP_400_BAD_REQUEST)
        
        now_time = timezone.now()
        if active_session.last_start_time:
            elapsed = int((now_time - active_session.last_start_time).total_seconds())
            active_session.duration += max(0, elapsed)
            
        active_session.is_paused = True
        active_session.save()
        
        serializer = StudySessionSerializer(active_session, context={'request': request})
        return Response(serializer.data)

class ResumeActiveSessionView(APIView):
    def post(self, request):
        active_session = StudySession.objects.filter(
            user=request.user, end_time__isnull=True, is_deleted=False
        ).first()
        if not active_session:
            return Response({'error': 'No active session found.'}, status=status.HTTP_404_NOT_FOUND)
        if not active_session.is_paused:
            return Response({'error': 'Session is not paused.'}, status=status.HTTP_400_BAD_REQUEST)
            
        active_session.last_start_time = timezone.now()
        active_session.is_paused = False
        active_session.save()
        
        serializer = StudySessionSerializer(active_session, context={'request': request})
        return Response(serializer.data)


# -------------------------------------------------------------------
# Project Tracking & AI Optimization Module Views
# -------------------------------------------------------------------

import threading
from .models import Project, TextDetail, ProjectFile, ProjectSummary
from .serializers import (
    ProjectSerializer, TextDetailSerializer,
    ProjectFileSerializer, ProjectSummarySerializer
)
from .ai_agent import run_project_ai_audit
from .voice_pipeline import process_voice_audio_placeholder


def _run_audit_in_background(project_id: str):
    """
    Background thread: runs Ollama AI audit and saves the result.
    Sets audit_pending=True before starting and False when done.
    """
    try:
        project = Project.objects.get(pk=project_id)
        logs = TextDetail.objects.filter(project=project)
        audit_result = run_project_ai_audit(project, logs)
        current_week = project.summaries.count() + 1
        ProjectSummary.objects.create(
            project=project,
            week_number=current_week,
            summary_text=audit_result['summary_text'],
            blindspots_detected=audit_result['blindspots_detected'],
            goal_completion_progress=audit_result['goal_completion_progress'],
            actionable_tips=audit_result['actionable_tips']
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Background audit failed for project {project_id}: {e}")
    finally:
        # Always clear the pending flag so the frontend knows it's done
        try:
            Project.objects.filter(pk=project_id).update(audit_pending=False)
        except Exception:
            pass


def _transcribe_and_update_log(log_id: str, audio_bytes: bytes, filename: str):
    """
    Background thread: transcribes audio using faster-whisper and updates an
    already-saved TextDetail log entry with the result.
    """
    import tempfile, os
    tmp_path = None
    try:
        ext = os.path.splitext(filename)[1] or '.wav'
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Use a file-like adapter so process_voice_audio_placeholder can call .chunks()
        class FileLike:
            def __init__(self, path, name):
                self.path = path
                self.name = name
            def chunks(self):
                with open(self.path, 'rb') as f:
                    yield f.read()

        result = process_voice_audio_placeholder(FileLike(tmp_path, filename))
        transcription = result.get('transcription', '')

        if transcription:
            log = TextDetail.objects.get(pk=log_id)
            log.log_text = transcription
            if result.get('detected_achievement'):
                log.achievement = result['detected_achievement']
            log.save(update_fields=['log_text', 'achievement'])
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Background transcription failed for log {log_id}: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass


class ProjectListCreateView(APIView):
    def get(self, request):
        status_filter = request.query_params.get('status')
        projects = Project.objects.filter(user=request.user)
        if status_filter:
            projects = projects.filter(status=status_filter)
        serializer = ProjectSerializer(projects, many=True)

        active_count = Project.objects.filter(user=request.user, status='Active').count()
        return Response({
            'projects': serializer.data,
            'active_count': active_count,
            'max_active_limit': 3
        })

    def post(self, request):
        active_count = Project.objects.filter(user=request.user, status='Active').count()
        desired_status = request.data.get('status', 'Active')

        if desired_status == 'Active' and active_count >= 3:
            return Response({
                'error': 'Max Active Limit Reached: Maximum of 3 active projects allowed simultaneously. Please Complete or Handoff an active project to free up a slot.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save(user=request.user)
        return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        return Response(ProjectSerializer(project).data)

    def patch(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        new_status = request.data.get('status')

        if new_status == 'Active' and project.status != 'Active':
            active_count = Project.objects.filter(user=request.user, status='Active').count()
            if active_count >= 3:
                return Response({
                    'error': 'Max Active Limit Reached: Maximum of 3 active projects allowed simultaneously. Please Complete or Handoff an active project first.'
                }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProjectSerializer(project, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_project = serializer.save()
        return Response(ProjectSerializer(updated_project).data)

    def delete(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectLogListCreateView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, user=request.user)
        logs = TextDetail.objects.filter(project=project)
        serializer = TextDetailSerializer(logs, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, user=request.user)
        log_text = request.data.get('log_text', '').strip()
        hours_worked = request.data.get('hours_worked', 0.0)
        achievement = request.data.get('achievement', '')

        if not log_text:
            return Response({'error': 'log_text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            hours_worked = float(hours_worked)
        except (TypeError, ValueError):
            hours_worked = 0.0

        log = TextDetail.objects.create(
            project=project,
            log_text=log_text,
            hours_worked=hours_worked,
            achievement=achievement
        )
        return Response(TextDetailSerializer(log).data, status=status.HTTP_201_CREATED)


class ProjectFileListCreateView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, user=request.user)
        files = ProjectFile.objects.filter(project=project)
        serializer = ProjectFileSerializer(files, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, user=request.user)
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        file_format = request.data.get('file_format', '') or file_obj.name.split('.')[-1]
        project_file = ProjectFile.objects.create(
            project=project,
            file=file_obj,
            file_format=file_format
        )
        return Response(ProjectFileSerializer(project_file).data, status=status.HTTP_201_CREATED)


class ProjectAIAuditView(APIView):
    """
    Starts an async Ollama AI audit in a background thread.
    Returns immediately with audit_pending=True so the frontend can poll.
    """
    def post(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, user=request.user)

        if project.audit_pending:
            return Response(
                {'message': 'An audit is already running for this project. Please wait.'},
                status=status.HTTP_202_ACCEPTED
            )

        # Mark as pending immediately
        project.audit_pending = True
        project.save(update_fields=['audit_pending'])

        # Fire background thread
        t = threading.Thread(
            target=_run_audit_in_background,
            args=(str(project.id),),
            daemon=True
        )
        t.start()

        return Response(
            {
                'message': 'AI audit started in the background using Ollama. Check the Audit Results tab in a few moments.',
                'audit_pending': True,
                'project_id': str(project.id)
            },
            status=status.HTTP_202_ACCEPTED
        )


class VoiceTranscribeView(APIView):
    """
    Immediately saves a placeholder log entry and kicks off faster-whisper
    transcription in the background. Returns the saved log instantly.
    """
    def post(self, request):
        audio_file = request.FILES.get('audio')
        project_id = request.data.get('project_id')
        hours_worked = request.data.get('hours_worked', 1.0)
        achievement = request.data.get('achievement', '')

        if not audio_file:
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # If a project_id is provided, save a placeholder log immediately
        # so the user sees instant confirmation, then transcribe in background
        log_id = None
        if project_id:
            try:
                project = Project.objects.get(pk=project_id, user=request.user)
                log = TextDetail.objects.create(
                    project=project,
                    log_text='[Transcribing voice note... This will update automatically in a few seconds]',
                    hours_worked=float(hours_worked) if hours_worked else 1.0,
                    achievement=achievement or 'Voice note recorded — transcription in progress'
                )
                log_id = str(log.id)

                # Read audio bytes now (file stream will close after request)
                audio_bytes = audio_file.read()
                filename = audio_file.name or 'voice_recording.wav'

                t = threading.Thread(
                    target=_transcribe_and_update_log,
                    args=(log_id, audio_bytes, filename),
                    daemon=True
                )
                t.start()

                return Response({
                    'message': 'Voice note saved! Transcription is running in the background — refresh logs in a moment.',
                    'log_id': log_id,
                    'transcription_pending': True,
                    'status': 'accepted'
                }, status=status.HTTP_202_ACCEPTED)

            except Project.DoesNotExist:
                pass

        # Fallback: synchronous transcription (no project_id given)
        result = process_voice_audio_placeholder(audio_file)
        return Response(result, status=status.HTTP_200_OK)
