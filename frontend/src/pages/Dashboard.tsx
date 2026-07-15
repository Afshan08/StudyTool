import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { api } from '../services/api';
import { Category, Stats } from '../types';
import { 
  Clock, Flame, Trophy, Plus, Play, Pause, Square, AlertTriangle, Upload, 
  Trash2, BookOpen, AlertCircle 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    status,
    elapsedSeconds,
    selectedCategory,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    discardTimer,
    setSelectedCategory,
    sleepWarning,
    resolveSleepWarning
  } = useTimer();

  // Page local states
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1'); // Indigo default
  const [loadingCats, setLoadingCats] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Weekly Goal editing state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editGoalHours, setEditGoalHours] = useState('40');

  // Stop Session Form state
  const [showStopModal, setShowStopModal] = useState(false);
  const [workedOn, setWorkedOn] = useState('');
  const [nextTask, setNextTask] = useState('');
  const [stopReason, setStopReason] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Chart view: 'daily' | 'weekly' | 'monthly'
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [status]); // Reload when timer status changes (e.g. session stopped)

  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCats(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getStatistics();
      setStats(data);
      if (data.weekly_goal) {
        setEditGoalHours(String(data.weekly_goal));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setErrorMsg(null);
    try {
      const newCat = await api.createCategory(newCatName.trim(), newCatColor);
      setCategories([...categories, newCat]);
      setSelectedCategory(newCat);
      setNewCatName('');
      setShowAddCategory(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this category? Past sessions will keep this as a note, but the category will be removed.')) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTimer = async () => {
    setErrorMsg(null);
    try {
      await startTimer(selectedCategory);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start timer');
    }
  };

  const handleStopTimerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workedOn.trim()) return;
    setUploading(true);
    try {
      await stopTimer(workedOn, nextTask, stopReason, videoFile);
      setShowStopModal(false);
      setWorkedOn('');
      setNextTask('');
      setStopReason('');
      setVideoFile(null);
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to stop session');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.setGoal(Number(editGoalHours));
      setShowGoalModal(false);
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to update weekly goal');
    }
  };

  // Time formatter
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRemainingHoursText = () => {
    if (!stats) return '0 hours';
    const rem = Math.max(0, stats.weekly_goal - stats.week_hours);
    return `${rem.toFixed(1)} hours`;
  };

  // Recharts custom tooltip style
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10 text-xs">
          <p className="font-semibold text-slate-200">{payload[0].payload.label}</p>
          <p className="text-indigo-400 font-bold mt-1">{payload[0].value} hours studied</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8">
      {/* Top Banner with Stream info */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Journal Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Distraction-free tracking for deep skill acquisition</p>
        </div>
        
        {/* Streak & Goal Badge */}
        {stats && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-amber-400 text-sm font-semibold">
              <Flame className="w-5 h-5 fill-amber-500/20" />
              <span>{stats.streak} Day Streak</span>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center space-x-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-2 rounded-xl text-indigo-400 text-sm font-semibold transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span>Goal: {stats.weekly_goal}h</span>
            </button>
          </div>
        )}
      </header>

      {/* Sleep Warning Banner */}
      <div 
        className={`transition-all duration-500 ease-[var(--ease-out-expo)] overflow-hidden ${
          sleepWarning?.show ? 'max-h-[200px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0 pointer-events-none'
        }`}
      >
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="flex items-center space-x-3 text-amber-300">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
            <div>
              <p className="text-sm font-semibold">Laptop Sleep Detected</p>
              <p className="text-xs text-amber-400/90">
                Your device was sleeping. Do you want to include the inactive {Math.round(sleepWarning ? sleepWarning.duration / 60 : 0)} minutes in your study session?
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => resolveSleepWarning(true)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs active-press"
            >
              Include Time
            </button>
            <button
              onClick={() => resolveSleepWarning(false)}
              className="px-4 py-2 rounded-lg bg-transparent border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-xs active-press"
            >
              Discard Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Main stats counters */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden stagger-item stagger-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Today's Study</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.today_hours.toFixed(2)}h</p>
            <p className="text-xs text-slate-500 mt-2">Hours completed today</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden stagger-item stagger-2">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>This Week</span>
              <Trophy className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.week_hours.toFixed(2)}h</p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <div className="w-full bg-slate-900 border border-white/5 rounded-full h-1.5 mr-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 h-1.5 rounded-full"
                  style={{ width: `${stats.goal_progress_percent}%` }}
                />
              </div>
              <span>{stats.goal_progress_percent}%</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden stagger-item stagger-3">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Weekly Remaining</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{getRemainingHoursText()}</p>
            <p className="text-xs text-slate-500 mt-2">Required to meet your goal</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden stagger-item stagger-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Lifetime Study</span>
              <Flame className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.lifetime_hours.toFixed(2)}h</p>
            <p className="text-xs text-slate-500 mt-2">Total investment in skills</p>
          </div>
        </section>
      )}

      {/* Focus Timer and Category Selector Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Selection Card */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between stagger-item stagger-3">
          <div>
            <div className="flex items-center justify-between border-b border-darkBorder pb-4 mb-4">
              <h2 className="text-lg font-bold text-white">Select Category</h2>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-400 transition-colors active-press"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 mb-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Dynamic Add Category Form */}
            {showAddCategory && (
              <form onSubmit={handleAddCategory} className="p-3 bg-slate-900/80 border border-white/5 rounded-xl space-y-3 mb-4 animate-fade-in">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Mathematics)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Color:</span>
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent active-press"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(false)}
                      className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-200 active-press"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] active-press"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Category Pill List */}
            {loadingCats ? (
              <div className="text-center py-6 text-xs text-slate-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No categories created yet. Click "+" to add.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  disabled={status !== 'idle'}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all active-press ${
                    selectedCategory === null
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300'
                      : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-xs font-semibold truncate">No Category</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    disabled={status !== 'idle'}
                    className={`group flex items-center justify-between p-3 rounded-xl border text-left transition-all relative overflow-hidden active-press ${
                      selectedCategory?.id === cat.id
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300'
                        : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="text-xs font-semibold truncate pr-4">{cat.name}</span>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {status === 'idle' && (
                        <button
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-0.5 rounded transition-opacity active-press"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-darkBorder pt-4 mt-4">
            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-normal">
                Setting a category links study sessions with your statistics. You can create categories for specific courses, math topics, or engineering skills.
              </p>
            </div>
          </div>
        </div>

        {/* Circular Timer Widget */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden stagger-item stagger-4">
          
          {/* Radial animated ring when running */}
          <div className="flex flex-col items-center space-y-6 z-10 py-6">
            <div className="relative flex items-center justify-center">
              <div 
                className={`w-64 h-64 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                  status === 'running' 
                    ? 'border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-pulse-ring' 
                    : status === 'paused'
                    ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                    : 'border-white/5'
                }`}
              >
                {/* Status indicator */}
                <span className={`text-[10px] uppercase font-bold tracking-widest ${
                  status === 'running' ? 'text-indigo-400' : status === 'paused' ? 'text-amber-400' : 'text-slate-500'
                }`}>
                  {status === 'running' ? 'Focusing' : status === 'paused' ? 'Paused' : 'Ready'}
                </span>
                
                {/* Clock Display */}
                <h3 className="text-4xl font-extrabold tracking-wider font-mono text-white mt-1">
                  {formatTime(elapsedSeconds)}
                </h3>

                {/* Selected Category Label */}
                {selectedCategory && (
                  <span
                    className="mt-2.5 px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider transition-all"
                    style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color, border: `1px solid ${selectedCategory.color}40` }}
                  >
                    {selectedCategory.name}
                  </span>
                )}
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center space-x-4">
              {status === 'idle' && (
                <button
                  onClick={handleStartTimer}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold tracking-wider transition-all flex items-center shadow-lg shadow-indigo-600/20 active-press"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Start Timer
                </button>
              )}

              {status === 'running' && (
                <>
                  <button
                    onClick={pauseTimer}
                    className="px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-semibold transition-all flex items-center active-press"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </button>
                  <button
                    onClick={() => setShowStopModal(true)}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold tracking-wider transition-all flex items-center shadow-lg shadow-rose-600/10 active-press"
                  >
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    Finish Session
                  </button>
                </>
              )}

              {status === 'paused' && (
                <>
                  <button
                    onClick={resumeTimer}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center shadow-lg shadow-indigo-600/10 active-press"
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Resume
                  </button>
                  <button
                    onClick={() => {
                      if(confirm('Discard this session? Your timer progress will be lost.')){
                        discardTimer();
                      }
                    }}
                    className="px-5 py-3 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-sm font-semibold transition-all active-press"
                  >
                    Discard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Charts & Distributions */}
      {stats && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col justify-between stagger-item stagger-5">
            <div className="flex items-center justify-between border-b border-darkBorder pb-4 mb-6">
              <h2 className="text-lg font-bold text-white">Study History</h2>
              
              <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-lg border border-white/5">
                {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setChartView(view)}
                    className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all active-press ${
                      chartView === view 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts[chartView]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between stagger-item stagger-6">
            <div className="border-b border-darkBorder pb-4 mb-4">
              <h2 className="text-lg font-bold text-white">Skill Allocation</h2>
              <p className="text-xs text-slate-500 mt-1">Time distribution per category</p>
            </div>

            <div className="h-44 flex items-center justify-center relative">
              {stats.category_distribution.length === 0 ? (
                <div className="text-xs text-slate-500 text-center">No category data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.category_distribution}
                      innerRadius={48}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="hours"
                    >
                      {stats.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="max-h-36 overflow-y-auto pr-1 space-y-2 mt-2">
              {stats.category_distribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 truncate max-w-32">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-200">{item.hours.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Edit Weekly Goal Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md modal-overlay ${
          showGoalModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`w-full max-w-sm glass-panel p-6 rounded-2xl space-y-4 modal-content ${
            showGoalModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div>
            <h3 className="text-lg font-bold text-white">Set Weekly Goal</h3>
            <p className="text-xs text-slate-400 mt-1">Adjust target hours of deep study per week.</p>
          </div>

          <form onSubmit={handleUpdateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Goal Hours
              </label>
              <input
                type="number"
                min="1"
                max="168"
                required
                value={editGoalHours}
                onChange={(e) => setEditGoalHours(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 active-press"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs active-press"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Stop Session Completion Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md modal-overlay ${
          showStopModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`w-full max-w-md glass-panel p-6 rounded-2xl space-y-4 modal-content ${
            showStopModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div>
            <h3 className="text-lg font-bold text-white">Complete Study Session</h3>
            <p className="text-xs text-slate-400 mt-1">Provide feedback before recording your session details.</p>
          </div>

          <form onSubmit={handleStopTimerSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                What did you work on? <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Worked on Dynamic Programming on Trees"
                value={workedOn}
                onChange={(e) => setWorkedOn(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                What is the next task?
              </label>
              <input
                type="text"
                placeholder="e.g. Practice 3 tree problems on Codeforces"
                value={nextTask}
                onChange={(e) => setNextTask(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Why did you stop?
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch break, tired, completed goals"
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Attach Video / Study Clip (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center justify-center px-4 py-2 border border-dashed border-white/15 hover:border-indigo-500/40 rounded-xl cursor-pointer text-slate-400 hover:text-indigo-400 bg-slate-900/60 transition-all active-press">
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="text-xs font-semibold">Select File</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </label>
                <span className="text-[10px] text-slate-500 truncate max-w-40">
                  {videoFile ? videoFile.name : 'No file selected (Max 30s)'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 active-press"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 active-press"
              >
                {uploading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Save Session</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
