import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, AlertTriangle, Clock,
    Sparkles, Radio, Droplet, MapPin, Copy, Badge,
    CloudRain, ShieldCheck, UserCheck, Zap, ArrowUpRight,
    Briefcase, Star, BadgeCheck, Smile, Siren
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useWebSocket } from '../context/WebSocketContext';

// Hardcoded insights (as they were in the original SPA)
const insightsInit = [
    { type: 'warning', text: 'Water complaints increased 18% in the last 24hrs', icon: <Droplet size={18} /> },
    { type: 'danger', text: 'Road issues concentrated in Ward 18', icon: <MapPin size={18} /> },
    { type: 'info', text: '7 duplicate complaints detected across 3 wards', icon: <Copy size={18} /> },
    { type: 'warning', text: 'Officer S. Kumar is overloaded (12 pending)', icon: <Badge size={18} /> },
    { type: 'danger', text: 'High flood risk predicted in Zone North', icon: <CloudRain size={18} /> },
    { type: 'success', text: '2 fake reports automatically flagged and hidden', icon: <ShieldCheck size={18} /> }
];

const initialLiveFeed = [
    { time: '10:15 AM', text: 'Citizen verified resolution for #392', icon: 'check-circle' },
    { time: '10:11 AM', text: 'Officer accepted assignment for #412', icon: 'user-check' },
    { time: '10:07 AM', text: 'Emergency reported: Power line down on 4th Ave', icon: 'zap' },
    { time: '10:03 AM', text: 'Road complaint escalated to High Priority', icon: 'arrow-up-right' },
    { time: '10:01 AM', text: 'Complaint #412 Assigned to Dept: Roads', icon: 'briefcase' }
];

const Dashboard = () => {
    const { systemInfo, loading } = useAppData();
    const { events } = useWebSocket();
    const [liveFeed, setLiveFeed] = useState(initialLiveFeed);

    useEffect(() => {
        if (events.length > 0) {
            const latest = events[events.length - 1];
            if (latest.event === 'live_feed' || latest.event.includes('complaint')) {
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const text = latest.data.text || `Event: ${latest.event}`;

                setLiveFeed(prev => {
                    const newFeed = [{ time, text }, ...prev];
                    return newFeed.slice(0, 8); // Keep last 8
                });
            }
        }
    }, [events]);

    if (loading || !systemInfo) {
        return <div className="fade-in"><p>Loading dashboard metrics...</p></div>;
    }

    return (
        <div className="fade-in">
            <div className="grid-cols-4" style={{ marginBottom: 32 }}>
                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Complaints</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--info)', background: 'var(--info-bg)', border: 'none' }}>
                            <FileText size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{systemInfo.totalComplaints}</h2>
                    <div className="flex-gap" style={{ fontSize: 12 }}>
                        <span className="badge success" style={{ padding: '2px 6px' }}>Live Data</span>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resolved Today</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--success)', background: 'var(--success-bg)', border: 'none' }}>
                            <CheckCircle size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{systemInfo.resolvedToday}</h2>
                    <div className="flex-gap" style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{systemInfo.slaCompliance}%</span> <span className="text-muted">SLA Compliance</span>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Critical Needs</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none' }}>
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{systemInfo.criticalNeeds}</h2>
                    <div className="flex-gap" style={{ fontSize: 12 }}>
                        <span className="badge danger" style={{ padding: '2px 6px' }}>Action Required</span>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resolution Time</h4>
                        <div className="icon-btn" style={{ width: 32, height: 32, color: 'var(--warning)', background: 'var(--warning-bg)', border: 'none' }}>
                            <Clock size={16} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: 36, marginBottom: 8 }}>{systemInfo.resolutionTimeHours}h</h2>
                    <div className="flex-gap" style={{ fontSize: 12 }}>
                        <span className="badge success" style={{ padding: '2px 6px' }}>-1.1h</span> <span className="text-muted">Down from 5.3h</span>
                    </div>
                </div>
            </div>

            <div className="grid-cols-2">
                <div className="glass-card" style={{ padding: 0 }}>
                    <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles style={{ color: 'var(--brand)' }} /> AI Insights
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Machine learning detections from the last 24 hours.</p>
                        </div>
                        <span className="badge info">Real-time</span>
                    </div>
                    <div style={{ padding: '12px 24px' }}>
                        {insightsInit.map((insight, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                <div className="icon-btn" style={{ width: 36, height: 36, border: 'none', background: `var(--${insight.type}-bg)`, color: `var(--${insight.type})`, flex: 'none' }}>
                                    {insight.icon}
                                </div>
                                <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{insight.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 0 }}>
                    <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Radio style={{ color: 'var(--danger)' }} /> Live Activity
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Real-time feed of civic operations via WebSocket.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)' }}></span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>LIVE</span>
                        </div>
                    </div>
                    <div style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 33, top: 24, bottom: 24, width: 2, background: 'var(--border)' }}></div>
                        {liveFeed.map((feed, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: 24, position: 'relative', zIndex: 2 }}>
                                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-faint)', width: 60, textAlign: 'right', flex: 'none', paddingTop: 4 }}>{feed.time}</div>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)', border: '2px solid var(--bg-card)', flex: 'none', marginTop: 6, marginLeft: -5, boxShadow: '0 0 0 4px var(--bg-page)' }}></div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500 }}>{feed.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid-cols-4" style={{ marginTop: 24 }}>
                <div className="glass-card" style={{ padding: 18 }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Emergencies</h4>
                        <Siren size={16} color="var(--danger)" />
                    </div>
                    <h2 style={{ fontSize: 26 }}>{systemInfo.activeEmergencies}</h2>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>2 dispatched · monitoring</span>
                </div>
                <div className="glass-card" style={{ padding: 18 }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Alerts Today</h4>
                        <Sparkles size={16} color="var(--brand)" />
                    </div>
                    <h2 style={{ fontSize: 26 }}>{systemInfo.aiAlertsToday}</h2>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Duplicate, fraud & risk flags</span>
                </div>
                <div className="glass-card" style={{ padding: 18 }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>SLA Compliance</h4>
                        <BadgeCheck size={16} color="var(--success)" />
                    </div>
                    <h2 style={{ fontSize: 26 }}>{systemInfo.slaCompliance}%</h2>
                    <div style={{ height: 5, background: 'var(--bg-page)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}><div style={{ height: '100%', width: `${systemInfo.slaCompliance}%`, background: 'var(--success)' }}></div></div>
                </div>
                <div className="glass-card" style={{ padding: 18 }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Citizen Satisfaction</h4>
                        <Smile size={16} color="var(--warning)" />
                    </div>
                    <h2 style={{ fontSize: 26 }}>{systemInfo.citizenSatisfaction}<span style={{ fontSize: 14, color: 'var(--text-faint)' }}>/5</span></h2>
                    <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} color={i <= Math.round(systemInfo.citizenSatisfaction) ? 'var(--warning)' : 'var(--border)'} fill={i <= Math.round(systemInfo.citizenSatisfaction) ? 'var(--warning)' : 'none'} />)}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
