import React from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const RoleGuard = ({ allowedRoles, children }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="flex-center fade-in" style={{ minHeight: '60vh', padding: 24 }}>
                <div className="glass-card" style={{ maxWidth: 480, textAlign: 'center', padding: 40 }}>
                    <div className="flex-center" style={{ margin: '0 auto 24px', width: 80, height: 80, borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}>
                        <ShieldAlert size={40} />
                    </div>
                    <h2 style={{ fontSize: 24, marginBottom: 16, fontWeight: 700 }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                        You do not have the required permissions to view the <strong>{location.pathname}</strong> page. This section is restricted to authorized personnel.
                    </p>
                    <Link to="/" className="btn brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleGuard;
