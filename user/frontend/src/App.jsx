import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import CreateComplaint from './pages/CreateComplaint';
import CitizenDashboard from './pages/CitizenDashboard';
import CitizenComplaints from './pages/CitizenComplaints';
import CitizenNotifications from './pages/CitizenNotifications';
import EmergencyAlerts from './pages/EmergencyAlerts';
import ProfileSettings from './pages/ProfileSettings';
import GeneralSettings from './pages/GeneralSettings';
import LoginPage from './pages/LoginPage';

const Placeholder = ({ title }) => (
  <div className="fade-in">
    <h3>{title}</h3>
    <p>This view is under development / migration.</p>
  </div>
);

const RoleAwareRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {isAdmin ? (
            <>
              <Route index element={<Dashboard />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="complaints/:id" element={<ComplaintDetails />} />
              <Route path="officers" element={<Placeholder title="Officers" />} />
              <Route path="departments" element={<Placeholder title="Departments" />} />
              <Route path="citizens" element={<Placeholder title="Citizens" />} />
              <Route path="notifications" element={<Placeholder title="Notifications" />} />
              <Route path="analytics" element={<Placeholder title="Analytics" />} />
              <Route path="reports" element={<Placeholder title="Reports" />} />
              <Route path="audit" element={<Placeholder title="Audit Logs" />} />
              <Route path="monitor" element={<Placeholder title="System Monitor" />} />
              <Route path="settings" element={<Placeholder title="Settings & Roles" />} />
            </>
          ) : (
            <>
              <Route index element={<CitizenDashboard />} />
              <Route path="complaints" element={<CitizenComplaints />} />
              <Route path="complaints/new" element={<CreateComplaint />} />
              <Route path="complaints/:id" element={<ComplaintDetails />} />
              <Route path="notifications" element={<CitizenNotifications />} />
              <Route path="emergency" element={<EmergencyAlerts />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="settings" element={<GeneralSettings />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RoleAwareRoutes />
    </BrowserRouter>
  );
}

export default App;
