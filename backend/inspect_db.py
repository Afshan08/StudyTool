import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'focus_journal.settings')
django.setup()

from tracker.models import StudySession, VideoEntry

print("=== All Sessions (including deleted) - Latest 15 ===")
sessions = StudySession.objects.all().order_by('-start_time')[:15]
for s in sessions:
    has_video = hasattr(s, 'video') and s.video is not None
    try:
        video_check = s.video
        has_video = True
    except:
        has_video = False
    worked = (s.worked_on[:60] + '...') if s.worked_on and len(s.worked_on) > 60 else (s.worked_on or 'EMPTY')
    print(f"  ID:{s.id} | deleted:{s.is_deleted} | end_time:{s.end_time} | video:{has_video} | worked_on: {repr(worked)}")

print()
print("=== All VideoEntries ===")
videos = VideoEntry.objects.all().order_by('-uploaded_at')
for v in videos:
    print(f"  VideoID:{v.id} | SessionID:{v.session_id} | file:{v.file} | uploaded:{v.uploaded_at}")
