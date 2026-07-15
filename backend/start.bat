@echo off
echo ============================================================
echo  Focus Journal - Production Server
echo ============================================================

REM Collect static files from Django apps + WhiteNoise
echo [1/3] Collecting static files...
python manage.py collectstatic --noinput

REM Run any pending database migrations
echo [2/3] Applying database migrations...
python manage.py migrate

REM Start Waitress production WSGI server on port 8000
echo [3/3] Starting Waitress server on http://localhost:8000
echo  Press Ctrl+C to stop.
echo ============================================================
waitress-serve --host=0.0.0.0 --port=8000 focus_journal.wsgi:application
