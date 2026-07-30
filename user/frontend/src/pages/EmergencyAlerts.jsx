import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { civicApi } from '../services/civicApi';
import { Siren, MapPin, Compass, ShieldAlert, HeartHandshake, Eye, AlertTriangle, ShieldCheck } from 'lucide-react';

const EmergencyAlerts = () => {
    const { user } = useAuth();
    const { events } = useWebSocket();
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadEmergencies = async () => {
        try {
            const { data } = await civicApi.getEmergencies();
            setEmergencies(data);
        } catch (error) {
            console.error('Failed to load emergencies', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmergencies();
    }, [events]);

    const getSafetyInstructions = (type) => {
        const ins = {
            'Fire': {
                steps: [
                    'Evacuate the structures immediately. Avoid elevators.',
                    'Keep low to avoid smoke inhalation. Cover face with wet cloth.',
                    'Assemble at the designated outdoor muster point.',
                    'Clear access ways for water tankers and fire tenders.'
                ],
                route: 'Proceed east away from Industrial Zone B towards Mahatma Park Assembly Ground.'
            },
            'Flood': {
                steps: [
                    'Move immediately to higher ground or upper building levels.',
                    'Do not walk, swim, or drive through moving flood waters.',
                    'Turn off power mains and utilities if safe to do so.',
                    'Store fresh drinking water and emergency lighting.'
                ],
                route: 'Lakeside residents move upward to City Ridge Road or the Science Center Shelter.'
            },
            'Gas Leak': {
                steps: [
                    'Leave the area immediately. Do not activate light switches or cellphones.',
                    'Keep windows and doors open only if evacuating is delayed.',
                    'Move upwind of the designated sector area.',
                    'Report symptoms of nausea or breathing difficulties to paramedic crew.'
                ],
                route: 'Sector 9 residential block evacuates south towards Sector 15 Sports Complex.'
            },
            'Accident': {
                steps: [
                    'Avoid the affected traffic corridors to let response teams access the lane.',
                    'Cooperate with traffic bypass directions.',
                    'Stay clear of hazardous cargo or power lines near the site.'
                ],
                route: 'Highway commuters divert via Sector 3 Service Road.'
            }
        };
        return ins[type] || {
            steps: [
                'Stay indoors and monitor local news/alerts.',
                'Follow instructions from municipal emergency services.',
                'Keep phone lines open only for critical calls.'
            ],
            route: 'Follow directions of local law enforcement officers on-site.'
        };
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ padding: 25 }}>
                <h2>Updating emergency feed...</h2>
                <div className="glass-card loading-skeleton" style={{ height: 350 }}></div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ paddingBottom: 40 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontFamily: 'var(--font-disp)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Siren color="var(--danger)" size={28} /> Emergency Bulletin Center
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Realtime incident reports and evacuation routes from civic response teams.</p>
            </div>

            {emergencies.length === 0 ? (
                <div className="glass-card flex-center" style={{ minHeight: 320, padding: 40, textAlign: 'center' }}>
                    <div className="flex-center" style={{ margin: '0 auto 20px', width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: 20, marginBottom: 8 }}>All Clear</h2>
                    <p style={{ color: 'var(--text-muted)' }}>No active emergency incidents are currently reported in the city area.</p>
                </div>
            ) : (
                <div className="grid-cols-3" style={{ alignItems: 'start' }}>
                    {/* Active Emergencies Listing */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {emergencies.map((e) => {
                            const instruct = getSafetyInstructions(e.type);
                            const isActiveState = e.status !== 'Resolved' && e.status !== 'Closed';

                            return (
                                <div
                                    key={e.id}
                                    className="glass-card"
                                    style={{
                                        border: `1px solid ${isActiveState ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}`,
                                        background: isActiveState ? 'linear-gradient(135deg, var(--bg-card) 0%, rgba(239, 68, 68, 0.01) 100%)' : 'var(--bg-card)',
                                        padding: 24
                                    }}
                                >
                                    <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 16 }}>
                                        <div>
                                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>INCIDENT ID: {e.id}</span>
                                            <h3 style={{ fontSize: 20, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {e.type} Incident
                                                <span className={`badge ${isActiveState ? 'danger' : 'success'}`} style={{ fontSize: 9, padding: '2px 8px' }}>
                                                    {e.status}
                                                </span>
                                            </h3>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <h4 style={{ color: 'var(--danger)', fontSize: 18 }}>Severity: {e.severity}%</h4>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ETA: {e.eta}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
                                        <MapPin size={16} style={{ color: 'var(--danger)' }} /> {e.location}
                                    </div>

                                    {/* Evacuation Routes */}
                                    {isActiveState && (
                                        <div style={{
                                            padding: 16,
                                            background: 'var(--warning-bg)',
                                            borderLeft: '4px solid var(--warning)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: 20
                                        }}>
                                            <h4 style={{ fontSize: 13.5, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700 }}>
                                                <Compass size={16} /> Recommended Evacuation Route:
                                            </h4>
                                            <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.4, fontWeight: 550 }}>
                                                {instruct.route}
                                            </p>
                                        </div>
                                    )}

                                    {/* Instructions list */}
                                    <div>
                                        <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Critical Safety Directions</h4>
                                        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {instruct.steps.map((st, i) => (
                                                <li key={i}>{st}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sidebar quick response guidelines */}
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="flex-gap" style={{ color: 'var(--danger)' }}>
                            <HeartHandshake size={22} className="heart-shake" />
                            <h3 style={{ fontSize: 16 }}>Civilian Responder Protocol</h3>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            During critical level contingencies, municipal authority commands demand compliance with basic civilian protection directives:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12.5 }}>
                            <div style={{ padding: '0 0 10px', borderBottom: '1px solid var(--border-light)' }}>
                                <strong>1. Stay Calmed</strong>
                                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>Irrational movements hamper search teams.</p>
                            </div>
                            <div style={{ padding: '0 0 10px', borderBottom: '1px solid var(--border-light)' }}>
                                <strong>2. Pack Light Essentials</strong>
                                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>Keep IDs, medicines and torches packed.</p>
                            </div>
                            <div>
                                <strong>3. Check on Neighbors</strong>
                                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>Assist senior residents and vulnerable children.</p>
                            </div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', background: 'var(--bg-page)' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                Map data is shown when it is available from the active emergency feed.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyAlerts;
