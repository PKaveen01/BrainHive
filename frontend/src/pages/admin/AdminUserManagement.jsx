import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useActionMessage, ActionBanner, LoadingState, EmptyState, formatDate } from '../../components/admin/adminShared';
import { useCustomPrompt } from '../../hooks/useCustomPrompt'; // Add this import
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRole] = useState('ALL');
    const [msg, showMsg] = useActionMessage();
    const { showPrompt, PromptDialog } = useCustomPrompt(); // Add this

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch {
            showMsg('Could not load users.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (userId) => {
        const days = await showPrompt({
            title: 'Suspend User',
            message: 'Enter suspension period',
            defaultValue: '30',
            placeholder: 'Number of days',
            unit: 'days'
        });
        
        if (days === null) return;
        
        const d = parseInt(days, 10);
        if (isNaN(d) || d < 1) { 
            showMsg('Enter a valid number of days (min 1).', true); 
            return; 
        }
        
        try {
            await api.post(`/admin/users/${userId}/terminate`, { durationDays: d });
            showMsg(`User suspended for ${d} day(s).`);
            fetchUsers();
        } catch { 
            showMsg('Failed to suspend user.', true); 
        }
    };

    const handleActivate = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/reactivate`);
            showMsg('User reactivated successfully.');
            fetchUsers();
        } catch { 
            showMsg('Failed to reactivate user.', true); 
        }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <AdminLayout pageTitle="User Management">
            <ActionBanner msg={msg} />
            <PromptDialog /> {/* Add this */}

            {/* Rest of your component remains the same */}
            <div className="content-header">
                <h2>All Users ({filtered.length})</h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search name or email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', minWidth: '200px' }}
                    />
                    <select
                        value={roleFilter}
                        onChange={e => setRole(e.target.value)}
                        style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="STUDENT">Students</option>
                        <option value="TUTOR">Tutors</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                    <button className="btn-secondary" onClick={fetchUsers}>↻ Refresh</button>
                </div>
            </div>

            {loading && <LoadingState text="Loading users…" />}
            {!loading && filtered.length === 0 && (
                <EmptyState icon="👤" title="No Users Found" body="No users match your current filters." onRefresh={fetchUsers} />
            )}

            {!loading && filtered.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(user => {
                                const isSuspended = ['SUSPENDED', 'TERMINATED', 'REJECTED'].includes(user.accountStatus);
                                return (
                                    <tr key={user.id}>
                                        <td><strong>{user.name}</strong></td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${(user.role || '').toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge ${(user.accountStatus || 'active').toLowerCase()}`}>
                                                {user.accountStatus || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="td-actions">
                                                {isSuspended
                                                    ? <button className="action-btn approve" onClick={() => handleActivate(user.id)}>✓ Activate</button>
                                                    : <button className="action-btn suspend" onClick={() => handleSuspend(user.id)}>⛔ Suspend</button>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUserManagement;