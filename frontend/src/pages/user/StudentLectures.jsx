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
                    <div className="lec-summary-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="lec-summary-lbl">Live Now</span>
                            <div style={{ padding: '0.5rem', background: '#fee2e2', borderRadius: '0.75rem', color: '#ef4444' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.5v-1z"></path><rect x="2" y="5" width="14" height="14" rx="2" ry="2"></rect></svg>
                            </div>
                        </div>
                        <span className="lec-summary-val">{liveCount}</span>
                    </div>
                    <div className="lec-summary-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="lec-summary-lbl">Upcoming</span>
                            <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '0.75rem', color: '#3b82f6' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </div>
                        </div>
                        <span className="lec-summary-val">{upcomingCount}</span>
                    </div>
                    <div className="lec-summary-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="lec-summary-lbl">Completed</span>
                            <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '0.75rem', color: '#64748b' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                        </div>
                        <span className="lec-summary-val">{pastCount}</span>
                    </div>
                    <div className="lec-summary-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="lec-summary-lbl">Total Sessions</span>
                            <div style={{ padding: '0.5rem', background: '#f0fdf4', borderRadius: '0.75rem', color: '#10b981' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            </div>
                        </div>
                        <span className="lec-summary-val">{lectures.length}</span>
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

                                        {/* Status Badge */}
                                        <span className={`lec-status-badge ${statusClass[st]}`}>
                                            {st === 'ongoing' && <span className="lec-live-dot"></span>}
                                            {statusLabel[st]}
                                        </span>

                                        {/* Header */}
                                        <div className="tutor-card-header">
                                            <div className="tutor-avatar">
                                                {(lec.tutorName || 'L').charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span className="tutor-subject">{lec.subjectName || 'General'}</span>
                                                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ph-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {lec.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {lec.description && (
                                            <p className="tutor-bio">{lec.description}</p>
                                        )}

                                        {/* Stats Section */}
                                        <div className="tutor-stats">
                                            <div className="tutor-stat">
                                                <span className="stat-label">Duration</span>
                                                <span className="stat-value" style={{ color: 'var(--ph-primary)' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                    {lec.durationMinutes || 0}m
                                                </span>
                                            </div>
                                            <div className="tutor-stat">
                                                <span className="stat-label">Tutor</span>
                                                <span className="stat-value">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                    {lec.tutorName || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="tutor-stat">
                                                <span className="stat-label">{scheduled.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className="stat-value">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                    {scheduled.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card actions */}
                                        <div className="tutor-card-actions">
                                            {lec.meetingLink && st !== 'past' ? (
                                                <a
                                                    href={lec.meetingLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`btn-primary w-full ${st === 'ongoing' ? 'lec-join-live' : ''}`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    {st === 'ongoing' ? 'Join Live' : 'Join'}
                                                </a>
                                            ) : (
                                                <button
                                                    className="btn-primary w-full"
                                                    onClick={() => navigate(`/dashboard/student/lectures/${lec.id}`)}
                                                >
                                                    Details
                                                </button>
                                            )}

                                            {st !== 'past' && lec.meetingLink && (
                                                <button
                                                    className="btn-secondary"
                                                    style={{ minWidth: '44px', padding: '0.75rem' }}
                                                    onClick={() => navigate(`/dashboard/student/lectures/${lec.id}`)}
                                                    title="View Details"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                </button>
                                            )}

                                            {st === 'past' && (
                                                <button className="btn-secondary w-full" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                                    Ended
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
