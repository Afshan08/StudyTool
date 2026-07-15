import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { api } from '../services/api';
import { Category } from '../types';
import {
  Flame, Clock, Calendar, CheckCircle2, Download, BookOpen,
  Sparkles, CheckSquare, Square, Play, Pause, ChevronDown, ChevronUp, AlertCircle,
  Cpu, Zap, Info, Compass, Shield
} from 'lucide-react';

interface Task {
  text: string;
  duration?: string;
}

interface DayPlan {
  dayNum: number;
  date: string;
  quote: string;
  pdfUrl: string;
  pdfDesc: string;
  tasks: Task[];
}

// 7-day battle plan data matching NSTC_7Day_Battle_Plan.md
const DAY_PLANS: DayPlan[] = [
  {
    dayNum: 1,
    date: 'July 4 (Friday)',
    quote: '"Good luck. Thousands will attempt this. Only 50 will make it. Be one of them."',
    pdfUrl: '/pdfs/Day_1.pdf',
    pdfDesc: 'Giancoli Ch 2 Solved Examples (Pages 21-48, Examples 2-1 to 2-10)',
    tasks: [
      { text: 'Take Mock Test 1 (diagnostic) under timed conditions', duration: '3 hrs' },
      { text: 'Self-grade Mock Test 1 and identify top 3 weak chapters', duration: '1 hr' },
      { text: 'Build Formula Wall: Hand-write the master formula sheet', duration: '1 hr' },
      { text: 'Watch calculus power rule & motion derivatives videos and solve 10 drill problems', duration: '1 hr' },
      { text: 'Giancoli Ch 2 Solved Examples (Examples 2-1 through 2-10 on pages 21-48)', duration: '2 hrs' }
    ]
  },
  {
    dayNum: 2,
    date: 'July 5 (Saturday)',
    quote: '"Physics is not a collection of facts; it is a way of thinking, a search for symmetry and harmony."',
    pdfUrl: '/pdfs/Day_2.pdf',
    pdfDesc: 'Giancoli Ch 2-6 (Kinematics, Newton\'s Laws, Work-Energy) & HRK Problems',
    tasks: [
      { text: 'Study Giancoli Ch 2-3 Solved Examples (projectile motion, relative velocity)', duration: '1.5 hrs' },
      { text: 'Study Giancoli Ch 4-6 Solved Examples (Newton\'s laws, friction, circular motion, work-energy)', duration: '1.5 hrs' },
      { text: 'Solve all Giancoli MisConceptual Questions for Chapters 2, 3, 4, and 6', duration: '1 hr' },
      { text: 'Solve Giancoli Problem Blitz: Selected problems in Chapters 2, 3, 4, and 6', duration: '1 hr' },
      { text: 'Solve HRK Problem Blitz: Chapters 2 (problems 34, 35, 50, 55, 60, 65, 70), 3 and 4 Review', duration: '1 hr' },
      { text: 'Take Mock Test 2 (Mechanics I focus) under timed conditions', duration: '2 hrs' }
    ]
  },
  {
    dayNum: 3,
    date: 'July 6 (Sunday)',
    quote: '"The important thing is not to stop questioning. Curiosity has its own reason for existing." — Albert Einstein',
    pdfUrl: '/pdfs/Day_3.pdf',
    pdfDesc: 'Giancoli Ch 5, 7-8, 11 (Momentum, Rotation, Gravity, SHM) & HRK Problems',
    tasks: [
      { text: 'Study Giancoli Ch 5, 7-8, 11 Solved Examples', duration: '2 hrs' },
      { text: 'Solve all Giancoli MisConceptual Questions for Chapters 5, 7, 8, and 11', duration: '1 hr' },
      { text: 'Solve Giancoli Problem Blitz: Chapters 5, 7, 8, and 11', duration: '1 hr' },
      { text: 'Solve HRK Problem Blitz: Chapters 7, 8, 9, 10, and 15', duration: '1 hr' },
      { text: 'Collision & Rotation Formula Drills: Write formulas 5 times. Memorize I for disk, sphere, hoop', duration: '1 hr' },
      { text: 'Take Mock Test 3 (Mechanics II focus) under timed conditions', duration: '2 hrs' }
    ]
  },
  {
    dayNum: 4,
    date: 'July 7 (Monday)',
    quote: '"Equations are just the rules of the game. Problem-solving is how you play it. Play to win."',
    pdfUrl: '/pdfs/Day_4.pdf',
    pdfDesc: 'Giancoli Ch 16-20 (Electricity & Magnetism, Circuits) & HRK Problems',
    tasks: [
      { text: 'Study Giancoli Ch 16-20 Solved Examples', duration: '2.5 hrs' },
      { text: 'Solve all Giancoli MisConceptual Questions for Chapters 16, 17, 18, 19, and 20', duration: '1 hr' },
      { text: 'Solve Giancoli Problem Blitz: Chapters 16, 17, 19, and 20', duration: '1 hr' },
      { text: 'Solve HRK Problem Blitz: Chapters 21, 22, 24, and 25', duration: '1 hr' },
      { text: 'Circuit Shortcut Drills: Parallel R_eq = (R1*R2)/(R1+R2), Power = V^2/R, short circuits', duration: '1 hr' },
      { text: 'Take Mock Test 4 (Electricity & Magnetism focus) under timed conditions', duration: '1.5 hrs' }
    ]
  },
  {
    dayNum: 5,
    date: 'July 8 (Tuesday)',
    quote: '"Symmetry is the key to nature\'s secrets. Conservation is her absolute rule. Trust the principles."',
    pdfUrl: '/pdfs/Day_5.pdf',
    pdfDesc: 'Giancoli Ch 11, 12, 23, 26, 27, 30 (Waves, Optics, Modern) & HRK Problems',
    tasks: [
      { text: 'Study Giancoli Ch 11, 12, 23, 26, 27, 30 Solved Examples', duration: '2 hrs' },
      { text: 'Solve all Giancoli MisConceptual Questions for Chapters 11, 12, 23, 26, 27, 30', duration: '1 hr' },
      { text: 'Solve Giancoli Problem Blitz: Chapters 11, 12, 23, 27, 30', duration: '1 hr' },
      { text: 'Solve HRK Problem Blitz: Chapters 16, 27, 28, and 30', duration: '1 hr' },
      { text: 'Descriptive Questions Practice: Solve Part III descriptive problems from 2022-2024 papers', duration: '1 hr' },
      { text: 'Take Mock Test 5 (Waves/Optics/Modern focus) under timed conditions', duration: '2 hrs' }
    ]
  },
  {
    dayNum: 6,
    date: 'July 9 (Wednesday)',
    quote: '"In the middle of difficulty lies opportunity. The final push separates the fifty from the rest."',
    pdfUrl: '/pdfs/Day_6.pdf',
    pdfDesc: 'Weak Area Blitz, Formula Recitation & Descriptive Mastery Material',
    tasks: [
      { text: 'Weak Area Blitz: Re-read Giancoli Solved Examples from your 3 weakest chapters', duration: '2 hrs' },
      { text: 'Weak Area Blitz: Solve 10 problems per weak chapter from lists', duration: '2 hrs' },
      { text: 'Descriptive Mastery: Solve 3 new descriptive problems using conservation laws & energy methods', duration: '1 hr' },
      { text: 'Formula Recitation: Close all books and write every formula from memory', duration: '1 hr' },
      { text: 'Part I Reasoning Drill: Solve 20 reasoning questions (dimensional, limiting cases, graphs)', duration: '1 hr' },
      { text: 'Take Mock Test 6 (full syllabus, hard) under timed conditions', duration: '2 hrs' }
    ]
  },
  {
    dayNum: 7,
    date: 'July 10 (Thursday)',
    quote: '"You have done the work. You have built the wall of formulas. Tomorrow, you just execute."',
    pdfUrl: '/pdfs/Day_7.pdf',
    pdfDesc: 'Final Mock Simulation, Strategy Lock-in & Formula Review Sheet',
    tasks: [
      { text: 'Take Mock Test 7 (final exam simulation) under exact exam conditions', duration: '3 hrs' },
      { text: 'Strict Self-Grade: Mark every question and calculate score', duration: '1 hr' },
      { text: 'Error Analysis: Write down the exact WHY for every wrong answer', duration: '1 hr' },
      { text: 'Final Formula Review: Read your formula wall sheet one last time', duration: '1 hr' },
      { text: 'Exam Day Strategy Review: Lock in time allocation, negative marking, and guessing strategy', duration: '1 hr' },
      { text: 'Sleep Early: Rest 7+ hours for optimal brain consolidation', duration: 'Rest' }
    ]
  }
];

export const PhysicsPrep: React.FC = () => {
  // Timer Context
  const {
    status,
    elapsedSeconds,
    selectedCategory,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setSelectedCategory
  } = useTimer();

  // Selected Day tab (1 to 7)
  const [activeDay, setActiveDay] = useState<number>(1);
  // Checklist State: { "dayNum-taskIdx": boolean }
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  // Form state for finishing session
  const [showStopModal, setShowStopModal] = useState(false);
  const [workedOn, setWorkedOn] = useState('');
  const [nextTask, setNextTask] = useState('');
  const [stopReason, setStopReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories loading for physics prep category auto-creation
  const [physicsCategory, setPhysicsCategory] = useState<Category | null>(null);

  // Formula Sheet Drawer State
  const [showFormulas, setShowFormulas] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('mechanics');

  // Exam Countdown State
  const [countdownText, setCountdownText] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 1. Initial Load: Checklist from localStorage, resolve/create "Physics Prep" category
  useEffect(() => {
    // Load checklist
    const savedChecklist = localStorage.getItem('physics_prep_checklist');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (err) {
        console.error(err);
      }
    }

    // Resolve or Create Category
    resolveCategory();
    
    // Set active day to match today's date if within prep window
    // Current date is 2026-07-04. July 4 = Day 1, July 5 = Day 2, etc.
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth(); // 6 = July (0-indexed)
    const year = today.getFullYear();
    
    if (year === 2026 && month === 6) {
      const dayIndex = dayOfMonth - 4 + 1; // July 4 -> 1, July 5 -> 2...
      if (dayIndex >= 1 && dayIndex <= 7) {
        setActiveDay(dayIndex);
      }
    }
  }, []);

  // 2. Countdown Timer Loop
  useEffect(() => {
    // Exam date: July 11, 2026, at 09:00:00 AM (local time)
    const examDate = new Date('2026-07-11T09:00:00').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const distance = examDate - now;

      if (distance < 0) {
        setCountdownText({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdownText({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const resolveCategory = async () => {
    try {
      const cats = await api.getCategories();
      const prepCat = cats.find((c: any) => c.name.toLowerCase() === 'physics prep');
      if (prepCat) {
        setPhysicsCategory(prepCat);
      } else {
        // Create it
        const newCat = await api.createCategory('Physics Prep', '#EC4899'); // Pink-500
        setPhysicsCategory(newCat);
      }
    } catch (err) {
      console.error("Failed to load or create Physics Prep category", err);
    }
  };

  // 3. Toggle task checklist
  const handleToggleTask = (dayNum: number, taskIdx: number) => {
    const key = `${dayNum}-${taskIdx}`;
    const newChecklist = {
      ...checklist,
      [key]: !checklist[key]
    };
    setChecklist(newChecklist);
    localStorage.setItem('physics_prep_checklist', JSON.stringify(newChecklist));
  };

  // 4. Calculate day completion percentage
  const getDayProgress = (dayNum: number) => {
    const dayPlan = DAY_PLANS.find(d => d.dayNum === dayNum);
    if (!dayPlan) return 0;
    const total = dayPlan.tasks.length;
    const completed = dayPlan.tasks.filter((_, idx) => checklist[`${dayNum}-${idx}`]).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // 5. Timer control: Link to global Timer Context
  const handleStartStudy = async () => {
    // Automatically select Physics Prep category
    let targetCat = physicsCategory;
    if (!targetCat) {
      try {
        const cats = await api.getCategories();
        targetCat = cats.find((c: any) => c.name.toLowerCase() === 'physics prep') || null;
      } catch (err) {
        console.error(err);
      }
    }
    
    setSelectedCategory(targetCat);
    try {
      await startTimer(targetCat);
    } catch (err: any) {
      alert(err.message || "Failed to start focus session.");
    }
  };

  const handleFinishStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workedOn.trim()) return;
    setIsSubmitting(true);
    try {
      await stopTimer(workedOn, nextTask, stopReason, null);
      setShowStopModal(false);
      setWorkedOn('');
      setNextTask('');
      setStopReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to record focus session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format stopwatch seconds
  const formatStopwatch = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activePlan = DAY_PLANS.find(d => d.dayNum === activeDay)!;
  const isFocusingOnPhysics = selectedCategory?.name === 'Physics Prep' && status === 'running';  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 relative">
      
      {/* Page Header */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-6 xl:space-y-0 stagger-item stagger-1">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Flame className="w-4.5 h-4.5 animate-pulse" />
            <span>NSTC Physics Screening Test Prep</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
            7-Day Physics Battle Plan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            July 4 &rarr; July 11 | Targeted textbook page range extracts and topic blitz
          </p>
        </div>

        {/* Exam Countdown Card */}
        <div className="flex items-center space-x-3 bg-slate-900/80 border border-white/5 px-5 py-3.5 rounded-2xl shadow-xl shadow-black/20">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mr-2 font-semibold">
            Exam Countdown:
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-indigo-400">{countdownText.days}</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Days</span>
            </div>
            <span className="text-slate-600 font-bold text-lg -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-indigo-400">{countdownText.hours.toString().padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Hrs</span>
            </div>
            <span className="text-slate-600 font-bold text-lg -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-indigo-400">{countdownText.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Min</span>
            </div>
            <span className="text-slate-600 font-bold text-lg -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-pink-400 animate-pulse">{countdownText.seconds.toString().padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Sec</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Focus Control & Stats Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Day Selector Navigation */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col justify-between stagger-item stagger-2">
          <div>
            <h3 className="text-md font-bold text-slate-100 flex items-center space-x-2 pb-4 border-b border-darkBorder mb-5">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Study Timeline</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
              {DAY_PLANS.map((plan) => {
                const progress = getDayProgress(plan.dayNum);
                const isSelected = activeDay === plan.dayNum;
                return (
                  <button
                    key={plan.dayNum}
                    onClick={() => setActiveDay(plan.dayNum)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all active-press ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-900/30 border-white/5 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Day {plan.dayNum}</span>
                    <span className="text-xs font-semibold mt-1 truncate w-full">Jul {3 + plan.dayNum}</span>
                    
                    {/* Completion Ring / Badge */}
                    <div className="mt-3.5 w-full flex items-center justify-center">
                      {progress === 100 ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                      ) : (
                        <div className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-indigo-300">
                          {progress}%
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col xl:flex-row justify-between items-start xl:items-center p-4 bg-slate-950/60 border border-white/5 rounded-xl gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center font-bold text-pink-400">
                {activeDay}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Active Plan: {activePlan.date}</p>
                <p className="text-xs text-slate-400">{activePlan.pdfDesc}</p>
              </div>
            </div>
            
            {/* Download PDF button */}
            <a
              href={activePlan.pdfUrl}
              download={`Physics_Prep_Day_${activeDay}.pdf`}
              className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/10 w-full xl:w-auto justify-center active-press"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Day {activeDay} PDF
            </a>
          </div>
        </div>

        {/* Stopwatch Focus Clock Widget */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[300px] stagger-item stagger-3">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />
          
          <div className="flex flex-col items-center space-y-4 w-full">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              <span>Session Focus Stopwatch</span>
            </h4>

            {/* Stopwatch Display */}
            <div className={`relative w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
              isFocusingOnPhysics
                ? 'border-pink-500 shadow-[0_0_35px_rgba(236,72,153,0.15)] animate-pulse-ring'
                : status === 'paused' && selectedCategory?.name === 'Physics Prep'
                ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                : 'border-white/5'
            }`}>
              <span className={`text-[9px] uppercase font-bold tracking-wider ${
                isFocusingOnPhysics ? 'text-pink-400 animate-pulse' : 'text-slate-500'
              }`}>
                {isFocusingOnPhysics ? 'Focus Active' : status === 'paused' && selectedCategory?.name === 'Physics Prep' ? 'Paused' : 'Idle'}
              </span>
              <h3 className="text-3xl font-black font-mono text-white mt-1">
                {selectedCategory?.name === 'Physics Prep' ? formatStopwatch(elapsedSeconds) : '00:00:00'}
              </h3>
              <span className="text-[10px] text-pink-400/90 font-semibold px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 mt-1.5">
                Physics Prep
              </span>
            </div>

            {/* Stopwatch Actions */}
            <div className="flex items-center space-x-3 w-full justify-center">
              {status === 'idle' && (
                <button
                  onClick={handleStartStudy}
                  className="w-48 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-center shadow-lg shadow-pink-600/20 active-press"
                >
                  <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                  Start Session
                </button>
              )}

              {selectedCategory?.name === 'Physics Prep' && status === 'running' && (
                <>
                  <button
                    onClick={pauseTimer}
                    className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center active-press"
                  >
                    <Pause className="w-3.5 h-3.5 mr-1" />
                    Pause
                  </button>
                  <button
                    onClick={() => setShowStopModal(true)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold tracking-wider transition-all flex items-center shadow-lg shadow-rose-600/10 active-press"
                  >
                    <Square className="w-3.5 h-3.5 mr-1 fill-current" />
                    Stop
                  </button>
                </>
              )}

              {selectedCategory?.name === 'Physics Prep' && status === 'paused' && (
                <>
                  <button
                    onClick={resumeTimer}
                    className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-lg shadow-pink-600/10 active-press"
                  >
                    <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                    Resume
                  </button>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all active-press"
                  >
                    Reset
                  </button>
                </>
              )}

              {selectedCategory?.name !== 'Physics Prep' && status !== 'idle' && (
                <div className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl flex items-start space-x-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>An active timer is already running for category: <b>{selectedCategory?.name || 'No Category'}</b>. Finish that first or use sidebar clock.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quote of the Day & Checklist grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Checklist */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl stagger-item stagger-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-darkBorder mb-5 gap-3">
            <div>
              <h3 className="text-md font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>Day {activeDay} Study Tasks</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Check off study checklist as you complete them</p>
            </div>
            
            <button
              onClick={() => setShowFormulas(true)}
              className="flex items-center px-3.5 py-2 bg-slate-900 border border-white/5 hover:border-indigo-500/35 text-indigo-400 hover:text-indigo-300 text-xs font-semibold rounded-lg transition-all active-press"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Formula Wall Reference
            </button>
          </div>

          {/* Checklist progress bar */}
          <div className="mb-6 p-4 bg-slate-950/40 border border-white/5 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
              <span>Day progress</span>
              <span className="text-indigo-400">{getDayProgress(activeDay)}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${getDayProgress(activeDay)}%` }}
              />
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-3">
            {activePlan.tasks.map((task, idx) => {
              const isChecked = !!checklist[`${activeDay}-${idx}`];
              return (
                <button
                  key={idx}
                  onClick={() => handleToggleTask(activeDay, idx)}
                  className={`w-full flex items-start text-left p-3.5 rounded-xl border transition-all active-press ${
                    isChecked
                      ? 'bg-slate-900/20 border-indigo-500/30 text-slate-400'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <div className="mr-3.5 mt-0.5 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-white/20 bg-slate-950'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {task.text}
                    </p>
                  </div>
                  {task.duration && (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-slate-400 ml-4 flex-shrink-0">
                      {task.duration}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Motivational Card */}
        <div className="lg:col-span-4 flex flex-col space-y-6 stagger-item stagger-5">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-pink-950/15 border border-indigo-500/10 flex-1 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl" />
            
            <div className="z-10">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
                <Sparkles className="w-4 h-4 fill-pink-500/20" />
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Day {activeDay} Motivation</span>
              <p className="text-base font-medium text-slate-100 italic leading-relaxed mt-2.5">
                {activePlan.quote}
              </p>
            </div>
            
            <div className="mt-6 border-t border-darkBorder pt-4 text-[10px] text-slate-400 leading-normal z-10 flex items-start space-x-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span><b>Target: Top 50.</b> Part I logic tests reasoning, graph slopes, dimensional checks, and extreme boundary values. Do not waste time memorizing calculus proofs.</span>
            </div>
          </div>
        </div>

      </section>

      {/* Formula Wall Reference Modal (Slide Over / Drawer) */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end bg-slate-950/65 backdrop-blur-sm modal-overlay ${
          showFormulas ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`w-full max-w-2xl h-screen bg-slate-900 border-l border-white/5 p-6 flex flex-col justify-between relative shadow-2xl overflow-y-auto transition-transform duration-500 ease-[var(--ease-drawer)] ${
            showFormulas ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex justify-between items-start border-b border-darkBorder pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5.5 h-5.5 text-indigo-400" />
                  <span>Physics Formula Wall Quick-Reference</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Recited from the core NSTC chapters. Scroll & copy formulas directly.
                </p>
              </div>
              <button
                onClick={() => setShowFormulas(false)}
                className="p-1.5 rounded-lg bg-slate-950 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors text-xs font-semibold active-press"
              >
                Close
              </button>
            </div>

            {/* Formula Sections Accordion */}
            <div className="space-y-4">
              
              {/* 1. Mechanics Section */}
              <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/30">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'mechanics' ? null : 'mechanics')}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-100 hover:bg-slate-900/60 active-press"
                >
                  <span className="flex items-center"><Compass className="w-4 h-4 mr-2 text-indigo-400" /> Mechanics (60% of test)</span>
                  {expandedSection === 'mechanics' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div 
                  className={`transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden ${
                    expandedSection === 'mechanics' ? 'max-h-[850px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 border-t border-white/5 space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Kinematics</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`v = u + at
s = ut + ½at²
v² = u² + 2as
s = ½(u + v)t
Average velocity = total displacement / total time`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Forces & Newton's Laws</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`F_net = ma
Weight = mg
Friction: f_s ≤ μ_s·N, f_k = μ_k·N
Inclined plane: a = g(sinθ - μ·cosθ)`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Work, Energy, Power</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`Work = F·d·cosθ
KE = ½mv²
PE_grav = mgh
PE_spring = ½kx²
Power = Work/time = F·v
Work-Energy Theorem: W_net = ΔKE`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Momentum & Collisions</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`p = mv
Impulse = F·Δt = Δp
Elastic 1D Collision (target m2 at rest):
  v1' = ((m1 - m2) / (m1 + m2)) · v1
  v2' = ((2m1) / (m1 + m2)) · v1
Inelastic: v' = (m1v1 + m2v2) / (m1 + m2)`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Circular Motion, Gravity, Rotation</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`a_c = v²/r = ω²r
v_orbital = √(GM/r)
g_surface = GM/R²
Escape Velocity = √(2GM/R)
Torque τ = I·α, Angular Momentum L = Iω
Rotational KE = ½Iω²
I_disk = ½MR², I_sphere = ⅖MR², I_hoop = MR²
Rolling: v = Rω, Total KE = ½mv² + ½Iω²`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">SHM & Oscillations</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`T_spring = 2π√(m/k)
T_pendulum = 2π√(L/g)
E_total = ½kA²
v_max = Aω = A√(k/m)`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Electromagnetism Section */}
              <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/30">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'em' ? null : 'em')}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-100 hover:bg-slate-900/60 active-press"
                >
                  <span className="flex items-center"><Zap className="w-4 h-4 mr-2 text-indigo-400" /> Electricity & Magnetism (25%)</span>
                  {expandedSection === 'em' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div 
                  className={`transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden ${
                    expandedSection === 'em' ? 'max-h-[550px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 border-t border-white/5 space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Electrostatics & Capacitors</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`F = k·q1·q2 / r²  (k = 8.99e9 N·m²/C²)
E = kQ/r², V = kQ/r
E = V/d (uniform field)
C = Q/V
C_parallel = C1 + C2, 1/C_series = 1/C1 + 1/C2
Energy stored U = ½CV² = ½QV = Q²/2C`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">DC Circuits</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`V = IR
P = VI = I²R = V²/R
R_series = R1 + R2 + ...
1/R_parallel = 1/R1 + 1/R2 + ...
EMF = IR + Ir (internal resistance r)
Shortcut: Two parallel R_eq = (R1·R2)/(R1+R2)
Shortcut: N identical parallel R_eq = R/N`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Magnetism & Induction</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`F = qvBsinθ  (Force on charge)
F = ILBsinθ  (Force on wire)
Circular orbit: r = mv / (qB)
EMF Induction: ε = -N · ΔΦ/Δt
Flux: Φ = B·A·cosθ`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Waves, Optics & Modern Physics Section */}
              <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/30">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'optics' ? null : 'optics')}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-100 hover:bg-slate-900/60 active-press"
                >
                  <span className="flex items-center"><Cpu className="w-4 h-4 mr-2 text-indigo-400" /> Waves, Optics & Modern Physics (15%)</span>
                  {expandedSection === 'optics' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div 
                  className={`transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden ${
                    expandedSection === 'optics' ? 'max-h-[550px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 border-t border-white/5 space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Optics & Wave Motion</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`v = f·λ, ω = 2πf = 2π/T
1/f = 1/d_o + 1/d_i
Magnification: m = -d_i / d_o = h_i / h_o
f = R/2
Snell's Law: n1·sinθ1 = n2·sinθ2
n = c/v
Critical Angle: sinθ_c = n2/n1 (n1 > n2)`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Modern & Nuclear Physics</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`De Broglie Wave: λ = h/p
Energy of photon: E = hf = hc/λ
Shortcut: hc ≈ 1240 eV·nm
Photoelectric Max KE: KE_max = hf - φ
Hydrogen lines: E_n = -13.6 / n² (in eV)
Radioactivity Decay: N = N0·e^(-λt)
Half life: t_half = ln2/λ ≈ 0.693/λ`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-400 mb-1">Thermodynamics</p>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 font-mono overflow-x-auto leading-normal">
{`PV = nRT
Avg Kinetic Energy: KE_avg = (3/2)·k·T
First Law: ΔU = Q - W
Carnot Efficiency = 1 - T_cold/T_hot`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Non-Calculus Reasoning Hacks */}
              <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/30">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'hacks' ? null : 'hacks')}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-100 hover:bg-slate-900/60 active-press"
                >
                  <span className="flex items-center"><Shield className="w-4 h-4 mr-2 text-indigo-400" /> Calculus Reasoning Hacks</span>
                  {expandedSection === 'hacks' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div 
                  className={`transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden ${
                    expandedSection === 'hacks' ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 border-t border-white/5 space-y-4 text-xs">
                    <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/10">
                      <p className="font-bold text-pink-400 mb-1">Hack 1: Power Rule</p>
                      <p className="text-slate-300 leading-relaxed mb-2">
                        If given position <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">x(t) = t^n</code>, the velocity is <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">v(t) = dx/dt = n·t^(n-1)</code>, and acceleration is <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">a(t) = dv/dt</code>.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/10">
                      <p className="font-bold text-pink-400 mb-1">Hack 2: Expand and Match</p>
                      <p className="text-slate-300 leading-relaxed">
                        If given position as a polynomial function like <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">r(t) = (1-βt)·t·r0</code>, expand it: <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">r(t) = t·r0 - βt²·r0</code>. Match directly to kinematic equation <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">x = ut + ½at²</code>. Here, <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">u = r0</code> and <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">½a = -β·r0</code> so <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">a = -2β·r0</code>. No derivative required!
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/10">
                      <p className="font-bold text-pink-400 mb-1">Hack 3: Work under F-x Graph</p>
                      <p className="text-slate-300 leading-relaxed">
                        Work done is the area under the Force-position curve. Integrate visually!
                        Triangle area = <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">½ · base · height</code>, Rectangle area = <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">base · height</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 border-t border-darkBorder pt-4">
            <button
              onClick={() => setShowFormulas(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors active-press"
            >
              Close Reference Drawer
            </button>
          </div>
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
            <h3 className="text-lg font-bold text-white flex items-center">
              <Flame className="w-5 h-5 text-pink-500 mr-2" />
              <span>Complete Physics Prep Session</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Review and log your study hours into the Focus Journal database.</p>
          </div>

          <form onSubmit={handleFinishStudySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                What did you work on? <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Worked on Giancoli Ch 2 Examples, Q1-5"
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
                placeholder="e.g. Complete Day 1 Mock test review"
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
                placeholder="e.g. Finished Day 1 goals, taking a break"
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
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
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs flex items-center justify-center min-w-[100px] active-press"
              >
                {isSubmitting ? (
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

export default PhysicsPrep;
