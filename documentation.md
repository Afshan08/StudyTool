# Focus Journal & Study Tool — Comprehensive Codebase Architecture Documentation

> **AI & Developer Handoff Specification**  
> This document provides an exhaustive structural and functional breakdown of the Study Tool codebase. Any AI model or software developer reading this file can instantly navigate the codebase, understand component responsibilities, locate backend functions, and extend or debug features.

---

## 1. Project Overview & Tech Stack

The application is a full-stack **Study Tool & Focus Journal** equipped with **Project Tracking, Voice STT Placeholders, and OpenAI Agent Optimization Audits**.

- **Backend Architecture**: Python 3.10+ / Django 4.2+ / Django REST Framework (DRF)
- **Database Layer**: SQLite (`db.sqlite3`) in development; PostgreSQL compatible via `psycopg2-binary`
- **Frontend Architecture**: React 18 / TypeScript / Vite 5 / Tailwind CSS
- **Authentication**: Token-based authentication (`rest_framework.authtoken`) with localStorage persistence
- **AI & Automation Pipeline**: OpenAI Agents Framework (`openai` SDK / JSON structured outputs) for project audits + pluggable Speech-to-Text (`voice_pipeline.py`) placeholder gateway for Ollama / Whisper / Wispr Flow.

---

## 2. Directory Structure & File Map

```
c:\Study_tool\
├── backend/                        # Django Backend Root
│   ├── accounts/                   # User Authentication & Profiles App
│   │   ├── models.py               # Custom User / WeeklyGoal models
│   │   ├── serializers.py          # Auth & Goal serializers
│   │   ├── views.py                # Login, Register, Goal API views
│   │   └── urls.py                 # /api/auth/ endpoint mappings
│   ├── tracker/                    # Focus Tracking & Projects App
│   │   ├── models.py               # StudySession, Category, Project, TextDetail, ProjectFile, ProjectSummary
│   │   ├── serializers.py          # DRF serializers with SMART Goal validation
│   │   ├── views.py                # APIViews for sessions, statistics, projects (Max 3 constraint), logs, files
│   │   ├── ai_agent.py             # OpenAI Agents Framework integration for project strategic audits
│   │   ├── voice_pipeline.py       # Speech-to-Text / Ollama / Wispr Flow placeholder gateway
│   │   ├── urls.py                 # /api/ endpoint mappings
│   │   └── migrations/             # Database schema migration files
│   ├── focus_journal/              # Django Project Configuration
│   │   ├── settings.py             # App settings, DB config, CORS, DRF auth settings
│   │   └── urls.py                 # Top-level API router & React SPA static fallback
│   ├── db.sqlite3                  # Local SQLite database
│   ├── manage.py                   # Django CLI management script
│   └── requirements.txt            # Python dependencies list
│
├── frontend/                       # React TypeScript Frontend Root
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Sidebar.tsx         # Navigation sidebar with active timer indicator
│   │   │   └── ProtectedRoute.tsx  # Auth guard wrapper
│   │   ├── context/
│   │   │   └── TimerContext.tsx    # Global active session timer state
│   │   ├── pages/                  # Main route pages
│   │   │   ├── Documentation.tsx   # Project tracking, SMART Goals, Voice & AI Audit UI
│   │   │   ├── Dashboard.tsx       # Focus timer controller & statistics overview
│   │   │   ├── History.tsx         # Session logs, edit history, soft-delete restore
│   │   │   ├── CalendarView.tsx    # Session calendar visualization
│   │   │   ├── PhysicsPrep.tsx     # Specialized PDF prep module
│   │   │   ├── Login.tsx           # Authentication login page
│   │   │   └── Register.tsx        # New user registration page
│   │   ├── services/
│   │   │   └── api.ts              # Fetch client API service registry
│   │   ├── App.tsx                 # React Router routing table & shared layout shell
│   │   ├── types.ts                # TypeScript interfaces (Project, Session, User, Stats)
│   │   ├── index.css               # Global Tailwind CSS & dark theme tokens
│   │   └── main.tsx                # Entry point
│   ├── package.json                # Frontend package manifest
│   └── vite.config.ts              # Vite server & proxy configuration
└── documentation.md                # Detailed architecture document (This file)
```

---

## 3. Backend Architecture & Function Map (`/backend`)

### 3.1 `tracker/models.py` — Database Models

1. **`Category`**
   - Belongs to a `User` (`user`).
   - Fields: `name` (CharField), `color` (Hex color code).
   - Constraints: `unique_together = ('user', 'name')`.

2. **`StudySession`**
   - Tracks individual focus/study timers.
   - Fields: `user`, `category` (nullable FK), `start_time`, `end_time`, `duration` (in seconds), `worked_on`, `next_task`, `stop_reason`, `is_deleted` (soft delete), `is_paused`, `last_start_time`.

3. **`SessionEditHistory`**
   - Audit trail for modified sessions.
   - Fields: `session`, `edited_by`, `previous_category`, `new_category`, `previous_duration`, `new_duration`, `previous_notes`, `new_notes`, `reason`, `edited_at`.

4. **`VideoEntry`**
   - Optional video attachment for a study session.

5. **`Project` (Documentation Module)**
   - Represents an active or archived project.
   - Fields: `id` (UUID PK), `user` (FK), `name` (CharField), `smart_goal` (TextField - mandatory target & definition of done), `status` (Choices: `'Active'`, `'Completed'`, `'Handed_Off'`), `created_at`, `updated_at`.
   - Constraint: Evaluated in view level — `COUNT(projects WHERE user=user AND status='Active') <= 3`.

6. **`TextDetail` (Daily / Event Logs)**
   - Daily progress log linked to a project.
   - Fields: `id` (UUID PK), `project` (FK), `log_text` (TextField), `hours_worked` (DecimalField), `achievement` (TextField), `created_at`.

7. **`ProjectFile`**
   - Document attachments for projects.
   - Fields: `id` (UUID PK), `project` (FK), `file_format` (CharField), `file` (FileField upload to `project_files/`), `uploaded_at`.

8. **`ProjectSummary` (AI Audits)**
   - Structured audit outputs generated by the OpenAI Agents Framework.
   - Fields: `id` (UUID PK), `project` (FK), `week_number` (Int), `summary_text` (TextField), `blindspots_detected` (TextField), `goal_completion_progress` (Int 0-100), `actionable_tips` (TextField), `created_at`.

---

### 3.2 `tracker/views.py` — API View Classes & Logic

- **`CategoryListCreateView` / `CategoryDetailView`**: GET/POST/DELETE categories for the authenticated user.
- **`ActiveSessionView`**: GET active running session; POST to start a new session (prevents concurrent sessions).
- **`PauseActiveSessionView` / `ResumeActiveSessionView`**: Pause and resume elapsed timer calculations.
- **`StopActiveSessionView`**: POST to stop timer; requires non-empty `worked_on` note.
- **`SessionListView` / `SessionDetailView` / `SessionRestoreView`**: Session CRUD with soft delete and edit audit trail.
- **`StatisticsView`**: Calculates daily, weekly, monthly study hours, category distributions, and daily streak based on the user's local timezone (`timezone` query parameter).
- **`ProjectListCreateView`**:
  - `GET`: Returns list of projects and active project count (`active_count`).
  - `POST`: Enforces **Max 3 Active Projects Constraint**. If `active_count >= 3` and desired status is `'Active'`, returns HTTP 400 Bad Request. Enforces SMART Goal validation.
- **`ProjectDetailView`**: GET/PATCH/DELETE project details. Checks max active limit if reactivating an archived project.
- **`ProjectLogListCreateView`**: GET/POST daily text/hours/achievement logs for a project.
- **`ProjectFileListCreateView`**: GET/POST document attachments for a project.
- **`ProjectAIAuditView`**: POST to execute an AI strategic audit using OpenAI Agents Framework (`ai_agent.py`) and save a `ProjectSummary`.
- **`VoiceTranscribeView`**: POST audio payload to process voice transcription via `voice_pipeline.py`.

---

### 3.3 `tracker/ai_agent.py` — OpenAI Agents Audit Pipeline

- **`run_project_ai_audit(project, logs)`**:
  1. Inspects environment for `OPENAI_API_KEY`.
  2. Formulates a structured prompt including the project `name`, `smart_goal`, total hours, and chronological `TextDetail` logs.
  3. Uses `openai` SDK (`gpt-4o-mini` with `json_object` format) to return structured JSON:
     - `summary_text`
     - `blindspots_detected`
     - `goal_completion_progress` (0 to 100)
     - `actionable_tips`
  4. If API key is not present, invokes an intelligent demonstration fallback audit generator.

---

### 3.4 `tracker/voice_pipeline.py` — Speech-to-Text Pipeline (faster-whisper)

- **`process_voice_audio_placeholder(audio_file)`**:
  - Receives uploaded audio (`.wav`, `.mp3`, `.m4a`, `.webm`, `.ogg`) from `VoiceTranscribeView`.
  - Saves in-memory audio chunk to a temporary file on disk (`tempfile`).
  - Lazy-loads and caches `faster-whisper.WhisperModel("base")` globally (`get_whisper_model()`) to ensure zero startup latency and instant CPU inference using `int8` quantization.
  - Returns transcribed text, detected language confidence, and audio duration to the frontend log editor.
  - Falls back gracefully to a status notice if `faster-whisper` or `ffmpeg` is missing on system PATH.


---

## 4. Frontend Architecture & Service Map (`/frontend`)

### 4.1 `src/services/api.ts` — API Client Methods

| Function Name | Target API Route | Description |
| flex | flex | flex |
| `login(username, password)` | `POST /api/auth/login/` | Authenticates user & stores token in `localStorage` |
| `register(username, email, pass)` | `POST /api/auth/register/` | Registers new account |
| `getCategories()` | `GET /api/categories/` | Fetches categories |
| `getSessions(filters)` | `GET /api/sessions/` | Fetches study sessions |
| `getActiveSession()` | `GET /api/sessions/active/` | Retrieves current running timer |
| `startSession(catId)` | `POST /api/sessions/active/` | Starts new focus timer |
| `stopSession(worked, next, reason)` | `POST /api/sessions/active/stop/` | Stops timer with mandatory note |
| `pauseSession()` / `resumeSession()` | `POST /api/sessions/active/pause/|resume/` | Pauses/resumes active timer |
| `getStatistics()` | `GET /api/statistics/` | Fetches aggregated chart stats |
| `getProjects(statusFilter)` | `GET /api/projects/` | Fetches projects & active count |
| `createProject(name, smart_goal)` | `POST /api/projects/` | Creates project (validated by SMART Goal & Max 3 limit) |
| `updateProject(id, updates)` | `PATCH /api/projects/:id/` | Updates project status (Active/Completed/Handed_Off) |
| `addProjectLog(id, log, hrs, ach)` | `POST /api/projects/:id/logs/` | Adds text/voice log to project |
| `uploadProjectFile(id, file)` | `POST /api/projects/:id/files/` | Uploads file attachment |
| `runProjectAIAudit(id)` | `POST /api/projects/:id/ai-audit/` | Executes OpenAI Agent audit |
| `transcribeVoiceAudio(blob)` | `POST /api/projects/transcribe-voice/` | Sends audio blob to voice pipeline hook |

---

### 4.2 `src/pages/Documentation.tsx` — Documentation & Project Module UI

- **Active Workloads Header**: Displays active count indicator `[X / 3 Active Workloads]`.
- **Max Limit Gatekeeper**: Disables "New Project" button when active project count >= 3, displaying a clear limit notice banner.
- **SMART Goal Gatekeeper Modal**: Requires project title and explicit target/definition of done.
- **Active vs Archive Tabs**: Switch between active projects grid and completed/handed off projects archive.
- **Project Drawer Modal**:
  - **Logs & Voice Tab**: Audio microphone recorder (Web Audio API / MediaRecorder), audio upload, voice pipeline placeholder trigger, manual log creation form, chronological logs list.
  - **Files Tab**: Document attachment manager with file upload and download links.
  - **AI Audit Tab**: Triggers OpenAI Agent audit, displaying progress bar %, strategic blindspots, executive summary, and actionable efficiency tips.

---

## 5. Summary of API Endpoints

```http
POST /api/auth/login/
POST /api/auth/register/
GET  /api/auth/goal/
POST /api/auth/goal/

GET  /api/categories/
POST /api/categories/
DELETE /api/categories/:id/

GET  /api/sessions/
GET  /api/sessions/active/
POST /api/sessions/active/
POST /api/sessions/active/pause/
POST /api/sessions/active/resume/
POST /api/sessions/active/stop/
PATCH /api/sessions/:id/
DELETE /api/sessions/:id/
POST /api/sessions/:id/restore/

GET  /api/statistics/

GET  /api/projects/
POST /api/projects/
GET  /api/projects/:id/
PATCH /api/projects/:id/
DELETE /api/projects/:id/
GET  /api/projects/:id/logs/
POST /api/projects/:id/logs/
GET  /api/projects/:id/files/
POST /api/projects/:id/files/
POST /api/projects/:id/ai-audit/
POST /api/projects/transcribe-voice/
```

---

## 6. How to Run & Commands Guide

### 6.1 Database Migrations (Run in `backend/`)
```bash
python manage.py makemigrations tracker
python manage.py migrate
```

### 6.2 Start Backend Server (Run in `backend/`)
```bash
python manage.py runserver
```

### 6.3 Start Frontend Development Server (Run in `frontend/`)
```bash
npm run dev
```

### 6.4 Build Frontend Production Bundle (Run in `frontend/`)
```bash
npm run build
```

---

## 7. Developer Voice & AI Model Extension Guide

- **Plugging in Local Ollama / Whisper STT**: Open `backend/tracker/voice_pipeline.py` and replace `process_voice_audio_placeholder` with your local HTTP POST call to `http://localhost:11434` or `faster-whisper`.
- **Setting OpenAI Key for AI Audits**: Add `OPENAI_API_KEY="your-key-here"` into `backend/.env`.
