import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';

function RoleRouter() {
  const { role, logout } = useAuth();
  if (!role) return <Navigate to="/login" />;

  const dashboards = {
    manager: <ManagerDashboard />,
    admin: <ManagerDashboard />,
    worker: <WorkerDashboard />,
    buyer: <BuyerDashboard />
  };

  return (
    <div>
      <div className="topbar">
        <button className="btn btn-secondary" onClick={logout}>Log Out</button>
      </div>
      {dashboards[role] || <p>Unknown role</p>}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<RoleRouter />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
