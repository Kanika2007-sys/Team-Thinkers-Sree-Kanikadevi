import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { civicApi, isComplaintOwner } from '../services/civicApi';
import { notify } from '../utils/toast';
import {
    ArrowLeft, Calendar, User, Wrench, Shield, CheckCircle,
    Clock, RefreshCw, XCircle, Trash2, Send, MessageSquare,
    AlertTriangle, Sparkles
} from 'lucide-react';

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { events } = useWebSocket();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState([]);
    const [updating, setUpdating] = useState(false);

    const fetchDetails = async () => {
        try {
            const { data } = await civicApi.getComplaint(id);
            if (!isComplaintOwner(data, user)) {
                navigate('/complaints');
                return;
            }
            setComplaint(data);

            // Fetch comments if any stored in local storage relative to this ticket
            const cachedComments = localStorage.getItem(`comments_${id}`);
            if (cachedComments) {
                setLocalComments(JSON.parse(cachedComments));
            }
        } catch (error) {
            console.error('Failed to load complaint details', error);
            navigate('/complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id, events]);

    // Handle delete: allowed only if status is Pending
    const handleDelete = async () => {
        if (complaint.status !== 'Pending') {
            alert('Only complaints in Pending status can be deleted.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this complaint?')) {
            try {
                setUpdating(true);
                await civicApi.deleteComplaint(id);
                notify('Complaint deleted.', 'success');
                navigate('/complaints');
            } catch (err) {
                console.error(err);
                notify('Error deleting complaint.', 'error');
                setUpdating(false);
            }
        }
    };

    // Reopen complaint is allowed if Resolved
    const handleReopen = async () => {
        try {
            setUpdating(true);
            const payload = {
                status: 'Pending',
                notes: {
                    ...complaint.notes,
                    inspection: `Reopened by Citizen ${user.name} on ${new Date().toLocaleDateString()}`
                }
            };
            const { data } = await civicApi.updateComplaint(id, payload);
            setComplaint(data);
            notify('Complaint has been reopened and placed in the Pending review queue.', 'success');
        } catch (err) {
            console.error('Failed to reopen complaint', err);
            notify('Failed to reopen complaint.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            author: user.name,
            text: commentText.trim(),
            time: new Date().toLocaleString()
        };

        const updated = [...localComments, newComment];
        setLocalComments(updated);
        localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
        setCommentText('');
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ padding: 20 }}>
                <p>Loading complaint record #{id}...</p>
                <div className="glass-card loading-skeleton" style={{ height: 350 }}></div>
            </div>
        );
    }

    if (!complaint) return null;

    // Helper for visual progress bar
    const stages = ['Pending', 'Assigned', 'InProgress', 'Resolved'];
    const currentStageIndex = stages.indexOf(complaint.status) >= 0 ? stages.indexOf(complaint.status) : 2; // default to InProgress index if Escalated etc.

    return (
        <div className="fade-in" style={{ paddingBottom: 40 }}>
            {/* Header Toolbar */}
            <div className="flex-between" style={{ marginBottom: 28 }}>
                <button className="btn btn-outline" onClick={() => navigate('/complaints')} style={{ gap: 6 }}>
                    <ArrowLeft size={16} /> Back to Complaints
                </button>

                <div style={{ display: 'flex', gap: 12 }}>
                    {complaint.status === 'Pending' && (
                        <button
                            onClick={handleDelete}
                            disabled={updating}
                            className="btn"
                            style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                        >
                            <Trash2 size={16} /> Cancel & Discard
                        </button>
                    )}
                    {complaint.status === 'Resolved' && (
                        <button
                            onClick={handleReopen}
                            disabled={updating}
                            className="btn btn-outline"
                            style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                        >
                            <RefreshCw size={16} /> Reopen Ticket
                        </button>
                    )}
                </div>
            </div>

            <div className="grid-cols-3" style={{ alignItems: 'start' }}>
                {/* Left side: Complaint info details */}
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Main details card */}
                    <div className="glass-card">
                        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 20 }}>
                            <div>
                                <span className="mono" style={{ fontSize: 13, color: 'var(--text-faint)' }}>TICKET ID:</span>
                                <h2 style={{ fontSize: 24, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {complaint.id}
                                    <span className={`badge ${complaint.status === 'Resolved' ? 'success' :
                                            complaint.status === 'Pending' ? 'warning' :
                                                complaint.status === 'InProgress' ? 'info' :
                                                    complaint.status === 'Escalated' ? 'danger' : 'warning'
                                        }`} style={{ fontSize: 11, padding: '4px 10px' }}>
                                        {complaint.status}
                                    </span>
                                </h2>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority Level</span>
                                <div style={{ fontSize: 16, fontWeight: 750, color: complaint.priority === 'Critical' ? 'var(--danger)' : 'var(--text-main)', marginTop: 4 }}>
                                    {complaint.priority}
                                </div>
                            </div>
                        </div>

                        {/* Visual Progress bar */}
                        <div style={{ padding: '8px 0 24px', borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>Resolution Flow Status</span>
                                <span style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700 }}>
                                    {complaint.status === 'InProgress' ? 'Investigation Live' : `${complaint.status} stage`}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 5, left: 16, right: 16, height: 4, background: 'var(--border-light)', zIndex: 1 }}></div>
                                <div style={{ position: 'absolute', top: 5, left: 16, width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%`, height: 4, background: 'var(--success)', zIndex: 1, transition: 'width 0.3s' }}></div>

                                {stages.map((stage, idx) => {
                                    const isCompleted = idx <= currentStageIndex;
                                    const isActive = idx === currentStageIndex;
                                    return (
                                        <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                                            <div style={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: '50%',
                                                background: isCompleted ? 'var(--success)' : 'var(--bg-card)',
                                                border: `3px solid ${isCompleted ? 'var(--success)' : 'var(--border)'}`,
                                                boxShadow: isActive ? '0 0 10px var(--success)' : 'none',
                                                transition: 'all 0.3s'
                                            }}></div>
                                            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-main)' : 'var(--text-muted)', marginTop: 6 }}>
                                                {stage === 'InProgress' ? 'In Progress' : stage}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Body Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Incident Category</label>
                                <p style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{complaint.category}</p>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Assigned Department</label>
                                <p style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{complaint.dept}</p>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Location & Landmarks</label>
                                <p style={{ fontSize: 15, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={16} style={{ color: 'var(--danger)' }} /> {complaint.street || 'No street details declared'} (Coords: {complaint.coords})
                                </p>
                            </div>

                            <div className="grid-cols-3" style={{ gap: 12 }}>
                                <div className="glass-card" style={{ padding: 14, background: 'var(--bg-page)' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Expected Resolution</span>
                                    <strong style={{ display: 'block', marginTop: 6 }}>{complaint.ai?.eta || '—'}</strong>
                                </div>
                                <div className="glass-card" style={{ padding: 14, background: 'var(--bg-page)' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase' }}>AI Classification</span>
                                    <strong style={{ display: 'block', marginTop: 6 }}>{complaint.ai?.detectedCategory || complaint.category}</strong>
                                </div>
                                <div className="glass-card" style={{ padding: 14, background: 'var(--bg-page)' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Attached Images</span>
                                    <strong style={{ display: 'block', marginTop: 6 }}>{complaint.evidence?.images || 0}</strong>
                                </div>
                            </div>

                            {complaint.notes?.admin && (
                                <div style={{ padding: 14, background: 'var(--info-bg)', borderLeft: '4px solid var(--info)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ fontSize: 13, color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Shield size={14} /> Official Resolution Notes:</h4>
                                    <p style={{ fontSize: 13.5, color: 'var(--text-main)' }}>{complaint.notes.admin}</p>
                                </div>
                            )}

                            {complaint.notes?.officer && (
                                <div style={{ padding: 14, background: 'var(--success-bg)', borderLeft: '4px solid var(--success)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ fontSize: 13, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><User size={14} /> Field Response Remarks:</h4>
                                    <p style={{ fontSize: 13.5, color: 'var(--text-main)' }}>{complaint.notes.officer}</p>
                                </div>
                            )}

                            <div style={{ padding: 14, background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Resolution Notes</h4>
                                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-main)' }}>
                                    {complaint.notes?.inspection || 'No resolution note has been recorded yet.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="glass-card">
                        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Resolution Timeline Log</h3>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 21, top: 12, bottom: 12, width: 2, background: 'var(--border)' }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {(complaint.history || []).map((h, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 2 }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            background: 'var(--bg-page)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-muted)'
                                        }} className="flex-center">
                                            {h.stage.includes('Create') ? <Plus size={18} /> : h.stage.includes('Assign') ? <Wrench size={18} /> : h.stage.includes('Complete') || h.stage.includes('resolve') ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 14, fontWeight: 700 }}>{h.stage}</h4>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {h.time} · Actor: <strong>{h.by}</strong>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Comments Dialog Center */}
                    <div className="glass-card">
                        <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MessageSquare size={18} /> Citizen - Officer Dialogue
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Post feedback or additions concerning this complaint.</p>

                        <form onSubmit={handlePostComment} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Add updates or follow up remark..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', gap: 6 }}>
                                <Send size={16} /> Send
                            </button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {localComments.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 13, padding: '20px 0' }}>No comments recorded on this ticket yet.</p>
                            ) : (
                                localComments.map((comm, idx) => (
                                    <div key={idx} style={{ padding: 12, background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                        <div className="flex-between" style={{ marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--info)' }}>{comm.author}</span>
                                            <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{comm.time}</span>
                                        </div>
                                        <p style={{ fontSize: 13, lineHeight: 1.4 }}>{comm.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Summary / AI classifications details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="glass-card" style={{
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)',
                        borderColor: 'rgba(99, 102, 241, 0.15)'
                    }}>
                        <div className="flex-gap" style={{ color: 'var(--brand)', marginBottom: 16 }}>
                            <Sparkles size={20} />
                            <h3 style={{ fontSize: 16, margin: 0 }}>Nexus AI Diagnostics</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                <span className="text-muted">Detected Category:</span>
                                <strong>{complaint.ai?.detectedCategory || complaint.category}</strong>
                            </div>
                            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                <span className="text-muted">Confidence Score:</span>
                                <strong>{complaint.ai?.confidence || 80}%</strong>
                            </div>
                            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                <span className="text-muted">Resolution ETA:</span>
                                <strong style={{ color: 'var(--brand)' }}>{complaint.ai?.eta || '2 days'}</strong>
                            </div>
                            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                <span className="text-muted">Potential Duplicate:</span>
                                <strong style={{ color: complaint.ai?.duplicate > 70 ? 'var(--danger)' : 'var(--text-main)' }}>
                                    {complaint.ai?.duplicate || 5}%
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h4 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>Municipal Department</h4>
                        <div className="flex-gap" style={{ marginBottom: 16 }}>
                            <div className="flex-center" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', color: 'var(--info)' }}>
                                <Wrench size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: 15, fontWeight: 700 }}>{complaint.dept}</h4>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assigned responding agency</p>
                            </div>
                        </div>

                        {complaint.ai?.suggestedOfficer && complaint.ai?.suggestedOfficer !== 'Unassigned' && (
                            <div>
                                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Field Officer</h4>
                                <div style={{ fontSize: 14, fontWeight: 650 }}>{complaint.ai.suggestedOfficer}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
