import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import './PeerHelp.css';

const FindTutors = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [searched, setSearched] = useState(false);
    const [requestModal, setRequestModal] = useState({ show: false, tutor: null });
    const [requestForm, setRequestForm] = useState({ topic: '', description: '', urgencyLevel: 3, estimatedDuration: 60, preferredDateTime: '' });
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchSubjects();
    }, [navigate]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/auth/subjects');
            setSubjects(res.data || []);
        } catch (e) { console.error(e); }
    };

    const handleSearch = async () => {
        if (!selectedSubject) { setError('Please select a subject first.'); return; }
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await api.get(`/peerhelp/requests/match/subject/${selectedSubject}?limit=20`);
            setTutors(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load tutors. Please try again.');
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
        const found = subjects.find(s => String(s.id) === e.target.value);
        setSelectedSubjectName(found?.name || '');
        setError('');
        setSearched(false);
        setTutors([]);
    };

    const openRequestModal = (tutor) => {
        setRequestModal({ show: true, tutor });
        setRequestForm({ topic: '', description: '', urgencyLevel: 3, estimatedDuration: 60, preferredDateTime: '' });
        setRequestSuccess('');
    };

    const handleDirectRequest = async () => {
        if (!requestForm.topic.trim() || !requestForm.description.trim()) {
            alert('Please fill in topic and description.');
            return;
        }
        setRequestLoading(true);
        try {
            await api.post('/peerhelp/requests', {
                subjectId: parseInt(selectedSubject),
                topic: requestForm.topic.trim(),
                description: requestForm.description.trim(),
                urgencyLevel: parseInt(requestForm.urgencyLevel),
                estimatedDuration: parseInt(requestForm.estimatedDuration),
                preferredDateTime: requestForm.preferredDateTime ? requestForm.preferredDateTime + ':00' : null
            });
            setRequestSuccess('Request submitted! This tutor will see your request shortly.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit request.');
        } finally {
            setRequestLoading(false);
        }
    };

    const renderStars = (rating) => {
        const r = rating || 0;
        return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
    };

    return (
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>👨‍🏫 Find Tutors</h1>
                        <p className="page-subtitle">Browse approved tutors matched to your subject</p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/request-help')}>
                        🙋 Submit a Help Request
                    </button>
                </div>

                {/* Search Bar */}
                <div className="tutor-search-bar">
                    <div className="search-row">
                        <select
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            className="subject-select"
                        >
                            <option value="">Select a subject...</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button className="btn-primary search-btn" onClick={handleSearch} disabled={loading || !selectedSubject}>
                            {loading ? 'Searching...' : '🔍 Find Tutors'}
                        </button>
                    </div>
                    {error && <div className="alert alert-error">⚠️ {error}</div>}
                </div>

                {/* Results */}
                {loading && <div className="loading-state"><div className="spinner"></div><p>Finding tutors...</p></div>}

                {!loading && searched && tutors.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">👨‍🏫</div>
                        <h3>No tutors found for {selectedSubjectName}</h3>
                        <p>Try a different subject, or submit a general help request instead.</p>
                        <button className="btn-primary" onClick={() => navigate('/request-help')}>Submit Help Request</button>
                    </div>
                )}

                {!loading && tutors.length > 0 && (
                    <>
                        <p className="results-count">Found <strong>{tutors.length}</strong> tutor{tutors.length !== 1 ? 's' : ''} for <strong>{selectedSubjectName}</strong></p>
                        <div className="tutors-grid">
                            {tutors.map(tutor => (
                                <div key={tutor.id} className="tutor-card">
                                    <div className="tutor-card-header">
                                        <div className="tutor-avatar">{(tutor.tutorName || tutor.name || 'T').charAt(0).toUpperCase()}</div>
                                        <div>
                                            <h3>{tutor.tutorName || tutor.name}</h3>
                                            <span className="tutor-subject">{tutor.subjectName || selectedSubjectName}</span>
                                        </div>
                                        <div className="tutor-availability" style={{ background: tutor.isAvailable ? '#dcfce7' : '#fee2e2', color: tutor.isAvailable ? '#16a34a' : '#dc2626' }}>
                                            {tutor.isAvailable ? '🟢 Available' : '🔴 Busy'}
                                        </div>
                                    </div>

                                    {tutor.bio && <p className="tutor-bio">{tutor.bio}</p>}

                                    <div className="tutor-stats">
                                        <div className="tutor-stat">
                                            <span className="stat-value">{renderStars(tutor.averageRating)}</span>
                                            <span className="stat-label">{(tutor.averageRating || 0).toFixed(1)} rating</span>
                                        </div>
                                        <div className="tutor-stat">
                                            <span className="stat-value">{tutor.totalSessions || 0}</span>
                                            <span className="stat-label">sessions</span>
                                        </div>
                                        <div className="tutor-stat">
                                            <span className="stat-value">{tutor.proficiencyLevel || '-'}/5</span>
                                            <span className="stat-label">proficiency</span>
                                        </div>
                                    </div>

                                    {tutor.qualification && <p className="tutor-qual">🎓 {tutor.qualification}</p>}

                                    <button
                                        className="btn-primary w-full"
                                        onClick={() => openRequestModal(tutor)}
                                        disabled={!tutor.isAvailable}
                                    >
                                        {tutor.isAvailable ? '📩 Request This Tutor' : 'Currently Unavailable'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Not-yet-searched state */}
                {!searched && !loading && (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Select a subject to find tutors</h3>
                        <p>We'll match you with approved tutors who specialize in that subject.</p>
                    </div>
                )}

                {/* Request Modal */}
                {requestModal.show && (
                    <div className="modal-overlay" onClick={() => setRequestModal({ show: false, tutor: null })}>
                        <div className="modal modal-large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>📩 Request Help from {requestModal.tutor?.tutorName || requestModal.tutor?.name}</h3>
                                <button className="modal-close" onClick={() => setRequestModal({ show: false, tutor: null })}>×</button>
                            </div>

                            {requestSuccess ? (
                                <div className="modal-success">
                                    <div className="success-icon">✅</div>
                                    <p>{requestSuccess}</p>
                                    <button className="btn-primary" onClick={() => { setRequestModal({ show: false, tutor: null }); navigate('/my-requests'); }}>
                                        View My Requests
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Topic <span className="required">*</span></label>
                                        <input type="text" value={requestForm.topic} onChange={e => setRequestForm(p => ({ ...p, topic: e.target.value }))} placeholder="What do you need help with?" maxLength={200} />
                                    </div>
                                    <div className="form-group">
                                        <label>Description <span className="required">*</span></label>
                                        <textarea value={requestForm.description} onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your specific question or problem..." rows={4} maxLength={2000} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Duration (min)</label>
                                            <select value={requestForm.estimatedDuration} onChange={e => setRequestForm(p => ({ ...p, estimatedDuration: e.target.value }))}>
                                                {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Preferred Date & Time</label>
                                            <input type="datetime-local" value={requestForm.preferredDateTime} onChange={e => setRequestForm(p => ({ ...p, preferredDateTime: e.target.value }))} min={new Date().toISOString().slice(0,16)} />
                                        </div>
                                    </div>
                                    <div className="modal-actions">
                                        <button className="btn-secondary" onClick={() => setRequestModal({ show: false, tutor: null })}>Cancel</button>
                                        <button className="btn-primary" onClick={handleDirectRequest} disabled={requestLoading}>
                                            {requestLoading ? 'Submitting...' : '🚀 Submit Request'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindTutors;
