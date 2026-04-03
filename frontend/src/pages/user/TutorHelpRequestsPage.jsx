import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';

const formatDateTime = (v) => {
    if (!v) return 'Not scheduled';
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleString();
};

const TutorHelpRequestsPage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [acceptingId, setAcceptingId] = useState(null);
    const [acceptForm, setAcceptForm] = useState({ scheduledStartTime: '', scheduledEndTime: '', meetingLink: '', notes: '' });
    const [acceptErrors, setAcceptErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const fetchRequests = useCallback(async () => {
        try {
            setError('');
            const res = await api.get('/peerhelp/requests/available');
            const data = res.data?.data || [];
            setRequests(data.map(item => ({
                id: item.id,
                student: item.studentName,
                subject: item.subjectName,
                topic: item.topic,
                time: formatDateTime(item.preferredDateTime),
                raw: item,
            })));
        } catch (err) {
            if (err?.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load help requests.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const openAccept = (id) => {
        const now = new Date();
        setAcceptingId(id);
        setAcceptErrors({});
        setMessage('');
        setAcceptForm({
            scheduledStartTime: new Date(now.getTime() + 3600000).toISOString().slice(0, 16),
            scheduledEndTime: new Date(now.getTime() + 7200000).toISOString().slice(0, 16),
            meetingLink: '', notes: '',
        });
    };

    const validate = () => {
        const errs = {};
        const start = new Date(acceptForm.scheduledStartTime);
        const end = new Date(acceptForm.scheduledEndTime);
        if (!acceptForm.scheduledStartTime || isNaN(start)) errs.scheduledStartTime = 'Valid start time required';
        else if (start <= new Date()) errs.scheduledStartTime = 'Start time must be in the future';
        if (!acceptForm.scheduledEndTime || isNaN(end)) errs.scheduledEndTime = 'Valid end time required';
        else if (end <= start) errs.scheduledEndTime = 'End time must be after start time';
        setAcceptErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submitAccept = async (request) => {
        if (!validate()) return;
        try {
            setSubmitting(true);
            await api.post(`/peerhelp/requests/${request.id}/approve`, {
                scheduledStartTime: new Date(acceptForm.scheduledStartTime).toISOString(),
                scheduledEndTime: new Date(acceptForm.scheduledEndTime).toISOString(),
                meetingLink: acceptForm.meetingLink.trim() || null,
                notes: acceptForm.notes.trim() || null,
            });
            setMessage(`✅ Request from ${request.student} accepted and scheduled.`);
            setAcceptingId(null);
            fetchRequests();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to approve request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <TutorLayout title="🙋 Help Requests">
            {message && (
                <div className="profile-alert profile-alert-success" style={{ marginBottom: '1rem' }}>{message}</div>
            )}
            {error && (
                <div className="profile-alert profile-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>
            )}

            <div className="dashboard-card">
                <div className="card-header">
                    <h2>Pending Help Requests</h2>
                    <button className="view-all" onClick={fetchRequests} disabled={loading}>↻ Refresh</button>
                </div>
                <div className="card-content">
                    {loading && <p className="header-subtitle">Loading...</p>}
                    {!loading && requests.length === 0 && (
                        <p className="header-subtitle">No pending help requests right now. Check back later.</p>
                    )}
                    {requests.map((req) => (
                        <div key={req.id} className="request-block">
                            <div className="request-item">
                                <div className="request-info">
                                    <h3>{req.student}</h3>
                                    <p><strong>{req.subject}</strong> — {req.topic}</p>
                                    <span className="request-time">📅 {req.time}</span>
                                </div>
                                <div className="request-actions">
                                    <button className="btn-decline" onClick={() => alert('Decline not available in current API.')}>Decline</button>
                                    <button className="btn-accept" onClick={() => openAccept(req.id)}>Accept</button>
                                </div>
                            </div>

                            {acceptingId === req.id && (
                                <form
                                    className="accept-request-form"
                                    onSubmit={(e) => { e.preventDefault(); submitAccept(req); }}
                                >
                                    <label className="lecture-label">Session Start</label>
                                    <input type="datetime-local" value={acceptForm.scheduledStartTime}
                                        onChange={e => setAcceptForm(p => ({ ...p, scheduledStartTime: e.target.value }))} />
                                    {acceptErrors.scheduledStartTime && <p className="form-error">{acceptErrors.scheduledStartTime}</p>}

                                    <label className="lecture-label">Session End</label>
                                    <input type="datetime-local" value={acceptForm.scheduledEndTime}
                                        onChange={e => setAcceptForm(p => ({ ...p, scheduledEndTime: e.target.value }))} />
                                    {acceptErrors.scheduledEndTime && <p className="form-error">{acceptErrors.scheduledEndTime}</p>}

                                    <label className="lecture-label">Meeting Link (optional)</label>
                                    <input type="url" value={acceptForm.meetingLink} placeholder="https://..."
                                        onChange={e => setAcceptForm(p => ({ ...p, meetingLink: e.target.value }))} />

                                    <label className="lecture-label">Notes (optional)</label>
                                    <textarea rows={3} value={acceptForm.notes}
                                        onChange={e => setAcceptForm(p => ({ ...p, notes: e.target.value }))} />

                                    <div className="request-actions">
                                        <button type="button" className="btn-decline" onClick={() => setAcceptingId(null)} disabled={submitting}>Cancel</button>
                                        <button type="submit" className="btn-accept" disabled={submitting}>
                                            {submitting ? 'Scheduling...' : 'Confirm Accept'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </TutorLayout>
    );
};

export default TutorHelpRequestsPage;
