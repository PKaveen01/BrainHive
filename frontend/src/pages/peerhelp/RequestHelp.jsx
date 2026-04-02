import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import './PeerHelp.css';

const RequestHelp = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Tutor matching
    const [matchedTutors, setMatchedTutors] = useState([]);
    const [tutorLoading, setTutorLoading] = useState(false);
    const [selectedTutorId, setSelectedTutorId] = useState(null);

    const [formData, setFormData] = useState({
        subjectId: '',
        topic: '',
        description: '',
        urgencyLevel: 3,
        estimatedDuration: 60,
        preferredDateTime: ''
    });

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

    // When subject changes, fetch matched tutors
    const handleSubjectChange = async (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, subjectId: val }));
        setSelectedTutorId(null);
        setMatchedTutors([]);
        setError('');
        if (!val) return;
        setTutorLoading(true);
        try {
            const res = await api.get(`/peerhelp/requests/match/subject/${val}?limit=10`);
            setMatchedTutors(res.data?.data || res.data || []);
        } catch (e) {
            setMatchedTutors([]);
        } finally {
            setTutorLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.subjectId) { setError('Please select a subject.'); setLoading(false); return; }
        if (!formData.topic.trim()) { setError('Please enter a topic.'); setLoading(false); return; }
        if (formData.description.trim().length < 10) { setError('Description must be at least 10 characters.'); setLoading(false); return; }

        try {
            const payload = {
                subjectId: parseInt(formData.subjectId),
                topic: formData.topic.trim(),
                description: formData.description.trim(),
                urgencyLevel: parseInt(formData.urgencyLevel),
                estimatedDuration: parseInt(formData.estimatedDuration),
                preferredDateTime: formData.preferredDateTime ? formData.preferredDateTime + ':00' : null
            };
            await api.post('/peerhelp/requests', payload);

            const tutorName = selectedTutorId
                ? matchedTutors.find(t => t.tutorId === selectedTutorId || t.id === selectedTutorId)?.tutorName || 'a tutor'
                : 'the most suitable available tutor';

            setSuccess(`Help request submitted! It will be reviewed by ${tutorName} shortly.`);
            setFormData({ subjectId: '', topic: '', description: '', urgencyLevel: 3, estimatedDuration: 60, preferredDateTime: '' });
            setMatchedTutors([]);
            setSelectedTutorId(null);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const urgencyLabels = { 1:'🟢 Low', 2:'🔵 Below Average', 3:'🟡 Medium', 4:'🟠 High', 5:'🔴 Urgent' };
    const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];

    const renderStars = (r) => '★'.repeat(Math.round(r||0)) + '☆'.repeat(5-Math.round(r||0));

    return (
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>🙋 Request Help</h1>
                        <p className="page-subtitle">Describe what you need help with and choose a tutor</p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/my-requests')}>📋 My Requests</button>
                </div>

                {success && (
                    <div className="alert alert-success">
                        <span>✅</span> {success}
                        <button className="alert-link" onClick={() => navigate('/my-requests')}>View My Requests →</button>
                    </div>
                )}
                {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

                <div className="peerhelp-form-container">
                    <form onSubmit={handleSubmit} className="peerhelp-form">

                        {/* ── Subject ── */}
                        <div className="form-section">
                            <h3>📚 Subject & Topic</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Subject <span className="required">*</span></label>
                                    <select name="subjectId" value={formData.subjectId} onChange={handleSubjectChange} required>
                                        <option value="">Select a subject...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estimated Duration (minutes) <span className="required">*</span></label>
                                    <select name="estimatedDuration" value={formData.estimatedDuration} onChange={handleChange}>
                                        {durationOptions.map(d => <option key={d} value={d}>{d} min</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Topic <span className="required">*</span></label>
                                <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="e.g. Binary Search Trees, Sorting Algorithms..." maxLength={200} required />
                                <span className="char-count">{formData.topic.length}/200</span>
                            </div>

                            <div className="form-group">
                                <label>Description <span className="required">*</span></label>
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your problem in detail — the more specific you are, the better help you'll get." rows={5} maxLength={2000} required />
                                <span className="char-count">{formData.description.length}/2000</span>
                            </div>
                        </div>

                        {/* ── Matched Tutors ── */}
                        {formData.subjectId && (
                            <div className="form-section">
                                <h3>👨‍🏫 Available Tutors for this Subject</h3>
                                {tutorLoading && <div className="tutor-loading"><div className="spinner-sm" />Finding tutors...</div>}

                                {!tutorLoading && matchedTutors.length === 0 && (
                                    <div className="no-tutors-note">
                                        No tutors currently available for this subject. Your request will be visible to all tutors and assigned automatically.
                                    </div>
                                )}

                                {!tutorLoading && matchedTutors.length > 0 && (
                                    <>
                                        <p className="tutor-hint">Select a preferred tutor (optional). Your request will be sent to all tutors in this subject regardless.</p>
                                        <div className="tutor-select-grid">
                                            {matchedTutors.map(t => {
                                                const tid = t.tutorId || t.id;
                                                const selected = selectedTutorId === tid;
                                                return (
                                                    <div
                                                        key={tid}
                                                        className={`tutor-select-card ${selected ? 'selected' : ''}`}
                                                        onClick={() => setSelectedTutorId(selected ? null : tid)}
                                                    >
                                                        <div className="tutor-select-avatar">{(t.tutorName||'T').charAt(0)}</div>
                                                        <div className="tutor-select-info">
                                                            <div className="tutor-select-name">{t.tutorName}</div>
                                                            {t.qualification && <div className="tutor-select-qual">🎓 {t.qualification}</div>}
                                                            <div className="tutor-select-stats">
                                                                <span style={{ color:'#f59e0b' }}>{renderStars(t.averageRating)}</span>
                                                                <span>{(t.averageRating||0).toFixed(1)}</span>
                                                                <span>·</span>
                                                                <span>{t.totalSessions||0} sessions</span>
                                                                {t.proficiencyLevel && <><span>·</span><span>Level {t.proficiencyLevel}/5</span></>}
                                                            </div>
                                                            {t.bio && <p className="tutor-select-bio">{t.bio.slice(0,80)}{t.bio.length>80?'…':''}</p>}
                                                        </div>
                                                        {selected && <div className="selected-check">✓ Preferred</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Preferences ── */}
                        <div className="form-section">
                            <h3>⚙️ Preferences</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Urgency Level</label>
                                    <div className="urgency-slider">
                                        <input type="range" name="urgencyLevel" min={1} max={5} value={formData.urgencyLevel} onChange={handleChange} />
                                        <div className="urgency-label">{urgencyLabels[formData.urgencyLevel]}</div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Preferred Date & Time (optional)</label>
                                    <input type="datetime-local" name="preferredDateTime" value={formData.preferredDateTime} onChange={handleChange} min={new Date().toISOString().slice(0,16)} />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate('/find-tutors')}>👨‍🏫 Browse Tutors</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Submitting...' : '🚀 Submit Request'}
                            </button>
                        </div>
                    </form>

                    <div className="peerhelp-tips">
                        <h3>💡 Tips for a great request</h3>
                        <ul>
                            <li>Be specific about what you don't understand</li>
                            <li>Mention any prior attempts or resources tried</li>
                            <li>Select a preferred tutor for faster matching</li>
                            <li>Higher urgency requests get prioritised</li>
                            <li>Include a deadline if you have one</li>
                        </ul>
                        <div className="quick-links">
                            <button onClick={() => navigate('/find-tutors')} className="quick-link-btn">👨‍🏫 Browse All Tutors</button>
                            <button onClick={() => navigate('/my-requests')} className="quick-link-btn" style={{ marginTop:'0.5rem' }}>📋 View My Requests</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestHelp;
