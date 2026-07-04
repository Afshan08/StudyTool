# Focus Journal – Software Design Document

# Project Goal

Build a distraction-free study tracking application designed specifically for long-term skill development (Competitive Programming, Mathematics, etc.).

Unlike a normal stopwatch, the application should answer questions like:

* Am I consistently studying?
* Am I meeting my weekly goal?
* What exactly did I work on?
* What did I accomplish today?
* Why did I stop?
* How has my consistency changed over months?
* Where is my time actually going?

The application should become a personal training journal rather than simply a timer.

---

# Core Principles

* Beautiful minimal interface
* Fast to start a session
* No unnecessary features
* Accurate data
* Every study session should have context
* Editing should preserve history
* Statistics should motivate rather than distract

---

# Technology Stack

## Backend

* Django
* Django REST Framework

Reason:

* Familiar
* Excellent ORM
* Easy authentication
* Reliable API development

---

## Frontend

React + TypeScript

Reason:

* Timer UI updates smoothly
* Easier state management
* Component based architecture
* Charts integrate easily

---

## Styling

Tailwind CSS

Reason:

* Fast development
* Clean modern UI
* Easy responsive layouts

---

## Charts

Recharts

Used for:

* Daily study graph
* Weekly graph
* Monthly graph
* Category distribution
* Goal progress

---

## Database

PostgreSQL

Reason:

* Reliable
* Handles relations well
* Easy analytics queries
* Production ready

SQLite may be used during development.

---

## Authentication

Django Authentication

Future:

Google Login

---

## File Storage

Development

Media folder

Production

Cloud storage (optional)

Only short clips (20–30 seconds).

---

# Main Features

## 1. Dashboard

Display

* Today's study time
* Weekly progress
* Weekly goal
* Remaining hours
* Active streak
* Recent sessions
* Goal completion percentage

---

## 2. Timer

Features

* Start
* Pause
* Resume
* Stop

Timer should continue even when:

* User switches tabs
* Browser window loses focus

Stopping requires session completion.

---

## 3. Category Selection

Before timer starts

Choose category

Examples

* Competitive Programming
* Math Olympiad
* Data Analytics
* Django
* Reading

Add new category dynamically.

---

## 4. Session Completion

Stopping a session opens a mandatory form.

Required fields

Worked on

Next task

Reason for stopping

Each field should accept only a short response.

---

## 5. Session History

Display

Start time

End time

Duration

Category

Notes

Search

Filter

Sort

---

## 6. Edit Session

Editable fields

Category

Duration

Notes

Date

Every edit requires

Reason for edit

Original data should be preserved.

---

## 7. Weekly Goal

Default

40 hours

User can change later.

Display

Hours completed

Hours remaining

Percentage

Average daily requirement

---

## 8. Statistics

Daily

Weekly

Monthly

Yearly

Category statistics

Average session length

Longest session

Best week

Best month

Most studied category

Total lifetime hours

---

## 9. Calendar

Every day should show

No study

Studied

Goal met

Clicking a day opens all sessions.

---

## 10. Video Journal

Optional

Attach

Short recording

Maximum 30 seconds.

Associated with one study session.

---

## 11. Search

Search sessions by

Category

Notes

Date

Keywords

---

# Data Model

User

* id
* username

---

Category

* id
* user
* name
* color
* created_at

---

StudySession

* id
* user
* category
* start_time
* end_time
* duration
* worked_on
* next_task
* stop_reason
* created_at
* updated_at

---

SessionEditHistory

* id
* session
* edited_by
* previous_category
* previous_duration
* previous_notes
* new_category
* new_duration
* new_notes
* reason
* edited_at

---

WeeklyGoal

* id
* user
* hours
* effective_from

---

VideoEntry

* id
* session
* file
* duration
* uploaded_at

---

# API Structure

Authentication

/api/auth/

Categories

/api/categories/

Sessions

/api/sessions/

Statistics

/api/statistics/

Weekly Goals

/api/goals/

Videos

/api/videos/

---

# Folder Structure

backend/

```
accounts/

tracker/
```

frontend/

```
components/

pages/

hooks/

services/

charts/

layouts/
```

---

# Edge Cases

## Multiple Tabs

Prevent two active timers simultaneously.

---

## Closing Browser

Recover unfinished session.

Ask

Resume?

Discard?

Finish?

---

## Internet Disconnects

Timer continues locally.

Sync once connection returns.

---

## Page Refresh

Timer resumes automatically.

---

## Laptop Sleep

Detect elapsed time.

Ask user whether to include or discard inactive duration.

---

## Midnight

Session crossing midnight should split correctly for daily statistics while still remaining one logical session.

---

## Editing Sessions

Editing must update statistics automatically.

Edit history should remain immutable.

---

## Deleting Sessions

Soft delete.

Allow restore.

---

## Duplicate Categories

Prevent duplicate names.

---

## Empty Session

Very short accidental sessions should ask whether to discard.

---

## Very Long Sessions

Warn user after long durations (e.g., 6+ hours) to verify the timer wasn't left running accidentally.

---

## Timezone

Store timestamps in UTC.

Convert to local time in the frontend.

---

## Browser Clock Changes

Do not rely only on JavaScript timers.

Calculate duration using timestamps.

---

## Concurrent Requests

Prevent duplicate submissions when stopping a session.

---

## Video Upload Failure

Session should still save even if the upload fails.

---

## Weekly Goal Change

Historical weeks should keep the goal that was active at that time.

---

# Success Criteria

The application should answer these questions instantly:

* What did I study today?
* Am I on track for 40 hours this week?
* What has my consistency looked like over the last month?
* Which skill am I neglecting?
* Why did I stop my previous session?
* What should I work on next?
* How many lifetime hours have I invested in each skill?

If those questions can be answered clearly and accurately, the application has achieved its purpose.
