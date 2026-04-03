import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useActionMessage, ActionBanner, LoadingState, EmptyState, formatDate } from '../../components/admin/adminShared';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

const AdminTutorApprovals = () => {
    const [tutors, setTutors]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [msg, showMsg]        = useActionMessage();

    useEffect(() => { fetchTutors(); }, []);

    const fetchTutors = async () => {
        setLoading(true); setError(null);
        try {
            const res = await api.get('/admin/tutors/pending');
            setTutors(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            const s = e?.response?.status;
            setError(s === 401 || s === 403
                ? 'Session expired or unauthorised. Please log out and log back in.'
                : `Could not load applications (${s || 'network error'}).`);
        } finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/tutors/${id}/approve`);
            showMsg('Tutor approved! They can now log in.');
            fetchTutors();
        } catch { showMsg('Failed to approve tutor.', true); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this tutor application? This will block their account.')) return;
        try {
            await api.post(`/admin/tutors/${id}/reject`);
            showMsg('Tutor application rejected.');
            fetchTutors();
        } catch { showMsg('Failed to reject tutor.', true); }
    };

    return (
        <AdminLayout pageTitle="Tutor Approvals">
            <ActionBanner msg={msg} />

            <div className="content-header">
                <h2>Pending Applications ({tutors.length})</h2>
                <button className="btn-secondary" onClick={fetchTutors}>↻ Refresh</button>
            </div>

            {loading && <LoadingState text="Loading pending applications…" />}

            {!loading && error && (
                <EmptyState icon="⚠️" title="Could Not Load Applications" body={error} onRefresh={fetchTutors} />
            )}

            {!loading && !error && tutors.length === 0 && (
                <EmptyState icon="✅" title="No Pending Applications" body="All tutor applications have been reviewed." onRefresh={fetchTutors} />
            )}

            {!loading && !error && tutors.length > 0 && (
                <div className="applications-grid">
                    {tutors.map(tutor => (
                        <div key={tutor.id} className="application-card">
                            <div className="application-header">
                                <div className="tutor-avatar">
                                    {tutor.name ? tutor.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="tutor-info">
                                    <h4>{tutor.name}</h4>
                                    <p>{tutor.email}</p>
                                </div>
                            </div>

                            <div className="application-details">
                                <div className="detail-row">
                                    <span className="detail-label">Qualification:</span>
                                    <span>{tutor.qualification || '—'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Experience:</span>
                                    <span>{tutor.yearsOfExperience != null ? `${tutor.yearsOfExperience} year(s)` : '—'}</span>
                                </div>
                                {tutor.bio && (
                                    <div className="detail-row">
                                        <span className="detail-label">Bio:</span>
                                        <span className="bio-text">{tutor.bio}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Applied:</span>
                                    <span>{formatDate(tutor.createdAt)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className="status-badge pending">
                                        {tutor.verificationStatus || 'PENDING'}
                                    </span>
                                </div>
                            </div>

                            <div className="application-actions">
                                <button className="btn-approve" onClick={() => handleApprove(tutor.id)}>
                                    ✓ Approve
                                </button>
                                <button className="btn-reject" onClick={() => handleReject(tutor.id)}>
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTutorApprovals;
