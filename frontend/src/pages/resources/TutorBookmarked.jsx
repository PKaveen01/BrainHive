import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import TutorLayout from '../user/TutorLayout';
import './BookMarked.css';

const typeIcon = { pdf: '📄', link: '🔗', doc: '📝', ppt: '📊', video: '🎥' };

export default function TutorBookmarked() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    const [rateModal, setRateModal] = useState({ show: false, resourceId: null, title: '' });
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [rateLoading, setRateLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        const init = async () => {
            let currentUser = authService.getCurrentUser();
            if (!currentUser) { navigate('/login'); return; }

            if (!currentUser.userId) {
                try {
                    const resp = await api.get('/auth/check');
                    if (resp.data?.userId) {
                        currentUser = { ...currentUser, userId: resp.data.userId };
                        localStorage.setItem('user', JSON.stringify(currentUser));
                    }
                } catch (e) {}
            }
            setUser(currentUser);
            fetchBookmarks(String(currentUser.userId));
        };
        init();
    }, [navigate]);

    const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
    const showError   = (msg) => { setError(msg);   setTimeout(() => setError(''),   4000); };
    const uid = () => user?.userId ? String(user.userId) : null;

    const fetchBookmarks = async (userIdParam) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/resources/bookmarks/${userIdParam}`);
            setBookmarks(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            if (e.response?.status === 404) setBookmarks([]);
            else showError('Failed to load bookmarks.');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (r) => {
        api.post(`/resources/${r.id}/view`).catch(() => {});
        const url = r.link || r.filePath;
        if (url) window.open(url, '_blank');
        else showError('No file or link for this resource.');
    };

    const handleDownload = (r) => {
        api.post(`/resources/${r.id}/download`).catch(() => {});
        const url = r.filePath || r.link;
        if (url) {
            const a = document.createElement('a');
            a.href = url; a.download = r.fileName || r.title; a.target = '_blank'; a.click();
        } else showError('No downloadable file available.');
    };

    const handleRemove = async (resourceId) => {
        setRemovingId(resourceId);
        try {
            await api.delete(`/resources/${resourceId}/bookmark/${uid()}`);
            setBookmarks(prev => prev.filter(r => r.id !== resourceId));
            showSuccess('Bookmark removed.');
        } catch {
            showError('Failed to remove bookmark.');
        } finally {
            setRemovingId(null);
        }
    };

    const handleRateSubmit = async () => {
        setRateLoading(true);
        try {
            await api.post(`/resources/${rateModal.resourceId}/rate`, { userId: uid(), rating, review });
            setRateModal({ show: false, resourceId: null, title: '' });
            setRating(5); setReview('');
            fetchBookmarks(uid());
            showSuccess('Rating submitted!');
        } catch {
            showError('Failed to submit rating.');
        } finally {
            setRateLoading(false);
        }
    };

    const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const fmtSize = (b) => { if (!b) return ''; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; };

    const filtered = bookmarks.filter(r =>
        !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <TutorLayout title="">
            <div className="bm-page-header">
                <div>
                    <h1>🔖 Bookmarked Resources</h1>
                    <p className="bm-page-subtitle">Resources you've saved to share with students</p>
                </div>
                <button className="bm-btn-primary" onClick={() => navigate('/dashboard/tutor/resources/discovery')}>
                    🔍 Discover More
                </button>
            </div>

            {success && (
                <div className="bm-alert bm-alert-success">
                    <span className="bm-alert-icon">✅</span>
                    <span>{success}</span>
                </div>
            )}
            {error && (
                <div className="bm-alert bm-alert-error">
                    <span className="bm-alert-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="bm-toolbar">
                <div className="bm-search-wrapper">
                    <span className="bm-search-icon">🔍</span>
                    <input
                        className="bm-search-input"
                        placeholder="Search bookmarks by title or subject..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="bm-count-badge">
                    <span className="bm-count-icon">🔖</span>
                    <span className="bm-count-text">{bookmarks.length} saved resource{bookmarks.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {loading && (
                <div className="bm-loading-state">
                    <div className="bm-spinner"></div>
                    <p>Loading your bookmarks...</p>
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="bm-empty-state">
                    <div className="bm-empty-icon">🔖</div>
                    <h3>{bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your search'}</h3>
                    <p>Browse the discovery page and bookmark resources you find useful for your students.</p>
                    <button className="bm-btn-primary" onClick={() => navigate('/dashboard/tutor/resources/discovery')}>
                        Discover Resources
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="bm-bookmarks-grid">
                    {filtered.map((r, idx) => (
                        <div key={r.id} className="bm-bookmark-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <div className="bm-card-header">
                                <div className="bm-title-section">
                                    <span className="bm-type-icon">{typeIcon[r.type?.toLowerCase()] || '📁'}</span>
                                    <div className="bm-title-info">
                                        <h3>{r.title}</h3>
                                        <div className="bm-badges-horizontal">
                                            {r.subject && <span className="bm-badge bm-badge-blue">{r.subject}</span>}
                                            {r.type && <span className="bm-badge bm-badge-purple">{r.type.toUpperCase()}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {r.description && <p className="bm-description">{r.description}</p>}

                            {r.tags && (
                                <div className="bm-tags-container">
                                    {r.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4).map(t => (
                                        <span key={t} className="bm-tag">#{t}</span>
                                    ))}
                                </div>
                            )}

                            <div className="bm-stats-section">
                                <div className="bm-rating-display">
                                    <span className="bm-stars">
                                        {[1,2,3,4,5].map(s => (
                                            <span
                                                key={s}
                                                className={`bm-star ${s <= Math.round(r.averageRating || 0) ? 'bm-star-filled' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </span>
                                    <span className="bm-rating-value">{(r.averageRating || 0).toFixed(1)}</span>
                                    <span className="bm-rating-count">({r.ratingCount || 0} reviews)</span>
                                </div>
                                <div className="bm-stat-item"><span>📅</span> {fmt(r.uploadedAt)}</div>
                                <div className="bm-stat-item"><span>👁</span> {r.viewCount || 0} views</div>
                                <div className="bm-stat-item"><span>⬇</span> {r.downloadCount || 0} downloads</div>
                            </div>

                            <div className="bm-actions-wrapper">
                                <div className="bm-actions-top-row">
                                    {r.filePath && (
                                        <button className="bm-btn-action bm-btn-download" onClick={() => handleDownload(r)}>
                                            ⬇ Download
                                        </button>
                                    )}
                                    <button className="bm-btn-action bm-btn-rate" onClick={() => setRateModal({ show: true, resourceId: r.id, title: r.title })}>
                                        ⭐ Rate
                                    </button>
                                    <button
                                        className="bm-btn-action bm-btn-remove"
                                        onClick={() => handleRemove(r.id)}
                                        disabled={removingId === r.id}
                                    >
                                        {removingId === r.id ? 'Removing...' : '🔖 Remove'}
                                    </button>
                                </div>
                                <button className="bm-btn-view-full" onClick={() => handleView(r)}>
                                    👁 View Full Resource
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rating Modal */}
            {rateModal.show && (
                <div className="bm-modal-overlay" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                    <div className="bm-modal" onClick={e => e.stopPropagation()}>
                        <div className="bm-modal-header">
                            <h3>⭐ Rate Resource</h3>
                            <button className="bm-modal-close" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                ×
                            </button>
                        </div>
                        <div className="bm-modal-body">
                            <p className="bm-modal-subtitle">{rateModal.title}</p>
                            <div className="bm-star-rating">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        className={`bm-star-btn ${s <= rating ? 'bm-star-filled' : ''}`}
                                        onClick={() => setRating(s)}
                                        onMouseEnter={() => setRating(s)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <p className="bm-rating-text">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>
                            <div className="bm-form-group">
                                <label>Review (optional)</label>
                                <textarea
                                    className="bm-form-textarea"
                                    value={review}
                                    onChange={e => setReview(e.target.value)}
                                    rows={3}
                                    placeholder="Share your thoughts about this resource..."
                                />
                            </div>
                        </div>
                        <div className="bm-modal-actions">
                            <button className="bm-btn-secondary" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                Cancel
                            </button>
                            <button className="bm-btn-primary" onClick={handleRateSubmit} disabled={rateLoading}>
                                {rateLoading ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TutorLayout>
    );
}
