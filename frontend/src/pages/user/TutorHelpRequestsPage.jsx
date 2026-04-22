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
    const [tab, setTab] = useState('open'); // 'open' | 'conversations'
    const [requests, setRequests] = useState([]);
    const [conversationRequests, setConversationRequests] = useState([]);
    const [loadingLecture, setLoadingLecture] = useState(false);
    const [openConvId, setOpenConvId] = useState(null);
    const [convMessages, setConvMessages] = useState({});
    const [convDraft, setConvDraft] = useState({});
    const [sendingConv, setSendingConv] = useState(null);
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

    const fetchConversationRequests = useCallback(async () => {
        try {
            setLoadingLecture(true);
            const res = await api.get('/peerhelp/requests/conversations');
            setConversationRequests(res.data?.data || []);
        } catch (err) {
            if (err?.response?.status === 401) { navigate('/login'); return; }
        } finally {
            setLoadingLecture(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (tab === 'conversations') fetchConversationRequests();
    }, [tab, fetchConversationRequests]);

    const loadConvMessages = async (requestId) => {
        try {
            const res = await api.get(`/peerhelp/requests/${requestId}/messages`);
            setConvMessages((prev) => ({ ...prev, [requestId]: res.data?.data || [] }));
        } catch {
            setConvMessages((prev) => ({ ...prev, [requestId]: [] }));
        }
    };

    const toggleConv = (requestId) => {
        if (openConvId === requestId) {
            setOpenConvId(null);
            return;
        }
        setOpenConvId(requestId);
        loadConvMessages(requestId);
    };

    const sendConvReply = async (requestId) => {
        const body = (convDraft[requestId] || '').trim();
        if (!body) return;
        try {
            setSendingConv(requestId);
            await api.post(`/peerhelp/requests/${requestId}/messages`, { body });
            setConvDraft((p) => ({ ...p, [requestId]: '' }));
            await loadConvMessages(requestId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send');
        } finally {
            setSendingConv(null);
        }
    };

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

            <div className="tutor-help-tabs">
                <button type="button" className={`tutor-help-tab ${tab === 'open' ? 'active' : ''}`} onClick={() => setTab('open')}>
                    Open pool
                </button>
                <button type="button" className={`tutor-help-tab ${tab === 'conversations' ? 'active' : ''}`} onClick={() => setTab('conversations')}>
                    Conversations
                </button>
            </div>

            {tab === 'conversations' && (
                <div className="dashboard-card" style={{ marginBottom: '1.25rem' }}>
                    <div className="card-header">
                        <h2>Student conversations</h2>
                        <button className="view-all" type="button" onClick={fetchConversationRequests} disabled={loadingLecture}>↻ Refresh</button>
                    </div>
                    <div className="card-content">
                        <p className="header-subtitle" style={{ marginBottom: '1rem' }}>
                            Reply to students for accepted sessions. Students can continue the same thread from <strong>My Requests</strong>.
                        </p>
                        {loadingLecture && <p className="header-subtitle">Loading...</p>}
                        {!loadingLecture && conversationRequests.length === 0 && (
                            <p className="header-subtitle">No conversations yet.</p>
                        )}
                        {conversationRequests.map((c) => (
                            <div key={c.id} className="lecture-tutor-conv-block">
                                <button type="button" className="lecture-tutor-conv-head" onClick={() => toggleConv(c.id)}>
                                    <div>
                                        <strong>{c.studentName}</strong>
                                        <span className="lecture-tutor-topic">{c.topic}</span>
                                        <span className="lecture-tutor-lec">{c.subjectName} · {c.status}</span>
                                    </div>
                                    <span>{openConvId === c.id ? '▲' : '▼'}</span>
                                </button>
                                {openConvId === c.id && (
                                    <div className="lecture-tutor-thread">
                                        <div className="lecture-convo-messages">
                                            {(convMessages[c.id] || []).map((m) => (
                                                <div key={m.id} className={`lecture-convo-bubble ${m.senderRole === 'TUTOR' ? 'is-mine' : 'is-theirs'}`}>
                                                    <span className="lecture-convo-who">{m.senderName}</span>
                                                    <p>{m.body}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="lecture-tutor-reply">
                                            <textarea
                                                rows={2}
                                                placeholder="Reply to student..."
                                                value={convDraft[c.id] || ''}
                                                onChange={(e) => setConvDraft((p) => ({ ...p, [c.id]: e.target.value }))}
                                            />
                                            <button type="button" className="lecture-convo-send" onClick={() => sendConvReply(c.id)} disabled={sendingConv === c.id}>
                                                {sendingConv === c.id ? 'Sending…' : 'Send reply'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'open' && (
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
                        <div key={req.id} className={`request-block ${acceptingId === req.id ? 'is-expanding' : ''}`}>
                            <div className="request-item tutor-request-item">
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
                                    <div className="accept-request-title-row">
                                        <h4>Schedule Session</h4>
                                        <span className="accept-request-chip">Required details</span>
                                    </div>

                                    <div className="accept-request-grid">
                                        <div className="accept-field">
                                            <label className="lecture-label">Session Start</label>
                                            <input className="accept-input" type="datetime-local" value={acceptForm.scheduledStartTime}
                                                onChange={e => setAcceptForm(p => ({ ...p, scheduledStartTime: e.target.value }))} />
                                            {acceptErrors.scheduledStartTime && <p className="form-error">{acceptErrors.scheduledStartTime}</p>}
                                        </div>

                                        <div className="accept-field">
                                            <label className="lecture-label">Session End</label>
                                            <input className="accept-input" type="datetime-local" value={acceptForm.scheduledEndTime}
                                                onChange={e => setAcceptForm(p => ({ ...p, scheduledEndTime: e.target.value }))} />
                                            {acceptErrors.scheduledEndTime && <p className="form-error">{acceptErrors.scheduledEndTime}</p>}
                                        </div>
                                    </div>

                                    <div className="accept-field">
                                        <label className="lecture-label">Meeting Link (optional)</label>
                                        <input className="accept-input" type="url" value={acceptForm.meetingLink} placeholder="https://..."
                                            onChange={e => setAcceptForm(p => ({ ...p, meetingLink: e.target.value }))} />
                                    </div>

                                    <div className="accept-field">
                                        <label className="lecture-label">Notes (optional)</label>
                                        <textarea className="accept-textarea" rows={3} value={acceptForm.notes}
                                            onChange={e => setAcceptForm(p => ({ ...p, notes: e.target.value }))} />
                                    </div>

                                    <div className="request-actions accept-request-actions">
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
            )}
        </TutorLayout>
    );
};

export default TutorHelpRequestsPage;
