import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudySession, Category } from '../types';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dailyDurations, setDailyDurations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Selected date for viewing sessions
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getSessions();
      setSessions(data);

      // Compute daily durations in local time
      const durations: Record<string, number> = {};
      data.forEach((s: StudySession) => {
        if (s.is_deleted || !s.end_time) return;
        const localDate = new Date(s.start_time).toLocaleDateString('sv'); // sv locale returns YYYY-MM-DD
        durations[localDate] = (durations[localDate] || 0) + s.duration;
      });
      setDailyDurations(durations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate grid cells for the last 24 weeks (6 months)
  const getGridCells = () => {
    const cells = [];
    const now = new Date();
    // Start from the Sunday 24 weeks ago
    const startDate = new Date();
    startDate.setDate(now.getDate() - 170); // ~5.5 months ago
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay); // Back to Sunday

    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateStr = currentDate.toLocaleDateString('sv');
      cells.push({
        date: new Date(currentDate),
        dateStr,
        seconds: dailyDurations[dateStr] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return cells;
  };

  const cells = getGridCells();

  // Handle day click
  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const filtered = sessions.filter(s => {
      if (s.is_deleted) return false;
      const sDate = new Date(s.start_time).toLocaleDateString('sv');
      return sDate === dateStr;
    });
    setSelectedSessions(filtered);
  };

  const getIntensityClass = (seconds: number) => {
    if (seconds === 0) return 'bg-slate-900 border-white/5 hover:border-slate-700';
    
    const hours = seconds / 3600;
    if (hours < 2) return 'bg-indigo-500/20 border-indigo-500/30 hover:border-indigo-400';
    if (hours < 4) return 'bg-indigo-500/40 border-indigo-500/50 hover:border-indigo-300';
    if (hours < 6) return 'bg-indigo-500/70 border-indigo-500/80 hover:border-indigo-200';
    return 'bg-indigo-500 border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]';
  };

  const formatHours = (secs: number) => {
    return `${(secs / 3600).toFixed(1)}h`;
  };

  const formatDateReadable = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Group cells by Sunday-Saturday weeks
  const weeks: Array<typeof cells> = [];
  let currentWeek: typeof cells = [];
  cells.forEach((cell, idx) => {
    currentWeek.push(cell);
    if (currentWeek.length === 7 || idx === cells.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Activity Calendar
        </h1>
        <p className="text-slate-400 text-sm mt-1">Grid representation of study consistency and allocations</p>
      </header>

      {/* Grid view */}
      <section className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-300">Consistency Grid</h3>
          <p className="text-xs text-slate-500">Each block represents a day. Click a block to inspect daily sessions.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading grid logs...</div>
        ) : (
          <div className="flex flex-col overflow-x-auto pb-2">
            <div className="flex space-x-1.5 min-w-[700px]">
              {/* Day Labels */}
              <div className="flex flex-col justify-between text-[10px] text-slate-500 pr-3 py-1 font-semibold select-none h-[116px]">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* Grid Columns (Weeks) */}
              <div className="flex space-x-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col space-y-1">
                    {/* Fill dummy cells for incomplete first week */}
                    {wIdx === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, idx) => (
                      <div key={`dummy-${idx}`} className="w-[13px] h-[13px] rounded bg-transparent border-0" />
                    ))}
                    
                    {week.map((cell) => (
                      <button
                        key={cell.dateStr}
                        onClick={() => handleDayClick(cell.dateStr)}
                        className={`w-[13px] h-[13px] rounded border transition-all ${getIntensityClass(cell.seconds)}`}
                        title={`${cell.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${formatHours(cell.seconds)} studied`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Intensity Legend */}
            <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-5 self-end">
              <span>Less</span>
              <div className="w-[10px] h-[10px] rounded bg-slate-900 border border-white/5" />
              <div className="w-[10px] h-[10px] rounded bg-indigo-500/20 border border-indigo-500/30" />
              <div className="w-[10px] h-[10px] rounded bg-indigo-500/40 border border-indigo-500/50" />
              <div className="w-[10px] h-[10px] rounded bg-indigo-500/70 border border-indigo-500/80" />
              <div className="w-[10px] h-[10px] rounded bg-indigo-500 border border-indigo-400" />
              <span>More (6h+)</span>
            </div>
          </div>
        )}
      </section>

      {/* Inspecting sessions of clicked day */}
      <section className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-300">
            {selectedDate ? `Logs for ${formatDateReadable(selectedDate)}` : 'Select a day above'}
          </h3>
          <p className="text-xs text-slate-500">Details of study blocks recorded on this calendar day.</p>
        </div>

        {!selectedDate ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            Click any colored cell in the grid above to view details.
          </div>
        ) : selectedSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            <span>No study sessions recorded on this day. Keep consistent!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedSessions.map((session) => (
              <div key={session.id} className="p-4 bg-slate-900/60 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    {session.category_details ? (
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{ backgroundColor: `${session.category_details.color}20`, color: session.category_details.color }}
                      >
                        {session.category_details.name}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-500">
                        Uncategorized
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      ID: #{session.id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {session.worked_on || <span className="italic text-slate-500">No details provided</span>}
                  </p>
                  {session.next_task && (
                    <p className="text-[10px] text-slate-400">
                      <span className="font-bold text-indigo-400">Next Up:</span> {session.next_task}
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-100 font-mono">
                    {formatHours(session.duration)}
                  </p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Duration</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
