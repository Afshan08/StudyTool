import datetime
import zoneinfo
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import Category, StudySession, SessionEditHistory
from .views import get_daily_durations_for_session

User = get_user_model()

class TrackerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.category = Category.objects.create(user=self.user, name='Programming', color='#00FF00')

    def test_category_list_create(self):
        # Create category
        response = self.client.post('/api/categories/', {'name': 'Math', 'color': '#FF0000'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Math')

        # Prevent case-insensitive duplicate names
        response = self.client.post('/api/categories/', {'name': 'MATH', 'color': '#FF0000'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_active_session_endpoints(self):
        # Start session
        response = self.client.post('/api/sessions/active/', {'category': self.category.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['id'])
        self.assertIsNone(response.data['end_time'])

        # Start duplicate active session (should error)
        response = self.client.post('/api/sessions/active/', {'category': self.category.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Stop active session
        response = self.client.post('/api/sessions/active/stop/', {
            'worked_on': 'Fixed some tree bugs',
            'next_task': 'Practice graphs',
            'stop_reason': 'Tired'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['end_time'])
        self.assertEqual(response.data['worked_on'], 'Fixed some tree bugs')

    def test_session_edit_audit_history(self):
        # Create a finished study session
        session = StudySession.objects.create(
            user=self.user,
            category=self.category,
            start_time=timezone.now() - datetime.timedelta(hours=2),
            end_time=timezone.now(),
            duration=7200,
            worked_on='Original notes'
        )

        # Edit session (mandates edit reason)
        url = f'/api/sessions/{session.id}/'
        response = self.client.patch(url, {
            'worked_on': 'Updated notes',
            'reason': 'Forgot to add details'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify SessionEditHistory record was generated
        history = SessionEditHistory.objects.filter(session=session).first()
        self.assertIsNotNone(history)
        self.assertEqual(history.reason, 'Forgot to add details')
        self.assertEqual(history.previous_notes, 'Original notes')
        self.assertEqual(history.new_notes, 'Updated notes')

    def test_midnight_session_splitting(self):
        # Create a session spanning midnight UTC
        # Starting 2026-06-28 22:00 UTC and ending 2026-06-29 02:00 UTC
        tz = zoneinfo.ZoneInfo('UTC')
        start = datetime.datetime(2026, 6, 28, 22, 0, tzinfo=tz)
        end = datetime.datetime(2026, 6, 29, 2, 0, tzinfo=tz)

        session = StudySession.objects.create(
            user=self.user,
            category=self.category,
            start_time=start,
            end_time=end,
            duration=14400 # 4 hours
        )

        daily_durations = get_daily_durations_for_session(session, 'UTC')
        
        # Verify split
        self.assertEqual(len(daily_durations), 2)
        
        # June 28: 2 hours (7200 seconds)
        date1 = datetime.date(2026, 6, 28)
        self.assertEqual(daily_durations[date1], 7200)

        # June 29: 2 hours (7200 seconds)
        date2 = datetime.date(2026, 6, 29)
        self.assertEqual(daily_durations[date2], 7200)
