import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { civicApi, userOwnedComplaints } from '../services/civicApi';
import {
    Search, Filter, ChevronDown, Plus, Eye,
    Trash2, RefreshCw, Calendar, MapPin, AlertCircle, Info
} from 'lucide-react';

const CitizenComplaints = () => {
    const { user } = useAuth();
    const { events } = useWebSocket();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const pageSize = 6;

    // Extract categories found in user complaints dynamically for the filter
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);

    const fetchComplaints = async () => {
        try {
            const { data } = await civicApi.getComplaints();
            const own = userOwnedComplaints(data, user);

            setComplaints(own);

            const uniqCats = [...new Set(own.map(c => c.category))];
            setCategories(uniqCats);
            const uniqDepts = [...new Set(own.map(c => c.dept))];
            setDepartments(uniqDepts);
        } catch (error) {
            console.error('Failed to load citizen complaints', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [user, events]);

    // Handle delete: citizen can delete ONLY if status is Pending
    const handleDelete = async (id, status) => {
        if (status !== 'Pending') {
            alert('Cannot delete complaint. Only Pending complaints can be deleted.');
            return;
        }

        if (window.confirm(`Are you sure you want to discard your complaint #${id}?`)) {
            try {
                await civicApi.deleteComplaint(id);
                setComplaints(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                console.error('Failed to delete complaint', err);
                alert('Failed to delete complaint. You can only delete complaints with status Pending.');
            }
        }
    };

    // Filter & search logic
    const filteredComplaints = complaints
        .filter(c => {
            const matchesSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
                c.category.toLowerCase().includes(search.toLowerCase()) ||
                c.street.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            const matchesDepartment = departmentFilter === 'All' || c.dept === departmentFilter;
            const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesDepartment && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return b.date.localeCompare(a.date);
            if (sortBy === 'oldest') return a.date.localeCompare(b.date);
            if (sortBy === 'priority') {
                const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
            }
            return 0;
        });

    const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
    const paginatedComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize);

    if (loading) {
        return (
            <div className="fade-in" style={{ padding: 20 }}>
                <div className="flex-between" style={{ marginBottom: 24 }}>
                    <h2>Loading Complaints...</h2>
                </div>
                <div className="glass-card loading-skeleton" style={{ height: 400 }}></div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ paddingBottom: 40 }}>
            {/* Header section with Create trigger */}
            <div className="flex-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontFamily: 'var(--font-disp)' }}>My Complaints</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Inspect, track active status, or submit new service requests.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/complaints/new')} style={{ gap: 6 }}>
                    <Plus size={18} /> File A Complaint
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-faint)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search complaint ID, category, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
                            <select
                                className="form-control"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                style={{ width: 140, padding: '8px 12px' }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Escalated">Escalated</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Department:</span>
                            <select
                                className="form-control"
                                value={departmentFilter}
                                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                                style={{ width: 160, padding: '8px 12px' }}
                            >
                                <option value="All">All Departments</option>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
                            <select
                                className="form-control"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ width: 160, padding: '8px 12px' }}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
                            <select
                                className="form-control"
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                style={{ width: 140, padding: '8px 12px' }}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="priority">Priority</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaints Data Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {filteredComplaints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-faint)' }}>
                        <Info size={48} style={{ marginBottom: 16, color: 'var(--info)' }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: 8, fontSize: 18 }}>No Complaints Found</h3>
                        <p style={{ maxWidth: 480, margin: '0 auto', fontSize: 14 }}>
                            {complaints.length === 0
                                ? "You haven't submitted any complaints yet. Click 'File A Complaint' to register your first ticket."
                                : "No complaints match your active filter criteria. Try resetting search or select filters."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Complaint ID</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Department</th>
                                        <th>Created Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedComplaints.map((c) => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 'var(--font-mono)' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{c.id}</span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{c.category} at {c.street.length > 25 ? `${c.street.substring(0, 25)}...` : c.street}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Ward {c.ward}</div>
                                            </td>
                                            <td>{c.category}</td>
                                            <td>
                                                <span className={`badge ${c.status === 'Resolved' ? 'success' :
                                                        c.status === 'Pending' ? 'warning' :
                                                            c.status === 'InProgress' ? 'info' :
                                                                c.status === 'Escalated' ? 'danger' : 'warning'
                                                    }`} style={{ padding: '3px 8px', fontSize: 10 }}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: 12,
                                                    fontWeight: 650,
                                                    color: c.priority === 'Critical' ? 'var(--danger)' : c.priority === 'High' ? 'var(--warning)' : 'var(--text-muted)'
                                                }}>
                                                    {c.priority}
                                                </span>
                                            </td>
                                            <td>{c.dept}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                                                    <Calendar size={13} /> {c.date}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                                    <button
                                                        onClick={() => navigate(`/complaints/${c.id}`)}
                                                        className="btn btn-outline"
                                                        style={{ padding: '6px 12px', fontSize: 12, gap: 4 }}
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} /> Open
                                                    </button>
                                                    {c.status === 'Pending' ? (
                                                        <button
                                                            onClick={() => handleDelete(c.id, c.status)}
                                                            className="btn"
                                                            style={{ padding: '6px 12px', fontSize: 12, color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none', gap: 4 }}
                                                            title="Delete Complaint"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn"
                                                            disabled
                                                            style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text-faint)', background: 'var(--border-light)', border: 'none', cursor: 'not-allowed' }}
                                                            title="Only Pending tickets can be deleted"
                                                        >
                                                            Locked
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredComplaints.length)} of {filteredComplaints.length}
                            </span>
                            <div className="flex-gap">
                                <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                                <button className="btn btn-outline" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CitizenComplaints;
