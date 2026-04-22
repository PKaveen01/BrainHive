import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';

const formatDT = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleString();
};

const EMPTY_FORM = { subjectId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' };

const TutorLecturesPage = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    const fetchData = useCallback(async () => {
        try {
            const [lectRes, subRes] = await Promise.allSettled([
                api.get('/peerhelp/lectures/my'),
                api.get('/peerhelp/subjects'),
            ]);
            if (lectRes.status === 'fulfilled') {
                setLectures((lectRes.value.data?.data || []).map(l => ({
                    id: l.id, title: l.title, subjectName: l.subjectName,
                    description: l.description, scheduledAt: formatDT(l.scheduledAt),
                    durationMinutes: l.durationMinutes, meetingLink: l.meetingLink,
                })));
            }
            if (subRes.status === 'fulfilled') setSubjects(subRes.value.data?.data || []);
            if (lectRes.status === 'rejected' && lectRes.reason?.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const validate = () => {
        const errs = {};
        if (!form.subjectId) errs.subjectId = 'Subject is required';
        if (!form.title.trim()) errs.title = 'Title is required';
        else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
        if (!form.description.trim()) errs.description = 'Description is required';
        else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
        if (!form.scheduledAt) errs.scheduledAt = 'Date and time is required';
        else if (new Date(form.scheduledAt) <= new Date()) errs.scheduledAt = 'Must be in the future';
        const dur = Number(form.durationMinutes);
        if (!dur || isNaN(dur) || dur < 15 || dur > 240) errs.durationMinutes = 'Duration must be 15–240 minutes';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSubmitting(true);
            setMessage('');
            await api.post('/peerhelp/lectures', {
                subjectId: Number(form.subjectId),
                title: form.title.trim(),
                description: form.description.trim(),
                scheduledAt: form.scheduledAt,
                durationMinutes: Number(form.durationMinutes),
                meetingLink: form.meetingLink.trim() || null,
            });
            setMessage('✅ Lecture created successfully!');
            setMessageType('success');
            setForm(EMPTY_FORM);
            fetchData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create lecture.');
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    };

    const set = (field) => (e) => {
        setForm(p => ({ ...p, [field]: e.target.value }));
        if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
        if (message) setMessage('');
    };

    return (
        <TutorLayout title="🎓 Lectures">
            {message && (
                <div className={`profile-alert profile-alert-${messageType}`} style={{ marginBottom: '1rem' }}>
                    {message}
                </div>
            )}

            <div className="dashboard-grid lecture-layout-grid">
                {/* Create form */}
                <div className="dashboard-card lecture-create-card">
                    <div className="card-header"><h2>Create New Lecture</h2></div>
                    <form className="lecture-form lecture-form-updated" onSubmit={handleSubmit}>
                        <div className="lecture-field">
                            <label className="lecture-label">Subject *</label>
                            <select
                                value={form.subjectId}
                                onChange={set('subjectId')}
                                style={{ fontSize: '0.92rem', minHeight: '40px' }}
                            >
                                <option value="">Select subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.subjectId && <p className="form-error">{errors.subjectId}</p>}
                        </div>

                        <div className="lecture-field">
                            <label className="lecture-label">Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={set('title')}
                                placeholder="Enter lecture title (e.g. Introduction to Binary Trees)"
                                style={{ fontSize: '0.92rem', minHeight: '40px' }}
                            />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>

                        <div className="lecture-field">
                            <label className="lecture-label">Description *</label>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={set('description')}
                                placeholder="Write what students will learn, key topics, and outcomes"
                                style={{ fontSize: '0.92rem', minHeight: '92px' }}
                            />
                            {errors.description && <p className="form-error">{errors.description}</p>}
                        </div>

                        <div className="lecture-field">
                            <label className="lecture-label">Date & Time *</label>
                            <input
                                type="datetime-local"
                                value={form.scheduledAt}
                                onChange={set('scheduledAt')}
                                style={{ fontSize: '0.92rem', minHeight: '40px' }}
                            />
                            {errors.scheduledAt && <p className="form-error">{errors.scheduledAt}</p>}
                        </div>

                        <div className="lecture-field">
                            <label className="lecture-label">Duration (minutes) *</label>
                            <input
                                type="number"
                                min="15"
                                max="240"
                                value={form.durationMinutes}
                                onChange={set('durationMinutes')}
                                placeholder="60"
                                style={{ fontSize: '0.92rem', minHeight: '40px' }}
                            />
                            <small className="header-subtitle" style={{ marginTop: '-2px' }}>
                                Recommended: 45 to 90 minutes
                            </small>
                            {errors.durationMinutes && <p className="form-error">{errors.durationMinutes}</p>}
                        </div>

                        <div className="lecture-field">
                            <label className="lecture-label">Meeting Link (optional)</label>
                            <input
                                type="url"
                                value={form.meetingLink}
                                onChange={set('meetingLink')}
                                placeholder="Paste Google Meet / Zoom link"
                                style={{ fontSize: '0.92rem', minHeight: '40px' }}
                            />
                            {errors.meetingLink && <p className="form-error">{errors.meetingLink}</p>}
                        </div>

                        <button type="submit" className="btn-save lecture-submit-btn" disabled={submitting}>
                            {submitting ? 'Creating...' : '+ Create Lecture'}
                        </button>
                    </form>
                </div>

                {/* My lectures list */}
                <div className="dashboard-card lecture-list-card">
                    <div className="card-header">
                        <h2>All Lectures ({lectures.length})</h2>
                        <button className="view-all" onClick={fetchData} disabled={loading}>↻ Refresh</button>
                    </div>
                    <div className="card-content lecture-list-content">
                        {loading && <p className="header-subtitle">Loading lectures...</p>}
                        {!loading && lectures.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                                <p className="header-subtitle">You haven't created any lectures yet.</p>
                            </div>
                        )}
                        {lectures.map((lec) => (
                            <article key={lec.id} className="session-item lecture-item-updated">
                                <div className="lecture-item-top">
                                    <h3>{lec.title}</h3>
                                    <span className="lecture-subject-chip">{lec.subjectName || 'General'}</span>
                                </div>
                                <p className="lecture-description-text">{lec.description || 'No description provided.'}</p>
                                <div className="lecture-meta-row">
                                    <span className="session-time">{lec.scheduledAt}</span>
                                    <span className="lecture-duration-chip">{lec.durationMinutes} min</span>
                                </div>
                                {lec.meetingLink && (
                                    <a href={lec.meetingLink} target="_blank" rel="noreferrer"
                                        className="join-link lecture-join-link">
                                        Join meeting
                                    </a>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </TutorLayout>
    );
};

export default TutorLecturesPage;
