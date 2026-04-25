import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import ProfileGuard from '../../components/common/ProfileGuard';
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
    const [rateModal, setRateModal] = useState({ show: false, tutor: null, rating: 5, message: '', loading: false, wouldRecommend: true });

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
        setRateModal({ show: true, tutor, rating: 5, message: '', loading: false, wouldRecommend: true });
    };

    const submitTutorRating = async () => {
        if (!rateModal.tutor) return;
        try {
            setRateModal((prev) => ({ ...prev, loading: true }));
            const tid = rateModal.tutor.tutorId || rateModal.tutor.id;
            await api.post(`/peerhelp/ratings/tutor/${tid}/quick`, {
                rating: rateModal.rating,
                message: rateModal.message,
                wouldRecommend: rateModal.wouldRecommend
            });
            if (selectedSubject) {
                await fetchTutorsBySubject(selectedSubject, selectedSubjectName);
            } else {
                await fetchAllTutors();
            }
            setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false, wouldRecommend: true });
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
        <ProfileGuard>
            <div className="dashboard">
                <StudentSidebar user={user} activeTab="discovery" />

                <div className="main-content peerhelp-main find-tutors-page">
                    <header className="page-header">
                        <div className="header-text">
                            <h1>Find Tutors</h1>
                            <p className="page-subtitle">Connect with expert tutors matched to your learning needs</p>
                        </div>
                        <button className="btn-secondary nav-action-btn" onClick={() => navigate('/request-help')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                            General Request
                        </button>
                    </header>

                    {/* Modern Search/Filter Bar */}
                    <section className="tutor-discovery-bar">
                        <div className="discovery-controls">
                            <div className="input-with-icon">
                                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <select
                                    value={selectedSubject}
                                    onChange={handleSubjectChange}
                                    className="discovery-select"
                                >
                                    <option value="">Filter by Subject...</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn-primary search-action-btn" onClick={handleSearch} disabled={loading || !selectedSubject}>
                                {loading ? (
                                    <><div className="btn-spinner"></div> Searching...</>
                                ) : (
                                    'Discover Tutors'
                                )}
                            </button>
                        </div>
                        {error && <div className="ph-alert alert-error-soft">{error}</div>}
                    </section>

                    {/* Results Section */}
                    <div className="discovery-results">
                        {loading && (
                            <div className="ph-loading-state">
                                <div className="ph-spinner-large"></div>
                                <p>Scanning for available tutors...</p>
                            </div>
                        )}

                        {!loading && searched && tutors.length === 0 && (
                            <div className="ph-empty-state">
                                <div className="empty-illustration">🔍</div>
                                <h3>No Tutors Available</h3>
                                <p>We couldn't find any tutors for <strong>{selectedSubjectName}</strong> at the moment.</p>
                                <button className="btn-primary" onClick={() => navigate('/request-help')}>Post a General Request</button>
                            </div>
                        )}

                        {!loading && tutors.length > 0 && (
                            <>
                                <div className="results-header">
                                    <span className="results-pill">
                                        <strong>{tutors.length}</strong> {tutors.length === 1 ? 'Expert' : 'Experts'} Available
                                        {selectedSubjectName && <> for {selectedSubjectName}</>}
                                    </span>
                                </div>

                                <div className="tutors-glass-grid">
                                    {tutors.map(tutor => (
                                        <div key={tutor.id} className="tutor-pro-card">
                                            <div className="card-top">
                                                <div className="tutor-identity">
                                                    <div className="tutor-avatar-pro">
                                                        {tutor.profilePicture ? (
                                                            <img src={tutor.profilePicture} alt={tutor.tutorName || tutor.name} className="avatar-img" />
                                                        ) : (
                                                            (tutor.tutorName || tutor.name || 'T').charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="tutor-info">
                                                        <h3>{tutor.tutorName || tutor.name}</h3>
                                                        <span className="subject-tag">{tutor.subjectName || selectedSubjectName}</span>
                                                    </div>
                                                </div>
                                                <div className={`status-pill ${tutor.isAvailable ? 'is-available' : 'is-away'}`}>
                                                    {tutor.isAvailable ? 'Available' : 'Away'}
                                                </div>
                                            </div>

                                            <p className="tutor-bio-pro">{tutor.bio || 'Professional tutor dedicated to student success and academic excellence.'}</p>

                                            <div className="tutor-metrics">
                                                <div className="metric">
                                                    <span className="metric-val">★ {(tutor.averageRating || 0).toFixed(1)}</span>
                                                    <span className="metric-label">Rating</span>
                                                </div>
                                                <div className="metric">
                                                    <span className="metric-val">{tutor.totalSessions || 0}</span>
                                                    <span className="metric-label">Sessions</span>
                                                </div>
                                                <div className="metric">
                                                    <span className="metric-val">{tutor.proficiencyLevel || 5}/5</span>
                                                    <span className="metric-label">Level</span>
                                                </div>
                                            </div>

                                            {tutor.qualification && (
                                                <div className="tutor-creds">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                                                    <span>{tutor.qualification}</span>
                                                </div>
                                            )}

                                            <div className="card-footer">
                                                <button
                                                    className="btn-primary w-full request-btn"
                                                    onClick={() => openRequestModal(tutor)}
                                                    disabled={!tutor.isAvailable}
                                                >
                                                    {tutor.isAvailable ? 'Direct Request' : 'Away'}
                                                </button>
                                                <div className="footer-secondary-btns">
                                                    <button className="btn-outline-sm" onClick={() => openRatingsModal(tutor)}>Ratings</button>
                                                    <button className="btn-outline-sm" onClick={() => openRateModal(tutor)}>Rate</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Request Modal */}
                    {requestModal.show && (
                        <div className="ph-modal-overlay" onClick={() => setRequestModal({ show: false, tutor: null })}>
                            <div className="ph-modal ph-modal-md" onClick={e => e.stopPropagation()}>
                                <div className="ph-modal-header">
                                    <h3>Consultation with {requestModal.tutor?.tutorName || requestModal.tutor?.name}</h3>
                                    <button className="ph-modal-close" onClick={() => setRequestModal({ show: false, tutor: null })}>×</button>
                                </div>

                                {requestSuccess ? (
                                    <div className="ph-modal-success">
                                        <div className="success-anim">✓</div>
                                        <p>{requestSuccess}</p>
                                        <button className="btn-primary w-full" onClick={() => { setRequestModal({ show: false, tutor: null }); navigate('/my-requests'); }}>
                                            View My Requests
                                        </button>
                                    </div>
                                ) : (
                                    <div className="ph-form-grid">
                                        <div className="ph-form-group">
                                            <label>Topic</label>
                                            <input type="text" value={requestForm.topic} onChange={e => setRequestForm(p => ({ ...p, topic: e.target.value }))} placeholder="e.g., Debugging Spring Boot API" />
                                        </div>
                                        <div className="ph-form-group">
                                            <label>Description</label>
                                            <textarea value={requestForm.description} onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))} placeholder="Provide more context for the tutor..." rows={4} />
                                        </div>
                                        <div className="ph-form-row">
                                            <div className="ph-form-group">
                                                <label>Est. Duration</label>
                                                <select value={requestForm.estimatedDuration} onChange={e => setRequestForm(p => ({ ...p, estimatedDuration: e.target.value }))}>
                                                    {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                                                </select>
                                            </div>
                                            <div className="ph-form-group">
                                                <label>Preferred Time</label>
                                                <input type="datetime-local" value={requestForm.preferredDateTime} onChange={e => setRequestForm(p => ({ ...p, preferredDateTime: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="ph-modal-footer">
                                            <button className="btn-ghost" onClick={() => setRequestModal({ show: false, tutor: null })}>Cancel</button>
                                            <button className="btn-primary" onClick={handleDirectRequest} disabled={requestLoading}>
                                                {requestLoading ? 'Processing...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ratings Modal */}
                    {ratingsModal.show && (
                        <div className="ph-modal-overlay" onClick={() => setRatingsModal({ show: false, tutor: null, ratings: [], loading: false })}>
                            <div className="ph-modal ph-modal-md" onClick={(e) => e.stopPropagation()}>
                                <div className="ph-modal-header">
                                    <h3>{ratingsModal.tutor?.tutorName || ratingsModal.tutor?.name} - Reviews</h3>
                                    <button className="ph-modal-close" onClick={() => setRatingsModal({ show: false, tutor: null, ratings: [], loading: false })}>×</button>
                                </div>

                                {!ratingsModal.loading && ratingsModal.ratings.length > 0 && (
                                    <div className="ph-rating-summary">
                                        <div className="summary-stars">
                                            {renderStars(ratingsModal.ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratingsModal.ratings.length)}
                                        </div>
                                        <div className="summary-text">
                                            {(ratingsModal.ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratingsModal.ratings.length).toFixed(1)} avg based on {ratingsModal.ratings.length} reviews
                                        </div>
                                    </div>
                                )}

                                {ratingsModal.loading ? (
                                    <div className="ph-loading-inline"><div className="ph-spinner-sm"></div> Loading...</div>
                                ) : ratingsModal.ratings.length === 0 ? (
                                    <div className="ph-empty-reviews">No reviews yet for this instructor.</div>
                                ) : (
                                    <div className="ph-reviews-list">
                                        {ratingsModal.ratings.map((r) => (
                                            <div key={r.id} className="ph-review-item">
                                                <div className="review-top">
                                                    <strong>{r.studentName || 'Student'}</strong>
                                                    <span className="review-stars">{renderStars(r.rating)}</span>
                                                </div>
                                                {r.feedback && <p className="review-text">{r.feedback}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rate Modal */}
                    {rateModal.show && (
                        <div className="ph-modal-overlay" onClick={() => setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false, wouldRecommend: true })}>
                            <div className="ph-modal pro-rate-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="ph-modal-header">
                                    <div className="modal-title-pro">
                                        <div className="tutor-mini-avatar">
                                            {(rateModal.tutor?.tutorName || rateModal.tutor?.name || 'T').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="modal-title-text">
                                            <h3>Rate your experience</h3>
                                            <p>{rateModal.tutor?.tutorName || rateModal.tutor?.name}</p>
                                        </div>
                                    </div>
                                    <button className="ph-modal-close" onClick={() => setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false, wouldRecommend: true })}>×</button>
                                </div>

                                <div className="pro-rate-body">
                                    <div className="rating-selector-section">
                                        <label className="section-label">Overall Quality</label>
                                        <div className="rating-stars-wrapper">
                                            {renderInteractiveStars(rateModal.rating, (n) => setRateModal((prev) => ({ ...prev, rating: n })), 'Overall rating')}
                                        </div>
                                        <div className={`rating-desc-pro rating-${rateModal.rating}`}>
                                            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rateModal.rating - 1]}
                                        </div>
                                    </div>

                                    <div className="ph-form-group">
                                        <label className="section-label">Your Feedback</label>
                                        <textarea
                                            rows={4}
                                            value={rateModal.message}
                                            onChange={(e) => setRateModal((prev) => ({ ...prev, message: e.target.value }))}
                                            placeholder="What did you like or what could be improved?"
                                            maxLength={1000}
                                            className="pro-textarea"
                                        />
                                        <div className="char-indicator">{rateModal.message.length}/1000</div>
                                    </div>

                                    <div className="recommendation-toggle">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={rateModal.wouldRecommend !== false}
                                                onChange={(e) => setRateModal(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                                            />
                                            <span className="toggle-text">I would recommend this tutor to other students</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="ph-modal-footer pro-footer">
                                    <button className="btn-ghost" onClick={() => setRateModal({ show: false, tutor: null, rating: 5, message: '', loading: false, wouldRecommend: true })}>Cancel</button>
                                    <button className="btn-primary pro-submit-btn" onClick={submitTutorRating} disabled={rateModal.loading}>
                                        {rateModal.loading ? (
                                            <><div className="btn-spinner"></div> Submitting...</>
                                        ) : (
                                            'Submit Review'
                                        )}
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

export default FindTutors;
