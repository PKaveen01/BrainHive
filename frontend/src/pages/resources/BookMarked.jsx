import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import './BookMarked.css';

const typeIcon = { pdf:'fileText', link:'link', doc:'fileEdit', ppt:'presentation', video:'video' };

function BmIcon({ name, className = '', size = 18, filled = false }) {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className
    };

    switch (name) {
        case 'bookmark':
            return (
                <svg {...props}>
                    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                </svg>
            );
        case 'search':
            return (
                <svg {...props}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
            );
        case 'fileText':
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                </svg>
            );
        case 'link':
            return (
                <svg {...props}>
                    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
                    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 20" />
                </svg>
            );
        case 'fileEdit':
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M10 13l5-5 2 2-5 5-3 1z" />
                </svg>
            );
        case 'presentation':
            return (
                <svg {...props}>
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M8 20h8" />
                    <path d="M12 16v4" />
                    <path d="M8 10l2-2 2 2 3-3 2 2" />
                </svg>
            );
        case 'video':
            return (
                <svg {...props}>
                    <rect x="3" y="6" width="15" height="12" rx="2" />
                    <path d="M18 10l3-2v8l-3-2z" />
                </svg>
            );
        case 'archive':
            return (
                <svg {...props}>
                    <rect x="3" y="4" width="18" height="4" rx="1" />
                    <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                    <path d="M10 12h4" />
                </svg>
            );
        case 'check':
            return (
                <svg {...props}>
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            );
        case 'alertTriangle':
            return (
                <svg {...props}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                </svg>
            );
        case 'calendar':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4" />
                    <path d="M8 3v4" />
                    <path d="M3 10h18" />
                </svg>
            );
        case 'eye':
            return (
                <svg {...props}>
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        case 'download':
            return (
                <svg {...props}>
                    <path d="M12 3v12" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M5 21h14" />
                </svg>
            );
        case 'star':
            return (
                <svg {...props}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        case 'x':
            return (
                <svg {...props}>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                </svg>
            );
        case 'sparkles':
            return (
                <svg {...props}>
                    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
                    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
                    <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />
                </svg>
            );
        default:
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
    }
}

export default function BookMarked() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    // Rate modal
    const [rateModal, setRateModal] = useState({ show: false, resourceId: null, title: '' });
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [rateLoading, setRateLoading] = useState(false);

    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        const init = async () => {
            let currentUser = authService.getCurrentUser();
            if (!currentUser) { navigate('/login'); return; }

            // Ensure userId is populated
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

    // ── View ──
    const handleView = (r) => {
        api.post(`/resources/${r.id}/view`).catch(() => {});
        const url = r.link || r.filePath;
        if (url) window.open(url, '_blank');
        else showError('No file or link for this resource.');
    };

    // ── Download ──
    const handleDownload = (r) => {
        api.post(`/resources/${r.id}/download`).catch(() => {});
        const url = r.filePath || r.link;
        if (url) {
            const a = document.createElement('a');
            a.href = url; a.download = r.fileName || r.title; a.target = '_blank'; a.click();
        } else showError('No downloadable file available.');
    };

    // ── Remove Bookmark ──
    const handleRemove = async (resourceId) => {
        setRemovingId(resourceId);
        try {
            await api.delete(`/resources/${resourceId}/bookmark/${uid()}`);
            setBookmarks(prev => prev.filter(r => r.id !== resourceId));
            showSuccess('Bookmark removed.');
        } catch (e) {
            showError('Failed to remove bookmark.');
        } finally {
            setRemovingId(null);
        }
    };

    // ── Rate ──
    const handleRateSubmit = async () => {
        setRateLoading(true);
        try {
            await api.post(`/resources/${rateModal.resourceId}/rate`, { userId: uid(), rating, review });
            setRateModal({ show: false, resourceId: null, title: '' });
            setRating(5); setReview('');
            fetchBookmarks(uid());
            showSuccess('Rating submitted!');
        } catch (e) {
            showError('Failed to submit rating.');
        } finally {
            setRateLoading(false);
        }
    };

    const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
    const fmtSize = (b) => { if (!b) return ''; if (b < 1024) return b+' B'; if (b < 1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB'; };

    const filtered = bookmarks.filter(r =>
        !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content">
                <div className="bm-page-header">
                    <div className="bm-page-header-left">
                        <div className="bm-title-wrap">
                            <span className="bm-title-icon"><BmIcon name="bookmark" size={22} /></span>
                            <div>
                                <h1>Bookmarked Resources</h1>
                                <p className="bm-page-subtitle">Resources you&apos;ve saved for later</p>
                            </div>
                        </div>
                    </div>
                    <button className="bm-btn-primary" onClick={() => navigate('/resources/discovery')}>
                        <BmIcon name="sparkles" size={16} />
                        <span>Discover More</span>
                    </button>
                </div>

                {/* Alert Messages */}
                {success && (
                    <div className="bm-alert bm-alert-success">
                        <span className="bm-alert-icon"><BmIcon name="check" size={18} /></span>
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="bm-alert bm-alert-error">
                        <span className="bm-alert-icon"><BmIcon name="alertTriangle" size={18} /></span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Toolbar */}
                <div className="bm-toolbar">
                    <div className="bm-search-wrapper">
                        <span className="bm-search-icon"><BmIcon name="search" size={16} /></span>
                        <input 
                            className="bm-search-input" 
                            placeholder="Search bookmarks by title or subject..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className="bm-count-badge">
                        <span className="bm-count-icon"><BmIcon name="bookmark" size={16} /></span>
                        <span className="bm-count-text">{bookmarks.length} saved resource{bookmarks.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bm-loading-state">
                        <div className="bm-spinner"></div>
                        <p>Loading your bookmarks...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filtered.length === 0 && (
                    <div className="bm-empty-state">
                        <div className="bm-empty-icon"><BmIcon name="bookmark" size={42} /></div>
                        <h3>{bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks match your search"}</h3>
                        <p>Browse the discovery page and bookmark resources you find useful.</p>
                        <button className="bm-btn-primary" onClick={() => navigate('/resources/discovery')}>
                            <BmIcon name="sparkles" size={16} />
                            <span>Discover Resources</span>
                        </button>
                    </div>
                )}

                {/* Bookmarks Grid */}
                {!loading && filtered.length > 0 && (
                    <div className="bm-bookmarks-grid">
                        {filtered.map((r, idx) => (
                            <div key={r.id} className="bm-bookmark-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="bm-card-header">
                                    <div className="bm-title-section">
                                        <span className="bm-type-icon"><BmIcon name={typeIcon[r.type?.toLowerCase()] || 'archive'} size={20} /></span>
                                        <div className="bm-title-info">
                                            <h3>{r.title}</h3>
                                            <div className="bm-badges-horizontal">
                                                {r.subject && <span className="bm-badge bm-badge-blue">{r.subject}</span>}
                                                {r.type && <span className="bm-badge bm-badge-purple">{r.type.toUpperCase()}</span>}
                                                {r.fileSize && <span className="bm-badge bm-badge-gray">{fmtSize(r.fileSize)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {r.description && (
                                    <p className="bm-description">{r.description}</p>
                                )}

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
                                    <div className="bm-stat-item">
                                        <span className="bm-stat-icon"><BmIcon name="calendar" size={14} /></span>
                                        <span>{fmt(r.uploadedAt)}</span>
                                    </div>
                                    <div className="bm-stat-item">
                                        <span className="bm-stat-icon"><BmIcon name="eye" size={14} /></span>
                                        <span>{r.viewCount || 0} views</span>
                                    </div>
                                    <div className="bm-stat-item">
                                        <span className="bm-stat-icon"><BmIcon name="download" size={14} /></span>
                                        <span>{r.downloadCount || 0} downloads</span>
                                    </div>
                                </div>

                                <div className="bm-actions-wrapper">
                                    <div className="bm-actions-top-row">
                                        {r.filePath && (
                                            <button className="bm-btn-action bm-btn-download" onClick={() => handleDownload(r)}>
                                                <BmIcon name="download" size={14} />
                                                <span>Download</span>
                                            </button>
                                        )}
                                        <button className="bm-btn-action bm-btn-rate" onClick={() => setRateModal({ show: true, resourceId: r.id, title: r.title })}>
                                            <BmIcon name="star" size={14} />
                                            <span>Rate</span>
                                        </button>
                                        <button 
                                            className="bm-btn-action bm-btn-remove" 
                                            onClick={() => handleRemove(r.id)} 
                                            disabled={removingId === r.id}
                                        >
                                            {removingId === r.id ? (
                                                'Removing...'
                                            ) : (
                                                <>
                                                    <BmIcon name="bookmark" size={14} />
                                                    <span>Remove</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <button className="bm-btn-view-full" onClick={() => handleView(r)}>
                                        <BmIcon name="eye" size={16} />
                                        <span>View Full Resource</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {rateModal.show && (
                <div className="bm-modal-overlay" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                    <div className="bm-modal" onClick={e => e.stopPropagation()}>
                        <div className="bm-modal-header">
                            <h3>
                                <span className="bm-modal-title-icon"><BmIcon name="star" size={18} /></span>
                                Rate Resource
                            </h3>
                            <button className="bm-modal-close" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                <BmIcon name="x" size={18} />
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
        </div>
    );
}