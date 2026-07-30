import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Cpu, Siren, Map,
    FileWarning, Badge, Building2, Users,
    BellRing, LineChart, FileBarChart2,
    ClipboardList, Activity, Settings, User, ShieldCheck, ShieldAlert,
    LogOut, PlusCircle, UserCog
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define navigation items based on active role
    const getNavItems = () => {
        if (user?.role === 'admin') {
            return [
                { group: 'Command & Control' },
                { label: 'Dashboard', icon: <LayoutDashboard size={18} />, route: '/' },
                { label: 'AI Command Center', icon: <Cpu size={18} />, route: '/ai-command', badge: { text: 'AI', type: 'danger' } },
                { label: 'Emergency Center', icon: <Siren size={18} />, route: '/emergency', badge: { text: '3', type: 'danger' } },
                { label: 'Live City Map', icon: <Map size={18} />, route: '/city-map' },

                { group: 'Operations' },
                { label: 'Complaints', icon: <FileWarning size={18} />, route: '/complaints', badge: { text: '1.2k', type: 'normal' } },
                { label: 'Officers', icon: <Badge size={18} />, route: '/officers' },
                { label: 'Departments', icon: <Building2 size={18} />, route: '/departments' },
                { label: 'Citizens', icon: <Users size={18} />, route: '/citizens' },

                { group: 'Insights & Comms' },
                { label: 'Notifications', icon: <BellRing size={18} />, route: '/notifications' },
                { label: 'Analytics', icon: <LineChart size={18} />, route: '/analytics' },
                { label: 'Reports', icon: <FileBarChart2 size={18} />, route: '/reports' },

                { group: 'System' },
                { label: 'Audit Logs', icon: <ClipboardList size={18} />, route: '/audit' },
                { label: 'System Monitor', icon: <Activity size={18} />, route: '/monitor' },
                { label: 'Settings & Roles', icon: <Settings size={18} />, route: '/settings' },
            ];
        } else {
            // Citizen navigation
            return [
                { group: 'Citizen Hub' },
                { label: 'Dashboard', icon: <LayoutDashboard size={18} />, route: '/' },
                { label: 'My Complaints', icon: <FileWarning size={18} />, route: '/complaints' },
                { label: 'Create Complaint', icon: <PlusCircle size={18} />, route: '/complaints/new' },
                { label: 'Notifications', icon: <BellRing size={18} />, route: '/notifications' },
                { label: 'Emergency Alerts', icon: <Siren size={18} />, route: '/emergency' },

                { group: 'User Settings' },
                { label: 'My Profile', icon: <UserCog size={18} />, route: '/profile' },
                { label: 'Settings', icon: <Settings size={18} />, route: '/settings' },
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand-logo">
                    {user?.role === 'admin' ? <ShieldAlert /> : <ShieldCheck />}
                </div>
                <div className="brand-text">
                    <h1>{user?.role === 'admin' ? 'Authority Portal' : 'Citizen Portal'}</h1>
                    <p>Civic One OS</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, idx) => {
                    if (item.group) {
                        return <div key={`group-${idx}`} className="nav-group">{item.group}</div>;
                    }
                    return (
                        <NavLink
                            key={item.route}
                            to={item.route}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon} {item.label}
                            {item.badge && (
                                <span className={`nav-badge ${item.badge.type === 'danger' ? 'danger' : ''}`}>
                                    {item.badge.text}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="user-card" style={{ width: '100%' }}>
                    <div className="avatar flex-center" style={{ background: user?.role === 'admin' ? 'var(--brand)' : 'var(--success)' }}>
                        <User style={{ color: '#fff', width: 20, height: 20 }} />
                    </div>
                    <div className="user-info" style={{ overflow: 'hidden' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name || 'Sign In'}
                            {user?.role === 'admin' && <ShieldCheck style={{ width: 14, height: 14, color: '#10B981', flex: 'none' }} />}
                        </h4>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {user?.role === 'admin' ? 'Super Administrator' : `Ward ${user?.ward || user?.details?.ward || '18'} Resident`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-outline"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 12.5,
                        justifyContent: 'center',
                        color: 'var(--danger)',
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        gap: 6
                    }}
                >
                    <LogOut size={14} /> Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

