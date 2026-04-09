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
    const [showingAllTutors, setShowingAllTutors] = useState(false);
    const [requestModal, setRequestModal] = useState({ show: false, tutor: null });
    const [requestForm, setRequestForm] = useState({ topic: '', description: '', urgencyLevel: 3, estimatedDuration: 60, preferredDateTime: '' });
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState('');
    const [ratingsModal, setRatingsModal] = useState({ show: false, tutor: null, ratings: [], loading: false });
    const [rateModal, setRateModal] = useState({ show: false, tutor: null, rating: 5, message: '', loading: false });

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchSubjects();
        fetchAllTutors();
    }, [navigate]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/auth/subjects');
            setSubjects(res.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchAllTutors = async () => {
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await api.get('/peerhelp/requests/match/all?limit=200');
            setTutors(res.data?.data || res.data || []);
            setShowingAllTutors(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load tutors. Please try again.');
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTutorsBySubject = async (subjectId, subjectName = '') => {
        if (!subjectId) {
            fetchAllTutors();
            return;
        }
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await api.get(`/peerhelp/requests/match/subject/${subjectId}?limit=50`);
            const matched = res.data?.data || res.data || [];
            if (matched.length > 0) {
                setTutors(matched);
                setShowingAllTutors(false);
            } else {
                const allRes = await api.get('/peerhelp/requests/match/all?limit=200');
                setTutors(allRes.data?.data || allRes.data || []);
                setShowingAllTutors(true);
                setError(`No tutors found for ${subjectName || 'this subject'}. Showing all tutors in database.`);
            }
            if (subjectName) setSelectedSubjectName(subjectName);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load tutors. Please try again.');
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!selectedSubject) { setError('Please select a subject first.'); return; }
        await fetchTutorsBySubject(selectedSubject, selectedSubjectName);
    };

    const handleSubjectChange = (e) => {
        const value = e.target.value;
        setSelectedSubject(value);
        const found = subjects.find(s => String(s.id) === value);
        setSelectedSubjectName(found?.name || '');
        setError('');
        fetchTutorsBySubject(value, found?.name || '');
    };

    const openRatingsModal = async (tutor) => {
        setRatingsModal({ show: true, tutor, ratings: [], loading: true });
        try {
            const tid = tutor.tutorId || tutor.id;
            const res = await api.get(`/peerhelp/ratings/tutor/${tid}`);
            setRatingsModal({ show: true, tutor, ratings: res.data?.data || [], loading: false });
        } catch {
            setRatingsModal({ show: true, tutor, ratings: [], loading: false });
        }
    };

    const openRateModal = (tutor) => {
        setRateModal({ show: true, tutor, rating: 5, message: '', loading: false });
    };

    const submitTutorRating = async () => {
        if (!rateModal.tutor) return;
        try {
            setRateModal((prev) => ({ ...prev, loading: true }));
            const tid = rateModal.tutor.tutorId || rateModal.tutor.id;
            await api.post(`/peerhelp/ratings/tutor/${tid}/quick`, {
                rating: rateModal.rating,
                message: rateModal.message,
                wouldRecommend: true
            });
            if (selectedSubject) {
                await fetchTutorsBySubject(selectedSubject, selectedSubjectName);
            } else {
                await fetchAllTutors();
            }
            setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false });
            await openRatingsModal(rateModal.tutor);
        } catch (err) {
            const apiMessage = err.response?.data?.message;
            const validationData = err.response?.data?.data;
            const detailedMessage = validationData && typeof validationData === 'object'
                ? Object.values(validationData)[0]
                : null;
            alert(detailedMessage || apiMessage || 'Unable to submit tutor rating.');
            setRateModal((prev) => ({ ...prev, loading: false }));
        }
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
        const numeric = Number(rating);
        const rounded = Number.isFinite(numeric) ? Math.max(0, Math.min(5, Math.round(numeric))) : 0;
        return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
    };

    const renderInteractiveStars = (value, onSelect, label) => (
        <div className="star-input" role="radiogroup" aria-label={label}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    className={`star-btn ${n <= value ? 'filled' : ''}`}
                    onClick={() => onSelect(n)}
                    aria-label={`${label} ${n} out of 5`}
                    aria-pressed={n <= value}
                >
                    ★
                </button>
            ))}
        </div>
    );

    return (
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content peerhelp-main">
                <div className="page-header">
                    <div>
                        <h1>Find Tutors</h1>
                        <p className="page-subtitle">Browse approved tutors matched to your selected subject</p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/request-help')}>
                        Submit a Help Request
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
                            {loading ? 'Searching...' : 'Find Tutors'}
                        </button>
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
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
                        <p className="results-count">
                            Found <strong>{tutors.length}</strong> tutor{tutors.length !== 1 ? 's' : ''}
                            {showingAllTutors ? ' in database' : <> for <strong>{selectedSubjectName}</strong></>}
                        </p>
                        <div className="tutors-grid">
                            {tutors.map(tutor => (
                                <div key={tutor.id} className="tutor-card">
                                    <div className="tutor-card-header">
                                        <div className="tutor-avatar">{(tutor.tutorName || tutor.name || 'T').charAt(0).toUpperCase()}</div>
                                        <div>
                                            <h3>{tutor.tutorName || tutor.name}</h3>
                                            <span className="tutor-subject">{tutor.subjectName || selectedSubjectName}</span>
                                        </div>
                                        <div className={`tutor-availability ${tutor.isAvailable ? 'available' : 'unavailable'}`}>
                                            {tutor.isAvailable ? 'Available' : 'Unavailable'}
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

                                    {tutor.qualification && <p className="tutor-qual">{tutor.qualification}</p>}

                                    <button
                                        className="btn-primary w-full"
                                        onClick={() => openRequestModal(tutor)}
                                        disabled={!tutor.isAvailable}
                                    >
                                        {tutor.isAvailable ? 'Request This Tutor' : 'Currently Unavailable'}
                                    </button>
                                    <div className="tutor-card-actions">
                                        <button className="btn-secondary w-full" onClick={() => openRatingsModal(tutor)}>
                                            View Ratings
                                        </button>
                                        <button className="btn-secondary w-full" onClick={() => openRateModal(tutor)}>
                                            Rate Tutor
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Not-yet-searched state */}
                {!selectedSubject && !loading && (
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
                                <h3>Request Help from {requestModal.tutor?.tutorName || requestModal.tutor?.name}</h3>
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
                                            {requestLoading ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {ratingsModal.show && (
                    <div className="modal-overlay" onClick={() => setRatingsModal({ show: false, tutor: null, ratings: [], loading: false })}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{ratingsModal.tutor?.tutorName || ratingsModal.tutor?.name} Ratings</h3>
                                <button className="modal-close" onClick={() => setRatingsModal({ show: false, tutor: null, ratings: [], loading: false })}>×</button>
                            </div>
                            {!ratingsModal.loading && ratingsModal.ratings.length > 0 && (
                                <div className="rating-summary">
                                    <span className="rating-summary-stars">
                                        {renderStars(
                                            ratingsModal.ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratingsModal.ratings.length
                                        )}
                                    </span>
                                    <span className="rating-summary-text">
                                        {(
                                            ratingsModal.ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratingsModal.ratings.length
                                        ).toFixed(1)} / 5 from {ratingsModal.ratings.length} review{ratingsModal.ratings.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                            {ratingsModal.loading && <p>Loading ratings...</p>}
                            {!ratingsModal.loading && ratingsModal.ratings.length === 0 && (
                                <p>No ratings yet for this tutor.</p>
                            )}
                            {!ratingsModal.loading && ratingsModal.ratings.length > 0 && (
                                <div className="ratings-list">
                                    {ratingsModal.ratings.map((r) => (
                                        <div key={r.id} className="rating-item">
                                            <div className="rating-item-top">
                                                <strong>{r.studentName || 'Student'}</strong>
                                                <span>{renderStars(r.rating)} ({r.rating}/5)</span>
                                            </div>
                                            {r.feedback && <p>{r.feedback}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {rateModal.show && (
                    <div className="modal-overlay" onClick={() => setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false })}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Rate {rateModal.tutor?.tutorName || rateModal.tutor?.name}</h3>
                                <button className="modal-close" onClick={() => setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false })}>×</button>
                            </div>
                            <div className="form-group">
                                <label>Rating</label>
                                {renderInteractiveStars(rateModal.rating, (n) => setRateModal((prev) => ({ ...prev, rating: n })), 'Overall rating')}
                                <div className="rating-inline-value">{rateModal.rating} / 5</div>
                            </div>
                            <div className="form-group">
                                <label>Rating Message</label>
                                <textarea
                                    rows={4}
                                    value={rateModal.message}
                                    onChange={(e) => setRateModal((prev) => ({ ...prev, message: e.target.value }))}
                                    placeholder="Write your feedback for this tutor..."
                                    maxLength={1000}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false })}>Cancel</button>
                                <button className="btn-primary" onClick={submitTutorRating} disabled={rateModal.loading}>
                                    {rateModal.loading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindTutors;
