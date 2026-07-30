import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, AlertTriangle, UserPlus, ClipboardPenLine } from 'lucide-react';

const AppLayout = () => {
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [fabOpen, setFabOpen] = useState(false);
    const { events } = useWebSocket();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // Very simple mapping for the title
    useEffect(() => {
        const titles = {
            '/': 'Dashboard',
            '/complaints': 'Complaints',
            '/complaints/new': 'Create Complaint',
            '/complaints/': 'Complaint Details',
            '/officers': 'Officers',
            '/departments': 'Departments',
            '/citizens': 'Citizens',
            '/notifications': 'Notifications',
            '/analytics': 'Analytics',
            '/reports': 'Reports',
            '/audit': 'Audit Logs',
            '/monitor': 'System Monitor',
            '/settings': isAdmin ? 'Settings & Roles' : 'Settings',
            '/profile': 'My Profile',
            '/emergency': 'Emergency Alerts'
        };
        const matchedTitle = location.pathname.startsWith('/complaints/') && location.pathname !== '/complaints/new'
            ? 'Complaint Details'
            : titles[location.pathname];
        setPageTitle(matchedTitle || 'Civic Portal');
    }, [location.pathname, isAdmin]);

    return (
        <div id="app-root">
            <Sidebar />
            <main className="main-wrapper">
                <Topbar title={pageTitle} />

                <div id="view-container">
                    <Outlet />
                </div>

                {isAdmin ? (
                    <div className={`quick-actions ${fabOpen ? 'open' : ''}`} id="quick-actions">
                        <div className="fab-menu">
                            <div className="fab-item" style={{ cursor: 'pointer' }}>
                                <div className="icon"><AlertTriangle style={{ color: 'var(--danger)' }} /></div>
                                <span>Emergency Broadcast</span>
                            </div>
                            <div className="fab-item" style={{ cursor: 'pointer' }}>
                                <div className="icon"><UserPlus style={{ color: 'var(--info)' }} /></div>
                                <span>Add Officer</span>
                            </div>
                            <div className="fab-item" style={{ cursor: 'pointer' }}>
                                <div className="icon"><ClipboardPenLine style={{ color: 'var(--warning)' }} /></div>
                                <span>Create Alert</span>
                            </div>
                        </div>
                        <div className="fab" onClick={() => setFabOpen(!fabOpen)}>
                            <Plus />
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    );
};

export default AppLayout;
