import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import ProfileGuard from '../../components/common/ProfileGuard';
import './StudentLectures.css';

const STATUS_FILTERS = ['All', 'Upcoming', 'Ongoing', 'Past'];

const getStatus = (lec) => {
    const now = new Date();
    const scheduled = new Date(lec.scheduledAt);
    const endTime = new Date(scheduled.getTime() + (lec.durationMinutes || 60) * 60000);
    if (now >= scheduled && now <= endTime) return 'ongoing';
    if (now > endTime) return 'past';
    return 'upcoming';
};

const StudentLectures = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchLectures();
    }, [navigate]);

    const fetchLectures = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/peerhelp/lectures');
            setLectures(res.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load lectures. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const filtered = lectures.filter(lec => {
        const matchesSearch =
            lec.title?.toLowerCase().includes(search.toLowerCase()) ||
            lec.tutorName?.toLowerCase().includes(search.toLowerCase()) ||
            lec.subjectName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'All' || getStatus(lec) === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const liveCount     = lectures.filter(l => getStatus(l) === 'ongoing').length;
    const upcomingCount = lectures.filter(l => getStatus(l) === 'upcoming').length;
    const pastCount     = lectures.filter(l => getStatus(l) === 'past').length;

    const statusLabel = { upcoming: 'Upcoming', ongoing: 'Live Now', past: 'Ended' };
    const statusClass = { upcoming: 'lec-badge--upcoming', ongoing: 'lec-badge--ongoing', past: 'lec-badge--past' };

    return (
        <ProfileGuard>
        <div className="dashboard">
            <StudentSidebar user={user} activeTab="lectures" />

            <div className="main-content peerhelp-main">

                {/* Page header */}
                <div className="page-header">
                    <div>
                        <h1>Lectures</h1>
                        <p className="page-subtitle">Browse and join available tutor-led sessions</p>
                    </div>
                    <button className="btn-secondary" onClick={fetchLectures} disabled={loading}>
                        {loading ? 'Refreshing…' : '↻ Refresh'}
                    </button>
                </div>

                {/* Summary strip */}
                <div className="lec-summary-strip">
                    <div className="lec-summary-item lec-summary--live">
                        <span className="lec-summary-val">{liveCount}</span>
                        <span className="lec-summary-lbl">Live Now</span>
                    </div>
                    <div className="lec-summary-item lec-summary--upcoming">
                        <span className="lec-summary-val">{upcomingCount}</span>
                        <span className="lec-summary-lbl">Upcoming</span>
                    </div>
                    <div className="lec-summary-item lec-summary--past">
                        <span className="lec-summary-val">{pastCount}</span>
                        <span className="lec-summary-lbl">Past</span>
                    </div>
                    <div className="lec-summary-item lec-summary--total">
                        <span className="lec-summary-val">{lectures.length}</span>
                        <span className="lec-summary-lbl">Total</span>
                    </div>
                </div>

                {/* Search bar */}
                <div className="tutor-search-bar">
                    <div className="search-row">
                        <input
                            type="text"
                            className="subject-select"
                            placeholder="Search by title, tutor, or subject…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="btn-secondary search-btn" onClick={() => setSearch('')}>
                                Clear
                            </button>
                        )}
                    </div>
                    {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
                </div>

                {/* Filter tabs */}
                <div className="filter-tabs">
                    {STATUS_FILTERS.map(opt => (
                        <button
                            key={opt}
                            className={`filter-tab ${statusFilter === opt ? 'active' : ''}`}
                            onClick={() => setStatusFilter(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading lectures…</p>
                    </div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🎓</div>
                        <h3>
                            {search || statusFilter !== 'All'
                                ? 'No lectures match your filters'
                                : 'No lectures available right now'}
                        </h3>
                        <p>
                            {search || statusFilter !== 'All'
                                ? 'Try adjusting your search or filter.'
                                : 'Check back later for upcoming sessions.'}
                        </p>
                        {(search || statusFilter !== 'All') && (
                            <button
                                className="btn-primary"
                                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Results */}
                {!loading && filtered.length > 0 && (
                    <>
                        <p className="results-count">
                            Showing <strong>{filtered.length}</strong> lecture{filtered.length !== 1 ? 's' : ''}
                            {statusFilter !== 'All' && <> · <strong>{statusFilter}</strong></>}
                            {search && <> matching "<strong>{search}</strong>"</>}
                        </p>

                        <div className="tutors-grid">
                            {filtered.map(lec => {
                                const st = getStatus(lec);
                                const scheduled = new Date(lec.scheduledAt);
                                return (
                                    <div key={lec.id} className="tutor-card">

                                        {/* Header */}
                                        <div className="tutor-card-header">
                                            <div className="tutor-avatar">
                                                {(lec.tutorName || 'L').charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--ph-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {lec.title}
                                                </h3>
                                                <span className="tutor-subject">{lec.subjectName || 'General'}</span>
                                            </div>
                                            <span className={`lec-status-badge ${statusClass[st]}`}>
                                                {st === 'ongoing' && <span className="lec-live-dot"></span>}
                                                {statusLabel[st]}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {lec.description && (
                                            <p className="tutor-bio">{lec.description}</p>
                                        )}

                                        {/* Stats */}
                                        <div className="tutor-stats">
                                            <div className="tutor-stat">
                                                <span className="stat-value" style={{ color: 'var(--ph-primary)', fontSize: '0.875rem' }}>
                                                    {lec.durationMinutes || 0} min
                                                </span>
                                                <span className="stat-label">Duration</span>
                                            </div>
                                            <div className="tutor-stat">
                                                <span className="stat-value" style={{ color: 'var(--ph-text)', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {lec.tutorName || 'N/A'}
                                                </span>
                                                <span className="stat-label">Tutor</span>
                                            </div>
                                            <div className="tutor-stat">
                                                <span className="stat-value" style={{ color: 'var(--ph-text)', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {scheduled.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="stat-label">
                                                    {scheduled.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Join button */}
                                        {lec.meetingLink && st !== 'past' && (
                                            <a
                                                href={lec.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`btn-primary w-full ${st === 'ongoing' ? 'lec-join-live' : ''}`}
                                                style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                                            >
                                                {st === 'ongoing' ? '● Join Now' : 'Join Lecture'}
                                            </a>
                                        )}

                                        {/* Card actions */}
                                        <div className="tutor-card-actions">
                                            <button
                                                className="btn-secondary w-full"
                                                onClick={() => navigate(`/dashboard/student/lectures/${lec.id}`)}
                                            >
                                                View Details
                                            </button>
                                            {st === 'past' && (
                                                <button className="btn-secondary w-full" disabled style={{ opacity: 0.5, cursor: 'default' }}>
                                                    Session Ended
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
        </ProfileGuard>
    );
};

export default StudentLectures;
