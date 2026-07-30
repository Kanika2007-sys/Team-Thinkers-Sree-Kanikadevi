import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useWebSocket } from '../../context/WebSocketContext';
import { Plus, AlertTriangle, UserPlus, ClipboardPenLine } from 'lucide-react';

const AppLayout = () => {
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [fabOpen, setFabOpen] = useState(false);
    const { events } = useWebSocket();

    // Very simple mapping for the title
    useEffect(() => {
        const titles = {
            '/': 'Dashboard',
            '/complaints': 'Complaints',
            '/officers': 'Officers',
            '/departments': 'Departments',
            '/citizens': 'Citizens',
            '/notifications': 'Notifications',
            '/analytics': 'Analytics',
            '/reports': 'Reports',
            '/audit': 'Audit Logs',
            '/monitor': 'System Monitor',
            '/settings': 'Settings & Roles'
        };
        setPageTitle(titles[location.pathname] || 'Civic Portal');
    }, [location.pathname]);

    return (
        <div id="app-root">
            <Sidebar />
            <main className="main-wrapper">
                <Topbar title={pageTitle} />

                <div id="view-container">
                    <Outlet />
                </div>

                {/* Floating Quick Actions */}
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
            </main>
        </div>
    );
};

export default AppLayout;
