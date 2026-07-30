import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { civicApi } from '../services/civicApi';
import {
    BellRing, Check, Trash2, ShieldAlert, Info,
    Volume2, Mail, MailOpen, Calendar, HelpCircle
} from 'lucide-react';

const CitizenNotifications = () => {
    const { user } = useAuth();
    const { events } = useWebSocket();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [readNotifs, setReadNotifs] = useState(() => {
        const stored = localStorage.getItem(`read_notifs_${user?.name}`);
        return stored ? JSON.parse(stored) : [];
    });
    const [deletedNotifs, setDeletedNotifs] = useState(() => {
        const stored = localStorage.getItem(`deleted_notifs_${user?.name}`);
        return stored ? JSON.parse(stored) : [];
    });

    const loadNotifications = async () => {
        try {
            const { data } = await civicApi.getNotifications();
            // Filter notifications that target either All Citizens or Ward Residents of our ward
            const citizenAlerts = data.filter(n => {
                const targetAll = n.recipients === 'All Citizens';
                const targetWard = n.recipients === 'Ward Residents' && n.area.toLowerCase().includes(`ward ${user.ward || '18'}`);
                return targetAll || targetWard;
            });
            setNotifications(citizenAlerts);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [user, events]);

    // Update local storage when read/delete state changes
    useEffect(() => {
        localStorage.setItem(`read_notifs_${user?.name}`, JSON.stringify(readNotifs));
    }, [readNotifs, user]);

    useEffect(() => {
        localStorage.setItem(`deleted_notifs_${user?.name}`, JSON.stringify(deletedNotifs));
    }, [deletedNotifs, user]);

    const handleMarkAsRead = (id) => {
        if (!readNotifs.includes(id)) {
            setReadNotifs(prev => [...prev, id]);
        }
    };

    const handleMarkAllRead = () => {
        const unreadIds = notifications.map(n => n.id).filter(id => !readNotifs.includes(id));
        setReadNotifs(prev => [...prev, ...unreadIds]);
    };

    const handleDeleteNotif = (id) => {
        setDeletedNotifs(prev => [...prev, id]);
    };

    const displayedNotifications = notifications.filter(n => !deletedNotifs.includes(n.id));
    const unreadCount = displayedNotifications.filter((n) => !readNotifs.includes(n.id)).length;

    if (loading) {
        return (
            <div className="fade-in" style={{ padding: 25 }}>
                <h2>Inbox is updating...</h2>
                <div className="glass-card loading-skeleton" style={{ height: 300 }}></div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ paddingBottom: 40 }}>
            {/* Header tools */}
            <div className="flex-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontFamily: 'var(--font-disp)' }}>Notifications Bulletin</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Official alerts, ward closures, and emergency broadcasts.</p>
                </div>
                <div className="flex-gap">
                    <span className="badge info">Unread {unreadCount}</span>
                    {displayedNotifications.length > 0 && (
                        <button className="btn btn-outline" onClick={handleMarkAllRead} style={{ gap: 6 }}>
                            <Check size={16} /> Mark All as Read
                        </button>
                    )}
                </div>
            </div>

            {displayedNotifications.length === 0 ? (
                <div className="glass-card flex-center" style={{ minHeight: 300, textAlign: 'center', padding: 40 }}>
                    <div className="flex-center" style={{ margin: '0 auto 20px', width: 64, height: 64, borderRadius: '50%', background: 'var(--border-light)', color: 'var(--text-faint)' }}>
                        <MailOpen size={30} />
                    </div>
                    <h2 style={{ fontSize: 18, marginBottom: 8 }}>Empty Alert Center</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 450 }}>No active notifications found for Ward {user?.ward || '18'} or global announcements. You are fully up to date.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {displayedNotifications.map((n) => {
                        const isRead = readNotifs.includes(n.id);
                        return (
                            <div
                                key={n.id}
                                className="glass-card"
                                style={{
                                    padding: 20,
                                    borderLeft: `5px solid ${n.priority === 'Critical' ? 'var(--danger)' :
                                            n.priority === 'High' ? 'var(--warning)' : 'var(--brand)'
                                        }`,
                                    background: isRead ? 'var(--bg-card)' : 'linear-gradient(90deg, var(--bg-card) 0%, rgba(37, 99, 235, 0.02) 100%)',
                                    opacity: isRead ? 0.75 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                        <div className="flex-center" style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: n.priority === 'Critical' ? 'var(--danger-bg)' : 'var(--info-bg)',
                                            color: n.priority === 'Critical' ? 'var(--danger)' : 'var(--info)',
                                            flex: 'none'
                                        }}>
                                            {n.priority === 'Critical' ? <ShieldAlert size={20} /> : <BellRing size={20} />}
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{n.title}</h3>
                                                <span className={`badge ${n.priority === 'Critical' ? 'danger' :
                                                        n.priority === 'High' ? 'warning' : 'info'
                                                    }`} style={{ fontSize: 9, padding: '2px 6px' }}>
                                                    {n.priority}
                                                </span>
                                                {!isRead && (
                                                    <span className="badge success" style={{ fontSize: 9, padding: '2px 6px' }}>New</span>
                                                )}
                                            </div>

                                            <p style={{ fontSize: 14, color: 'var(--text-main)', marginTop: 8, lineHeight: 1.5 }}>
                                                {n.description || `Important municipal update from the ${n.dept} department regarding ${n.area}.`}
                                            </p>

                                            <div className="flex-gap" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, gap: 16 }}>
                                                <span className="flex-gap" style={{ gap: 4 }}>
                                                    <Calendar size={13} /> {n.sent_at}
                                                </span>
                                                <span className="flex-gap" style={{ gap: 4 }}>
                                                    Target: <strong>{n.area}</strong>
                                                </span>
                                                <span>
                                                    Source: <strong>{n.dept} Dept</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
                                        {!isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="btn btn-outline"
                                                style={{ padding: '6px 12px', fontSize: 12, gap: 4, height: 32 }}
                                                title="Mark as Read"
                                            >
                                                <Check size={14} /> Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteNotif(n.id)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                background: 'transparent',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-muted)'
                                            }}
                                            className="flex-center"
                                            title="Delete Dismiss"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CitizenNotifications;
