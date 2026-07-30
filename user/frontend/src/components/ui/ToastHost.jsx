import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { toastChannel } from '../../utils/toast';

const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const ToastHost = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToast = (event) => {
            const detail = event.detail || {};
            setToasts((current) => [...current, detail]);

            window.setTimeout(() => {
                setToasts((current) => current.filter((toast) => toast.id !== detail.id));
            }, detail.timeout || 3500);
        };

        window.addEventListener(toastChannel, handleToast);
        return () => window.removeEventListener(toastChannel, handleToast);
    }, []);

    const renderedToasts = useMemo(() => toasts.slice(-4), [toasts]);

    return (
        <div style={{ position: 'fixed', right: 20, top: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderedToasts.map((toast) => {
                const Icon = iconMap[toast.type] || Info;
                return (
                    <div
                        key={toast.id}
                        className="glass-card"
                        style={{
                            minWidth: 280,
                            maxWidth: 360,
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            boxShadow: 'var(--shadow-lg)',
                            borderLeft: `4px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? 'var(--success)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--info)'}`,
                        }}
                    >
                        <div className="flex-center" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-page)', color: 'var(--text-main)', flex: 'none' }}>
                            <Icon size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <strong style={{ display: 'block', fontSize: 13, marginBottom: 4, textTransform: 'capitalize' }}>{toast.type}</strong>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>{toast.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                            style={{ background: 'transparent', color: 'var(--text-faint)', padding: 2 }}
                            aria-label="Dismiss notification"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default ToastHost;