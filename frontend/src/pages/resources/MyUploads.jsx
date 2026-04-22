import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import TutorSidebar from '../peerhelp/TutorSidebar';
import ProfileGuard from '../../components/common/ProfileGuard';
import './MyUploads.css';

const statusColor = { active:'#16a34a', pending:'#d97706', flagged:'#dc2626', removed:'#6b7280' };
const typeIcon = { pdf:'fileText', link:'link', doc:'fileEdit', ppt:'presentation', video:'video' };

function MuIcon({ name, className = '', size = 18 }) {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className
    };

    switch (name) {
        case 'folderOpen':
            return (
                <svg {...props}>
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1" />
                    <path d="M3 10h18l-2 8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
            );
        case 'plus':
            return (
                <svg {...props}>
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                </svg>
            );
        case 'book':
            return (
                <svg {...props}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            );
        case 'checkCircle':
            return (
                <svg {...props}>
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
        case 'clock':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
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
        case 'search':
            return (
                <svg {...props}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
            );
        case 'uploadCloud':
            return (
                <svg {...props}>
                    <path d="M16 16l-4-4-4 4" />
                    <path d="M12 12v9" />
                    <path d="M20.39 18.39A5.5 5.5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.3" />
                    <path d="M16 16h1a4 4 0 0 0 0-8h-.7" />
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
        case 'calendar':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4" />
                    <path d="M8 3v4" />
                    <path d="M3 10h18" />
                </svg>
            );
        case 'star':
            return (
                <svg {...props}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        case 'edit':
            return (
                <svg {...props}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
            );
        case 'trash':
            return (
                <svg {...props}>
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                </svg>
            );
        case 'x':
            return (
                <svg {...props}>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                </svg>
            );
        case 'save':
            return (
                <svg {...props}>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M17 21v-8H7v8" />
                    <path d="M7 3v5h8" />
                </svg>
            );
        case 'messageSquare':
            return (
                <svg {...props}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
        const isTutor = user.role === 'TUTOR' || user.role === 'tutor' || user.userType === 'TUTOR' || user.userType === 'tutor';
        
        if (isTutor) {
            return <TutorSidebar user={user} />;
        } else {
            return <StudentSidebar user={user} />;
        }
    };

    return (
        <ProfileGuard>
        <div className="dashboard">
            {renderSidebar()}
            <div className="main-content">
                <div className="mu-page-header">
                    <div className="mu-page-header-left">
                        <div className="mu-page-title-wrap">
                            <div className="mu-page-title-icon">
                                <MuIcon name="folderOpen" size={22} />
                            </div>
                            <div>
                                <h1>My Uploads</h1>
                                <p className="mu-page-subtitle">Manage, review, and track your uploaded resources</p>
                            </div>
                        </div>
                    </div>
                    <button className="mu-btn-primary" onClick={() => navigate('/upload')}>
                        <MuIcon name="plus" size={16} />
                        <span>Upload New</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="mu-stats-grid">
                    {[
                        { label: 'Total', value: stats.total, icon: 'book', color: '#3b82f6' },
                        { label: 'Active', value: stats.active, icon: 'checkCircle', color: '#10b981' },
                        { label: 'Pending', value: stats.pending, icon: 'clock', color: '#f59e0b' },
                        { label: 'Views', value: stats.views, icon: 'eye', color: '#8b5cf6' },
                        { label: 'Downloads', value: stats.downloads, icon: 'download', color: '#ec4899' }
                    ].map((stat, idx) => (
                        <div key={stat.label} className="mu-stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="mu-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                <MuIcon name={stat.icon} size={20} />
                            </div>
                            <div className="mu-stat-value">{stat.value}</div>
                            <div className="mu-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Alert Messages */}
                {success && (
                    <div className="mu-alert mu-alert-success">
                        <span className="mu-alert-icon">
                            <MuIcon name="check" size={18} />
                        </span>
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="mu-alert mu-alert-error">
                        <span className="mu-alert-icon">
                            <MuIcon name="alertTriangle" size={18} />
                        </span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Filters Toolbar */}
                <div className="mu-toolbar">
                    <div className="mu-search-wrapper">
                        <span className="mu-search-icon">
                            <MuIcon name="search" size={17} />
                        </span>
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
                        <div className="mu-empty-icon">
                            <MuIcon name="uploadCloud" size={42} />
                        </div>
                        <h3>{uploads.length === 0 ? "You haven't uploaded anything yet" : "No uploads match your filter"}</h3>
                        <p>Start sharing your knowledge with the community</p>
                        <button className="mu-btn-primary" onClick={() => navigate('/upload')}>
                            <MuIcon name="plus" size={16} />
                            <span>Upload Your First Resource</span>
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
                                        <span className="mu-type-icon">
                                            <MuIcon name={typeIcon[r.type?.toLowerCase()] || 'archive'} size={20} />
                                        </span>
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
                                    <div className="mu-meta-item">
                                        <span className="mu-meta-icon"><MuIcon name="calendar" size={14} /></span>
                                        <span>{fmt(r.uploadedAt)}</span>
                                    </div>
                                    <div className="mu-meta-item">
                                        <span className="mu-meta-icon"><MuIcon name="eye" size={14} /></span>
                                        <span>{r.viewCount || 0} views</span>
                                    </div>
                                    <div className="mu-meta-item">
                                        <span className="mu-meta-icon"><MuIcon name="download" size={14} /></span>
                                        <span>{r.downloadCount || 0} downloads</span>
                                    </div>
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
                                        <button className="mu-btn-action mu-btn-view" onClick={() => handleView(r)}>
                                            <MuIcon name="eye" size={15} />
                                            <span>View</span>
                                        </button>
                                        {r.filePath && (
                                            <button className="mu-btn-action mu-btn-download" onClick={() => handleDownload(r)}>
                                                <MuIcon name="download" size={15} />
                                                <span>Download</span>
                                            </button>
                                        )}
                                        <button className="mu-btn-action mu-btn-edit" onClick={() => openEdit(r)}>
                                            <MuIcon name="edit" size={15} />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                    <div className="mu-actions-bottom-row">
                                        <button className="mu-btn-action mu-btn-rate" onClick={() => setRateModal({ show: true, resourceId: r.id, title: r.title })}>
                                            <MuIcon name="star" size={15} />
                                            <span>Rate</span>
                                        </button>
                                        <button className="mu-btn-action mu-btn-delete" onClick={() => setDeleteId(r.id)}>
                                            <MuIcon name="trash" size={15} />
                                            <span>Delete</span>
                                        </button>
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
                            <h3>
                                <span className="mu-modal-title-icon"><MuIcon name="trash" size={18} /></span>
                                Delete Resource
                            </h3>
                            <button className="mu-modal-close" onClick={() => setDeleteId(null)}>
                                <MuIcon name="x" size={18} />
                            </button>
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
                                <MuIcon name="trash" size={15} />
                                <span>Delete</span>
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
                            <h3>
                                <span className="mu-modal-title-icon"><MuIcon name="edit" size={18} /></span>
                                Edit Resource
                            </h3>
                            <button className="mu-modal-close" onClick={() => setEditModal({ show: false, resource: null })}>
                                <MuIcon name="x" size={18} />
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
                                <MuIcon name="save" size={15} />
                                <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
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
                            <h3>
                                <span className="mu-modal-title-icon"><MuIcon name="star" size={18} /></span>
                                Rate Resource
                            </h3>
                            <button className="mu-modal-close" onClick={() => setRateModal({ show: false, resourceId: null, title: '' })}>
                                <MuIcon name="x" size={18} />
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
                                <MuIcon name="messageSquare" size={15} />
                                <span>{rateLoading ? 'Submitting...' : 'Submit Rating'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ProfileGuard>
    );
}