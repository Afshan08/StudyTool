const BASE_URL = '/api';

function getHeaders(isMultipart = false): HeadersInit {
  const token = localStorage.getItem('focus_journal_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse(res: Response, defaultError: string) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.username?.[0] || 
        data.email?.[0] || 
        data.non_field_errors?.[0] || 
        data.error || 
        defaultError
      );
    }
    return data;
  }
  if (!res.ok) {
    throw new Error(`Server Error (${res.status}): Please check if backend server is running and database is migrated.`);
  }
  throw new Error('Unexpected response format from server.');
}

export const api = {
  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res, 'Login failed');
    localStorage.setItem('focus_journal_token', data.token);
    localStorage.setItem('focus_journal_user', JSON.stringify(data.user));
    return data;
  },

  async register(username: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await handleResponse(res, 'Registration failed');
    localStorage.setItem('focus_journal_token', data.token);
    localStorage.setItem('focus_journal_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('focus_journal_token');
    localStorage.removeItem('focus_journal_user');
  },

  getUser() {
    const userStr = localStorage.getItem('focus_journal_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('focus_journal_token');
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${BASE_URL}/categories/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  async createCategory(name: string, color: string) {
    const res = await fetch(`${BASE_URL}/categories/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, color })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create category');
    }
    return res.json();
  },

  async deleteCategory(id: number) {
    const res = await fetch(`${BASE_URL}/categories/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  // Weekly Goal
  async getGoal() {
    const res = await fetch(`${BASE_URL}/auth/goal/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load goal');
    return res.json();
  },

  async setGoal(hours: number) {
    const res = await fetch(`${BASE_URL}/auth/goal/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ hours })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update goal');
    }
    return res.json();
  },

  // Sessions
  async getSessions(filters: { category?: number; start_date?: string; end_date?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', String(filters.category));
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const res = await fetch(`${BASE_URL}/sessions/?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load sessions');
    return res.json();
  },

  async getActiveSession() {
    const res = await fetch(`${BASE_URL}/sessions/active/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to check active session');
    return res.json();
  },

  async startSession(categoryId: number | null) {
    const res = await fetch(`${BASE_URL}/sessions/active/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ category: categoryId })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to start session');
    }
    return res.json();
  },

  async stopSession(workedOn: string, nextTask: string, stopReason: string) {
    const res = await fetch(`${BASE_URL}/sessions/active/stop/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ worked_on: workedOn, next_task: nextTask, stop_reason: stopReason })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to stop session');
    }
    return res.json();
  },

  async pauseSession() {
    const res = await fetch(`${BASE_URL}/sessions/active/pause/`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to pause session');
    }
    return res.json();
  },

  async resumeSession() {
    const res = await fetch(`${BASE_URL}/sessions/active/resume/`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to resume session');
    }
    return res.json();
  },

  async updateSession(id: number, updates: { category?: number | null; duration?: number; worked_on?: string; next_task?: string; stop_reason?: string; reason: string }) {
    const res = await fetch(`${BASE_URL}/sessions/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update session');
    }
    return res.json();
  },

  async deleteSession(id: number) {
    const res = await fetch(`${BASE_URL}/sessions/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  async restoreSession(id: number) {
    const res = await fetch(`${BASE_URL}/sessions/${id}/restore/`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to restore session');
    return res.json();
  },

  async uploadSessionVideo(id: number, file: File, duration = 0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('duration', String(duration));
    const res = await fetch(`${BASE_URL}/sessions/${id}/video/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload video');
    }
    return res.json();
  },

  // Stats
  async getStatistics() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(`${BASE_URL}/statistics/?timezone=${encodeURIComponent(timezone)}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load statistics');
    return res.json();
  },

  // Projects & Documentation Module
  async getProjects(statusFilter?: string) {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    const res = await fetch(`${BASE_URL}/projects/?${params.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async createProject(name: string, smart_goal: string) {
    const res = await fetch(`${BASE_URL}/projects/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, smart_goal })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.smart_goal?.[0] || 'Failed to create project');
    }
    return res.json();
  },

  async updateProject(id: string, updates: { name?: string; smart_goal?: string; status?: 'Active' | 'Completed' | 'Handed_Off' }) {
    const res = await fetch(`${BASE_URL}/projects/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update project');
    }
    return res.json();
  },

  async deleteProject(id: string) {
    const res = await fetch(`${BASE_URL}/projects/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  async addProjectLog(projectId: string, log_text: string, hours_worked: number, achievement: string) {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/logs/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ log_text, hours_worked, achievement })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add project log');
    }
    return res.json();
  },

  async uploadProjectFile(projectId: string, file: File, file_format?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (file_format) formData.append('file_format', file_format);
    const res = await fetch(`${BASE_URL}/projects/${projectId}/files/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload project file');
    }
    return res.json();
  },

  async runProjectAIAudit(projectId: string) {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/ai-audit/`, {
      method: 'POST',
      headers: getHeaders()
    });
    // 200 (sync result) or 202 (async accepted) are both success
    if (res.status !== 200 && res.status !== 201 && res.status !== 202) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to execute AI project audit');
    }
    return res.json();
  },

  async transcribeVoiceAudio(audioBlob: Blob, filename = 'voice_recording.wav') {
    const formData = new FormData();
    formData.append('audio', audioBlob, filename);
    const res = await fetch(`${BASE_URL}/projects/transcribe-voice/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to transcribe audio via voice pipeline placeholder');
    }
    return res.json();
  }
};

