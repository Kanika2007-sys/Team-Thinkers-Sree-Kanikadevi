import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Cpu, Siren, Map,
    FileWarning, Badge, Building2, Users,
    BellRing, LineChart, FileBarChart2,
    ClipboardList, Activity, Settings, User, ShieldCheck, ShieldAlert
} from 'lucide-react';

const navItems = [
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

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand-logo"><ShieldAlert /></div>
                <div className="brand-text">
                    <h1>Authority Portal</h1>
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

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="avatar flex-center">
                        <User style={{ color: '#fff', width: 20, height: 20 }} />
                    </div>
                    <div className="user-info">
                        <h4>Admin User <ShieldCheck style={{ width: 14, height: 14, color: '#10B981' }} /></h4>
                        <p>Super Administrator</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
