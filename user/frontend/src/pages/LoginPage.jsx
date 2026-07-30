import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, User, ShieldCheck, HelpCircle } from 'lucide-react';
import { notify } from '../utils/toast';

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
    const [citizensList, setCitizensList] = useState([]);
    const [selectedCitizen, setSelectedCitizen] = useState('');
    const [customName, setCustomName] = useState('');
    const [customPhone, setCustomPhone] = useState('');
    const [customWard, setCustomWard] = useState('18');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Fetch existing seeded citizens to make switching super easy/fun
    useEffect(() => {
        const loadCitizens = async () => {
            try {
                const { data } = await axios.get('/api/citizens');
                setCitizensList(data);
                if (data.length > 0) {
                    // Default to Aarti M., but let them pick
                    const active = data.find(c => !c.blocked);
                    if (active) setSelectedCitizen(active.name);
                    else setSelectedCitizen(data[0].name);
                }
            } catch (err) {
                console.error('Failed to load citizens.', err);
            }
        };
        loadCitizens();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (role === 'admin') {
                // Admin Login
                if (pin !== '1234') {
                    throw new Error('Invalid Secure Access PIN (Hint: Use 1234)');
                }
                login('Admin User', 'admin', { email: 'admin@civicone.gov', role: 'admin' });
                navigate('/');
                notify('Signed in as Admin User.', 'success');
            } else {
                // Citizen Login
                let citizenName = '';
                let citizenPhone = '';
                let citizenWard = customWard || '18';
                let citizenDetails = {};

                if (selectedCitizen && selectedCitizen !== '__custom__') {
                    // Seeded Citizen
                    const citizenObj = citizensList.find(c => c.name === selectedCitizen);
                    if (!citizenObj) throw new Error('Citizen not found');
                    if (citizenObj.blocked) {
                        throw new Error(`Access Denied: Account for ${citizenObj.name} has been suspended by the administrator.`);
                    }
                    citizenName = citizenObj.name;
                    citizenPhone = citizenObj.phone;
                    citizenDetails = {
                        phone: citizenObj.phone,
                        verified: citizenObj.verified,
                        blocked: citizenObj.blocked,
                        complaints: citizenObj.complaints,
                        rating: citizenObj.rating,
                        trust: citizenObj.trust,
                        ward: '18' // default ward
                    };
                } else {
                    // New Custom Citizen
                    if (!customName.trim()) {
                        throw new Error('Please enter your name');
                    }
                    citizenName = customName.trim();
                    citizenPhone = customPhone || '+91 9999999999';
                    citizenDetails = {
                        phone: citizenPhone,
                        verified: true,
                        blocked: false,
                        complaints: 0,
                        rating: 5.0,
                        trust: 80,
                        ward: citizenWard
                    };
                }

                login(citizenName, 'citizen', citizenDetails);
                navigate('/');
                notify(`Welcome back, ${citizenName}.`, 'success');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check credentials.');
            notify(err.message || 'Login failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at bottom, #090e17 0%, #030408 100%)',
            padding: 20
        }}>
            <div className="glass-card fade-in" style={{
                maxWidth: 450,
                width: '100%',
                background: 'rgba(9, 14, 23, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div className="flex-center" style={{
                        margin: '0 auto 16px',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: role === 'admin' ? 'var(--brand)' : 'var(--success-bg)',
                        color: role === 'admin' ? '#fff' : 'var(--success)',
                        boxShadow: role === 'admin' ? '0 0 20px rgba(37, 99, 235, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.2)'
                    }}>
                        {role === 'admin' ? <ShieldCheck size={36} /> : <User size={36} />}
                    </div>
                    <h1 style={{ fontSize: 28, color: '#fff', fontWeight: 800, fontFamily: 'var(--font-disp)' }}>Civic One</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Municipal Authority & Citizen Hub</p>
                </div>

                <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: 4,
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 24,
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <button
                        onClick={() => { setRole('citizen'); setError(''); }}
                        className="btn"
                        style={{
                            flex: 1,
                            background: role === 'citizen' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            color: role === 'citizen' ? '#fff' : 'var(--text-muted)',
                            borderRadius: 'var(--radius-md) - 2px',
                            fontWeight: 650,
                            padding: '8px 16px',
                            border: 'none'
                        }}
                    >
                        Citizen Login
                    </button>
                    <button
                        onClick={() => { setRole('admin'); setError(''); }}
                        className="btn"
                        style={{
                            flex: 1,
                            background: role === 'admin' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            color: role === 'admin' ? '#fff' : 'var(--text-muted)',
                            borderRadius: 'var(--radius-md) - 2px',
                            fontWeight: 650,
                            padding: '8px 16px',
                            border: 'none'
                        }}
                    >
                        Officer/Admin
                    </button>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#fda4af',
                        fontSize: 13,
                        marginBottom: 20
                    }}>
                        <ShieldAlert size={18} style={{ flex: 'none', marginTop: 2 }} />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    {role === 'admin' ? (
                        <div className="fade-in">
                            <div className="form-group">
                                <label style={{ color: 'var(--text-faint)' }}>Admin Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value="Admin User"
                                    disabled
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--text-faint)' }}>Secure Access PIN</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter PIN code (e.g. 1234)"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    required
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                                <HelpCircle size={14} />
                                <span>Default administrator PIN is <strong>1234</strong></span>
                            </div>
                        </div>
                    ) : (
                        <div className="fade-in">
                            <div className="form-group">
                                <label style={{ color: 'var(--text-faint)' }}>Select Registered Citizen</label>
                                <select
                                    className="form-control"
                                    value={selectedCitizen}
                                    onChange={(e) => setSelectedCitizen(e.target.value)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#fff'
                                    }}
                                >
                                    {citizensList.map((c) => (
                                        <option key={c.name} value={c.name} style={{ background: '#0f172a' }}>
                                            {c.name} {c.phone ? `(${c.phone})` : ''} {c.blocked ? '[SUSPENDED]' : ''}
                                        </option>
                                    ))}
                                    <option value="__custom__" style={{ background: '#0f172a' }}>+ Access with New Profile</option>
                                </select>
                            </div>

                            {selectedCitizen === '__custom__' && (
                                <div className="fade-in" style={{ padding: '16px 0 0', marginTop: 16, borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                                    <div className="form-group">
                                        <label style={{ color: 'var(--text-faint)' }}>Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your name"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }}
                                            required={selectedCitizen === '__custom__'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: 'var(--text-faint)' }}>Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={customPhone}
                                            onChange={(e) => setCustomPhone(e.target.value)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: 'var(--text-faint)' }}>Select Ward</label>
                                        <select
                                            className="form-control"
                                            value={customWard}
                                            onChange={(e) => setCustomWard(e.target.value)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }}
                                        >
                                            {['02', '04', '12', '18', '24'].map(w => (
                                                <option key={w} value={w} style={{ background: '#0f172a' }}>Ward {w}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: 16,
                            padding: '12px',
                            background: role === 'admin' ? 'var(--brand)' : 'var(--success)',
                            boxShadow: role === 'admin' ? '0 4px 14px var(--brand-glow)' : '0 4px 14px rgba(16, 185, 129, 0.3)',
                            fontFamily: 'var(--font-disp)',
                            fontWeight: 700
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
