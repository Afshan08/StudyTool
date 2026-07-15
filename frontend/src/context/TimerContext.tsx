import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { StudySession, Category } from '../types';

type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerContextType {
  status: TimerStatus;
  elapsedSeconds: number;
  activeSession: StudySession | null;
  selectedCategory: Category | null;
  startTimer: (category: Category | null) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: (workedOn: string, nextTask: string, stopReason: string, videoFile: File | null) => Promise<void>;
  discardTimer: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  sleepWarning: { show: boolean; duration: number } | null;
  resolveSleepWarning: (include: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sleepWarning, setSleepWarning] = useState<{ show: boolean; duration: number } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  // Load state from localStorage on init and sync with backend
  useEffect(() => {
    // Setup BroadcastChannel for tab syncing
    const channel = new BroadcastChannel('focus_journal_timer');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      switch (type) {
        case 'SYNC_STATE':
          setStatus(payload.status);
          setElapsedSeconds(payload.elapsedSeconds);
          setActiveSession(payload.activeSession);
          setSelectedCategory(payload.selectedCategory);
          break;
        case 'SLEEP_DETECTED':
          setSleepWarning({ show: true, duration: payload.duration });
          break;
      }
    };

    // Check if user is logged in first
    if (api.isAuthenticated()) {
      syncWithBackendAndLocal();
    }

    return () => {
      channel.close();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Broadcast state updates to other tabs
  const broadcastState = (newStatus: TimerStatus, seconds: number, session: StudySession | null, cat: Category | null) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'SYNC_STATE',
        payload: { status: newStatus, elapsedSeconds: seconds, activeSession: session, selectedCategory: cat }
      });
    }
  };

  const syncWithBackendAndLocal = async () => {
    try {
      const backendSession = await api.getActiveSession();
      if (backendSession) {
        // Active session exists on backend
        setActiveSession(backendSession);
        setSelectedCategory(backendSession.category_details);
        
        const isPaused = backendSession.is_paused;
        const accumulated = backendSession.duration || 0;
        
        if (isPaused) {
          setStatus('paused');
          setElapsedSeconds(accumulated);
          
          localStorage.setItem('timer_status', 'paused');
          localStorage.setItem('timer_accumulated_seconds', String(accumulated));
          localStorage.removeItem('timer_start_time');
        } else {
          const lastStart = new Date(backendSession.last_start_time || backendSession.start_time).getTime();
          const now = Date.now();
          const calculatedSeconds = accumulated + Math.max(0, Math.floor((now - lastStart) / 1000));
          
          setStatus('running');
          setElapsedSeconds(calculatedSeconds);
          
          localStorage.setItem('timer_start_time', String(lastStart));
          localStorage.setItem('timer_status', 'running');
          localStorage.setItem('timer_accumulated_seconds', String(accumulated));
        }
        localStorage.setItem('active_session_id', String(backendSession.id));
      } else {
        // Check local storage for any sync discrepancies
        const localStatus = localStorage.getItem('timer_status') as TimerStatus;
        if (localStatus && localStatus !== 'idle') {
          // Discrepancy: Active locally but not backend. Reset to idle.
          clearLocalStorage();
        }
        setStatus('idle');
        setElapsedSeconds(0);
        setActiveSession(null);
        setSelectedCategory(null);
      }
    } catch (err) {
      // Offline fallback: load from local storage
      const localStatus = localStorage.getItem('timer_status') as TimerStatus || 'idle';
      setStatus(localStatus);
      if (localStatus === 'running') {
        const localStart = Number(localStorage.getItem('timer_start_time') || Date.now());
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - localStart) / 1000)));
      } else if (localStatus === 'paused') {
        setElapsedSeconds(Number(localStorage.getItem('timer_accumulated_seconds') || 0));
      }
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('timer_start_time');
    localStorage.removeItem('timer_status');
    localStorage.removeItem('active_session_id');
    localStorage.removeItem('timer_accumulated_seconds');
  };

  // Timer Ticking & Sleep Detection Loop
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (status === 'running') {
      lastTickRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        // Sleep detection: interval should trigger every ~1000ms.
        // If delta is > 15 seconds, the computer likely slept/suspended.
        if (delta > 15000) {
          const sleepDurationSeconds = Math.floor((delta - 1000) / 1000);
          setSleepWarning({ show: true, duration: sleepDurationSeconds });
          if (channelRef.current) {
            channelRef.current.postMessage({ type: 'SLEEP_DETECTED', payload: { duration: sleepDurationSeconds } });
          }
        }

        // Recalculate duration based on starting time to prevent drift
        const localStart = Number(localStorage.getItem('timer_start_time') || now);
        const accumulated = Number(localStorage.getItem('timer_accumulated_seconds') || 0);
        const currentSeconds = accumulated + Math.floor((now - localStart) / 1000);
        setElapsedSeconds(currentSeconds);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  const startTimer = async (category: Category | null) => {
    // Check tab locking: ensure we don't start duplicate timers
    const localStatus = localStorage.getItem('timer_status');
    if (localStatus === 'running' || localStatus === 'paused') {
      throw new Error('A timer is already active in another tab.');
    }

    const session = await api.startSession(category ? category.id : null);
    const nowTime = Date.now();
    
    localStorage.setItem('timer_status', 'running');
    localStorage.setItem('timer_start_time', String(nowTime));
    localStorage.setItem('timer_accumulated_seconds', '0');
    localStorage.setItem('active_session_id', String(session.id));

    setStatus('running');
    setElapsedSeconds(0);
    setActiveSession(session);
    setSelectedCategory(category);
    broadcastState('running', 0, session, category);
  };

  const pauseTimer = async () => {
    if (status !== 'running') return;
    
    try {
      const updatedSession = await api.pauseSession();
      setActiveSession(updatedSession);
      
      const now = Date.now();
      const localStart = Number(localStorage.getItem('timer_start_time') || now);
      const accumulated = Number(localStorage.getItem('timer_accumulated_seconds') || 0);
      const currentSessionSeconds = Math.floor((now - localStart) / 1000);
      const totalAccumulated = accumulated + currentSessionSeconds;

      localStorage.setItem('timer_status', 'paused');
      localStorage.setItem('timer_accumulated_seconds', String(totalAccumulated));
      localStorage.removeItem('timer_start_time');

      setStatus('paused');
      setElapsedSeconds(totalAccumulated);
      broadcastState('paused', totalAccumulated, updatedSession, selectedCategory);
    } catch (err) {
      console.error("Failed to pause session on backend:", err);
    }
  };

  const resumeTimer = async () => {
    if (status !== 'paused') return;

    try {
      const updatedSession = await api.resumeSession();
      setActiveSession(updatedSession);
      
      const now = Date.now();
      localStorage.setItem('timer_status', 'running');
      localStorage.setItem('timer_start_time', String(now));
      localStorage.setItem('timer_accumulated_seconds', String(elapsedSeconds));

      setStatus('running');
      broadcastState('running', elapsedSeconds, updatedSession, selectedCategory);
    } catch (err) {
      console.error("Failed to resume session on backend:", err);
    }
  };

  const stopTimer = async (workedOn: string, nextTask: string, stopReason: string, videoFile: File | null) => {
    if (!activeSession) return;
    
    // Stop session in backend
    const stoppedSession = await api.stopSession(workedOn, nextTask, stopReason);

    // If there is a video entry to upload
    if (videoFile) {
      try {
        await api.uploadSessionVideo(stoppedSession.id, videoFile, stoppedSession.duration);
      } catch (err) {
        console.error("Video upload failed, session saved successfully.", err);
      }
    }

    clearLocalStorage();
    setStatus('idle');
    setElapsedSeconds(0);
    setActiveSession(null);
    setSelectedCategory(null);
    broadcastState('idle', 0, null, null);
  };

  const discardTimer = async () => {
    if (!activeSession) return;
    // Hard delete or soft delete the incomplete session
    await api.deleteSession(activeSession.id);
    clearLocalStorage();
    setStatus('idle');
    setElapsedSeconds(0);
    setActiveSession(null);
    setSelectedCategory(null);
    broadcastState('idle', 0, null, null);
  };

  const resolveSleepWarning = (include: boolean) => {
    if (!sleepWarning) return;

    if (!include) {
      // Discard the sleep duration.
      // We deduct the sleep duration in seconds from elapsed time
      const startTime = Number(localStorage.getItem('timer_start_time') || Date.now());
      // Adjust starting time forward by the sleep duration so it acts as if we paused it
      const adjustedStartTime = startTime + (sleepWarning.duration * 1000);
      localStorage.setItem('timer_start_time', String(adjustedStartTime));
      
      const newElapsed = Math.max(0, elapsedSeconds - sleepWarning.duration);
      setElapsedSeconds(newElapsed);
    }
    
    setSleepWarning(null);
  };

  return (
    <TimerContext.Provider value={{
      status,
      elapsedSeconds,
      activeSession,
      selectedCategory,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      discardTimer,
      setSelectedCategory,
      sleepWarning,
      resolveSleepWarning
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
