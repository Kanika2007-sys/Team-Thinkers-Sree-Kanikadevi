import { useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ToastContainer, { showToast } from '../../components/Toast';
import useAuthStore from '../../store/authStore';

export default function OfficerLayout() {
  const [activeView, setActiveView] = useState('dashboard');
  const { user } = useAuthStore();

  const role = user?.role?.name || user?.role || 'officer';

  // Role Guard: If citizen is logged in, redirect them to Citizen Portal!
  if (role === 'citizen') {
    return <Navigate to="/citizen" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden font-sans">
      <Sidebar portal="officer" activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 ml-60 min-w-0 min-h-screen bg-[#0b0f19]">
        <Outlet context={{ activeView, setActiveView }} />
      </main>
      <ToastContainer />
    </div>
  );
}
