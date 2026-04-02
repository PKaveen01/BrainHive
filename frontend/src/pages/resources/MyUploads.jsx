import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
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

    return (
        <div className="dashboard">
            <StudentSidebar user={user} />
            <div className="main-content">
                <div className="page-header-row">
                    <div>
                        <h1>🗂️ My Uploads</h1>
                        <p className="page-subtitle">Manage your uploaded resources</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/upload')}>+ Upload New</button>
                </div>

                {/* Stats */}
                <div className="uploads-stats">
                    {[['Total', stats.total, '📚'], ['Active', stats.active, '✅'], ['Pending', stats.pending, '⏳'], ['Views', stats.views, '👁'], ['Downloads', stats.downloads, '⬇']].map(([label, val, icon]) => (
                        <div key={label} className="upload-stat-card">
                            <span className="stat-icon-sm">{icon}</span>
                            <div className="stat-num">{val}</div>
                            <div className="stat-lbl">{label}</div>
                        </div>
                    ))}
                </div>

                {success && <div className="alert-success">✅ {success}</div>}
                {error   && <div className="alert-error">⚠️ {error}</div>}

                {/* Filters */}
                <div className="uploads-toolbar">
                    <input className="search-input" placeholder="Search by title or subject..." value={search} onChange={e => setSearch(e.target.value)} />
                    <div className="filter-tabs">
                        {['all','active','pending','flagged'].map(f => (
                            <button key={f} className={`filter-tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase()+f.slice(1)} ({f==='all' ? uploads.length : uploads.filter(r=>r.status===f).length})
                            </button>
                        ))}
                    </div>
                </div>

                {loading && <div className="loading-state"><div className="spinner" /><p>Loading your uploads...</p></div>}

                {!loading && filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📤</div>
                        <h3>{uploads.length === 0 ? "You haven't uploaded anything yet" : "No uploads match your filter"}</h3>
                        <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Your First Resource</button>
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
                                <span className="status-chip" style={{ background:(statusColor[r.status]||'#9ca3af')+'20', color:statusColor[r.status]||'#9ca3af' }}>
                                    {(r.status||'unknown').toUpperCase()}
                                </span>
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
                                <button className="btn-action btn-edit"     onClick={() => openEdit(r)}>✏️ Edit</button>
                                <button className="btn-action btn-rate"     onClick={() => setRateModal({ show:true, resourceId:r.id, title:r.title })}>⭐ Rate</button>
                                <button className="btn-action btn-delete"   onClick={() => setDeleteId(r.id)}>🗑 Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirm */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>🗑 Delete Resource</h3>
                        <p>Are you sure? This cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn-danger"    onClick={() => handleDelete(deleteId)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.show && (
                <div className="modal-overlay" onClick={() => setEditModal({ show:false, resource:null })}>
                    <div className="modal modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>✏️ Edit Resource</h3><button className="modal-close" onClick={() => setEditModal({ show:false, resource:null })}>×</button></div>
                        {[['title','Title','text'],['subject','Subject','text'],['semester','Semester','text'],['tags','Tags (comma separated)','text'],['link','Link (if applicable)','url']].map(([field, label, type]) => (
                            <div key={field} className="form-group">
                                <label>{label}</label>
                                <input type={type} value={editForm[field]||''} onChange={e => setEditForm(p => ({...p, [field]: e.target.value}))} />
                            </div>
                        ))}
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={editForm.description||''} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} rows={3} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setEditModal({ show:false, resource:null })}>Cancel</button>
                            <button className="btn-primary"   onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

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
