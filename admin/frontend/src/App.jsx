import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';

// Placeholder Pages for now
const Placeholder = ({ title }) => (
  <div className="fade-in">
    <h3>{title}</h3>
    <p>This view is under development / migration.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="officers" element={<Placeholder title="Officers" />} />
          <Route path="departments" element={<Placeholder title="Departments" />} />
          <Route path="citizens" element={<Placeholder title="Citizens" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="analytics" element={<Placeholder title="Analytics" />} />
          <Route path="reports" element={<Placeholder title="Reports" />} />
          <Route path="audit" element={<Placeholder title="Audit Logs" />} />
          <Route path="monitor" element={<Placeholder title="System Monitor" />} />
          <Route path="settings" element={<Placeholder title="Settings & Roles" />} />
          <Route path="*" element={<Placeholder title="Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
