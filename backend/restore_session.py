import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'focus_journal.settings'
django.setup()

from django.utils import timezone
from tracker.models import StudySession, VideoEntry
from django.contrib.auth import get_user_model
import datetime

User = get_user_model()

# Get the user (first/only user)
user = User.objects.first()
print(f"Restoring session for user: {user.username}")

# Session details:
# Date: July 14, 2026  |  Duration: ~2 hours  |  Timezone: UTC-7
# Video file timestamp: July 14 at 10:55 AM local = 17:55 UTC
# So: end_time ≈ 17:55 UTC, start_time ≈ 15:55 UTC (2 hours earlier)

# Category: "CP handbook study" (id=3) — div 3 CF problems
CATEGORY_ID = 3

start_utc = datetime.datetime(2026, 7, 14, 15, 55, 0, tzinfo=datetime.timezone.utc)
end_utc   = datetime.datetime(2026, 7, 14, 17, 55, 0, tzinfo=datetime.timezone.utc)
duration_seconds = 2 * 3600  # 2 hours

worked_on   = "I solved Div 3 problems from Codeforces."
next_task   = "Make a proper timetable for managing different things. Also work on and learn string manipulation in C++."
stop_reason = "Participating in a CF contest or solving CF problems using only brain makes me exhausted."

from tracker.models import Category
category = Category.objects.get(id=CATEGORY_ID)

session = StudySession.objects.create(
    user=user,
    category=category,
    start_time=start_utc,
    end_time=end_utc,
    last_start_time=start_utc,
    duration=duration_seconds,
    worked_on=worked_on,
    next_task=next_task,
    stop_reason=stop_reason,
    is_paused=False,
    is_deleted=False,
)
print(f"✅ Session created  →  ID: {session.id}")
print(f"   start_time : {session.start_time}")
print(f"   end_time   : {session.end_time}")
print(f"   duration   : {session.duration}s ({session.duration//3600}h {(session.duration%3600)//60}m)")
print(f"   category   : {session.category.name}")
print(f"   worked_on  : {session.worked_on}")
print(f"   next_task  : {session.next_task}")
print(f"   stop_reason: {session.stop_reason}")

# Now link the orphaned video file to this session
orphaned_file_path = "session_videos/WhatsApp_Video_2026-07-14_at_22.54.32.mp4"

video_entry = VideoEntry.objects.create(
    session=session,
    file=orphaned_file_path,
    duration=duration_seconds,
)
print(f"\n✅ VideoEntry created  →  ID: {video_entry.id}")
print(f"   file       : {video_entry.file}")
print(f"   session_id : {video_entry.session_id}")
print(f"\n🎉 Session fully restored and video linked!")
