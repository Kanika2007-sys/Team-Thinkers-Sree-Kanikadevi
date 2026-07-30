import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { civicApi } from '../services/civicApi';
import { notify } from '../utils/toast';
import {
    Plus, MapPin, BadgeAlert, Sparkles, AlertCircle,
    Info, Image as ImageIcon, CheckCircle, ArrowLeft
} from 'lucide-react';

const CATEGORY_MAP = {
    'Pipe Leak': { dept: 'Water', priority: 'High', description: 'Ruptured utility mains or leakage.' },
    'Pothole': { dept: 'Roads', priority: 'Medium', description: 'Road damage causing vehicle hazard.' },
    'Garbage Dump': { dept: 'Sanitation', priority: 'Low', description: 'Accumulated trash in public space.' },
    'Streetlight': { dept: 'Electricity', priority: 'Medium', description: 'Light pole malfunction or outage.' },
    'Flood Risk': { dept: 'Emergency', priority: 'Critical', description: 'Flooding risk from lake overflow.' },
    'Other Roads': { dept: 'Roads', priority: 'Low', description: 'General road and signage repairs.' },
    'Water Pollution': { dept: 'Water', priority: 'High', description: 'Visible contamination in water supply.' },
    'Power Line Down': { dept: 'Electricity', priority: 'Critical', description: 'Broken electrical wires or fire risks.' }
};

const CreateComplaint = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Pothole');
    const [description, setDescription] = useState('');
    const [coords, setCoords] = useState('');
    const [street, setStreet] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [imageCount, setImageCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // AI suggestion updates automatically on category select
    const aiConfig = CATEGORY_MAP[category];

    const detectLocation = () => {
        setGpsLoading(true);
        setTimeout(() => {
            // Simulated coordinates around city center
            const randomLat = (12.9716 + (Math.random() - 0.5) * 0.05).toFixed(4);
            const randomLng = (77.5946 + (Math.random() - 0.5) * 0.05).toFixed(4);
            setCoords(`${randomLat}, ${randomLng}`);

            // Simulated street address based on user's ward
            const roadNames = ['Kamaraj Salai', 'MG Road', 'Gandhi Avenue', 'Nazarathpet Outer Ring', 'Nehru Ring Street'];
            const randomRoad = roadNames[Math.floor(Math.random() * roadNames.length)];
            setStreet(`${Math.floor(Math.random() * 80) + 1} ${randomRoad}, Ward ${user?.ward || '18'}`);
            setGpsLoading(false);
        }, 1200);
    };

    const handleUploadMockImage = () => {
        if (imageCount < 3) {
            setImageCount(prev => prev + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (!title.trim() || !description.trim()) {
            setError('Please fill in all mandatory fields.');
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                citizen: user.name,
                phone: user.phone || '+91 9999999999',
                dept: aiConfig.dept,
                category: category,
                ward: user.ward || '18',
                priority: aiConfig.priority,
                labels: ['Citizen App', 'Mobile Upload'],
                trust: user.trust || 80,
                coords: coords || '12.9716, 77.5946',
                street: street || `Ward ${user.ward || '18'} Main Road`
            };

            await civicApi.createComplaint(payload);
            setSuccess(true);
            notify('Complaint submitted successfully.', 'success');
            setTimeout(() => {
                navigate('/complaints');
            }, 1500);
        } catch (err) {
            console.error('Failed to submit complaint', err);
            setError('Error submitting complaint. Please try again.');
            notify('Error submitting complaint. Please try again.', 'error');
            setSubmitting(false);
        }
    };

    return (
        <div className="fade-in" style={{ paddingBottom: 40, maxWidth: 900, margin: '0 auto' }}>
            <div className="flex-gap" style={{ marginBottom: 20 }}>
                <button className="btn btn-outline" onClick={() => navigate('/complaints')} style={{ padding: '8px 14px' }}>
                    <ArrowLeft size={16} /> Back to List
                </button>
            </div>

            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontFamily: 'var(--font-disp)' }}>Submit a Complaint</h1>
                <p style={{ color: 'var(--text-muted)' }}>Report a street incident or municipal service disruption to the department.</p>
            </div>

            {success ? (
                <div className="glass-card flex-center fade-in" style={{ minHeight: 300, textAlign: 'center', padding: 40 }}>
                    <div className="flex-center" style={{ margin: '0 auto 20px', width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 style={{ fontSize: 22, marginBottom: 12 }}>Complaint Registered Successfully!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Nexus AI has classified your ticket and forwarded it to the {aiConfig.dept} Department. Redirecting...</p>
                </div>
            ) : (
                <div className="grid-cols-3" style={{ alignItems: 'start' }}>
                    {/* Form Details Area */}
                    <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                        {error && (
                            <div className="badge danger" style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 20, textTransform: 'none' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Complaint Title *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Brief title (e.g. Sewage water overflow)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid-cols-2" style={{ gap: 16 }}>
                                <div className="form-group">
                                    <label>Incident Category</label>
                                    <select
                                        className="form-control"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {Object.keys(CATEGORY_MAP).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{ opacity: 0.7 }}>Assigned Priority (AI Determined)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={`${aiConfig.priority} Priority`}
                                        disabled
                                        style={{ background: 'var(--border-light)', cursor: 'not-allowed', fontWeight: 600 }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Detailed Description *</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Explain the issue, impact on residents, and exact landmarks..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ minHeight: 120 }}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label>GPS Location & Landmark</label>
                                <div className="flex-gap" style={{ marginBottom: 10 }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Click detect location or enter GPS coords"
                                        value={coords}
                                        onChange={(e) => setCoords(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={detectLocation}
                                        disabled={gpsLoading}
                                        style={{ whiteSpace: 'nowrap', gap: 6 }}
                                    >
                                        <MapPin size={16} />
                                        {gpsLoading ? 'Detecting...' : 'Auto Detect GPS'}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Estimated Address / Near landmark"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 32 }}>
                                <label>Attach Evidence Images ({imageCount}/3)</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[0, 1, 2].map((idx) => (
                                        <div
                                            key={idx}
                                            onClick={handleUploadMockImage}
                                            style={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: 'var(--radius-md)',
                                                border: '2px dashed var(--border)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: idx < imageCount ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-page)',
                                                color: idx < imageCount ? 'var(--success)' : 'var(--text-faint)',
                                                borderColor: idx < imageCount ? 'var(--success)' : 'var(--border)',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                        >
                                            {idx < imageCount ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10 }}>
                                                    <CheckCircle size={16} />
                                                    <span style={{ marginTop: 2 }}>Evidence</span>
                                                </div>
                                            ) : (
                                                <ImageIcon size={20} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>
                                    Provide up to three mock photos details for faster AI evaluation.
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 16 }}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    {submitting ? 'Submitting...' : 'Register Complaint'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate('/complaints')}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* AI Preview Assistant Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="glass-card" style={{
                            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)',
                            borderColor: 'rgba(99, 102, 241, 0.2)'
                        }}>
                            <div className="flex-gap" style={{ color: 'var(--brand)', marginBottom: 16 }}>
                                <Sparkles size={20} />
                                <h3 style={{ fontSize: 16, margin: 0 }}>Nexus AI Assistant</h3>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                                Nexus AI will pre-process your report parameters. Swapping categories automatically updates the recommended routing filters:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                    <span className="text-muted">Target Area:</span>
                                    <strong>{aiConfig.dept} Department</strong>
                                </div>
                                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                    <span className="text-muted">Preset Priority:</span>
                                    <span className={`badge ${aiConfig.priority === 'Critical' ? 'danger' : aiConfig.priority === 'High' ? 'warning' : 'info'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                                        {aiConfig.priority}
                                    </span>
                                </div>
                                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                    <span className="text-muted">Trust Factor:</span>
                                    <strong>{user?.trust || 80}% Reliability</strong>
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <span className="text-muted" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>AI Classifier description:</span>
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1.4, fontSize: 12.5 }}>
                                        "{aiConfig.description}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 18, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <Info size={18} style={{ color: 'var(--brand)', flex: 'none', marginTop: 1 }} />
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    Your complaint will initially enter the <strong style={{ color: 'var(--text-main)' }}>Pending</strong> queue, during which you retain authorization to discard or edit the ticket details if necessary.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateComplaint;
