import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Clock, Flame, Trophy, Play, CheckCircle2, ChevronRight, Sparkles, 
  ArrowRight, ShieldCheck, Video, LayoutDashboard, Calendar, History, BookOpen 
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = api.isAuthenticated();

  // Mock ticking timer state for the interactive hero preview
  const [mockSeconds, setMockSeconds] = useState(1452); // Starts at 24:12
  const [isTicking, setIsTicking] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Competitive Programming');

  // Stagger loading state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let interval: any;
    if (isTicking) {
      interval = setInterval(() => {
        setMockSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTicking]);

  const formatMockTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const mockCategories = [
    { name: 'Competitive Programming', color: '#6366F1' },
    { name: 'Mathematics', color: '#EC4899' },
    { name: 'Data Structures', color: '#10B981' },
    { name: 'Systems Engineering', color: '#3B82F6' },
  ];

  return (
    <div className={`min-h-screen bg-[#02040a] text-slate-200 overflow-x-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#02040a]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            F
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Focus Journal
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active-press shadow-lg shadow-indigo-600/20"
            >
              <span>Go to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-200 text-xs font-bold transition-all active-press"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-pink-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="lg:col-span-6 space-y-8 stagger-item stagger-1">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Tactile Study Tracking for Outliers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.08] tracking-tight">
            Your personal training <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">journal</span> for deep skills.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Stop tracking simple minutes. Build consistency, record block context, log edit reasons, and upload video journals. Engineered specifically for Competitive Programming, Mathematics, and complex skill acquisition.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 max-w-md">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-wider transition-all active-press flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <span>Enter Your Journal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-wider transition-all active-press flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
                >
                  <span>Start Free Journaling</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/30 text-slate-300 rounded-xl font-bold text-xs tracking-wider transition-all active-press flex items-center justify-center"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-6 text-slate-500 text-xs pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No distractions</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Immutable practice logs</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Preview */}
        <div className="lg:col-span-6 stagger-item stagger-2 relative">
          <div className="glass-panel p-6 rounded-2xl relative border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-950/80">
            {/* Window controls decoration */}
            <div className="flex space-x-1.5 pb-4 border-b border-white/5 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-[10px] text-slate-600 font-mono pl-3">focus_timer.tsx</span>
            </div>

            {/* Mock Timer Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Category selector preview */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Practice Topic</div>
                <div className="space-y-2">
                  {mockCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all active-press ${
                        activeCategory === cat.name
                          ? 'bg-indigo-600/15 border-indigo-500/35 text-indigo-300'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="truncate pr-2 font-semibold">{cat.name}</span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Stopwatch display preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900/20 border border-white/5 rounded-xl text-center relative">
                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[8px] font-mono">
                  <Flame className="w-2.5 h-2.5 animate-pulse" />
                  <span>3 Day Streak</span>
                </div>

                <div 
                  className={`w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    isTicking 
                      ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)] animate-pulse-ring' 
                      : 'border-white/5'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-widest text-indigo-400 font-bold">
                    {isTicking ? 'Focusing' : 'Ready'}
                  </span>
                  <h3 className="text-xl font-bold font-mono text-white mt-0.5">
                    {formatMockTime(mockSeconds)}
                  </h3>
                  <button 
                    onClick={() => setIsTicking(!isTicking)}
                    className="mt-2 p-1.5 rounded-full bg-indigo-600 text-white active-press"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

            </div>

            {/* Mock stats widget below */}
            <div className="mt-6 p-4 bg-slate-900/40 border border-white/5 rounded-xl flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Weekly Progress</span>
                <span className="text-sm font-extrabold text-white">28.4h / 40h Goal</span>
              </div>
              <div className="w-32 bg-slate-950 border border-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full w-[71%] rounded-full" />
              </div>
              <span className="text-xs font-bold text-indigo-400">71%</span>
            </div>

          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-slate-950/40 border-y border-white/5 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 stagger-item stagger-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mx-auto">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Designed for Deliberate Practice
          </h2>
          <blockquote className="text-lg sm:text-xl font-medium text-slate-300 italic leading-relaxed">
            "Deliberate practice is not comfortable. It requires extreme focus, immediate feedback, and structured self-reflection. Focus Journal forces you to record not just when you studied, but exactly what was solved, why you stopped, and what you will attack next."
          </blockquote>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Everything you need. Zero distractions.</h2>
          <p className="text-slate-400 text-xs sm:text-sm">We stripped away the clutter, social feeds, and gamification to focus entirely on deep work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resilient Focus Timer</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Timers continue accurately across tab switches, screen locks, and browser crashes. Inactive durations (e.g. laptop sleeping) are detected and resolved gracefully with explicit choice.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Immutable Edit Audit Log</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Need to adjust a session? You can, but you must enter an explicit reason. Every single change is stored in an immutable, readable audit log. Your training history remains clean and honest.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tactile Activity Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Inspect weeks of consistency with Github-style grid maps. Drill down into any day's specific logs, allocations, and stats to understand where your cognitive energy is going.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">30s Video Journals</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Attach optional 20-30 second reflection clips to sessions. Review your state of exhaustion, breakthroughs, or mood months down the road. Keep a living journal of your training arc.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Weekly Goal Targets</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Set active targets (e.g. 40 hours per week). The application tracks your goal status historically so goal changes don't corrupt past records. Always know your daily requirements.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Self-Correcting Metadata</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mandatory completion flows enforce answers on: *What did you solve?*, *What is the next task?*, and *Why did you stop?*. A structured log guarantees you never waste restart overhead.
            </p>
          </div>

        </div>
      </section>

      {/* Visual Product showcase section using high-fidelity dark design */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#0c0f1d] to-[#04060e] border border-white/5 rounded-3xl p-8 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative overflow-hidden">
          {/* Background visuals */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />

          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">Structured Practice Flow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              An application that acts like a coach.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Most timers let you click start and forget. Focus Journal structures your entry and exit boundaries. When you click stop, the app requires you to answer:
            </p>
            
            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">"What did you work on?"</strong>
                  <span className="text-slate-400 text-[11px]">Forces precise descriptions of problem-solving contexts.</span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">"What is the next task?"</strong>
                  <span className="text-slate-400 text-[11px]">Eliminates starting friction on your next practice session.</span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">"Why did you stop?"</strong>
                  <span className="text-slate-400 text-[11px]">Pinpoints distractions, cognitive limits, and energy schedules.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* Visual illustration containing programming mock code and a sleek terminal layout */}
            <div className="w-full max-w-md p-6 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl font-mono text-[11px] text-slate-400 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-500 font-semibold uppercase text-[9px]">Session Journal Entry</span>
                <span className="text-emerald-400 font-semibold text-[9px] uppercase tracking-wide">● Database Sync Complete</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500"># Category:</span>
                  <span className="text-pink-400 block font-semibold font-sans mt-0.5">Competitive Programming</span>
                </div>
                <div>
                  <span className="text-slate-500"># Duration:</span>
                  <span className="text-white block font-semibold mt-0.5 font-mono">02:14:19</span>
                </div>
                <div>
                  <span className="text-slate-500"># Worked On:</span>
                  <span className="text-slate-300 block font-sans leading-relaxed mt-0.5">
                    "Solved Codeforces 1800E using DSU for connected components and character frequency checks."
                  </span>
                </div>
                <div>
                  <span className="text-slate-500"># Next Task:</span>
                  <span className="text-indigo-400 block font-sans leading-relaxed mt-0.5">
                    "Implement CF 1800F bitmask DP optimization to handle odd/even frequency constraints."
                  </span>
                </div>
                <div>
                  <span className="text-slate-500"># Stop Reason:</span>
                  <span className="text-slate-400 block font-sans leading-relaxed mt-0.5">
                    "Felt brain fatigue after 3 failed implementations; taking a walking break."
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-24 border-t border-white/5 relative overflow-hidden bg-slate-950/20">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center px-6 space-y-8">
          <h2 className="text-4xl font-black text-white leading-none tracking-tight">
            Stop tracking. Start training.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Take control of your skill acquisition. Log session reasons, review edit histories, and build deep focus. Free to use, built for outliers.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 max-w-sm mx-auto">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-wider transition-all active-press flex items-center justify-center space-x-2"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-wider transition-all active-press"
                >
                  Start Your Journal
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-slate-300 rounded-xl font-bold text-xs tracking-wider transition-all active-press"
                >
                  Login
                </button>
              </>
            )}
          </div>
          
          <div className="text-[10px] text-slate-600 pt-8 border-t border-white/5">
            © {new Date().getFullYear()} Focus Journal. Engineered for deliberate practicing and outliers.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
