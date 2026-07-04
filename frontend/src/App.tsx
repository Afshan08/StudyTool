import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { CalendarView } from './pages/CalendarView';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="calendar" element={<CalendarView />} />
          </Route>
        </Routes>
      </TimerProvider>
    </Router>
  );
};

export default App;
