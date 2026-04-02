import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import './ResourceDiscovery.css';

const relevanceMeta = {
    'weak-area':       { label: '🎯 Weak Area', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    'current-subject': { label: '📚 Your Subject', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    'general':         { label: '🌐 General', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }
};

const typeIcons = { pdf: '📄', link: '🔗', doc: '📝', ppt: '📊', video: '🎥' };

const ResourceDiscovery = () => {
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

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchResources();
        fetchBookmarks(currentUser.userId);
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

    // Collect unique subjects for filter
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
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>🔍 Resource Discovery</h1>
                        <p className="page-subtitle">Personalized resources ranked by your weak areas and current subjects</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/upload')}>+ Upload Resource</button>
                </div>

                {/* Personalization legend */}
                <div className="relevance-legend">
                    {Object.entries(relevanceMeta).map(([key, val]) => (
                        <div key={key} className="legend-item" style={{ background: val.bg, border: `1px solid ${val.border}`, color: val.color }}>
                            {val.label}
                        </div>
                    ))}
                    <span className="legend-note">Resources are ranked by your academic profile</span>
                </div>

                {/* Search & Filters */}
                <div className="discovery-filters">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search resources by title, topic, or tags..."
                        />
                        <button className="btn-primary" onClick={handleSearch}>Search</button>
                    </div>
                    <div className="filter-row">
                        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); fetchResources(search, e.target.value, typeFilter); }}>
                            <option value="">All Subjects</option>
                            {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); fetchResources(search, subjectFilter, e.target.value); }}>
                            <option value="">All Types</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{typeIcons[t] || '📁'} {t.toUpperCase()}</option>)}
                        </select>
                        <div className="relevance-filter-tabs">
                            {['ALL', 'weak-area', 'current-subject', 'general'].map(tag => (
                                <button
                                    key={tag}
                                    className={`filter-chip ${relevanceFilter === tag ? 'active' : ''}`}
                                    onClick={() => setRelevanceFilter(tag)}
                                >
                                    {tag === 'ALL' ? `All (${resources.length})` : relevanceMeta[tag]?.label + ` (${resources.filter(r => r.relevanceTag === tag).length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading && <div className="loading-state"><div className="spinner"></div><p>Loading personalized resources...</p></div>}
                {error && <div className="alert alert-error">⚠️ {typeof error === 'string' ? error : 'Error loading resources.'} <button onClick={() => fetchResources(search, subjectFilter, typeFilter)} className="retry-btn">Retry</button></div>}

                {!loading && !error && filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>No resources found</h3>
                        <p>Try adjusting your filters or be the first to upload a resource!</p>
                        <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Resource</button>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="resources-grid">
                        {filtered.map((r, idx) => {
                            const meta = relevanceMeta[r.relevanceTag] || relevanceMeta['general'];
                            const isBookmarked = bookmarkedIds.has(r.id);
                            const bookmarkBusy = bookmarkLoading.has(r.id);
                            return (
                                <div
                                    key={r.id}
                                    className="resource-card"
                                    style={{ borderTop: `3px solid ${meta.border}` }}
                                >
                                    {/* Top row: rank + relevance badge */}
                                    <div className="resource-card-top">
                                        <span className="resource-rank">#{idx + 1}</span>
                                        <span className="relevance-badge" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                                            {meta.label}
                                        </span>
                                        <button
                                            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                                            onClick={() => handleBookmark(r.id)}
                                            disabled={bookmarkBusy}
                                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                                        >
                                            {isBookmarked ? '🔖' : '☆'}
                                        </button>
                                    </div>

                                    {/* Title + type */}
                                    <div className="resource-title-row">
                                        <span className="type-icon">{typeIcons[r.type?.toLowerCase()] || '📁'}</span>
                                        <h3 className="resource-title">{r.title}</h3>
                                    </div>

                                    {/* Metadata badges */}
                                    <div className="resource-badges">
                                        {r.subject && <span className="badge badge-blue">{r.subject}</span>}
                                        {r.semester && <span className="badge badge-gray">{r.semester}</span>}
                                        {r.type && <span className="badge badge-purple">{r.type.toUpperCase()}</span>}
                                        {r.fileSize && <span className="badge badge-gray">{fileSize(r.fileSize)}</span>}
                                    </div>

                                    {r.description && <p className="resource-desc">{r.description}</p>}

                                    {r.tags && (
                                        <div className="resource-tags">
                                            {r.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4).map(t => (
                                                <span key={t} className="tag">#{t}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="resource-stats">
                                        <span>⭐ {(r.averageRating || 0).toFixed(1)} ({r.ratingCount || 0})</span>
                                        <span>👁 {r.viewCount || 0}</span>
                                        <span>⬇ {r.downloadCount || 0}</span>
                                        <span>📅 {fmt(r.uploadedAt)}</span>
                                    </div>

                                    <div className="resource-uploader">
                                        <span className="uploader-avatar">{(r.uploaderName || '?').charAt(0).toUpperCase()}</span>
                                        <span>{r.uploaderName || 'Unknown'}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="resource-actions">
                                        {r.link ? (
                                            <a
                                                href={r.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-primary btn-sm"
                                                onClick={() => handleView(r.id)}
                                            >
                                                🔗 Open Link
                                            </a>
                                        ) : r.filePath ? (
                                            <a
                                                href={r.filePath}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-primary btn-sm"
                                                onClick={() => handleView(r.id)}
                                            >
                                                ⬇ View / Download
                                            </a>
                                        ) : (
                                            <span className="no-file">No file attached</span>
                                        )}
                                        <button
                                            className="btn-report"
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
                    <div className="modal-overlay" onClick={() => setReportModal({ show: false, resourceId: null })}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>🚩 Report Resource</h3>
                            <div className="form-group">
                                <label>Reason</label>
                                <select value={reportReason} onChange={e => setReportReason(e.target.value)}>
                                    <option value="">Select reason...</option>
                                    <option value="Inappropriate content">Inappropriate content</option>
                                    <option value="Copyright violation">Copyright violation</option>
                                    <option value="Spam or misleading">Spam or misleading</option>
                                    <option value="Incorrect information">Incorrect information</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setReportModal({ show: false, resourceId: null })}>Cancel</button>
                                <button className="btn-primary" onClick={handleReport} disabled={reportLoading}>
                                    {reportLoading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceDiscovery;
