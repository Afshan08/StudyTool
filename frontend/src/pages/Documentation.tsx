import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Project, ProjectStatus } from '../types';
import {
  FolderKanban, Plus, Target, FileText, CheckCircle2,
  AlertTriangle, Mic, Sparkles, AlertCircle,
  Archive, ArrowRight, X, Square, Loader2, Paperclip, FileCheck,
  RefreshCw, Brain, Clock
} from 'lucide-react';

export const Documentation: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [maxLimit] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Top-level tab: 'Active' | 'Archive' | 'Audits'
  const [activeTab, setActiveTab] = useState<'Active' | 'Archive' | 'Audits'>('Active');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<'logs' | 'files' | 'ai'>('logs');

  // Create Project Form State
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newSmartGoal, setNewSmartGoal] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  // Log Entry Form State
  const [logText, setLogText] = useState<string>('');
  const [hoursWorked, setHoursWorked] = useState<number>(1.0);
  const [achievement, setAchievement] = useState<string>('');
  const [submittingLog, setSubmittingLog] = useState<boolean>(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<{ type: 'info' | 'success' | 'pending'; msg: string } | null>(null);
  const [sendingVoice, setSendingVoice] = useState<boolean>(false);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // AI Audit State — now just fires and forgets
  const [auditStarting, setAuditStarting] = useState<boolean>(false);
  const [auditNotice, setAuditNotice] = useState<string | null>(null);

  // Polling ref — auto-refresh when any project has audit_pending
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProjects = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      setError(null);
      const res = await api.getProjects();
      const fetched: Project[] = res.projects || [];
      setProjects(fetched);
      setActiveCount(res.active_count ?? 0);

      // Start polling if any project has a pending audit
      const hasPending = fetched.some((p: Project) => (p as any).audit_pending);
      if (hasPending && !pollRef.current) {
        pollRef.current = setInterval(() => fetchProjects(true), 4000);
      } else if (!hasPending && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchProjects]);

  // Keep selected project in sync after refresh
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  }, [projects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (activeCount >= maxLimit) {
      setCreateError(`Max Limit Reached (${activeCount}/${maxLimit}). Please complete or handoff an active project.`);
      return;
    }
    if (!newSmartGoal.trim()) {
      setCreateError('SMART Goal is mandatory to initialize a project.');
      return;
    }
    try {
      setCreating(true);
      const created = await api.createProject(newProjectName, newSmartGoal);
      setShowCreateModal(false);
      setNewProjectName('');
      setNewSmartGoal('');
      await fetchProjects();
      setSelectedProject(created);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await api.updateProject(projectId, { status: newStatus });
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!logText.trim()) { alert('Please enter log details.'); return; }
    try {
      setSubmittingLog(true);
      await api.addProjectLog(selectedProject.id, logText, hoursWorked, achievement);
      setLogText(''); setHoursWorked(1.0); setAchievement('');
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to add log');
    } finally {
      setSubmittingLog(false);
    }
  };

  // Browser microphone handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecordedAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setVoiceStatus(null);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Send voice recording to backend immediately — log saved instantly, transcription in background
  const handleSendVoiceLog = async () => {
    if (!audioBlob || !selectedProject) {
      alert('Record audio first, then click Send Voice Log.');
      return;
    }
    try {
      setSendingVoice(true);
      setVoiceStatus({ type: 'pending', msg: 'Saving log & starting background transcription...' });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_log.webm');
      formData.append('project_id', selectedProject.id);
      formData.append('hours_worked', String(hoursWorked));
      formData.append('achievement', achievement);

      const token = localStorage.getItem('focus_journal_token');
      const res = await fetch('/api/projects/transcribe-voice/', {
        method: 'POST',
        headers: token ? { Authorization: `Token ${token}` } : {},
        body: formData,
      });
      const data = await res.json();

      setVoiceStatus({
        type: 'success',
        msg: data.message || 'Voice log saved! Transcription running in background — refresh logs in a moment.'
      });
      setAudioBlob(null);
      setRecordedAudioUrl(null);
      // Refresh project data after 3s to pick up transcribed log
      setTimeout(() => fetchProjects(true), 3000);
      setTimeout(() => fetchProjects(true), 8000);
    } catch (err: any) {
      setVoiceStatus({ type: 'info', msg: err.message || 'Voice send failed.' });
    } finally {
      setSendingVoice(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadFile) return;
    try {
      setUploadingFile(true);
      await api.uploadProjectFile(selectedProject.id, uploadFile);
      setUploadFile(null);
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  // Fire async Ollama audit — returns immediately, backend threads it
  const handleRunAIAudit = async () => {
    if (!selectedProject) return;
    try {
      setAuditStarting(true);
      setAuditNotice(null);
      const res = await api.runProjectAIAudit(selectedProject.id);
      setAuditNotice(res.message || 'Audit started in background. Check the Audit Results tab.');
      // Start polling for completion
      await fetchProjects(true);
    } catch (err: any) {
      setAuditNotice(err.message || 'AI audit failed to start.');
    } finally {
      setAuditStarting(false);
    }
  };

  const activeProjects = projects.filter(p => p.status === 'Active');
  const archivedProjects = projects.filter(p => p.status !== 'Active');
  // All summaries across all projects for the Audits tab
  const allSummaries = projects.flatMap(p =>
    p.summaries.map(s => ({ ...s, projectName: p.name, projectId: p.id }))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const pendingAuditProjects = projects.filter((p: any) => p.audit_pending);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-[#030712] text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                Documentation & Project AI Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Manage up to 3 active workloads with SMART Goal gating and async Ollama AI audits.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 text-sm font-semibold ${
              activeCount >= maxLimit
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${activeCount >= maxLimit ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{activeCount} / {maxLimit} Active Workloads</span>
            </div>

            <button
              onClick={() => { setCreateError(null); setShowCreateModal(true); }}
              disabled={activeCount >= maxLimit}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
                activeCount >= maxLimit
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 border border-indigo-400/30'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>

            <button
              onClick={() => fetchProjects()}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Limit Warning */}
        {activeCount >= maxLimit && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-300">Active Project Limit Reached ({activeCount}/3)</p>
              <p className="text-slate-300 mt-0.5">Complete or handoff an active project to free up a slot.</p>
            </div>
          </div>
        )}

        {/* Pending Audits Banner */}
        {pendingAuditProjects.length > 0 && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-indigo-300">Ollama AI audit running in background</span>
              <span className="text-slate-400 ml-2">
                for: {pendingAuditProjects.map(p => p.name).join(', ')}
              </span>
            </div>
            <span className="text-xs text-slate-500 ml-auto">Auto-refreshing every 4s</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/5 space-x-6 text-sm font-medium overflow-x-auto">
          {(['Active', 'Archive', 'Audits'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors relative flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'Active' && <span>Active Projects ({activeProjects.length})</span>}
              {tab === 'Archive' && <><Archive className="w-4 h-4" /><span>Archive ({archivedProjects.length})</span></>}
              {tab === 'Audits' && (
                <>
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Audit Results ({allSummaries.length})</span>
                  {pendingAuditProjects.length > 0 && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </>
              )}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-500" />
            <span>Loading projects & AI data...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center">{error}</div>

        ) : activeTab === 'Active' ? (
          activeProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              <Target className="w-12 h-12 text-indigo-400 mx-auto opacity-60" />
              <h3 className="text-lg font-semibold text-slate-200">No Active Projects</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Create a project with a clear SMART Goal to get started.
              </p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-colors inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Initialize Active Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => {
                const isPending = (project as any).audit_pending;
                return (
                  <div key={project.id}
                    className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-xl">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              <span>Audit Running</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleStatusChange(project.id, 'Completed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Mark Completed">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(project.id, 'Handed_Off')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Hand Off">
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2">
                        {project.name}
                      </h3>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 mb-4 text-xs">
                        <div className="flex items-center text-indigo-400 font-semibold space-x-1.5 mb-1">
                          <Target className="w-3.5 h-3.5" />
                          <span>SMART Goal</span>
                        </div>
                        <p className="line-clamp-3 italic text-slate-300">{project.smart_goal}</p>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>AI Progress</span>
                          <span className="font-semibold text-indigo-400">{project.latest_progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${project.latest_progress}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-xs">
                        <div><p className="text-slate-400">Hours</p><p className="font-bold text-slate-200">{project.total_hours_worked}h</p></div>
                        <div><p className="text-slate-400">Logs</p><p className="font-bold text-slate-200">{project.logs.length}</p></div>
                        <div><p className="text-slate-400">Audits</p><p className="font-bold text-slate-200">{project.summaries.length}</p></div>
                      </div>
                    </div>

                    <button onClick={() => { setSelectedProject(project); setDetailTab('logs'); }}
                      className="mt-6 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-sm transition-colors border border-white/5 flex items-center justify-center space-x-2">
                      <span>Manage & AI Audit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )

        ) : activeTab === 'Archive' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedProjects.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400">
                No archived projects yet.
              </div>
            ) : (
              archivedProjects.map((project) => (
                <div key={project.id} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      project.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {project.status === 'Completed' ? 'Completed' : 'Handed Off'}
                    </span>
                    <button onClick={() => handleStatusChange(project.id, 'Active')}
                      className="text-xs text-indigo-400 hover:underline font-medium">Reactivate</button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">{project.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{project.smart_goal}</p>
                  <button onClick={() => { setSelectedProject(project); setDetailTab('ai'); }}
                    className="w-full py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                    View Audit History
                  </button>
                </div>
              ))
            )}
          </div>

        ) : (
          /* AUDITS TAB */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200">All Ollama AI Audit Results</h2>
              <span className="text-xs text-slate-500">{allSummaries.length} audits across {projects.length} projects</span>
            </div>

            {pendingAuditProjects.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">In Progress</p>
                {pendingAuditProjects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-400">Ollama is processing this audit... results will appear here when done.</p>
                    </div>
                    <Clock className="w-4 h-4 text-slate-500 ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {allSummaries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400 space-y-3">
                <Brain className="w-10 h-10 mx-auto opacity-40" />
                <p>No audit results yet. Open a project, go to the AI Audit tab, and click Run Audit.</p>
              </div>
            ) : (
              allSummaries.map((summary: any) => (
                <div key={summary.id} className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{summary.projectName}</p>
                      <p className="text-xs text-indigo-400">Audit #{summary.week_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{new Date(summary.created_at).toLocaleString()}</p>
                      <p className="text-lg font-bold text-emerald-400">{summary.goal_completion_progress}%</p>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                      style={{ width: `${summary.goal_completion_progress}%` }} />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{summary.summary_text}</p>

                  {summary.blindspots_detected && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <p className="font-semibold text-amber-300 mb-1 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" /> Strategic Blindspots
                      </p>
                      <p className="text-amber-200/90 whitespace-pre-line">{summary.blindspots_detected}</p>
                    </div>
                  )}

                  {summary.actionable_tips && (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                      <p className="font-semibold text-indigo-300 mb-1 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Actionable Tips
                      </p>
                      <p className="text-indigo-200/90 whitespace-pre-line">{summary.actionable_tips}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* CREATE PROJECT MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6 relative">
              <button onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                  <Target className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">SMART Goal Gatekeeper</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Initialize New Workload</h2>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Name</label>
                  <input type="text" required placeholder="e.g., Voice AI Pipeline"
                    value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    SMART Goal <span className="text-rose-400">* Required</span>
                  </label>
                  <textarea required rows={4}
                    placeholder="Specific, Measurable, Achievable, Relevant, Time-bound target..."
                    value={newSmartGoal} onChange={(e) => setNewSmartGoal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="pt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200">Cancel</button>
                  <button type="submit" disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-sm text-white transition-colors flex items-center">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PROJECT DETAIL DRAWER */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">

              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 bg-slate-950/80 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-2xl font-bold text-slate-100">{selectedProject.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      selectedProject.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>{selectedProject.status}</span>
                    {(selectedProject as any).audit_pending && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        <span>Audit in Progress</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    <span className="font-semibold text-indigo-400">SMART Goal:</span> {selectedProject.smart_goal}
                  </p>
                </div>
                <button onClick={() => setSelectedProject(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center px-6 bg-slate-950/40 border-b border-white/5 space-x-6 text-sm font-medium">
                {[
                  { key: 'logs', label: `Logs & Voice (${selectedProject.logs.length})`, icon: <FileText className="w-4 h-4" /> },
                  { key: 'files', label: `Files (${selectedProject.files.length})`, icon: <Paperclip className="w-4 h-4" /> },
                  { key: 'ai', label: `Ollama Audit (${selectedProject.summaries.length})`, icon: <Brain className="w-4 h-4 text-indigo-400" /> },
                ].map(t => (
                  <button key={t.key} onClick={() => setDetailTab(t.key as any)}
                    className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                      detailTab === t.key ? 'border-indigo-500 text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}>
                    {t.icon}<span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* LOGS & VOICE TAB */}
                {detailTab === 'logs' && (
                  <div className="space-y-6">

                    {/* Voice Recorder — send to background immediately */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mic className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <h4 className="text-sm font-semibold text-slate-200">Voice Log (faster-whisper — Background)</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                          Instant Save
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Record a voice note. Log is saved instantly — transcription runs in the background via <code className="text-indigo-300">voice_pipeline.py</code>.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {!isRecording ? (
                          <button type="button" onClick={startRecording}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors">
                            <Mic className="w-3.5 h-3.5" /><span>Start Recording</span>
                          </button>
                        ) : (
                          <button type="button" onClick={stopRecording}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center space-x-1.5 animate-pulse">
                            <Square className="w-3.5 h-3.5" /><span>Stop Recording</span>
                          </button>
                        )}

                        {recordedAudioUrl && (
                          <div className="flex items-center space-x-2">
                            <audio src={recordedAudioUrl} controls className="h-8 w-40" />
                            <button type="button" onClick={handleSendVoiceLog} disabled={sendingVoice}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1 transition-colors">
                              {sendingVoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              <span>Send Voice Log</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {voiceStatus && (
                        <div className={`text-xs font-medium flex items-center space-x-1.5 ${
                          voiceStatus.type === 'success' ? 'text-emerald-400' :
                          voiceStatus.type === 'pending' ? 'text-indigo-300' : 'text-slate-300'
                        }`}>
                          {voiceStatus.type === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {voiceStatus.type === 'success' && <CheckCircle2 className="w-3 h-3" />}
                          <span>{voiceStatus.msg}</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Log Form */}
                    <form onSubmit={handleAddLog} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-4">
                      <h4 className="text-sm font-semibold text-slate-200">Add Text Log Entry</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1">Work Description</label>
                          <textarea required rows={3} placeholder="Detail work performed today..."
                            value={logText} onChange={(e) => setLogText(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Hours Worked</label>
                            <input type="number" step="0.1" min="0" value={hoursWorked}
                              onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-100" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Daily Achievement</label>
                            <input type="text" placeholder="Key milestone..."
                              value={achievement} onChange={(e) => setAchievement(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-100" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" disabled={submittingLog}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors">
                          {submittingLog ? 'Saving...' : 'Save Log Entry'}
                        </button>
                      </div>
                    </form>

                    {/* Logs List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-300">Work Logs</h4>
                        <button onClick={() => fetchProjects(true)}
                          className="text-xs text-indigo-400 hover:underline flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" /><span>Refresh</span>
                        </button>
                      </div>
                      {selectedProject.logs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No logs yet.</p>
                      ) : (
                        selectedProject.logs.map((log) => {
                          const isTranscribing = log.log_text.startsWith('[Transcribing');
                          return (
                            <div key={log.id} className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                              isTranscribing
                                ? 'bg-indigo-950/40 border-indigo-500/20'
                                : 'bg-slate-950/40 border-white/5'
                            }`}>
                              <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span>{new Date(log.created_at).toLocaleString()}</span>
                                <div className="flex items-center space-x-2">
                                  {isTranscribing && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                                  <span className="font-semibold text-indigo-400">{log.hours_worked}h</span>
                                </div>
                              </div>
                              <p className={isTranscribing ? 'text-indigo-300 italic' : 'text-slate-200'}>{log.log_text}</p>
                              {log.achievement && (
                                <p className="text-emerald-400 font-medium">Achievement: {log.achievement}</p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* FILES TAB */}
                {detailTab === 'files' && (
                  <div className="space-y-6">
                    <form onSubmit={handleFileUpload} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center space-x-3">
                      <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500" />
                      <button type="submit" disabled={!uploadFile || uploadingFile}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-50">
                        {uploadingFile ? 'Uploading...' : 'Upload'}
                      </button>
                    </form>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">Attachments</h4>
                      {selectedProject.files.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No files attached.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedProject.files.map((file) => (
                            <div key={file.id} className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2 truncate">
                                <FileCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-slate-200 truncate">{file.file.split('/').pop()}</span>
                              </div>
                              <a href={file.file} target="_blank" rel="noreferrer"
                                className="text-indigo-400 hover:underline font-medium text-[11px]">View</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI AUDIT TAB */}
                {detailTab === 'ai' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Ollama AI Strategic Auditor</h4>
                        <p className="text-xs text-slate-400">
                          Async audit via local Ollama — runs in background, results appear in Audit Results tab.
                        </p>
                        {auditNotice && (
                          <p className="text-xs text-indigo-300 font-medium mt-1">{auditNotice}</p>
                        )}
                      </div>
                      <button onClick={handleRunAIAudit}
                        disabled={auditStarting || (selectedProject as any).audit_pending}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-indigo-500/20">
                        {(auditStarting || (selectedProject as any).audit_pending)
                          ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Running...</span></>
                          : <><Sparkles className="w-4 h-4" /><span>Run Audit</span></>
                        }
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedProject.summaries.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-white/5 text-slate-400 text-xs">
                          No audits yet. Click Run Audit — Ollama processes it asynchronously.
                          Results appear in the <strong>Audit Results</strong> tab when complete.
                        </div>
                      ) : (
                        selectedProject.summaries.map((summary) => (
                          <div key={summary.id} className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <span className="text-xs font-bold text-indigo-400">Audit #{summary.week_number}</span>
                              <span className="text-[11px] text-slate-400">{new Date(summary.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1 font-semibold">
                                <span className="text-slate-300">Goal Progress</span>
                                <span className="text-emerald-400">{summary.goal_completion_progress}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${summary.goal_completion_progress}%` }} />
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{summary.summary_text}</p>
                            {summary.blindspots_detected && (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                                <p className="font-semibold text-amber-300 mb-1 flex items-center">
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" /> Blindspots
                                </p>
                                <p className="text-amber-200/90 whitespace-pre-line">{summary.blindspots_detected}</p>
                              </div>
                            )}
                            {summary.actionable_tips && (
                              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                                <p className="font-semibold text-indigo-300 mb-1 flex items-center">
                                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Actionable Tips
                                </p>
                                <p className="text-indigo-200/90 whitespace-pre-line">{summary.actionable_tips}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
