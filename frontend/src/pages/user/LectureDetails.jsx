import React, { useEffect, useState } from 'react';
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
    const [helpForm, setHelpForm] = useState({
        topic: '',
        description: '',
        preferredDateTime: '',
        estimatedDuration: 60,
        urgencyLevel: 3
    });

    const formatDateTime = (value) => {
        if (!value) {
            return 'Not scheduled';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleString();
    };

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
            if (err.response?.status === 401) {
                navigate('/login');
            }
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
        loadLecture();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lectureId]);

    const handleAttendLecture = async () => {
        try {
            setAttending(true);
            setMessage('');
            await api.post(`/peerhelp/lectures/${lectureId}/attend`);
            setMessage('Attendance marked successfully.');
            await loadLecture();
        } catch (err) {
            console.error('Attend lecture error:', err);
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
            setMessage('Help request sent to this lecture tutor. You can now wait for tutor scheduling.');
            setHelpForm((prev) => ({
                ...prev,
                description: '',
                preferredDateTime: '',
                estimatedDuration: 60,
                urgencyLevel: 3
            }));
        } catch (err) {
            console.error('Create lecture help request error:', err);
            setError(err.response?.data?.message || 'Failed to create help request.');
        } finally {
            setSubmittingHelp(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading lecture details...</div>;
    }

    return (
        <div className="dashboard">
            <div className="main-content lecture-detail-page">
                <button type="button" className="view-all" onClick={() => navigate('/dashboard/student')}>← Back to Student Dashboard</button>

                {error && <p className="header-subtitle">{error}</p>}
                {message && <p className="lecture-message">{message}</p>}

                {lecture && (
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>{lecture.title}</h2>
                            </div>
                            <div className="card-content">
                                <p><strong>Subject:</strong> {lecture.subjectName}</p>
                                <p><strong>Tutor:</strong> {lecture.tutorName}</p>
                                <p><strong>Scheduled:</strong> {formatDateTime(lecture.scheduledAt)}</p>
                                <p><strong>Duration:</strong> {lecture.durationMinutes} minutes</p>
                                <p><strong>Attendees:</strong> {lecture.attendeeCount}</p>
                                <p>{lecture.description}</p>

                                {lecture.meetingLink && (
                                    <p>
                                        <a href={lecture.meetingLink} target="_blank" rel="noreferrer">Open lecture link</a>
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="btn-accept"
                                    onClick={handleAttendLecture}
                                    disabled={attending || lecture.attendedByCurrentUser}
                                >
                                    {lecture.attendedByCurrentUser ? 'Attendance Marked' : (attending ? 'Marking...' : 'Attend Lecture')}
                                </button>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Request Help for This Lecture</h2>
                            </div>
                            <form className="lecture-form" onSubmit={handleSubmitHelpRequest}>
                                <label className="lecture-label" htmlFor="topic">Topic</label>
                                <input
                                    id="topic"
                                    type="text"
                                    value={helpForm.topic}
                                    onChange={(e) => handleHelpInput('topic', e.target.value)}
                                    required
                                />

                                <label className="lecture-label" htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={helpForm.description}
                                    onChange={(e) => handleHelpInput('description', e.target.value)}
                                    placeholder="Describe what you need help with"
                                    required
                                />

                                <label className="lecture-label" htmlFor="preferredDateTime">Preferred Date & Time</label>
                                <input
                                    id="preferredDateTime"
                                    type="datetime-local"
                                    value={helpForm.preferredDateTime}
                                    onChange={(e) => handleHelpInput('preferredDateTime', e.target.value)}
                                />

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

                                <button type="submit" className="btn-accept" disabled={submittingHelp}>
                                    {submittingHelp ? 'Sending...' : 'Help Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LectureDetails;
