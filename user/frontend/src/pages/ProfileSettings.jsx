import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, ShieldAlert, Sparkles, CheckCircle, Camera } from 'lucide-react';
import { notify } from '../utils/toast';

const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || user?.details?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [ward, setWard] = useState(user?.ward || user?.details?.ward || '18');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatarSimulator, setAvatarSimulator] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [successBanner, setSuccessBanner] = useState('');

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setUpdating(true);
        // Simulate database save
        setTimeout(() => {
            const updatedDetails = {
                ...user,
                name,
                email,
                phone: phone,
                address,
                ward: ward
            };
            updateUser(updatedDetails);
            setSuccessBanner('Profile parameters updated successfully in active session.');
            notify('Profile updated successfully.', 'success');
            setUpdating(false);
            setTimeout(() => setSuccessBanner(''), 3000);
        }, 800);
    };

    const handleSimulateAvatar = () => {
        setAvatarSimulator(true);
        setTimeout(() => {
            setAvatarSimulator(false);
            setSuccessBanner('Mock profile avatar uploaded successfully.');
            notify('Avatar updated successfully.', 'success');
            setTimeout(() => setSuccessBanner(''), 3000);
        }, 1200);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (!newPassword) return;
        setSuccessBanner('Credential PIN successfully changed.');
        notify('Password changed successfully.', 'success');
        setOldPassword('');
        setNewPassword('');
        setTimeout(() => setSuccessBanner(''), 3000);
    };

    return (
        <div className="fade-in" style={{ paddingBottom: 40, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontFamily: 'var(--font-disp)' }}>Profile Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage citizen credentials and constituency registers.</p>
            </div>

            {successBanner && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    background: 'var(--success-bg)',
                    color: 'var(--success)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 20,
                    fontSize: 14
                }}>
                    <CheckCircle size={16} />
                    <span>{successBanner}</span>
                </div>
            )}

            <div className="grid-cols-3" style={{ alignItems: 'start' }}>
                {/* Details form */}
                <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: 18, marginBottom: 20 }}>Account Information</h3>
                    <form onSubmit={handleSaveProfile}>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid-cols-2" style={{ gap: 16 }}>
                            <div className="form-group">
                                <label>Phone Details</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Registered Ward</label>
                                <select
                                    className="form-control"
                                    value={ward}
                                    onChange={(e) => setWard(e.target.value)}
                                >
                                    {['02', '04', '12', '18', '24'].map(w => (
                                        <option key={w} value={w}>Ward {w}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="btn btn-primary"
                            style={{ marginTop: 8 }}
                        >
                            {updating ? 'Saving...' : 'Update Details'}
                        </button>
                    </form>

                    <h3 style={{ fontSize: 18, marginTop: 36, marginBottom: 20 }}>Privacy Passkey</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label>Current Credentials PIN</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>New Passkey / PIN</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter secure PIN code"
                            />
                        </div>

                        <button type="submit" className="btn btn-outline" style={{ marginTop: 8 }}>
                            Save Pin Code
                        </button>
                    </form>
                </div>

                {/* Avatar upload + Trust score card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 24 }}>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <div style={{
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                background: 'var(--brand-glow)',
                                border: '3px solid var(--border)',
                                color: 'var(--brand)',
                                fontSize: 32,
                                fontWeight: 800
                            }} className="flex-center">
                                {user?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <button
                                onClick={handleSimulateAvatar}
                                disabled={avatarSimulator}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'var(--brand)',
                                    color: '#fff',
                                    border: 'none'
                                }}
                                className="flex-center"
                                title="Change avatar"
                            >
                                <Camera size={14} />
                            </button>
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700 }}>{user?.name}</h4>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Registered Ward Resident</span>

                        {avatarSimulator && (
                            <div style={{ fontStyle: 'italic', fontSize: 11, color: 'var(--brand)', marginTop: 10 }}>Uploading mock media...</div>
                        )}
                    </div>

                    <div className="glass-card" style={{
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%)',
                        borderColor: 'rgba(16, 185, 129, 0.2)'
                    }}>
                        <div className="flex-gap" style={{ color: 'var(--success)', marginBottom: 10 }}>
                            <Sparkles size={18} />
                            <h3 style={{ fontSize: 15, margin: 0 }}>Citizen Reliability</h3>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                            Your reliability coefficient is computed by Nexus AI from verification parameters and ticket validity statistics:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                            <div className="flex-between">
                                <span className="text-muted">Trust Factor:</span>
                                <strong>{user?.trust || 80}/100</strong>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Verification Status:</span>
                                <span className="badge success" style={{ fontSize: 9, padding: '2px 6px' }}>Verified</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Member Since:</span>
                                <span>{user?.memberSince || 'April 2026'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
