import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './Dashboard.css';

const LectureDetails = () => {
    const navigate = useNavigate();
    const { lectureId } = useParams();

    const [loading, setLoading] = useState(true);
    const [lecture, setLecture] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [attending, setAttending] = useState(false);
    const [submittingHelp, setSubmittingHelp] = useState(false);
    const [helpThread, setHelpThread] = useState({ helpRequest: null, messages: [] });
    const [chatInput, setChatInput] = useState('');
    const [sendingChat, setSendingChat] = useState(false);
    const [helpForm, setHelpForm] = useState({
        topic: '',
        description: '',
        preferredDateTime: '',
        estimatedDuration: 60,
        urgencyLevel: 3
    });

    const currentUserId = authService.getCurrentUser()?.userId;

    const formatDateTime = (value) => {
        if (!value) return 'Not scheduled';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    };

    const loadHelpThread = useCallback(async () => {
        try {
            const res = await api.get(`/peerhelp/lectures/${lectureId}/help-thread`);
            const data = res.data?.data;
            setHelpThread({
                helpRequest: data?.helpRequest || null,
                messages: data?.messages || []
            });
        } catch {
            setHelpThread({ helpRequest: null, messages: [] });
        }
    }, [lectureId]);

    const loadLecture = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get(`/peerhelp/lectures/${lectureId}`);
            const data = response.data?.data;
            setLecture(data);
            setHelpForm((prev) => ({
                ...prev,
                topic: prev.topic || `Need help with lecture: ${data?.title || ''}`.trim()
            }));
        } catch (err) {
            console.error('Error loading lecture details:', err);
            setError(err.response?.data?.message || 'Unable to load lecture details.');
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        (async () => {
            await loadLecture();
            await loadHelpThread();
        })();
    }, [lectureId, navigate, loadHelpThread]);

    const handleAttendLecture = async () => {
        try {
            setAttending(true);
            setMessage('');
            await api.post(`/peerhelp/lectures/${lectureId}/attend`);
            setMessage('Attendance marked successfully.');
            await loadLecture();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark attendance.');
        } finally {
            setAttending(false);
        }
    };

    const handleHelpInput = (field, value) => {
        setHelpForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitHelpRequest = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        try {
            setSubmittingHelp(true);
            await api.post(`/peerhelp/lectures/${lectureId}/help-request`, {
                topic: helpForm.topic.trim(),
                description: helpForm.description.trim(),
                preferredDateTime: helpForm.preferredDateTime || null,
                estimatedDuration: Number(helpForm.estimatedDuration),
                urgencyLevel: Number(helpForm.urgencyLevel)
            });
            setMessage('Your question was sent. You can continue the conversation below.');
            setHelpForm((prev) => ({
                ...prev,
                description: '',
                preferredDateTime: '',
                estimatedDuration: 60,
                urgencyLevel: 3
            }));
            await loadHelpThread();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create help request.';
            setError(msg);
            if (msg.includes('already have')) await loadHelpThread();
        } finally {
            setSubmittingHelp(false);
        }
    };

    const sendChat = async (e) => {
        e.preventDefault();
        const rid = helpThread.helpRequest?.id;
        if (!rid || !chatInput.trim()) return;
        try {
            setSendingChat(true);
            await api.post(`/peerhelp/requests/${rid}/messages`, { body: chatInput.trim() });
            setChatInput('');
            await loadHelpThread();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message.');
        } finally {
            setSendingChat(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading lecture details...</div>;
    }

    const hasThread = Boolean(helpThread.helpRequest);

    return (
        <div className="dashboard">
            <div className="main-content lecture-detail-page">
                <button type="button" className="view-all lecture-back-btn" onClick={() => navigate('/dashboard/student')}>
                    ← Back to Student Dashboard
                </button>

                <div className="lecture-detail-hero">
                    <div className="lecture-detail-hero-inner">
                        <span className="lecture-hero-kicker">Lecture</span>
                        <h1 className="lecture-hero-title">{lecture?.title || 'Lecture'}</h1>
                        <p className="lecture-hero-sub">{lecture?.subjectName} · with {lecture?.tutorName}</p>
                    </div>
                </div>

                {error && <div className="lecture-alert lecture-alert-error">{error}</div>}
                {message && <div className="lecture-alert lecture-alert-success">{message}</div>}

                {lecture && (
                    <div className="lecture-detail-layout">
                        <div className="dashboard-card lecture-detail-card">
                            <div className="card-header lecture-card-header-accent">
                                <h2>About this session</h2>
                            </div>
                            <div className="card-content lecture-detail-content">
                                <div className="lecture-meta-badges">
                                    <span className="lecture-meta-badge">{lecture.subjectName}</span>
                                    <span className="lecture-meta-badge">{lecture.durationMinutes} min</span>
                                    <span className="lecture-meta-badge">{lecture.attendeeCount} attendees</span>
                                </div>
                                <div className="lecture-detail-info-list">
                                    <p><strong>Tutor:</strong> {lecture.tutorName}</p>
                                    <p><strong>Scheduled:</strong> {formatDateTime(lecture.scheduledAt)}</p>
                                </div>
                                <p className="lecture-detail-description">{lecture.description}</p>
                                <div className="lecture-card-actions">
                                    {lecture.meetingLink && (
                                        <a href={lecture.meetingLink} target="_blank" rel="noreferrer" className="lecture-link-btn">
                                            Open Lecture Link
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-accept lecture-attend-btn"
                                        onClick={handleAttendLecture}
                                        disabled={attending || lecture.attendedByCurrentUser}
                                    >
                                        {lecture.attendedByCurrentUser ? 'Attendance Marked' : (attending ? 'Marking...' : 'Attend Lecture')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lecture-detail-right">
                            <div className="dashboard-card lecture-convo-card">
                                <div className="card-header lecture-card-header-accent">
                                    <h2>Conversation with tutor</h2>
                                    <span className="lecture-convo-badge">Live</span>
                                </div>
                                <div className="lecture-convo-body">
                                    <p className="lecture-convo-hint">
                                        Ask about difficult points from this lecture. Your tutor will reply here — you can also continue this thread from <strong>My Requests</strong>.
                                    </p>
                                    <div className="lecture-convo-messages">
                                        {!hasThread && (
                                            <div className="lecture-convo-empty">
                                                No messages yet. Submit your first question using the form below.
                                            </div>
                                        )}
                                        {helpThread.messages.map((m) => {
                                            const mine = currentUserId && Number(currentUserId) === m.senderId;
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`lecture-convo-bubble ${mine ? 'is-mine' : 'is-theirs'}`}
                                                >
                                                    <span className="lecture-convo-who">{mine ? 'You' : m.senderName}</span>
                                                    <p>{m.body}</p>
                                                    <span className="lecture-convo-time">{formatDateTime(m.createdAt)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {hasThread && (
                                        <form className="lecture-convo-compose" onSubmit={sendChat}>
                                            <textarea
                                                rows={2}
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Type a message to your tutor..."
                                                disabled={sendingChat}
                                            />
                                            <button type="submit" className="lecture-convo-send" disabled={sendingChat || !chatInput.trim()}>
                                                {sendingChat ? 'Sending…' : 'Send'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {!hasThread && (
                                <div className="dashboard-card lecture-help-card">
                                    <div className="card-header">
                                        <h2>Start: difficult points</h2>
                                    </div>
                                    <form className="lecture-form lecture-form-updated" onSubmit={handleSubmitHelpRequest}>
                                        <div className="lecture-field">
                                            <label className="lecture-label" htmlFor="topic">Topic</label>
                                            <input
                                                id="topic"
                                                type="text"
                                                value={helpForm.topic}
                                                onChange={(e) => handleHelpInput('topic', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="lecture-field">
                                            <label className="lecture-label" htmlFor="description">What are your difficult points?</label>
                                            <textarea
                                                id="description"
                                                rows={4}
                                                value={helpForm.description}
                                                onChange={(e) => handleHelpInput('description', e.target.value)}
                                                placeholder="Describe concepts or problems you want help with from this lecture."
                                                required
                                            />
                                        </div>
                                        <div className="lecture-field">
                                            <label className="lecture-label" htmlFor="preferredDateTime">Preferred Date & Time (optional)</label>
                                            <input
                                                id="preferredDateTime"
                                                type="datetime-local"
                                                value={helpForm.preferredDateTime}
                                                onChange={(e) => handleHelpInput('preferredDateTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="lecture-detail-form-row">
                                            <div className="lecture-field">
                                                <label className="lecture-label" htmlFor="estimatedDuration">Duration (minutes)</label>
                                                <input
                                                    id="estimatedDuration"
                                                    type="number"
                                                    min="15"
                                                    max="180"
                                                    value={helpForm.estimatedDuration}
                                                    onChange={(e) => handleHelpInput('estimatedDuration', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="lecture-field">
                                                <label className="lecture-label" htmlFor="urgencyLevel">Urgency (1-5)</label>
                                                <input
                                                    id="urgencyLevel"
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    value={helpForm.urgencyLevel}
                                                    onChange={(e) => handleHelpInput('urgencyLevel', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="lecture-form-actions">
                                            <button type="submit" className="btn-accept lecture-help-submit-btn" disabled={submittingHelp}>
                                                {submittingHelp ? 'Sending...' : 'Send & open conversation'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LectureDetails;
