import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AiChatbot from '../../components/AiChatbot';
import ToastContainer from '../../components/Toast';
import useAuthStore from '../../store/authStore';

export default function CitizenLayout() {
  const { user } = useAuthStore();

  const role = user?.role?.name || user?.role || 'citizen';

  // Role Guard: If officer or admin is logged in, redirect them to their respective portal!
  if (role === 'officer') {
    return <Navigate to="/officer" replace />;
  }
  if (role === 'admin' || role === 'org_admin' || role === 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      <Sidebar portal="citizen" />
      <main className="flex-1 ml-60 min-w-0 min-h-screen">
        <Outlet />
      </main>
      <AiChatbot />
      <ToastContainer />
    </div>
  );
}
