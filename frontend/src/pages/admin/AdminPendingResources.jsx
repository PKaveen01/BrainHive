import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    useActionMessage, ActionBanner, LoadingState, EmptyState,
    ResourceViewerModal, formatDate
} from '../../components/admin/adminShared';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

const AdminPendingResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [selected, setSelected]   = useState(null);
    const [msg, showMsg]            = useActionMessage();

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/resources/pending');
            setResources(Array.isArray(res.data) ? res.data : []);
        } catch { showMsg('Could not load pending resources.', true); }
        finally   { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/resources/${id}/approve`);
            showMsg('Resource approved — now active.');
            setResources(p => p.filter(r => r.id !== id));
            setSelected(null);
        } catch { showMsg('Failed to approve resource.', true); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and remove this resource? This cannot be undone.')) return;
        try {
            await api.post(`/admin/resources/${id}/remove`);
            showMsg('Resource rejected and removed.');
            setResources(p => p.filter(r => r.id !== id));
            setSelected(null);
        } catch { showMsg('Failed to reject resource.', true); }
    };

    return (
        <AdminLayout pageTitle="Pending Resources">
            <ActionBanner msg={msg} />

            <div className="content-header">
                <h2>Awaiting Review ({resources.length})</h2>
                <button className="btn-secondary" onClick={fetchResources}>↻ Refresh</button>
            </div>

            {loading && <LoadingState text="Loading pending resources…" />}

            {!loading && resources.length === 0 && (
                <EmptyState icon="✅" title="No Pending Resources" body="All submitted resources have been reviewed." onRefresh={fetchResources} />
            )}

            {!loading && resources.length > 0 && (
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
                            {resources.map(r => (
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
                                            <button className="action-btn view" onClick={() => setSelected(r)}>👁 View</button>
                                            <button className="action-btn approve" onClick={() => handleApprove(r.id)}>✓ Approve</button>
                                            <button className="action-btn reject"  onClick={() => handleReject(r.id)}>✗ Reject</button>
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
                    selected && <>
                        <button className="btn-approve" style={{ flex: 'unset', padding: '8px 20px' }} onClick={() => handleApprove(selected.id)}>✓ Approve</button>
                        <button className="btn-reject"  style={{ flex: 'unset', padding: '8px 20px' }} onClick={() => handleReject(selected.id)}>✗ Reject</button>
                    </>
                }
            />
        </AdminLayout>
    );
};

export default AdminPendingResources;
