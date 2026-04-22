import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    useActionMessage, ActionBanner, LoadingState, EmptyState,
    ResourceViewerModal, formatDate
} from '../../components/admin/adminShared';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

const AdminReportResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [selected, setSelected]   = useState(null);
    const [msg, showMsg]            = useActionMessage();

    useEffect(() => { fetchReported(); }, []);

    const fetchReported = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/resources/reported');
            setResources(Array.isArray(res.data) ? res.data : []);
        } catch { showMsg('Could not load reported resources.', true); }
        finally   { setLoading(false); }
    };

    const handleResolve = async (id) => {
        try {
            await api.post(`/admin/resources/${id}/resolve-reports`);
            showMsg('Reports resolved — resource stays active.');
            setResources(p => p.filter(r => r.id !== id));
            setSelected(null);
        } catch { showMsg('Failed to resolve reports.', true); }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this resource and close all reports?')) return;
        try {
            await api.post(`/admin/resources/${id}/remove`);
            showMsg('Resource removed and reports closed.');
            setResources(p => p.filter(r => r.id !== id));
            setSelected(null);
        } catch { showMsg('Failed to remove resource.', true); }
    };

    return (
        <AdminLayout pageTitle="Reported Content">
            <ActionBanner msg={msg} />

            <div className="content-header">
                <h2>Open Reports ({resources.length})</h2>
                <button className="btn-secondary" onClick={fetchReported}>↻ Refresh</button>
            </div>

            {loading && <LoadingState text="Loading reported resources…" />}

            {!loading && resources.length === 0 && (
                <EmptyState
                    icon="🎉"
                    title="No Reported Content"
                    body="There are no resources with open reports at this time."
                    onRefresh={fetchReported}
                />
            )}

            {!loading && resources.length > 0 && (
                <div className="reports-list">
                    {resources.map(r => (
                        <div key={r.id} className="report-card">
                            <div className="report-card-header">
                                <div>
                                    <h4>{r.title}</h4>
                                    <div className="report-badges">
                                        <span className="type-badge">{r.type}</span>
                                        {r.subject && (
                                            <span className="type-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                                                {r.subject}
                                            </span>
                                        )}
                                        <span className={`status-badge ${(r.status || '').toLowerCase()}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="application-details">
                                <div className="detail-row">
                                    <span className="detail-label">Uploaded by:</span>
                                    <span>
                                        {r.uploadedBy}
                                        {r.uploadedByEmail && <span className="sub-email" style={{ marginLeft: '6px' }}>({r.uploadedByEmail})</span>}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Upload date:</span>
                                    <span>{formatDate(r.uploadedAt)}</span>
                                </div>
                                {r.moderationNotes && (
                                    <div className="detail-row">
                                        <span className="detail-label">Report reason:</span>
                                        <span className="report-reason">{r.moderationNotes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="report-actions">
                                <button
                                    className="action-btn view"
                                    style={{ padding: '7px 14px' }}
                                    onClick={() => setSelected(r)}
                                >
                                    👁 View Details
                                </button>
                                <button className="btn-approve" onClick={() => handleResolve(r.id)}>
                                    ✓ Resolve &amp; Keep
                                </button>
                                <button className="btn-reject" onClick={() => handleRemove(r.id)}>
                                    🗑 Remove Content
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail modal */}
            <ResourceViewerModal
                resource={selected}
                onClose={() => setSelected(null)}
                footer={
                    selected && <>
                        <button
                            className="btn-approve"
                            style={{ flex: 'unset', padding: '8px 16px' }}
                            onClick={() => handleResolve(selected.id)}
                        >
                            ✓ Resolve &amp; Keep
                        </button>
                        <button
                            className="btn-reject"
                            style={{ flex: 'unset', padding: '8px 16px' }}
                            onClick={() => handleRemove(selected.id)}
                        >
                            🗑 Remove Content
                        </button>
                    </>
                }
            />
        </AdminLayout>
    );
};

export default AdminReportResources;
