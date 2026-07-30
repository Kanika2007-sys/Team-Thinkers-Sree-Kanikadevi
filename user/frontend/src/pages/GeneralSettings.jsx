import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Shield, Eye, Bell, Globe, Sparkles, Award } from 'lucide-react';

const GeneralSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const [language, setLanguage] = useState('English');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showPushNotifs, setShowPushNotifs] = useState(true);
    const [sendMarketing, setSendMarketing] = useState(false);
    const [shareDiagnostics, setShareDiagnostics] = useState(true);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        alert('General application settings saved for the active session (Theme is persisted automatically).');
    };

    return (
        <div className="fade-in" style={{ paddingBottom: 40, maxWidth: 855, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontFamily: 'var(--font-disp)' }}>General Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure portal appearance, browser alert preferences, and localization options.</p>
            </div>

            <div className="grid-cols-3" style={{ alignItems: 'start' }}>
                <form onSubmit={handleSaveSettings} style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Appearance card */}
                    <div className="glass-card">
                        <div className="flex-gap" style={{ marginBottom: 16 }}>
                            <Eye size={20} style={{ color: 'var(--brand)' }} />
                            <h3 style={{ fontSize: 16, margin: 0 }}>Portal Appearance</h3>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Toggle the look and feel of the Civic One portal.</p>

                        <div className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                            <div>
                                <strong style={{ fontSize: 14 }}>Interface Theme</strong>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Toggle between Dark Mode and default Light Mode.</p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={toggleTheme}
                                style={{ textTransform: 'capitalize', fontWeight: 650, width: 120 }}
                            >
                                {theme} Theme
                            </button>
                        </div>
                    </div>

                    {/* Localization card */}
                    <div className="glass-card">
                        <div className="flex-gap" style={{ marginBottom: 16 }}>
                            <Globe size={20} style={{ color: 'var(--brand)' }} />
                            <h3 style={{ fontSize: 16, margin: 0 }}>Language & Translation</h3>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Select default language for notifications and reports.</p>

                        <div className="form-group">
                            <label>Default Language</label>
                            <select
                                className="form-control"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="English">English</option>
                                <option value="Tamil">Tamil (தமிழ்)</option>
                                <option value="Hindi">Hindi (हिन्दी)</option>
                                <option value="Spanish">Spanish (Español)</option>
                            </select>
                        </div>
                    </div>

                    {/* Notification card */}
                    <div className="glass-card">
                        <div className="flex-gap" style={{ marginBottom: 16 }}>
                            <Bell size={20} style={{ color: 'var(--brand)' }} />
                            <h3 style={{ fontSize: 16, margin: 0 }}>Alert Notifications</h3>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Customize notification frequencies and media alerts.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={soundEnabled}
                                    onChange={(e) => setSoundEnabled(e.target.checked)}
                                    style={{ width: 16, height: 16 }}
                                />
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>Enable Sound Alerts</span>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Play quick chime alerts on incoming critical notifications.</p>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={showPushNotifs}
                                    onChange={(e) => setShowPushNotifs(e.target.checked)}
                                    style={{ width: 16, height: 16 }}
                                />
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>Browser Push Announcements</span>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Display desktop notifications when browser is minimized.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Privacy card */}
                    <div className="glass-card">
                        <div className="flex-gap" style={{ marginBottom: 16 }}>
                            <Shield size={20} style={{ color: 'var(--brand)' }} />
                            <h3 style={{ fontSize: 16, margin: 0 }}>Privacy & Diagnostics</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={shareDiagnostics}
                                    onChange={(e) => setShareDiagnostics(e.target.checked)}
                                    style={{ width: 16, height: 16 }}
                                />
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>Share Diagnostic Logs</span>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Report crash dumps automatically to developers to improve portal quality.</p>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={sendMarketing}
                                    onChange={(e) => setSendMarketing(e.target.checked)}
                                    style={{ width: 16, height: 16 }}
                                />
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>Subscribe to Newsletters</span>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Receive civic ward activities and local festival announcements via email.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'start', padding: '12px 24px' }}>
                        Save General Settings
                    </button>
                </form>

                {/* Right banner card */}
                <div className="glass-card" style={{
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    borderColor: 'rgba(99, 102, 241, 0.2)'
                }}>
                    <div className="flex-gap" style={{ color: 'var(--brand)', marginBottom: 12 }}>
                        <Award size={20} />
                        <h3 style={{ fontSize: 16, margin: 0 }}>Civic One Security</h3>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                        Your connection to the municipal dashboard is encrypted with 256-bit Secure Socket Layers.
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic' }}>
                        Platform Version: 1.4.2-Nexus
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
