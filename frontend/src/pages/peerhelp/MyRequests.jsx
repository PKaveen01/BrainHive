import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import ProfileGuard from '../../components/common/ProfileGuard';
import './PeerHelp.css';

const statusColors = {
    PENDING: '#f59e0b',
    APPROVED: '#10b981',
    COMPLETED: '#2563eb',
    RATED: '#7c3aed',
    CANCELLED: '#ef4444',
    REJECTED: '#ef4444'
};

const statusIcons = {
    PENDING: '⏳',
    APPROVED: '✅',
    COMPLETED: '🎓',
    RATED: '⭐',
    CANCELLED: '❌',
    REJECTED: '🚫'
};

const canConversation = (req) => (
    !!req.assignedTutorId && ['APPROVED', 'COMPLETED', 'RATED'].includes(req.status)
);

const MyRequests = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [sessions, setSessions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestView, setRequestView] = useState('requests'); // requests | conversations
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [cancellingId, setCancellingId] = useState(null);
    const [ratingModal, setRatingModal] = useState({ show: false, requestId: null, sessionId: null });
    const [rating, setRating] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [convOpenId, setConvOpenId] = useState(null);
    const [convMessages, setConvMessages] = useState({});
    const [convDraft, setConvDraft] = useState({});
    const [convSending, setConvSending] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchRequests();
    }, [navigate]);

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const [reqRes, sessRes] = await Promise.all([
                api.get('/peerhelp/requests/my-requests'),
                api.get('/peerhelp/sessions/my-sessions').catch(() => ({ data: { data: [] } }))
            ]);

            const reqs = reqRes.data?.data || reqRes.data || [];
            const sess = sessRes.data?.data || sessRes.data || [];

            const sessMap = {};
            sess.forEach(s => { if (s.helpRequestId) sessMap[s.helpRequestId] = s; });

            setRequests(reqs);
            setSessions(sessMap);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load your requests.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (requestId) => {
        if (!window.confirm('Cancel this help request?')) return;
        setCancellingId(requestId);
        try {
            await api.post(`/peerhelp/requests/${requestId}/cancel`);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel request.');
        } finally {
            setCancellingId(null);
        }
    };

    const handleRateSubmit = async () => {
        setRatingLoading(true);
        try {
            await api.post('/peerhelp/ratings', {
                sessionId: ratingModal.sessionId,
                rating,
                feedback: ratingComment,
                wouldRecommend: true
            });
            setRatingModal({ show: false, requestId: null, sessionId: null });
            setRating(5);
            setRatingComment('');
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit rating.');
        } finally {
            setRatingLoading(false);
        }
    };

    const filtered = filterStatus === 'ALL' ? requests : requests.filter(r => r.status === filterStatus);
    const conversationRequests = requests.filter(canConversation);
    const visibleRequests = requestView === 'conversations' ? conversationRequests : filtered;
    const statuses = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'RATED', 'CANCELLED'];

    const fmt = (dt) => {
        if (!dt) return 'Not set';
        return new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const loadConv = async (requestId) => {
        try {
            const res = await api.get(`/peerhelp/requests/${requestId}/messages`);
            setConvMessages((prev) => ({ ...prev, [requestId]: res.data?.data || [] }));
        } catch {
            setConvMessages((prev) => ({ ...prev, [requestId]: [] }));
        }
    };

    const toggleConv = (req) => {
        if (!canConversation(req)) return;
        if (convOpenId === req.id) {
            setConvOpenId(null);
            return;
        }
        setConvOpenId(req.id);
        loadConv(req.id);
    };

    const sendConvStudent = async (requestId) => {
        const body = (convDraft[requestId] || '').trim();
        if (!body) return;
        try {
            setConvSending(requestId);
            await api.post(`/peerhelp/requests/${requestId}/messages`, { body });
            setConvDraft((p) => ({ ...p, [requestId]: '' }));
            await loadConv(requestId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send');
        } finally {
            setConvSending(null);
        }
    };

    return (
        <ProfileGuard>
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content peerhelp-main">
                <div className="page-header">
                    <div>
                        <h1>My Help Requests</h1>
                        <p className="page-subtitle">Track your submitted help requests and session details</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/request-help')}>
                        + New Request
                    </button>
                </div>

                <div className="request-view-tabs">
                    <button
                        type="button"
                        className={`request-view-tab ${requestView === 'requests' ? 'active' : ''}`}
                        onClick={() => setRequestView('requests')}
                    >
                        Requests
                    </button>
                    <button
                        type="button"
                        className={`request-view-tab ${requestView === 'conversations' ? 'active' : ''}`}
                        onClick={() => setRequestView('conversations')}
                    >
                        Conversations ({conversationRequests.length})
                    </button>
                </div>

                {requestView === 'requests' && (
                    <div className="filter-tabs">
                        {statuses.map(s => (
                            <button
                                key={s}
                                className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
                                onClick={() => setFilterStatus(s)}
                            >
                                {s === 'ALL' ? `All (${requests.length})` : `${statusIcons[s] || ''} ${s} (${requests.filter(r => r.status === s).length})`}
                            </button>
                        ))}
                    </div>
                )}

                {loading && <div className="loading-state"><div className="spinner"></div><p>Loading your requests...</p></div>}
                {error && <div className="alert alert-error">{error} <button onClick={fetchRequests} className="retry-btn">Retry</button></div>}

                {!loading && !error && visibleRequests.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🙋</div>
                        <h3>
                            {requestView === 'conversations'
                                ? 'No conversation threads yet'
                                : (filterStatus === 'ALL' ? 'No help requests yet' : `No ${filterStatus.toLowerCase()} requests`)}
                        </h3>
                        <p>
                            {requestView === 'conversations'
                                ? 'Accept a tutor response first, then continue the discussion here.'
                                : 'Need help with a subject? Submit your first request!'}
                        </p>
                        {requestView !== 'conversations' && (
                            <button className="btn-primary" onClick={() => navigate('/request-help')}>Request Help</button>
                        )}
                    </div>
                )}

                <div className="requests-list">
                    {visibleRequests.map(req => {
                        const session = sessions[req.id];
                        return (
                            <div key={req.id} className="request-card">
                                <div className="request-card-header">
                                    <div>
                                        <h3>{req.topic}</h3>
                                        <span className="subject-badge">{req.subjectName}</span>
                                    </div>
                                    <span className="status-badge" style={{ background: statusColors[req.status] + '20', color: statusColors[req.status], border: `1px solid ${statusColors[req.status]}40` }}>
                                        {statusIcons[req.status]} {req.status}
                                    </span>
                                </div>

                                <p className="request-desc">{req.description}</p>

                                <div className="request-meta">
                                    <span>Urgency: {req.urgencyLevel}/5</span>
                                    <span>Duration: {req.estimatedDuration} min</span>
                                    <span>Preferred: {fmt(req.preferredDateTime)}</span>
                                    <span>Submitted: {fmt(req.createdAt)}</span>
                                </div>

                                {req.assignedTutorName && (
                                    <div className="tutor-assigned">
                                        <span>Tutor: <strong>{req.assignedTutorName}</strong></span>
                                    </div>
                                )}

                                {canConversation(req) && (
                                    <div className="lecture-req-conv-wrap">
                                        <button type="button" className="lecture-req-conv-toggle" onClick={() => toggleConv(req)}>
                                            {convOpenId === req.id ? 'Hide' : 'View'} conversation with tutor
                                            {req.lectureTitle ? ` · ${req.lectureTitle}` : ''}
                                        </button>
                                        {convOpenId === req.id && (
                                            <div className="lecture-req-conv-panel">
                                                <div className="lecture-convo-messages">
                                                    {(convMessages[req.id] || []).map((m) => (
                                                        <div key={m.id} className={`lecture-convo-bubble ${m.senderRole === 'STUDENT' ? 'is-mine' : 'is-theirs'}`}>
                                                            <span className="lecture-convo-who">{m.senderName}</span>
                                                            <p>{m.body}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="lecture-req-conv-compose">
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Message your tutor..."
                                                        value={convDraft[req.id] || ''}
                                                        onChange={(e) => setConvDraft((p) => ({ ...p, [req.id]: e.target.value }))}
                                                    />
                                                    <button type="button" className="btn-primary" onClick={() => sendConvStudent(req.id)} disabled={convSending === req.id}>
                                                        {convSending === req.id ? 'Sending…' : 'Send'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {session && (
                                    <div className="session-details">
                                        <h4>Session Details</h4>
                                        <div className="session-meta">
                                            <span>Start: {fmt(session.scheduledStartTime)}</span>
                                            <span>End: {fmt(session.scheduledEndTime)}</span>
                                            {session.meetingLink && (
                                                <a href={session.meetingLink} target="_blank" rel="noreferrer" className="join-link">
                                                    Join Session
                                                </a>
                                            )}
                                        </div>
                                        {session.notes && <p className="session-notes">{session.notes}</p>}
                                    </div>
                                )}

                                <div className="request-actions">
                                    {req.status === 'PENDING' && (
                                        <button
                                            className="btn-cancel"
                                            onClick={() => handleCancel(req.id)}
                                            disabled={cancellingId === req.id}
                                        >
                                            {cancellingId === req.id ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    )}
                                    {req.status === 'COMPLETED' && (
                                        <button className="btn-rate" onClick={() => setRatingModal({ show: true, requestId: req.id, sessionId: sessions[req.id]?.id || null })}>
                                            Rate Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rating Modal */}
                {ratingModal.show && (
                    <div className="modal-overlay" onClick={() => setRatingModal({ show: false, requestId: null, sessionId: null })}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Rate Your Session</h3>
                            <div className="star-rating">
                                {[1,2,3,4,5].map(s => (
                                    <button key={s} className={`star ${s <= rating ? 'filled' : ''}`} onClick={() => setRating(s)}>★</button>
                                ))}
                            </div>
                            <p className="rating-label">{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</p>
                            <textarea
                                value={ratingComment}
                                onChange={e => setRatingComment(e.target.value)}
                                placeholder="Share your experience (optional)..."
                                rows={3}
                            />
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setRatingModal({ show: false, requestId: null, sessionId: null })}>Cancel</button>
                                <button className="btn-primary" onClick={handleRateSubmit} disabled={ratingLoading}>
                                    {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </ProfileGuard>
    );
};

export default MyRequests;
