import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Download, Plus, Search, MoreHorizontal, MapPin
} from 'lucide-react';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ dept: 'All', priority: 'All', status: 'All', search: '', sort: 'newest' });

    const fetchComplaints = async () => {
        try {
            const { data } = await axios.get('/api/complaints');
            setComplaints(data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    // Compute derived state
    const depts = Array.from(new Set(complaints.map(c => c.dept)));

    const getFilteredComplaints = () => {
        let list = complaints.filter(c => {
            if (filter.dept !== 'All' && c.dept !== filter.dept) return false;
            if (filter.priority !== 'All' && c.priority !== filter.priority) return false;
            if (filter.status !== 'All' && c.status !== filter.status) return false;
            if (filter.search) {
                const q = filter.search.toLowerCase();
                const hay = `${c.id} ${c.citizen} ${c.category} ${c.ward}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        const priorityRank = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        if (filter.sort === 'newest') list.sort((a, b) => b.date.localeCompare(a.date));
        else if (filter.sort === 'oldest') list.sort((a, b) => a.date.localeCompare(b.date));
        else if (filter.sort === 'priority') list.sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0));
        else if (filter.sort === 'trust') list.sort((a, b) => a.trust - b.trust);

        return list;
    };

    const visibleComplaints = getFilteredComplaints();

    const getStatusBadge = (status) => {
        const map = { 'Pending': 'warning', 'Assigned': 'info', 'Escalated': 'danger', 'Resolved': 'success', 'InProgress': 'info' };
        const color = map[status] || 'info';
        return (
            <span className={`badge ${color}`}>
                <span className="dot"></span>{status}
            </span>
        );
    };

    const getPriorityColor = (pri) => {
        const map = { 'Critical': 'var(--danger)', 'High': 'var(--warning)', 'Medium': 'var(--info)', 'Low': 'var(--text-muted)' };
        return map[pri] || 'var(--text-muted)';
    };

    if (loading) return <div className="fade-in">Loading complaints...</div>;

    return (
        <div className="fade-in">
            <div className="flex-between" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <h2 style={{ fontSize: 22, margin: 0 }}>Complaints Ledger</h2>
                    <span className="badge info" style={{ fontSize: 12 }}>{visibleComplaints.length} of {complaints.length}</span>
                </div>
                <div className="flex-gap">
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }}>
                        <Download size={14} /> Export CSV
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}>
                        <Plus size={14} /> New Complaint
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 24 }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div className="flex-gap" style={{ opacity: 0.5, pointerEvents: 'none', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Bulk Actions:</strong>
                        <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 8px' }}>Assign (0)</button>
                        <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 8px' }}>Resolve (0)</button>
                        <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Escalate (0)</button>
                    </div>

                    <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                        <div className="search-container" style={{ width: 180 }}>
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="Search ID, citizen..."
                                style={{ height: 34, fontSize: 12 }}
                                value={filter.search}
                                onChange={e => setFilter({ ...filter, search: e.target.value })}
                            />
                        </div>
                        <select className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} value={filter.dept} onChange={e => setFilter({ ...filter, dept: e.target.value })}>
                            <option value="All">All Departments</option>
                            {depts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}>
                            <option value="All">All Priorities</option>
                            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                        </select>
                        <select className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                            <option value="All">All Statuses</option>
                            <option>Pending</option><option>Assigned</option><option>InProgress</option><option>Escalated</option><option>Resolved</option>
                        </select>
                        <select className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} value={filter.sort} onChange={e => setFilter({ ...filter, sort: e.target.value })}>
                            <option value="newest">Sort: Newest First</option>
                            <option value="oldest">Sort: Oldest First</option>
                            <option value="priority">Sort: Priority</option>
                            <option value="trust">Sort: Lowest Trust</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}><input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} /></th>
                                <th>ID & Date</th>
                                <th>Citizen / Source</th>
                                <th>Category & Ward</th>
                                <th>Priority</th>
                                <th>Labels</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleComplaints.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 48, color: 'var(--text-faint)' }}>No complaints match these filters.</td></tr>
                            ) : visibleComplaints.map(c => (
                                <tr key={c.id} className="fade-in" style={{ cursor: 'pointer' }}>
                                    <td><input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} /></td>
                                    <td>
                                        <strong style={{ color: 'var(--brand)', display: 'block' }}>{c.id}</strong>
                                        <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{c.date}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, display: 'block' }}>{c.citizen}</span>
                                        <span style={{ fontSize: 11, color: c.trust < 50 ? 'var(--danger)' : 'var(--success)' }}>Trust: {c.trust}/100</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 500, display: 'block' }}>{c.category} - {c.dept}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}><MapPin size={10} /> Ward {c.ward}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: getPriorityColor(c.priority) }}>{c.priority}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                                            {Array.isArray(c.labels) && c.labels.map(l => (
                                                <span key={l} className="badge" style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 9 }}>{l}</span>
                                            ))}
                                            {(!c.labels || c.labels.length === 0) && <span className="text-muted" style={{ fontSize: 11 }}>--</span>}
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(c.status)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="icon-btn" style={{ width: 30, height: 30, display: 'inline-flex' }}>
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Complaints;
