import React from 'react';
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

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden text-slate-200">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <Outlet />
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
