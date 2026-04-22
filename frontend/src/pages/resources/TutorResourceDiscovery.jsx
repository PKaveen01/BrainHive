import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import TutorLayout from '../user/TutorLayout';
import './ResourceDiscovery.css';

const relevanceMeta = {
    'weak-area':       { label: '🎯 Weak Area', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    'current-subject': { label: '📚 Your Subject', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    'general':         { label: '🌐 General', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }
};

const typeIcons = { pdf: '📄', link: '🔗', doc: '📝', ppt: '📊', video: '🎥' };

const TutorResourceDiscovery = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [relevanceFilter, setRelevanceFilter] = useState('ALL');
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [bookmarkLoading, setBookmarkLoading] = useState(new Set());
    const [reportModal, setReportModal] = useState({ show: false, resourceId: null });
    const [reportReason, setReportReason] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const [rateModal, setRateModal] = useState({ show: false, resourceId: null, title: '' });
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [rateLoading, setRateLoading] = useState(false);
    const [userRatings, setUserRatings] = useState(new Map());

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchResources();
        fetchBookmarks(currentUser.userId);
        fetchUserRatings(currentUser.userId);
    }, [navigate]);

    const fetchResources = useCallback(async (q = '', subj = '', type = '') => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (q) params.set('query', q);
            if (subj) params.set('subject', subj);
            if (type) params.set('type', type);
            const res = await api.get(`/resources/discovery?${params.toString()}`);
            setResources(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err.response?.data || 'Failed to load resources.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBookmarks = async (userId) => {
        if (!userId) return;
        try {
            const res = await api.get(`/resources/bookmarks/${userId}`);
            const ids = (res.data || []).map(r => r.id);
            setBookmarkedIds(new Set(ids));
        } catch { /* ignore */ }
    };

    const fetchUserRatings = async (userId) => {
        if (!userId) return;
        try {
            const res = await api.get(`/resources/user/${userId}/ratings`);
            const ratingsMap = new Map();
            (res.data || []).forEach(r => ratingsMap.set(r.resourceId, r.rating));
            setUserRatings(ratingsMap);
        } catch { /* ignore */ }
    };

    const handleSearch = () => fetchResources(search, subjectFilter, typeFilter);
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

    const handleBookmark = async (resourceId) => {
        const userId = user?.userId;
        if (!userId) return;
        setBookmarkLoading(prev => new Set([...prev, resourceId]));
        try {
            const isBookmarked = bookmarkedIds.has(resourceId);
            if (isBookmarked) {
                await api.delete(`/resources/${resourceId}/bookmark/${userId}`);
                setBookmarkedIds(prev => { const s = new Set(prev); s.delete(resourceId); return s; });
            } else {
                await api.post(`/resources/${resourceId}/bookmark/${userId}`);
                setBookmarkedIds(prev => new Set([...prev, resourceId]));
            }
        } catch { /* ignore */ }
        setBookmarkLoading(prev => { const s = new Set(prev); s.delete(resourceId); return s; });
    };

    const handleReport = async () => {
        if (!reportReason.trim()) { alert('Please enter a reason.'); return; }
        setReportLoading(true);
        try {
            await api.post(`/resources/${reportModal.resourceId}/report`, {
                userId: String(user?.userId),
                reason: reportReason,
                description: reportReason
            });
            setReportModal({ show: false, resourceId: null });
            setReportReason('');
            alert('Report submitted. Our moderators will review it.');
        } catch { alert('Failed to submit report.'); }
        setReportLoading(false);
    };

    const handleView = (resourceId) => {
        api.post(`/resources/${resourceId}/view`).catch(() => {});
    };

    const handleRateSubmit = async () => {
        setRateLoading(true);
        try {
            await api.post(`/resources/${rateModal.resourceId}/rate`, {
                userId: String(user?.userId),
                rating,
                review
            });
            await fetchResources(search, subjectFilter, typeFilter);
            await fetchUserRatings(user?.userId);
            setRateModal({ show: false, resourceId: null, title: '' });
            setRating(5);
            setReview('');
            alert('Rating submitted successfully!');
        } catch {
            alert('Failed to submit rating.');
        } finally {
            setRateLoading(false);
        }
    };

    const uniqueSubjects = [...new Set(resources.map(r => r.subject).filter(Boolean))].sort();
    const uniqueTypes = [...new Set(resources.map(r => r.type).filter(Boolean))].sort();

    const filtered = relevanceFilter === 'ALL'
        ? resources
        : resources.filter(r => r.relevanceTag === relevanceFilter);

    const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const fileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <TutorLayout title="">
            <div className="rds-page-header">
                <div>
                    <h1>🔍 Resource Discovery</h1>
                    <p className="rds-page-subtitle">Browse and bookmark resources to share with your students</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="rds-btn-primary" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }} onClick={() => navigate('/dashboard/tutor/resources/bookmarked')}>
                        🔖 My Bookmarks
                    </button>
                    <button className="rds-btn-primary" onClick={() => navigate('/upload')}>
                        + Upload Resource
                    </button>
                </div>
            </div>

            {/* Personalization legend */}
            <div className="rds-relevance-legend">
                {Object.entries(relevanceMeta).map(([key, val]) => (
                    <div
                        key={key}
                        className="rds-legend-item"
                        style={{ background: val.bg, border: `1px solid ${val.border}`, color: val.color }}
                    >
                        {val.label}
                    </div>
                ))}
                <span className="rds-legend-note">Resources are ranked by subject relevance</span>
            </div>

            {/* Search & Filters */}
            <div className="rds-discovery-filters">
                <div className="rds-search-bar">
                    <span className="rds-search-icon">🔍</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search resources by title, topic, or tags..."
                    />
                    <button className="rds-btn-primary rds-btn-sm" onClick={handleSearch}>
                        Search
                    </button>
                </div>
                <div className="rds-filter-row">
                    <select
                        className="rds-filter-select"
                        value={subjectFilter}
                        onChange={e => { setSubjectFilter(e.target.value); fetchResources(search, e.target.value, typeFilter); }}
                    >
                        <option value="">All Subjects</option>
                        {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        className="rds-filter-select"
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); fetchResources(search, subjectFilter, e.target.value); }}
                    >
                        <option value="">All Types</option>
                        {uniqueTypes.map(t => <option key={t} value={t}>{typeIcons[t] || '📁'} {t.toUpperCase()}</option>)}
                    </select>
                    <div className="rds-relevance-filter-tabs">
                        {['ALL', 'weak-area', 'current-subject', 'general'].map(tag => (
                            <button
                                key={tag}
                                className={`rds-filter-chip ${relevanceFilter === tag ? 'rds-filter-chip-active' : ''}`}
                                onClick={() => setRelevanceFilter(tag)}
                            >
                                {tag === 'ALL' ? `All (${resources.length})` : relevanceMeta[tag]?.label + ` (${resources.filter(r => r.relevanceTag === tag).length})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="rds-loading-state">
                    <div className="rds-spinner"></div>
                    <p>Loading resources...</p>
                </div>
            )}

            {error && (
                <div className="rds-alert rds-alert-error">
                    ⚠️ {typeof error === 'string' ? error : 'Error loading resources.'}
                    <button onClick={() => fetchResources(search, subjectFilter, typeFilter)} className="rds-retry-btn">
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="rds-empty-state">
                    <div className="rds-empty-icon">📚</div>
                    <h3>No resources found</h3>
                    <p>Try adjusting your filters or be the first to upload a resource!</p>
                    <button className="rds-btn-primary" onClick={() => navigate('/upload')}>
                        Upload Resource
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="rds-resources-grid">
                    {filtered.map((r, idx) => {
                        const meta = relevanceMeta[r.relevanceTag] || relevanceMeta['general'];
                        const isBookmarked = bookmarkedIds.has(r.id);
                        const bookmarkBusy = bookmarkLoading.has(r.id);
                        const userRating = userRatings.get(r.id);
                        return (
                            <div
                                key={r.id}
                                className="rds-resource-card"
                                style={{ borderTop: `3px solid ${meta.border}` }}
                            >
                                <div className="rds-card-top">
                                    <span className="rds-resource-rank">#{idx + 1}</span>
                                    <span
                                        className="rds-relevance-badge"
                                        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                                    >
                                        {meta.label}
                                    </span>
                                    <button
                                        className={`rds-bookmark-btn ${isBookmarked ? 'rds-bookmark-active' : ''}`}
                                        onClick={() => handleBookmark(r.id)}
                                        disabled={bookmarkBusy}
                                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                                    >
                                        {isBookmarked ? '🔖' : '☆'}
                                    </button>
                                </div>

                                <div className="rds-title-row">
                                    <span className="rds-type-icon">{typeIcons[r.type?.toLowerCase()] || '📁'}</span>
                                    <h3 className="rds-resource-title">{r.title}</h3>
                                </div>

                                <div className="rds-badges-container">
                                    {r.subject && <span className="rds-badge rds-badge-blue">{r.subject}</span>}
                                    {r.semester && <span className="rds-badge rds-badge-gray">{r.semester}</span>}
                                    {r.type && <span className="rds-badge rds-badge-purple">{r.type.toUpperCase()}</span>}
                                    {r.fileSize && <span className="rds-badge rds-badge-gray">{fileSize(r.fileSize)}</span>}
                                </div>

                                {r.description && <p className="rds-resource-desc">{r.description}</p>}

                                {r.tags && (
                                    <div className="rds-tags-container">
                                        {r.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4).map(t => (
                                            <span key={t} className="rds-tag">#{t}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="rds-stats-section">
                                    <div className="rds-rating-display">
                                        <span className="rds-stars">
                                            {[1,2,3,4,5].map(s => (
                                                <span
                                                    key={s}
                                                    className={`rds-star ${s <= Math.round(r.averageRating || 0) ? 'rds-star-filled' : ''}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </span>
                                        <span className="rds-rating-value">{(r.averageRating || 0).toFixed(1)}</span>
                                        <span className="rds-rating-count">({r.ratingCount || 0} reviews)</span>
                                    </div>
                                    <div className="rds-stat-item"><span>👁</span> {r.viewCount || 0}</div>
                                    <div className="rds-stat-item"><span>⬇</span> {r.downloadCount || 0}</div>
                                    <div className="rds-stat-item"><span>📅</span> {fmt(r.uploadedAt)}</div>
                                </div>

                                <div className="rds-actions-section">
                                    {r.link ? (
                                        <a
                                            href={r.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rds-btn-primary rds-btn-sm"
                                            onClick={() => handleView(r.id)}
                                        >
                                            🔗 Open Link
                                        </a>
                                    ) : r.filePath ? (
                                        <a
                                            href={r.filePath}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rds-btn-primary rds-btn-sm"
                                            onClick={() => handleView(r.id)}
                                        >
                                            ⬇ View / Download
                                        </a>
                                    ) : (
                                        <span className="rds-no-file">No file attached</span>
                                    )}
                                    <button
                                        className="rds-btn-rate"
                                        onClick={() => setRateModal({ show: true, resourceId: r.id, title: r.title })}
                                    >
                                        {userRating ? '⭐ Edit Rating' : '⭐ Rate'}
                                    </button>
                                    <button
                                        className="rds-btn-report"
                                        onClick={() => setReportModal({ show: true, resourceId: r.id })}
                                    >
                                        🚩 Report
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Report Modal */}
            {reportModal.show && (
                <div className="rds-modal-overlay" onClick={() => setReportModal({ show: false, resourceId: null })}>
                    <div className="rds-modal" onClick={e => e.stopPropagation()}>
                        <h3>🚩 Report Resource</h3>
                        <div className="rds-form-group">
                            <label>Reason</label>
                            <select
                                className="rds-form-select"
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                            >
                                <option value="">Select reason...</option>
                                <option value="Inappropriate content">Inappropriate content</option>
                                <option value="Copyright violation">Copyright violation</option>
                                <option value="Spam or misleading">Spam or misleading</option>
                                <option value="Incorrect information">Incorrect information</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="rds-modal-actions">
                            <button className="rds-btn-secondary" onClick={() => setReportModal({ show: false, resourceId: null })}>
                                Cancel
                            </button>
                            <button className="rds-btn-primary" onClick={handleReport} disabled={reportLoading}>
                                {reportLoading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {rateModal.show && (
                <div className="rds-modal-overlay" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                    <div className="rds-modal" onClick={e => e.stopPropagation()}>
                        <h3>⭐ Rate Resource</h3>
                        <p className="rds-modal-subtitle">{rateModal.title}</p>
                        <div className="rds-star-rating">
                            {[1,2,3,4,5].map(s => (
                                <button
                                    key={s}
                                    className={`rds-star-btn ${s <= rating ? 'rds-star-filled' : ''}`}
                                    onClick={() => setRating(s)}
                                    onMouseEnter={() => setRating(s)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="rds-rating-label">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>
                        <div className="rds-form-group">
                            <label>Review (optional)</label>
                            <textarea
                                className="rds-form-textarea"
                                value={review}
                                onChange={e => setReview(e.target.value)}
                                rows={3}
                                placeholder="Share your thoughts about this resource..."
                            />
                        </div>
                        <div className="rds-modal-actions">
                            <button className="rds-btn-secondary" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                Cancel
                            </button>
                            <button className="rds-btn-primary" onClick={handleRateSubmit} disabled={rateLoading}>
                                {rateLoading ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TutorLayout>
    );
};

export default TutorResourceDiscovery;
