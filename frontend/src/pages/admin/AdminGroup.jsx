import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useActionMessage, ActionBanner, LoadingState, EmptyState, formatDate } from '../../components/admin/adminShared';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

/* ── Members modal ────────────────────────────────────────────────────────── */
const MembersModal = ({ group, onClose }) => {
    if (!group) return null;
    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box">
                <h3>👥 {group.name} — Members ({group.members?.length ?? 0})</h3>

                {(!group.members || group.members.length === 0) ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No members in this group.</p>
                ) : (
                    <div className="members-modal-list">
                        {group.members.map((m, i) => (
                            <div key={m.userId ?? i} className="member-row">
                                <div className="member-avatar">
                                    {m.fullName ? m.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="member-name">{m.fullName}</div>
                                    <div className="member-email">{m.email}</div>
                                </div>
                                <span className={`status-badge ${m.role === 'ADMIN' ? 'active' : 'pending'}`}
                                    style={{ fontSize: '0.7rem' }}>
                                    {m.role}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

/* ── Main page ────────────────────────────────────────────────────────────── */
const AdminGroup = () => {
    const [groups, setGroups]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('ALL');
    const [membersGroup, setMembersGroup] = useState(null);
    const [msg, showMsg]              = useActionMessage();

    useEffect(() => { fetchGroups(); }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/groups');
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch { showMsg('Could not load groups.', true); }
        finally   { setLoading(false); }
    };

    const handleDelete = async (group) => {
        if (!window.confirm(`Delete group "${group.name}"? All members will be removed. This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/groups/${group.id}`);
            showMsg(`Group "${group.name}" deleted.`);
            setGroups(p => p.filter(g => g.id !== group.id));
            if (membersGroup?.id === group.id) setMembersGroup(null);
        } catch { showMsg('Failed to delete group.', true); }
    };

    const filtered = groups.filter(g => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            g.name?.toLowerCase().includes(q) ||
            g.subject?.toLowerCase().includes(q) ||
            g.createdByName?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE'   &&  g.isActive) ||
            (statusFilter === 'INACTIVE' && !g.isActive);
        return matchSearch && matchStatus;
    });

    const goalLabel = (goal) => {
        const map = { EXAM: '📝 Exam', ASSIGNMENT: '📋 Assignment', PROJECT: '🚀 Project', GENERAL: '💬 General' };
        return map[goal] || goal;
    };

    return (
        <AdminLayout pageTitle="Group Management">
            <ActionBanner msg={msg} />

            {/* Header */}
            <div className="content-header">
                <h2>All Groups ({filtered.length})</h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search name, subject or creator…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            padding: '7px 12px', borderRadius: '8px',
                            border: '1px solid #e2e8f0', fontSize: '13px', minWidth: '220px'
                        }}
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatus(e.target.value)}
                        style={{
                            padding: '7px 12px', borderRadius: '8px',
                            border: '1px solid #e2e8f0', fontSize: '13px'
                        }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <button className="btn-secondary" onClick={fetchGroups}>↻ Refresh</button>
                </div>
            </div>

            {loading && <LoadingState text="Loading groups…" />}

            {!loading && filtered.length === 0 && (
                <EmptyState
                    icon="👥"
                    title="No Groups Found"
                    body="No study groups match your current filters."
                    onRefresh={fetchGroups}
                />
            )}

            {!loading && filtered.length > 0 && (
                <div className="groups-grid">
                    {filtered.map(group => (
                        <div key={group.id} className="group-card">

                            {/* Card header */}
                            <div className="group-card-header">
                                <h4>{group.name}</h4>
                                <span className={`status-badge ${group.isActive ? 'active' : 'suspended'}`}>
                                    {group.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Description */}
                            {group.description && (
                                <p style={{
                                    fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem',
                                    display: '-webkit-box', WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    {group.description}
                                </p>
                            )}

                            {/* Meta */}
                            <div className="group-meta">
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                    <span className="type-badge">📚 {group.subject}</span>
                                    <span className="type-badge">{goalLabel(group.goal)}</span>
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600 }}>Created by: </span>
                                    {group.createdByName}
                                    {group.createdByEmail && (
                                        <span className="sub-email" style={{ marginLeft: '4px' }}>
                                            ({group.createdByEmail})
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                                    Created: {formatDate(group.createdAt)} &nbsp;·&nbsp; Invite: <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>{group.inviteCode}</code>
                                </div>
                            </div>

                            {/* Member chips preview (up to 4) */}
                            {group.members && group.members.length > 0 && (
                                <div className="group-members-preview">
                                    {group.members.slice(0, 4).map((m, i) => (
                                        <span
                                            key={m.userId ?? i}
                                            className={`member-chip ${m.role === 'ADMIN' ? 'admin-chip' : ''}`}
                                            title={m.email}
                                        >
                                            {m.role === 'ADMIN' ? '👑 ' : ''}{m.fullName}
                                        </span>
                                    ))}
                                    {group.members.length > 4 && (
                                        <span className="member-chip">+{group.members.length - 4} more</span>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="group-card-footer">
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    👥 {group.memberCount ?? 0} / {group.maxMembers ?? '∞'} members
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="action-btn view"
                                        onClick={() => setMembersGroup(group)}
                                    >
                                        👁 Members
                                    </button>
                                    <button
                                        className="action-btn remove"
                                        onClick={() => handleDelete(group)}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Members modal */}
            <MembersModal group={membersGroup} onClose={() => setMembersGroup(null)} />
        </AdminLayout>
    );
};

export default AdminGroup;
