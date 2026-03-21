import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './MyUploads.css';

const MyUploads = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, resourceId: null, resourceTitle: '' });
    const [sortBy, setSortBy] = useState('date_desc');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        views: 0,
        downloads: 0
    });

    // ============= MAPPING AUTH IDs TO DATABASE IDs =============
    const AUTH_TO_DB_ID_MAP = {
        'alex@example.com': '1',
        'john@example.com': '2',
        'sarah@example.com': '3',
        'mike@example.com': '4',
    };

    const getDatabaseUserId = (authUser) => {
        if (!authUser) return null;

        const possibleIds = [
            authUser.id,
            authUser.userId,
            authUser._id,
            authUser.uid,
            authUser.sub
        ].filter(id => id);

        for (const id of possibleIds) {
            if (AUTH_TO_DB_ID_MAP[id]) {
                return AUTH_TO_DB_ID_MAP[id];
            }
        }

        if (authUser.email && AUTH_TO_DB_ID_MAP[authUser.email]) {
            return AUTH_TO_DB_ID_MAP[authUser.email];
        }

        for (const id of possibleIds) {
            if (/^\d+$/.test(id)) {
                return id;
            }
        }

        return null;
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const dbUserId = getDatabaseUserId(currentUser);
        
        if (dbUserId) {
            fetchUploads(dbUserId);
        } else {
            setError('Could not identify user. Please check your login.');
            setLoading(false);
        }

        const timer = setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const fetchUploads = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            
            const userIdStr = String(userId);
            const response = await api.get(`/resources/user/${userIdStr}`);
            
            let uploadsData = [];
            if (Array.isArray(response.data)) {
                uploadsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                uploadsData = response.data.content || response.data.data || [];
            }
            
            setUploads(uploadsData);
            
            const pending = uploadsData.filter(u => u?.status === 'pending').length;
            const active = uploadsData.filter(u => u?.status === 'active').length;
            const totalViews = uploadsData.reduce((sum, u) => sum + (u?.viewCount || 0), 0);
            const totalDownloads = uploadsData.reduce((sum, u) => sum + (u?.downloadCount || 0), 0);
            
            setStats({
                total: uploadsData.length,
                pending,
                active,
                views: totalViews,
                downloads: totalDownloads
            });
            
        } catch (error) {
            console.error('Error fetching uploads:', error);
            
            if (error.response?.status === 404) {
                setError('No uploads found. Start by uploading your first resource!');
            } else if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(error.response?.data?.message || error.message || 'Failed to fetch uploads');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const { resourceId } = deleteConfirm;
        
        try {
            await api.delete(`/resources/${resourceId}`);
            const dbUserId = getDatabaseUserId(user);
            await fetchUploads(dbUserId);
            setSuccessMessage('✓ Resource deleted successfully!');
            setDeleteConfirm({ show: false, resourceId: null, resourceTitle: '' });
        } catch (error) {
            console.error('Error deleting resource:', error);
            setError('Failed to delete resource. Please try again.');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, resourceId: null, resourceTitle: '' });
    };

    const handleEdit = (resourceId) => {
        navigate(`/resources/edit/${resourceId}`);
    };

    const handleView = (resourceId) => {
        navigate(`/resources/${resourceId}`);
    };

    const handleRetry = () => {
        const dbUserId = getDatabaseUserId(user);
        if (dbUserId) {
            fetchUploads(dbUserId);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-badge active';
            case 'pending': return 'status-badge pending';
            case 'rejected': return 'status-badge rejected';
            case 'flagged': return 'status-badge flagged';
            default: return 'status-badge';
        }
    };

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return '📄';
            case 'document': return '📝';
            case 'presentation': return '📊';
            case 'image': return '🖼️';
            case 'video': return '🎥';
            case 'link': return '🔗';
            case 'article': return '📰';
            default: return '📦';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <span className="stars-container">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="star full">★</span>
                ))}
                {hasHalfStar && <span className="star half">½</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="star empty">☆</span>
                ))}
            </span>
        );
    };

    const filteredUploads = uploads.filter(upload => {
        if (filter !== 'all' && upload.status !== filter) return false;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (upload.title?.toLowerCase() || '').includes(term) ||
                   (upload.subject?.toLowerCase() || '').includes(term) ||
                   (upload.description?.toLowerCase() || '').includes(term) ||
                   (upload.courseCode?.toLowerCase() || '').includes(term);
        }
        
        return true;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'date_desc':
                return new Date(b.uploadedAt) - new Date(a.uploadedAt);
            case 'date_asc':
                return new Date(a.uploadedAt) - new Date(b.uploadedAt);
            case 'title_asc':
                return (a.title || '').localeCompare(b.title || '');
            case 'title_desc':
                return (b.title || '').localeCompare(a.title || '');
            case 'views_desc':
                return (b.viewCount || 0) - (a.viewCount || 0);
            case 'rating_desc':
                return (b.averageRating || 0) - (a.averageRating || 0);
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <div className="myuploads-container">
                <div className="sidebar">
                    <div className="sidebar-logo">BrainHive</div>
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="user-info">
                            <h4>{user?.name || user?.fullName || 'User'}</h4>
                            <p>Student</p>
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        <div className="nav-section">
                            <h3>Resources</h3>
                            <ul>
                                <li onClick={() => navigate('/dashboard/student')}>Discovery</li>
                                <li onClick={() => navigate('/upload')}>Upload</li>
                                <li className="active">My Uploads</li>
                                <li onClick={() => navigate('/resources/bookmarked')}>Bookmarked</li>
                            </ul>
                        </div>
                        <div className="nav-section">
                            <h3>Peer Help</h3>
                            <ul>
                                <li onClick={() => navigate('/request-help')}>Request Help</li>
                                <li onClick={() => navigate('/find-tutors')}>Find Tutors</li>
                            </ul>
                        </div>
                        <div className="nav-section">
                            <h3>Study Groups</h3>
                            <ul>
                                <li onClick={() => navigate('/my-groups')}>My Groups</li>
                                <li onClick={() => navigate('/create-group')}>Create Group</li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="main-content">
                    <div className="loading-spinner">Loading your uploads...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="myuploads-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">BrainHive</div>
                
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div className="user-info">
                        <h4>{user?.name || user?.fullName || 'User'}</h4>
                        <p>Student</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Resources</h3>
                        <ul>
                            <li onClick={() => navigate('/dashboard/student')}>Discovery</li>
                            <li onClick={() => navigate('/upload')}>Upload</li>
                            <li className="active">My Uploads</li>
                            <li onClick={() => navigate('/resources/bookmarked')}>Bookmarked</li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>Peer Help</h3>
                        <ul>
                            <li onClick={() => navigate('/request-help')}>Request Help</li>
                            <li onClick={() => navigate('/find-tutors')}>Find Tutors</li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>Study Groups</h3>
                        <ul>
                            <li onClick={() => navigate('/my-groups')}>My Groups</li>
                            <li onClick={() => navigate('/create-group')}>Create Group</li>
                        </ul>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <div className="content-header">
                    <div>
                        <h1 className="page-title">My Uploads</h1>
                        <p className="page-subtitle">Manage all resources you've uploaded</p>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => navigate('/upload')} className="primary-btn">
                            + Upload New
                        </button>
                        <button onClick={() => navigate('/dashboard/student')} className="back-btn">
                            ← Dashboard
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="success-message">
                        <span className="success-icon">✅</span>
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <div className="error-content">
                            <span className="error-icon">⚠️</span>
                            <span><strong>Error:</strong> {error}</span>
                            <button onClick={handleRetry} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><span className="icon">📚</span></div>
                        <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Uploads</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><span className="icon">✅</span></div>
                        <div><div className="stat-value">{stats.active}</div><div className="stat-label">Active</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><span className="icon">⏳</span></div>
                        <div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending Review</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><span className="icon">👁️</span></div>
                        <div><div className="stat-value">{stats.views}</div><div className="stat-label">Total Views</div></div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="filters-section">
                    {/* Search Box */}
                    <div className="search-box-wrapper">
                        <input
                            type="text"
                            placeholder="Search your uploads by title, subject, or course code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search-btn"
                                onClick={() => setSearchTerm('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    {/* Filter Tabs */}
                    <div className="filter-tabs-wrapper">
                        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            All ({stats.total})
                        </button>
                        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                            Pending ({stats.pending})
                        </button>
                        <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                            Active ({stats.active})
                        </button>
                    </div>
                    
                    {/* Sort Dropdown */}
                    <div className="sort-wrapper">
                        <label className="sort-label">Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                            <option value="date_desc">Latest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="title_asc">Title (A-Z)</option>
                            <option value="title_desc">Title (Z-A)</option>
                            <option value="views_desc">Most Views</option>
                            <option value="rating_desc">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Uploads Grid */}
                {filteredUploads.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No uploads found</h3>
                        <p>
                            {searchTerm 
                                ? `No results for "${searchTerm}"` 
                                : uploads.length === 0 
                                    ? "You haven't uploaded any resources yet." 
                                    : "No resources match the selected filter."}
                        </p>
                        {!searchTerm && uploads.length === 0 && (
                            <button onClick={() => navigate('/upload')} className="primary-btn">
                                Upload Your First Resource
                            </button>
                        )}
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="secondary-btn">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="uploads-stats">
                            📊 Showing {filteredUploads.length} of {uploads.length} uploads
                        </div>
                        <div className="uploads-grid">
                            {filteredUploads.map((upload) => (
                                <div key={upload.id} className="upload-card" onClick={() => handleView(upload.id)}>
                                    <div className="upload-card-header">
                                        <div className="upload-type-icon">{getTypeIcon(upload.type)}</div>
                                        <div className="upload-info">
                                            <h3 className="upload-title">{upload.title}</h3>
                                            <div className="upload-meta">
                                                <span className="upload-subject">{upload.subject}</span>
                                                <span className="upload-semester">{upload.semester}</span>
                                                {upload.courseCode && (
                                                    <span className="upload-course">{upload.courseCode}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="upload-status">
                                            <span className={getStatusBadgeClass(upload.status)}>
                                                {upload.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {upload.description && (
                                        <p className="upload-description">
                                            {upload.description.length > 100 
                                                ? upload.description.substring(0, 100) + '...' 
                                                : upload.description}
                                        </p>
                                    )}
                                    
                                    {upload.tags && (
                                        <div className="upload-tags">
                                            {upload.tags.split(',').map((tag, i) => (
                                                <span key={i} className="tag">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="upload-stats">
                                        <div className="stat-item" title="Upload Date">
                                            <span>📅</span> {formatDate(upload.uploadedAt)}
                                        </div>
                                        <div className="stat-item" title="Views">
                                            <span>👁️</span> {upload.viewCount || 0}
                                        </div>
                                        <div className="stat-item" title="Downloads">
                                            <span>📥</span> {upload.downloadCount || 0}
                                        </div>
                                        <div className="stat-item" title="Rating">
                                            <span>⭐</span> 
                                            {renderStars(upload.averageRating || 0)}
                                            <span className="rating-count">
                                                ({upload.ratingCount || 0})
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="upload-actions">
                                        <button 
                                            className="action-btn view"
                                            onClick={() => handleView(upload.id)}
                                            title="View details"
                                        >
                                            👁️ View
                                        </button>
                                        <button 
                                            className="action-btn edit"
                                            onClick={() => handleEdit(upload.id)}
                                            title="Edit resource"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className="action-btn delete"
                                            onClick={() => setDeleteConfirm({ show: true, resourceId: upload.id, resourceTitle: upload.title })}
                                            title="Delete resource"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete <strong>"{deleteConfirm.resourceTitle}"</strong>?</p>
                        <p className="warning-text">⚠️ This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button type="button" onClick={cancelDelete} className="cancel-btn">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDelete} className="delete-confirm-btn">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyUploads;