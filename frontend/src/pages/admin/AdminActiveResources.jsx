import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    useActionMessage, ActionBanner, LoadingState, EmptyState,
    ResourceViewerModal, formatDate
} from '../../components/admin/adminShared';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

const AdminActiveResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState('');
    const [msg, showMsg]            = useActionMessage();

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/resources/approved');
            setResources(Array.isArray(res.data) ? res.data : []);
        } catch { showMsg('Could not load active resources.', true); }
        finally   { setLoading(false); }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this resource? It will no longer be visible to users.')) return;
        try {
            await api.post(`/admin/resources/${id}/remove`);
            showMsg('Resource removed successfully.');
            setResources(p => p.filter(r => r.id !== id));
            setSelected(null);
        } catch { showMsg('Failed to remove resource.', true); }
    };

    const filtered = resources.filter(r => {
        const q = search.toLowerCase();
        return !q || r.title?.toLowerCase().includes(q) || r.subject?.toLowerCase().includes(q) || r.uploadedBy?.toLowerCase().includes(q);
    });

    return (
        <AdminLayout pageTitle="Active Resources">
            <ActionBanner msg={msg} />

            <div className="content-header">
                <h2>Live Resources ({filtered.length})</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search title, subject or uploader…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', minWidth: '220px' }}
                    />
                    <button className="btn-secondary" onClick={fetchResources}>↻ Refresh</button>
                </div>
            </div>

            {loading && <LoadingState text="Loading active resources…" />}

            {!loading && filtered.length === 0 && (
                <EmptyState icon="📭" title="No Active Resources" body="No approved resources found." onRefresh={fetchResources} />
            )}

            {!loading && filtered.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Uploaded By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id}>
                                    <td><strong>{r.title}</strong></td>
                                    <td><span className="type-badge">{r.type}</span></td>
                                    <td>{r.subject}</td>
                                    <td>
                                        <div>{r.uploadedBy}</div>
                                        {r.uploadedByEmail && <div className="sub-email">{r.uploadedByEmail}</div>}
                                    </td>
                                    <td>{formatDate(r.uploadedAt)}</td>
                                    <td>
                                        <div className="td-actions">
                                            <button className="action-btn view"   onClick={() => setSelected(r)}>👁 View</button>
                                            <button className="action-btn remove" onClick={() => handleRemove(r.id)}>🗑 Remove</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail modal */}
            <ResourceViewerModal
                resource={selected}
                onClose={() => setSelected(null)}
                footer={
                    selected && (
                        <button className="btn-danger" onClick={() => handleRemove(selected.id)}>🗑 Remove Resource</button>
                    )
                }
            />
        </AdminLayout>
    );
};

export default AdminActiveResources;
