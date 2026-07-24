import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { api } from '../services/api';
import { LayoutDashboard, History, Calendar, LogOut, Flame, X, FolderKanban } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { status, elapsedSeconds, selectedCategory } = useTimer();
  const user = api.getUser();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNavClick = () => {
    // Close the drawer on mobile after navigation
    onClose?.();
  };

  return (
    <aside className="w-64 glass-panel border-r border-darkBorder flex flex-col justify-between h-screen sticky top-0 z-20">
      <div className="flex flex-col">
        {/* Logo + mobile close button */}
        <div className="p-6 border-b border-darkBorder flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              F
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Focus Journal
            </span>
          </div>
          {/* Close button — only visible on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-900/60 transition-colors active-press"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-4 my-6 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-semibold text-indigo-300">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Links */}
        <nav className="px-3 space-y-1">
          <NavLink
            to="/dashboard"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium sidebar-link border active-press ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>

          <NavLink
            to="/documentation"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium sidebar-link border active-press ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
              }`
            }
          >
            <FolderKanban className="w-5 h-5 mr-3 text-indigo-400" />
            Documentation
          </NavLink>

          <NavLink
            to="/history"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium sidebar-link border active-press ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
              }`
            }
          >
            <History className="w-5 h-5 mr-3" />
            History
          </NavLink>

          <NavLink
            to="/calendar"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium sidebar-link border active-press ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
              }`
            }
          >
            <Calendar className="w-5 h-5 mr-3" />
            Calendar
          </NavLink>

          <NavLink
            to="/physics-prep"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium sidebar-link border active-press ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
              }`
            }
          >
            <Flame className="w-5 h-5 mr-3 text-pink-500 animate-pulse" />
            Physics Prep
          </NavLink>
        </nav>
      </div>


      {/* Footer Timer Status & Logout */}
      <div className="p-4 border-t border-darkBorder">
        {/* Animated Timer Box wrapper */}
        <div
          className={`transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden ${
            status !== 'idle' ? 'max-h-[160px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0 pointer-events-none'
          }`}
        >
          <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-500 m-2 animate-ping" />
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>{status === 'running' ? 'Active Focus' : 'Paused Session'}</span>
            </div>
            <p className="text-xl font-bold tracking-wider text-slate-100 font-mono">
              {formatTime(elapsedSeconds)}
            </p>
            {selectedCategory && (
              <span
                className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color, border: `1px solid ${selectedCategory.color}40` }}
              >
                {selectedCategory.name}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20 active-press"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};
