import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { civicApi, userOwnedComplaints } from '../services/civicApi';
import {
    FileText, Clock, CheckCircle, ShieldAlert,
    AlertTriangle, BellRing, Sparkles, Navigation,
    User, Send, RefreshCw, Star, Info
} from 'lucide-react';

const CitizenDashboard = () => {
    const { user } = useAuth();
    const { events } = useWebSocket();
    const [complaints, setComplaints] = useState([]);
    const [liveFeed, setLiveFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        resolved: 0,
        inProgress: 0,
        categories: {}
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await civicApi.getComplaints();
                const ownComplaints = userOwnedComplaints(data, user);
                setComplaints(ownComplaints);

                // Calculate personal statistics
                const total = ownComplaints.length;
                const resolved = ownComplaints.filter(c => c.status === 'Resolved').length;
                const inProgress = ownComplaints.filter(c => c.status === 'InProgress' || c.status === 'Assigned').length;
                const open = ownComplaints.filter(c => c.status === 'Pending').length;

                // Category distribution
                const categories = ownComplaints.reduce((acc, current) => {
                    acc[current.category] = (acc[current.category] || 0) + 1;
                    return acc;
                }, {});

                setStats({ total, open, resolved, inProgress, categories });

                // Construct initial feed from history
                const feedItems = ownComplaints.flatMap(c =>
                    (c.history || []).map(hist => ({
                        time: hist.time?.substring(11, 16) || 'N/A',
                        date: hist.time?.substring(0, 10) || '',
                        text: `Complaint #${c.id} - ${hist.stage} (${hist.by})`,
                        id: c.id
                    }))
                );
                feedItems.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
                setLiveFeed(feedItems.slice(0, 5));

            } catch (error) {
                console.error('Failed to load citizen dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.name) {
            fetchUserData();
        }
    }, [user, events]);

    // Handle incoming realtime socket notifications for own complaints
    useEffect(() => {
        if (events.length > 0) {
            const latest = events[events.length - 1];
            if (latest.event === 'complaint_updated' && latest.data) {
                // If it is our complaint
                const affectedComplaint = complaints.find(c => c.id === latest.data.id);
                if (affectedComplaint) {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setLiveFeed(prev => [
                        { time, text: `Complaint #${latest.data.id} status updated to ${latest.data.status} by Officer`, id: latest.data.id },
                        ...prev.slice(0, 4)
                    ]);
                }
            }
        }
    }, [events, complaints]);

    if (loading) {
        return (
            <div className="fade-in" style={{ padding: 20 }}>
                <h2>Welcome back, {user?.name}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Gathering your citizen profile and complaints feedback...</p>
                <div className="grid-cols-4" style={{ marginBottom: 32 }}>
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="glass-card loading-skeleton" style={{ height: 120 }}></div>
                    ))}
                </div>
                <div className="grid-cols-2">
                    <div className="glass-card loading-skeleton" style={{ height: 300 }}></div>
                    <div className="glass-card loading-skeleton" style={{ height: 300 }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ paddingBottom: 40 }}>
            {/* Upper Welcome Header */}
            <div className="glass-card" style={{
                marginBottom: 32,
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37, 99, 235, 0.05) 100%)',
                borderColor: 'var(--border)'
            }}>
                <div className="flex-between">
                    <div>
                        <span className="badge success" style={{ marginBottom: 12 }}>
                            <div className="dot"></div> Verified Citizen Profile
                        </span>
                        <h1 style={{ fontSize: 32, marginBottom: 8, fontFamily: 'var(--font-disp)' }}>
                            Welcome, {user?.name}!
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 650 }}>
                            Track your active service requests, submit new civic complaints, and review emergency bulletins issued by the municipal administration.
                        </p>
                    </div>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%)',
                        color: '#fff',
                        fontSize: 24,
                        fontWeight: 800
                    }} className="flex-center">
                        {user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid-cols-4" style={{ marginBottom: 32 }}>
                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Complaints</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--info)', background: 'var(--info-bg)', border: 'none' }}>
                            <FileText size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{stats.total}</h2>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Lifetime submissions</span>
                </div>

                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending Review</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--warning)', background: 'var(--warning-bg)', border: 'none' }}>
                            <Clock size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{stats.open}</h2>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Awaiting classification</span>
                </div>

                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>In Progress</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--brand)', background: 'var(--brand-glow)', border: 'none' }}>
                            <RefreshCw size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{stats.inProgress}</h2>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Assigned to crew</span>
                </div>

                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resolved Tickets</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--success)', background: 'var(--success-bg)', border: 'none' }}>
                            <CheckCircle size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{stats.resolved}</h2>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Verified solutions</span>
                </div>
            </div>

            {/* Split Info Grid */}
            <div className="grid-cols-2" style={{ marginBottom: 32 }}>
                {/* Left: Charts column */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                        <h3 style={{ fontSize: 18, marginBottom: 4 }}>My Service Analytics</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Status breakdown and categories distribution.</p>
                    </div>

                    {stats.total === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--text-faint)' }}>
                            <Info size={40} style={{ marginBottom: 12 }} />
                            <p>No complaints submitted to calculate metrics.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* SVG status bar */}
                            <div>
                                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>My Complaint Status (Ratio)</h4>
                                <div style={{ height: 24, background: 'var(--border-light)', borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
                                    {stats.open > 0 && (
                                        <div style={{
                                            width: `${(stats.open / stats.total) * 100}%`,
                                            background: 'var(--warning)',
                                            color: '#fff',
                                            fontSize: 10,
                                            fontWeight: 700
                                        }} className="flex-center" title="Pending">
                                            {Math.round((stats.open / stats.total) * 100)}%
                                        </div>
                                    )}
                                    {stats.inProgress > 0 && (
                                        <div style={{
                                            width: `${(stats.inProgress / stats.total) * 100}%`,
                                            background: 'var(--brand)',
                                            color: '#fff',
                                            fontSize: 10,
                                            fontWeight: 700
                                        }} className="flex-center" title="In Progress">
                                            {Math.round((stats.inProgress / stats.total) * 100)}%
                                        </div>
                                    )}
                                    {stats.resolved > 0 && (
                                        <div style={{
                                            width: `${(stats.resolved / stats.total) * 100}%`,
                                            background: 'var(--success)',
                                            color: '#fff',
                                            fontSize: 10,
                                            fontWeight: 700
                                        }} className="flex-center" title="Resolved">
                                            {Math.round((stats.resolved / stats.total) * 100)}%
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
                                    <div className="flex-gap" style={{ gap: 6 }}>
                                        <span style={{ width: 8, height: 8, background: 'var(--warning)', borderRadius: '50%' }}></span>
                                        <span>Pending ({stats.open})</span>
                                    </div>
                                    <div className="flex-gap" style={{ gap: 6 }}>
                                        <span style={{ width: 8, height: 8, background: 'var(--brand)', borderRadius: '50%' }}></span>
                                        <span>In Progress / Assigned ({stats.inProgress})</span>
                                    </div>
                                    <div className="flex-gap" style={{ gap: 6 }}>
                                        <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }}></span>
                                        <span>Resolved ({stats.resolved})</span>
                                    </div>
                                </div>
                            </div>

                            {/* CSS Category Pie Chart representation */}
                            <div>
                                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Categories Distribution</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {Object.entries(stats.categories).map(([cat, count], i) => (
                                        <div key={cat} style={{ fontSize: 13 }}>
                                            <div className="flex-between" style={{ marginBottom: 4 }}>
                                                <strong>{cat}</strong>
                                                <span className="text-muted">{count} complaint{count > 1 ? 's' : ''} ({Math.round((count / stats.total) * 100)}%)</span>
                                            </div>
                                            <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${(count / stats.total) * 100}%`,
                                                    background: `hsl(${(i * 70) % 360}, 70%, 55%)`
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Personal Activity Timeline */}
                <div className="glass-card" style={{ padding: 0 }}>
                    <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: 18 }}>My Complaints Timeline</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Recent status logs and updates from investigators.</p>
                    </div>
                    <div style={{ padding: 24, position: 'relative' }}>
                        {liveFeed.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
                                <Clock size={32} style={{ marginBottom: 12 }} />
                                <p>No recent timeline logs to display.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'absolute', left: 33, top: 24, bottom: 24, width: 2, background: 'var(--border)' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {liveFeed.map((feed, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 2 }}>
                                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 650, color: 'var(--text-faint)', width: 60, textAlign: 'right', flex: 'none', paddingTop: 2 }}>
                                                {feed.time}
                                            </div>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-card)', flex: 'none', marginTop: 4, marginLeft: -5, boxShadow: '0 0 0 3px var(--bg-page)' }}></div>
                                            <div>
                                                <p style={{ fontSize: 13.5, fontWeight: 550 }}>{feed.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Profile Overview widgets */}
            <div className="grid-cols-3">
                <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-glow)', color: 'var(--brand)' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14, color: 'var(--text-muted)' }}>Ward Constituency</h4>
                        <p style={{ fontSize: 18, fontWeight: 700 }}>Ward {user?.ward || '18'}</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14, color: 'var(--text-muted)' }}>Citizen Trust Score</h4>
                        <p style={{ fontSize: 18, fontWeight: 700 }}>{user?.trust || 80}/100</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <BadgeCheck size={24} className="badge-check" style={{ display: 'none' }} />
                        <Star size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14, color: 'var(--text-muted)' }}>Community Rating</h4>
                        <p style={{ fontSize: 18, fontWeight: 700 }}>{user?.rating || 4.5}/5.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Help helper
const BadgeCheck = ({ size, style, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 11 2 2 4-4" />
    </svg>
);

export default CitizenDashboard;
