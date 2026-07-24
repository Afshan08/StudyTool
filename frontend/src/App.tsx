import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { CalendarView } from './pages/CalendarView';
import { PhysicsPrep } from './pages/PhysicsPrep';
import { Documentation } from './pages/Documentation';
import { Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden text-slate-200">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, always visible on md+ */}
      <div
        className={`
          fixed md:relative z-40 h-full
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-white/5 bg-[#02040a]/90 backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors active-press"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 ml-3">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-indigo-500/30">
              F
            </div>
            <span className="font-semibold text-sm bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Focus Journal
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes under Shared Sidebar Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/history" element={<History />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/physics-prep" element={<PhysicsPrep />} />
          </Route>
        </Routes>
      </TimerProvider>
    </Router>
  );
};

export default App;

