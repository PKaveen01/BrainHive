import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import TutorLayout from '../user/TutorLayout';
import './MyUploads.css';

const statusColor = { active:'#16a34a', pending:'#d97706', flagged:'#dc2626', removed:'#6b7280' };
const typeIcon = { pdf:'📄', link:'🔗', doc:'📝', ppt:'📊', video:'🎥' };

export default function MyUploads() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    // Edit modal
    const [editModal, setEditModal] = useState({ show: false, resource: null });
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    // Rate modal
    const [rateModal, setRateModal] = useState({ show: false, resourceId: null, title: '' });
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [rateLoading, setRateLoading] = useState(false);

    // Delete confirm
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchUploads(currentUser.userId);
    }, [navigate]);

    const userId = () => user?.userId ? String(user.userId) : null;

    const fetchUploads = async (uid) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/resources/user/${uid}`);
            setUploads(Array.isArray(res.data) ? res.data : res.data?.content || []);
        } catch (e) {
            setError('Failed to load your uploads.');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
    const showError   = (msg) => { setError(msg);   setTimeout(() => setError(''),   4000); };

    // ── View / Download ──
    const handleView = (r) => {
        api.post(`/resources/${r.id}/view`).catch(() => {});
        const url = r.link || r.filePath;
        if (url) window.open(url, '_blank');
        else showError('No file or link attached to this resource.');
    };

    const handleDownload = (r) => {
        api.post(`/resources/${r.id}/download`).catch(() => {});
        const url = r.filePath || r.link;
        if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = r.fileName || r.title;
            a.target = '_blank';
            a.click();
        } else showError('No downloadable file available.');
    };

    // ── Delete ──
    const handleDelete = async (id) => {
        try {
            await api.delete(`/resources/${id}`);
            setUploads(prev => prev.filter(r => r.id !== id));
            setDeleteId(null);
            showSuccess('Resource deleted.');
        } catch (e) {
            showError(e.response?.data || 'Failed to delete resource.');
        }
    };

    // ── Edit ──
    const openEdit = (r) => {
        setEditForm({ title: r.title, description: r.description || '', subject: r.subject || '', semester: r.semester || '', tags: r.tags || '', link: r.link || '' });
        setEditModal({ show: true, resource: r });
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        try {
            await api.put(`/resources/${editModal.resource.id}`, { ...editForm, userId: userId() });
            setEditModal({ show: false, resource: null });
            fetchUploads(user.userId);
            showSuccess('Resource updated successfully.');
        } catch (e) {
            showError('Failed to update resource.');
        } finally {
            setEditLoading(false);
        }
    };

    // ── Rate ──
    const handleRateSubmit = async () => {
        setRateLoading(true);
        try {
            await api.post(`/resources/${rateModal.resourceId}/rate`, { userId: userId(), rating, review });
            setRateModal({ show: false, resourceId: null, title: '' });
            setRating(5); setReview('');
            fetchUploads(user.userId);
            showSuccess('Rating submitted!');
        } catch (e) {
            showError('Failed to submit rating.');
        } finally {
            setRateLoading(false);
        }
    };

    const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
    const fmtSize = (b) => { if (!b) return ''; if (b < 1024) return b+' B'; if (b < 1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB'; };

    const filtered = uploads
        .filter(r => filter === 'all' || r.status === filter)
        .filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase()));

    const stats = {
        total: uploads.length,
        active: uploads.filter(r => r.status === 'active').length,
        pending: uploads.filter(r => r.status === 'pending').length,
        views: uploads.reduce((s, r) => s + (r.viewCount || 0), 0),
        downloads: uploads.reduce((s, r) => s + (r.downloadCount || 0), 0),
    };

    // Determine which sidebar to render based on user role
    const renderSidebar = () => {
        if (!user) return null;
        
        // Check if user has tutor role
        const isTutor = user.role === 'tutor' || user.userType === 'tutor';
        
        if (isTutor) {
            return <TutorLayout user={user} />;
        } else {
            return <StudentSidebar user={user} />;
        }
    };

    return (
        <div className="dashboard">
            {renderSidebar()}
            <div className="main-content">
                <div className="mu-page-header">
                    <div>
                        <h1>🗂️ My Uploads</h1>
                        <p className="mu-page-subtitle">Manage your uploaded resources</p>
                    </div>
                    <button className="mu-btn-primary" onClick={() => navigate('/upload')}>
                        + Upload New
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="mu-stats-grid">
                    {[
                        { label: 'Total', value: stats.total, icon: '📚', color: '#3b82f6' },
                        { label: 'Active', value: stats.active, icon: '✅', color: '#10b981' },
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b' },
                        { label: 'Views', value: stats.views, icon: '👁', color: '#8b5cf6' },
                        { label: 'Downloads', value: stats.downloads, icon: '⬇', color: '#ec4899' }
                    ].map((stat, idx) => (
                        <div key={stat.label} className="mu-stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="mu-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="mu-stat-value">{stat.value}</div>
                            <div className="mu-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Alert Messages */}
                {success && (
                    <div className="mu-alert mu-alert-success">
                        <span className="mu-alert-icon">✅</span>
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="mu-alert mu-alert-error">
                        <span className="mu-alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Filters Toolbar */}
                <div className="mu-toolbar">
                    <div className="mu-search-wrapper">
                        <span className="mu-search-icon">🔍</span>
                        <input 
                            className="mu-search-input" 
                            placeholder="Search by title or subject..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className="mu-filter-tabs">
                        {['all', 'active', 'pending', 'flagged'].map(f => (
                            <button 
                                key={f} 
                                className={`mu-filter-tab ${filter === f ? 'mu-filter-tab-active' : ''}`} 
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)} 
                                <span className="mu-filter-count">
                                    ({f === 'all' ? uploads.length : uploads.filter(r => r.status === f).length})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mu-loading-state">
                        <div className="mu-spinner"></div>
                        <p>Loading your uploads...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filtered.length === 0 && (
                    <div className="mu-empty-state">
                        <div className="mu-empty-icon">📤</div>
                        <h3>{uploads.length === 0 ? "You haven't uploaded anything yet" : "No uploads match your filter"}</h3>
                        <p>Start sharing your knowledge with the community</p>
                        <button className="mu-btn-primary" onClick={() => navigate('/upload')}>
                            Upload Your First Resource
                        </button>
                    </div>
                )}

                {/* Uploads List */}
                {!loading && filtered.length > 0 && (
                    <div className="mu-uploads-grid">
                        {filtered.map((r, idx) => (
                            <div key={r.id} className="mu-upload-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                                {/* Header */}
                                <div className="mu-card-header">
                                    <div className="mu-title-section">
                                        <span className="mu-type-icon">{typeIcon[r.type?.toLowerCase()] || '📁'}</span>
                                        <div className="mu-title-info">
                                            <h3>{r.title}</h3>
                                            <div className="mu-badges">
                                                {r.subject && <span className="mu-badge mu-badge-blue">{r.subject}</span>}
                                                {r.semester && <span className="mu-badge mu-badge-gray">{r.semester}</span>}
                                                {r.type && <span className="mu-badge mu-badge-purple">{r.type.toUpperCase()}</span>}
                                                {r.fileSize && <span className="mu-badge mu-badge-gray">{fmtSize(r.fileSize)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <span 
                                        className="mu-status-badge" 
                                        style={{ 
                                            background: (statusColor[r.status] || '#9ca3af') + '15', 
                                            color: statusColor[r.status] || '#9ca3af',
                                            border: `1px solid ${(statusColor[r.status] || '#9ca3af') + '30'}`
                                        }}
                                    >
                                        {(r.status || 'unknown').toUpperCase()}
                                    </span>
                                </div>

                                {r.description && <p className="mu-description">{r.description}</p>}

                                <div className="mu-meta-info">
                                    <div className="mu-meta-item"><span>📅</span> {fmt(r.uploadedAt)}</div>
                                    <div className="mu-meta-item"><span>👁</span> {r.viewCount || 0} views</div>
                                    <div className="mu-meta-item"><span>⬇</span> {r.downloadCount || 0} downloads</div>
                                    <div className="mu-rating">
                                        <div className="mu-stars">
                                            {[1,2,3,4,5].map(s => (
                                                <span key={s} className={`mu-star ${s <= Math.round(r.averageRating || 0) ? 'mu-star-filled' : ''}`}>★</span>
                                            ))}
                                        </div>
                                        <span className="mu-rating-value">{(r.averageRating || 0).toFixed(1)}</span>
                                        <span className="mu-rating-count">({r.ratingCount || 0})</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mu-actions-wrapper">
                                    <div className="mu-actions-top-row">
                                        <button className="mu-btn-action mu-btn-view" onClick={() => handleView(r)}>👁 View</button>
                                        {r.filePath && <button className="mu-btn-action mu-btn-download" onClick={() => handleDownload(r)}>⬇ Download</button>}
                                        <button className="mu-btn-action mu-btn-edit" onClick={() => openEdit(r)}>✏️ Edit</button>
                                    </div>
                                    <div className="mu-actions-bottom-row">
                                        <button className="mu-btn-action mu-btn-rate" onClick={() => setRateModal({ show: true, resourceId: r.id, title: r.title })}>⭐ Rate</button>
                                        <button className="mu-btn-action mu-btn-delete" onClick={() => setDeleteId(r.id)}>🗑 Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="mu-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="mu-modal" onClick={e => e.stopPropagation()}>
                        <div className="mu-modal-header">
                            <h3>🗑 Delete Resource</h3>
                            <button className="mu-modal-close" onClick={() => setDeleteId(null)}>×</button>
                        </div>
                        <div className="mu-modal-body">
                            <p>Are you sure you want to delete this resource?</p>
                            <p className="mu-modal-warning">This action cannot be undone.</p>
                        </div>
                        <div className="mu-modal-actions">
                            <button className="mu-btn-secondary" onClick={() => setDeleteId(null)}>
                                Cancel
                            </button>
                            <button className="mu-btn-danger" onClick={() => handleDelete(deleteId)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.show && (
                <div className="mu-modal-overlay" onClick={() => setEditModal({ show: false, resource: null })}>
                    <div className="mu-modal mu-modal-large" onClick={e => e.stopPropagation()}>
                        <div className="mu-modal-header">
                            <h3>✏️ Edit Resource</h3>
                            <button className="mu-modal-close" onClick={() => setEditModal({ show: false, resource: null })}>
                                ×
                            </button>
                        </div>
                        <div className="mu-modal-body">
                            {[
                                ['title', 'Title', 'text'],
                                ['subject', 'Subject', 'text'],
                                ['semester', 'Semester', 'text'],
                                ['tags', 'Tags (comma separated)', 'text'],
                                ['link', 'Link (if applicable)', 'url']
                            ].map(([field, label, type]) => (
                                <div key={field} className="mu-form-group">
                                    <label>{label}</label>
                                    <input 
                                        type={type} 
                                        value={editForm[field] || ''} 
                                        onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} 
                                    />
                                </div>
                            ))}
                            <div className="mu-form-group">
                                <label>Description</label>
                                <textarea 
                                    value={editForm.description || ''} 
                                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} 
                                    rows={4} 
                                />
                            </div>
                        </div>
                        <div className="mu-modal-actions">
                            <button className="mu-btn-secondary" onClick={() => setEditModal({ show: false, resource: null })}>
                                Cancel
                            </button>
                            <button className="mu-btn-primary" onClick={handleEditSave} disabled={editLoading}>
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {rateModal.show && (
                <div className="mu-modal-overlay" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                    <div className="mu-modal" onClick={e => e.stopPropagation()}>
                        <div className="mu-modal-header">
                            <h3>⭐ Rate Resource</h3>
                            <button className="mu-modal-close" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                ×
                            </button>
                        </div>
                        <div className="mu-modal-body">
                            <p className="mu-modal-subtitle">{rateModal.title}</p>
                            <div className="mu-star-rating">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                        key={s} 
                                        className={`mu-star-btn ${s <= rating ? 'mu-star-filled' : ''}`} 
                                        onClick={() => setRating(s)}
                                        onMouseEnter={() => setRating(s)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <p className="mu-rating-text">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>
                            <div className="mu-form-group">
                                <label>Review (optional)</label>
                                <textarea 
                                    value={review} 
                                    onChange={e => setReview(e.target.value)} 
                                    rows={3} 
                                    placeholder="Share your thoughts about this resource..."
                                />
                            </div>
                        </div>
                        <div className="mu-modal-actions">
                            <button className="mu-btn-secondary" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                Cancel
                            </button>
                            <button className="mu-btn-primary" onClick={handleRateSubmit} disabled={rateLoading}>
                                {rateLoading ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}