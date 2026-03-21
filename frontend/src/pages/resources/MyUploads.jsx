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
    const [searchError, setSearchError] = useState('');
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

        // Validate authUser object
        if (typeof authUser !== 'object') {
            console.error('Invalid authUser object');
            return null;
        }

        const possibleIds = [
            authUser.id,
            authUser.userId,
            authUser._id,
            authUser.uid,
            authUser.sub
        ].filter(id => id && typeof id === 'string' || typeof id === 'number');

        for (const id of possibleIds) {
            if (AUTH_TO_DB_ID_MAP[id]) {
                return AUTH_TO_DB_ID_MAP[id];
            }
        }

        if (authUser.email && AUTH_TO_DB_ID_MAP[authUser.email]) {
            return AUTH_TO_DB_ID_MAP[authUser.email];
        }

        for (const id of possibleIds) {
            if (/^\d+$/.test(String(id))) {
                return String(id);
            }
        }

        return null;
    };

    // ============= SEARCH VALIDATION =============
    const validateSearchTerm = (term) => {
        if (term.length > 0 && term.length < 2) {
            setSearchError('Search term must be at least 2 characters');
            return false;
        } else if (term.length > 50) {
            setSearchError('Search term must be less than 50 characters');
            return false;
        } else if (/[<>{}()]/.test(term)) {
            setSearchError('Search term contains invalid characters');
            return false;
        } else {
            setSearchError('');
            return true;
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        validateSearchTerm(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchError('');
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        
        // Validate user exists
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        // Validate user object structure
        if (!currentUser.email && !currentUser.id && !currentUser.userId) {
            setError('Invalid user data. Please log in again.');
            setLoading(false);
            return;
        }
        
        setUser(currentUser);

        const dbUserId = getDatabaseUserId(currentUser);
        
        if (dbUserId) {
            fetchUploads(dbUserId);
        } else {
            setError('Could not identify user. Please check your login or contact support.');
            setLoading(false);
        }

        const timer = setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // ============= DATA VALIDATION =============
    const validateUploadData = (data) => {
        if (!data) return false;
        
        // Validate each upload has required fields
        return data.every(upload => 
            upload && 
            typeof upload === 'object' &&
            upload.id !== undefined &&
            upload.title !== undefined
        );
    };

    const fetchUploads = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            
            // Validate userId
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            const userIdStr = String(userId);
            const response = await api.get(`/resources/user/${userIdStr}`);
            
            // Validate response
            if (!response || !response.data) {
                throw new Error('Invalid response from server');
            }
            
            let uploadsData = [];
            if (Array.isArray(response.data)) {
                uploadsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                uploadsData = response.data.content || response.data.data || [];
            }
            
            // Validate uploads data structure
            if (!validateUploadData(uploadsData)) {
                console.warn('Some uploads have invalid data structure');
            }
            
            setUploads(uploadsData);
            
            // Calculate stats with validation
            const pending = uploadsData.filter(u => u?.status === 'pending').length;
            const active = uploadsData.filter(u => u?.status === 'active').length;
            const totalViews = uploadsData.reduce((sum, u) => sum + (Number(u?.viewCount) || 0), 0);
            const totalDownloads = uploadsData.reduce((sum, u) => sum + (Number(u?.downloadCount) || 0), 0);
            
            setStats({
                total: uploadsData.length,
                pending,
                active,
                views: totalViews,
                downloads: totalDownloads
            });
            
        } catch (error) {
            console.error('Error fetching uploads:', error);
            
            // Enhanced error handling
            if (error.response?.status === 404) {
                setError('No uploads found. Start by uploading your first resource!');
            } else if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (error.code === 'ECONNABORTED') {
                setError('Request timeout. Please check your internet connection.');
            } else {
                setError(error.response?.data?.message || error.message || 'Failed to fetch uploads');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const { resourceId } = deleteConfirm;
        
        // Validate resource ID
        if (!resourceId) {
            setError('Invalid resource ID');
            return;
        }
        
        try {
            await api.delete(`/resources/${resourceId}`);
            const dbUserId = getDatabaseUserId(user);
            
            if (!dbUserId) {
                throw new Error('Unable to identify user');
            }
            
            await fetchUploads(dbUserId);
            setSuccessMessage('✓ Resource deleted successfully!');
            setDeleteConfirm({ show: false, resourceId: null, resourceTitle: '' });
        } catch (error) {
            console.error('Error deleting resource:', error);
            
            if (error.response?.status === 404) {
                setError('Resource not found. It may have been already deleted.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to delete this resource.');
            } else {
                setError('Failed to delete resource. Please try again.');
            }
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, resourceId: null, resourceTitle: '' });
    };

    const handleEdit = (resourceId) => {
        // Validate resource ID
        if (!resourceId) {
            setError('Invalid resource ID');
            return;
        }
        navigate(`/resources/edit/${resourceId}`);
    };

    const handleView = (resourceId) => {
        // Validate resource ID
        if (!resourceId) {
            setError('Invalid resource ID');
            return;
        }
        navigate(`/resources/${resourceId}`);
    };

    const handleRetry = () => {
        const dbUserId = getDatabaseUserId(user);
        if (dbUserId) {
            fetchUploads(dbUserId);
        } else {
            setError('Unable to identify user. Please log in again.');
        }
    };

    const getStatusBadgeClass = (status) => {
        // Validate status
        if (!status) return 'status-badge';
        
        switch (status?.toLowerCase()) {
            case 'active': return 'status-badge active';
            case 'pending': return 'status-badge pending';
            case 'rejected': return 'status-badge rejected';
            case 'flagged': return 'status-badge flagged';
            default: return 'status-badge';
        }
    };

    const getTypeIcon = (type) => {
        // Validate type
        if (!type) return '📦';
        
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
        // Validate date
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            
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
        // Validate rating
        const validRating = Number(rating) || 0;
        const fullStars = Math.floor(validRating);
        const hasHalfStar = validRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <span className="stars-container">
                {[...Array(Math.max(0, fullStars))].map((_, i) => (
                    <span key={`full-${i}`} className="star full">★</span>
                ))}
                {hasHalfStar && <span className="star half">½</span>}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <span key={`empty-${i}`} className="star empty">☆</span>
                ))}
            </span>
        );
    };

    const filteredUploads = uploads.filter(upload => {
        // Skip if upload is invalid
        if (!upload) return false;
        
        if (filter !== 'all' && upload.status !== filter) return false;
        
        if (searchTerm && validateSearchTerm(searchTerm)) {
            const term = searchTerm.toLowerCase();
            return (upload.title?.toLowerCase() || '').includes(term) ||
                   (upload.subject?.toLowerCase() || '').includes(term) ||
                   (upload.description?.toLowerCase() || '').includes(term) ||
                   (upload.courseCode?.toLowerCase() || '').includes(term);
        }
        
        return true;
    }).sort((a, b) => {
        // Validate sorting
        if (!a || !b) return 0;
        
        switch (sortBy) {
            case 'date_desc':
                return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
            case 'date_asc':
                return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
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
                    {/* Search Box with Validation */}
                    <div className="search-box-wrapper">
                        <input
                            type="text"
                            placeholder="Search your uploads by title, subject, or course code..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`search-input ${searchError ? 'error' : ''}`}
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search-btn"
                                onClick={clearSearch}
                            >
                                ✕
                            </button>
                        )}
                        {searchError && (
                            <div className="search-error">{searchError}</div>
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
                            <button onClick={clearSearch} className="secondary-btn">
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