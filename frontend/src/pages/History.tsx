import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudySession, Category } from '../types';
import { 
  Search, ArrowUpDown, Edit2, Trash2, RotateCcw, AlertCircle, Calendar, 
  Clock, Eye, MessageSquare 
} from 'lucide-react';

export const History: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Expanded session details ID (for edit history view)
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDurationMinutes, setEditDurationMinutes] = useState<string>('0');
  const [editWorkedOn, setEditWorkedOn] = useState('');
  const [editNextTask, setEditNextTask] = useState('');
  const [editStopReason, setEditStopReason] = useState('');
  const [editReason, setEditReason] = useState('');

  // Toast notification for undo/restore
  const [restoreSessionId, setRestoreSessionId] = useState<number | null>(null);

  useEffect(() => {
    loadSessions();
    loadCategories();
  }, [showDeleted]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // If we want to show deleted sessions, we will query them differently.
      // But let's fetch all sessions, and filter locally on is_deleted status.
      // Django returns is_deleted: false sessions by default, but let's fetch them.
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this study session? This is a soft-delete and can be undone.')) return;
    try {
      await api.deleteSession(id);
      setRestoreSessionId(id);
      loadSessions();
      // Clear toast after 6 seconds
      setTimeout(() => {
        setRestoreSessionId(prev => prev === id ? null : prev);
      }, 6000);
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.restoreSession(id);
      setRestoreSessionId(null);
      loadSessions();
    } catch (err) {
      alert('Failed to restore session');
    }
  };

  const openEditModal = (session: StudySession) => {
    setEditingSession(session);
    setEditCategory(session.category ? String(session.category) : '');
    setEditDurationMinutes(String(Math.round(session.duration / 60)));
    setEditWorkedOn(session.worked_on);
    setEditNextTask(session.next_task);
    setEditStopReason(session.stop_reason);
    setEditReason(''); // Force edit reason
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    if (!editReason.trim()) {
      alert('An edit reason is mandatory.');
      return;
    }

    try {
      await api.updateSession(editingSession.id, {
        category: editCategory ? Number(editCategory) : null,
        duration: Number(editDurationMinutes) * 60,
        worked_on: editWorkedOn,
        next_task: editNextTask,
        stop_reason: editStopReason,
        reason: editReason.trim()
      });
      setEditingSession(null);
      loadSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to update session');
    }
  };

  const toggleSort = (field: 'date' | 'duration') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Helper formats
  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };



  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Filter & Sort math
  const processedSessions = sessions
    .filter((session) => {
      // Filter by deleted state
      if (showDeleted) {
        return session.is_deleted === true;
      }
      return session.is_deleted === false;
    })
    .filter((session) => {
      // Filter by search notes
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        session.worked_on.toLowerCase().includes(q) ||
        session.next_task.toLowerCase().includes(q) ||
        session.stop_reason.toLowerCase().includes(q) ||
        (session.category_details?.name && session.category_details.name.toLowerCase().includes(q))
      );
    })
    .filter((session) => {
      // Filter by category
      if (!selectedCatFilter) return true;
      if (selectedCatFilter === 'none') return session.category === null;
      return session.category === Number(selectedCatFilter);
    })
    .sort((a, b) => {
      // Sort
      let valA = sortField === 'date' ? new Date(a.start_time).getTime() : a.duration;
      let valB = sortField === 'date' ? new Date(b.start_time).getTime() : b.duration;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 stagger-item stagger-1">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Study History
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review, edit, and analyze previous sessions</p>
        </div>
        
        {/* Soft Deleted Toggle */}
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all active-press ${
            showDeleted 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showDeleted ? 'Show Active Sessions' : 'Show Deleted Sessions'}
        </button>
      </header>

      {/* Undo Toast Alert */}
      {restoreSessionId && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-between text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-900/10 animate-fade-in mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4.5 h-4.5" />
            <span>Session soft-deleted.</span>
          </div>
          <button 
            onClick={() => handleRestore(restoreSessionId)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors font-bold active-press"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Delete</span>
          </button>
        </div>
      )}

      {/* Filters Card */}
      <section className="glass-panel p-5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 stagger-item stagger-2">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search notes, categories, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="none">No Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Sorting Toggles */}
        <div className="flex space-x-2">
          <button
            onClick={() => toggleSort('date')}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900/60 border rounded-xl text-xs font-medium transition-colors active-press ${
              sortField === 'date' ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/5' : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Date</span>
            <ArrowUpDown className="w-3 h-3 ml-1" />
          </button>
          <button
            onClick={() => toggleSort('duration')}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900/60 border rounded-xl text-xs font-medium transition-colors active-press ${
              sortField === 'duration' ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/5' : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Duration</span>
            <ArrowUpDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </section>

      {/* History List */}
      <section className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading session history...</div>
        ) : processedSessions.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl stagger-item stagger-3">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No sessions match your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search query or categories.</p>
          </div>
        ) : (
          processedSessions.map((session, index) => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <div 
                key={session.id} 
                className="glass-panel rounded-2xl overflow-hidden transition-all duration-350 border border-white/5 hover:border-white/10 stagger-item"
                style={{ animationDelay: `${Math.min(5, index) * 50 + 100}ms` }}
              >
                {/* Main Session row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Category info & Dates */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex flex-col items-center justify-center border border-white/5 text-slate-400">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {new Date(session.start_time).toLocaleString(undefined, { month: 'short' })}
                      </span>
                      <span className="text-sm font-extrabold text-slate-200 leading-tight">
                        {new Date(session.start_time).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {session.category_details ? (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: `${session.category_details.color}15`, color: session.category_details.color }}
                          >
                            {session.category_details.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-white/5 text-slate-500">
                            Uncategorized
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatTime(session.start_time)} – {session.end_time ? formatTime(session.end_time) : 'Active'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 line-clamp-2">
                        {session.worked_on || <span className="text-slate-500 italic">No description provided</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Duration & Actions */}
                  <div className="flex items-center justify-between md:justify-end space-x-6 border-t md:border-0 border-white/5 pt-3 md:pt-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{formatDuration(session.duration)}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Duration</p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                        className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors active-press ${isExpanded ? 'bg-slate-900' : 'bg-transparent'}`}
                        title="View Details & Edit History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!session.is_deleted ? (
                        <>
                          <button
                            onClick={() => openEditModal(session)}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all active-press"
                            title="Edit Session"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all active-press"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(session.id)}
                          className="p-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all active-press"
                          title="Restore Session"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Detail Feedback & Edit History Accordion */}
                <div 
                  className={`transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden border-t border-darkBorder bg-slate-900/30 ${
                    isExpanded ? 'max-h-[800px] opacity-100 p-5' : 'max-h-0 opacity-0 p-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Grid details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Next Task Goal</span>
                        <span className="text-slate-300">{session.next_task || <span className="italic text-slate-600">None planned</span>}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Reason for Stopping</span>
                        <span className="text-slate-300">{session.stop_reason || <span className="italic text-slate-600">Not specified</span>}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Attached Media</span>
                        {session.video ? (
                          <a 
                            href={session.video.file} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline flex items-center space-x-1.5 font-bold"
                          >
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span>View Study Clip ({session.video.duration}s)</span>
                          </a>
                        ) : (
                          <span className="italic text-slate-600">No video journal clip</span>
                        )}
                      </div>
                    </div>

                    {/* Edit logs */}
                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 flex items-center mb-3">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                        <span>Edit Log (Audit Trail)</span>
                      </h4>

                      {session.edit_histories && session.edit_histories.length > 0 ? (
                        <div className="space-y-3">
                          {session.edit_histories.map((edit) => (
                            <div key={edit.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                              <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>Edited by <strong>{edit.edited_by_username}</strong></span>
                                <span>{new Date(edit.edited_at).toLocaleString()}</span>
                              </div>
                              <p className="text-slate-300 font-medium">
                                <span className="text-indigo-400/90 font-semibold">Reason:</span> "{edit.reason}"
                              </p>
                              
                              {/* Details updated */}
                              <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-white/5 pt-1.5 text-slate-400">
                                {edit.previous_category !== edit.new_category && (
                                  <div>
                                    <span className="block text-slate-500">Category</span>
                                    <span>{edit.previous_category} &rarr; {edit.new_category}</span>
                                  </div>
                                )}
                                {edit.previous_duration !== edit.new_duration && (
                                  <div>
                                    <span className="block text-slate-500">Duration</span>
                                    <span>{formatDuration(edit.previous_duration || 0)} &rarr; {formatDuration(edit.new_duration || 0)}</span>
                                  </div>
                                )}
                                {edit.previous_notes !== edit.new_notes && (
                                  <div>
                                    <span className="block text-slate-500">Notes</span>
                                    <span className="truncate block max-w-44">Changed description</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No edits recorded for this session. Audit log is clean.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Edit Session Dialog Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md modal-overlay ${
          editingSession ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`w-full max-w-md glass-panel p-6 rounded-2xl space-y-4 modal-content ${
            editingSession ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div>
            <h3 className="text-lg font-bold text-white">Edit Session</h3>
            <p className="text-xs text-slate-400 mt-1">Changes are logged in the session edit history trail.</p>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 text-xs focus:outline-none"
              >
                <option value="">No Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={editDurationMinutes}
                onChange={(e) => setEditDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                What did you work on?
              </label>
              <input
                type="text"
                required
                value={editWorkedOn}
                onChange={(e) => setEditWorkedOn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Next Task Goal
                </label>
                <input
                  type="text"
                  value={editNextTask}
                  onChange={(e) => setEditNextTask(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Reason Stopped
                </label>
                <input
                  type="text"
                  value={editStopReason}
                  onChange={(e) => setEditStopReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                Reason for Edit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Corrected category, adjusted duration error"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-amber-500/20 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 active-press"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs active-press"
              >
                Update Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
