import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import './LectureDetails.css';

const LectureDetails = ({ embedded = false, lectureIdOverride = null, onBackToList = null }) => {
    const navigate = useNavigate();
    const { lectureId: routeLectureId } = useParams();
    const lectureId = lectureIdOverride || routeLectureId;

    const [loading, setLoading] = useState(true);
    const [lecture, setLecture] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [attending, setAttending] = useState(false);
    const [submittingHelp, setSubmittingHelp] = useState(false);
    const [helpThread, setHelpThread] = useState({ helpRequest: null, messages: [] });
    const [chatInput, setChatInput] = useState('');
    const [sendingChat, setSendingChat] = useState(false);
    const [user, setUser] = useState(null);
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
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        setUser(currentUser);
        if (!lectureId) {
            setError('Missing lecture id.');
            setLoading(false);
            return;
        }
        (async () => {
            await loadLecture();
            await loadHelpThread();
        })();
    }, [lectureId, navigate, loadHelpThread]);

    const handleBack = () => {
        if (embedded && onBackToList) {
            onBackToList();
            return;
        }
        navigate('/dashboard/student/lectures');
    };

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
        return (
            <div className="dashboard">
                {!embedded && <StudentSidebar user={user} activeTab="lectures" />}
                <div className="main-content lecture-main">
                    <div className="ph-loading">
                        <div className="ph-spinner"></div>
                        <p>Loading session details...</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasThread = Boolean(helpThread.helpRequest);

    const detailsContent = (
        <div className={`lecture-detail-page ${embedded ? 'lecture-detail-embedded' : ''}`}>
            <header className="lecture-header-nav">
                <button type="button" className="ph-back-btn" onClick={handleBack}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    <span>{embedded ? 'Back to Lectures' : 'All Lectures'}</span>
                </button>
            </header>

            {lecture && (
                <>
                    <div className="lecture-hero-banner">
                        <div className="hero-content">
                            <div className="hero-top">
                                <span className="subject-chip">{lecture.subjectName}</span>
                                {lecture.status === 'LIVE' && <span className="live-pill"><span className="pulse-dot"></span> LIVE NOW</span>}
                            </div>
                            <h1 className="hero-title">{lecture.title}</h1>
                            <div className="hero-meta">
                                <div className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    <span>Tutor: <strong>{lecture.tutorName}</strong></span>
                                </div>
                                <div className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span>{lecture.durationMinutes} minutes</span>
                                </div>
                                <div className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span>{formatDateTime(lecture.scheduledAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <div className="ph-alert alert-error">{error}</div>}
                    {message && <div className="ph-alert alert-success">{message}</div>}

                    <div className="lecture-content-grid">
                        <div className="lecture-primary-col">
                            {/* Interaction Area: Chat or Form */}
                            <section className="ph-card conversation-main-card">
                                <div className="card-header">
                                    <h3>{hasThread ? 'Consultation Thread' : 'Request Consultation'}</h3>
                                    {hasThread && <span className="live-indicator">Active</span>}
                                </div>
                                
                                {hasThread ? (
                                    <div className="chat-container">
                                        <div className="messages-list">
                                            {helpThread.messages.map((m) => {
                                                const mine = currentUserId && Number(currentUserId) === m.senderId;
                                                return (
                                                    <div key={m.id} className={`chat-message ${mine ? 'sent' : 'received'}`}>
                                                        <div className="message-info">
                                                            <span className="sender-name">{mine ? 'You' : m.senderName}</span>
                                                            <span className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="message-bubble">
                                                            <p>{m.body}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <form className="chat-composer" onSubmit={sendChat}>
                                            <textarea
                                                rows={2}
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Ask your tutor anything about this session..."
                                                disabled={sendingChat}
                                            />
                                            <button type="submit" className="send-btn" disabled={sendingChat || !chatInput.trim()}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="form-container-pro">
                                        <div className="form-intro">
                                            <p>Need clarification on this lecture? Submit your questions here to start a private consultation with the tutor.</p>
                                        </div>
                                        <form className="ph-form-modern" onSubmit={handleSubmitHelpRequest}>
                                            <div className="form-group">
                                                <label>Topic of Discussion</label>
                                                <input
                                                    type="text"
                                                    value={helpForm.topic}
                                                    onChange={(e) => handleHelpInput('topic', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Your specific questions or difficult points</label>
                                                <textarea
                                                    rows={6}
                                                    value={helpForm.description}
                                                    onChange={(e) => handleHelpInput('description', e.target.value)}
                                                    placeholder="Describe what you'd like the tutor to help you with..."
                                                    required
                                                />
                                            </div>
                                            <div className="form-row-modern">
                                                <div className="form-group">
                                                    <label>Urgency Level</label>
                                                    <select 
                                                        value={helpForm.urgencyLevel} 
                                                        onChange={(e) => handleHelpInput('urgencyLevel', e.target.value)}
                                                    >
                                                        <option value="1">1 - Low Priority</option>
                                                        <option value="2">2 - Normal</option>
                                                        <option value="3">3 - Medium</option>
                                                        <option value="4">4 - High</option>
                                                        <option value="5">5 - Immediate</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Est. Duration (min)</label>
                                                    <input
                                                        type="number"
                                                        value={helpForm.estimatedDuration}
                                                        onChange={(e) => handleHelpInput('estimatedDuration', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn-ph-primary submit-btn-lg" disabled={submittingHelp}>
                                                {submittingHelp ? 'Sending...' : 'Start Consultation Thread'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="lecture-secondary-col">
                            {/* Session Details in Sidebar */}
                            <section className="ph-card details-sidebar-card">
                                <div className="card-header">
                                    <h3>Session Overview</h3>
                                </div>
                                <div className="card-body">
                                    <div className="sidebar-stats">
                                        <div className="stat-pill">
                                            <label>Status</label>
                                            <span className={`status-val ${lecture.status?.toLowerCase()}`}>{lecture.status}</span>
                                        </div>
                                        <div className="stat-pill">
                                            <label>Attendees</label>
                                            <span className="status-val">{lecture.attendeeCount}</span>
                                        </div>
                                    </div>

                                    <div className="sidebar-description">
                                        <label>Description</label>
                                        <p>{lecture.description}</p>
                                    </div>

                                    <div className="sidebar-actions">
                                        {lecture.meetingLink && (
                                            <a href={lecture.meetingLink} target="_blank" rel="noreferrer" className="btn-ph-primary w-full">
                                                Join Live Session
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            className={`btn-ph-secondary w-full ${lecture.attendedByCurrentUser ? 'is-attended' : ''}`}
                                            onClick={handleAttendLecture}
                                            disabled={attending || lecture.attendedByCurrentUser}
                                        >
                                            {lecture.attendedByCurrentUser ? 'Attendance Marked' : (attending ? 'Marking...' : 'Mark Attendance')}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="ph-card instructor-card">
                                <div className="card-header">
                                    <h3>Instructor</h3>
                                </div>
                                <div className="card-body instructor-brief">
                                    <div className="instructor-avatar">
                                        {lecture.tutorName?.charAt(0)}
                                    </div>
                                    <div className="instructor-info">
                                        <h4>{lecture.tutorName}</h4>
                                        <p>Expert in {lecture.subjectName}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    if (embedded) {
        return detailsContent;
    }

    return (
        <div className="dashboard">
            <StudentSidebar user={user} activeTab="lectures" />
            <div className="main-content lecture-main">
                {detailsContent}
            </div>
        </div>
    );
};

export default LectureDetails;
