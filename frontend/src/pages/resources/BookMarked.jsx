import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import './BookMarked.css';

const typeIcon = { pdf:'📄', link:'🔗', doc:'📝', ppt:'📊', video:'🎥' };

export default function BookMarked() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    // Rate modal
    const [rateModal, setRateModal] = useState({ show:false, resourceId:null, title:'' });
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
            setRateModal({ show:false, resourceId:null, title:'' });
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
                <div className="page-header-row">
                    <div>
                        <h1>🔖 Bookmarked Resources</h1>
                        <p className="page-subtitle">Resources you've saved for later</p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/resources/discovery')}>🔍 Discover More</button>
                </div>

                {success && <div className="alert-success">✅ {success}</div>}
                {error   && <div className="alert-error">⚠️ {error}</div>}

                <div className="uploads-toolbar">
                    <input className="search-input" placeholder="Search bookmarks..." value={search} onChange={e => setSearch(e.target.value)} />
                    <span className="bm-count">{bookmarks.length} saved resource{bookmarks.length !== 1 ? 's' : ''}</span>
                </div>

                {loading && <div className="loading-state"><div className="spinner" /><p>Loading your bookmarks...</p></div>}

                {!loading && filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🔖</div>
                        <h3>{bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks match your search"}</h3>
                        <p>Browse the discovery page and bookmark resources you find useful.</p>
                        <button className="btn-primary" onClick={() => navigate('/resources/discovery')}>Discover Resources</button>
                    </div>
                )}

                <div className="uploads-list">
                    {filtered.map(r => (
                        <div key={r.id} className="upload-card">
                            <div className="upload-card-header">
                                <div className="upload-title-row">
                                    <span className="type-icon-lg">{typeIcon[r.type?.toLowerCase()] || '📁'}</span>
                                    <div>
                                        <h3>{r.title}</h3>
                                        <div className="upload-badges">
                                            {r.subject  && <span className="badge badge-blue">{r.subject}</span>}
                                            {r.semester && <span className="badge badge-gray">{r.semester}</span>}
                                            {r.type     && <span className="badge badge-purple">{r.type.toUpperCase()}</span>}
                                            {r.fileSize && <span className="badge badge-gray">{fmtSize(r.fileSize)}</span>}
                                        </div>
                                    </div>
                                </div>
                                {r.uploadedBy && (
                                    <div className="uploader-chip">
                                        <span className="uploader-avatar-sm">{(r.uploadedBy.fullName||r.uploadedBy||'?').charAt(0).toUpperCase()}</span>
                                        <span>{r.uploadedBy.fullName || r.uploadedBy}</span>
                                    </div>
                                )}
                            </div>

                            {r.description && <p className="upload-desc">{r.description}</p>}

                            <div className="upload-meta">
                                <span>📅 {fmt(r.uploadedAt)}</span>
                                <span>👁 {r.viewCount||0} views</span>
                                <span>⬇ {r.downloadCount||0} downloads</span>
                                <span>⭐ {(r.averageRating||0).toFixed(1)} ({r.ratingCount||0})</span>
                            </div>

                            <div className="upload-actions">
                                <button className="btn-action btn-view"     onClick={() => handleView(r)}>👁 View</button>
                                {r.filePath && <button className="btn-action btn-download" onClick={() => handleDownload(r)}>⬇ Download</button>}
                                <button className="btn-action btn-rate"     onClick={() => setRateModal({ show:true, resourceId:r.id, title:r.title })}>⭐ Rate</button>
                                <button className="btn-action btn-delete"   onClick={() => handleRemove(r.id)} disabled={removingId === r.id}>
                                    {removingId === r.id ? 'Removing...' : '🔖 Remove'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rate Modal */}
            {rateModal.show && (
                <div className="modal-overlay" onClick={() => setRateModal({ show:false, resourceId:null, title:'' })}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>⭐ Rate: {rateModal.title}</h3>
                        <div className="star-rating">{[1,2,3,4,5].map(s => <button key={s} className={`star ${s<=rating?'filled':''}`} onClick={() => setRating(s)}>★</button>)}</div>
                        <p className="rating-label">{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</p>
                        <div className="form-group"><label>Review (optional)</label><textarea value={review} onChange={e => setReview(e.target.value)} rows={3} placeholder="Share your thoughts..." /></div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setRateModal({ show:false, resourceId:null, title:'' })}>Cancel</button>
                            <button className="btn-primary"   onClick={handleRateSubmit} disabled={rateLoading}>{rateLoading ? 'Submitting...' : 'Submit Rating'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
