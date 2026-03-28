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
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
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

    // ============= FETCH BOOKMARK STATUS =============
    const fetchBookmarkStatus = async (resources) => {
        try {
            const dbUserId = getDatabaseUserId(user);
            if (!dbUserId) return;

            const bookmarkStatus = {};

            for (const resource of resources) {
                try {
                    const response = await api.get(`/resources/${resource.id}/bookmarked/status?userId=${dbUserId}`);
                    bookmarkStatus[resource.id] = response.data.isBookmarked;
                } catch (error) {
                    console.error(`Error checking bookmark status for ${resource.id}:`, error);
                    bookmarkStatus[resource.id] = false;
                }
            }

            const bookmarked = new Set(
                Object.keys(bookmarkStatus).filter(id => bookmarkStatus[id])
            );
            setBookmarkedIds(bookmarked);
        } catch (error) {
            console.error('Error fetching bookmark status:', error);
        }
    };

    // ============= HANDLE BOOKMARK =============
    const handleBookmark = async (resourceId, e) => {
        e.stopPropagation(); // Prevent card click when clicking bookmark

        try {
            const dbUserId = getDatabaseUserId(user);
            if (!dbUserId) {
                setError('Unable to identify user');
                return;
            }

            if (bookmarkedIds.has(resourceId)) {
                // Remove bookmark
                await api.delete(`/resources/${resourceId}/bookmark?userId=${dbUserId}`);
                setBookmarkedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(resourceId);
                    return newSet;
                });
                setSuccessMessage('Bookmark removed');
            } else {
                // Add bookmark
                await api.post(`/resources/${resourceId}/bookmark?userId=${dbUserId}`);
                setBookmarkedIds(prev => new Set([...prev, resourceId]));
                setSuccessMessage('Resource bookmarked successfully!');
            }

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            setError('Failed to update bookmark');
            setTimeout(() => setError(null), 3000);
        }
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

        if (!currentUser) {
            navigate('/login');
            return;
        }

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

            if (!userId) {
                throw new Error('User ID is required');
            }

            const userIdStr = String(userId);
            const response = await api.get(`/resources/user/${userIdStr}`);

            if (!response || !response.data) {
                throw new Error('Invalid response from server');
            }

            let uploadsData = [];
            if (Array.isArray(response.data)) {
                uploadsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                uploadsData = response.data.content || response.data.data || [];
            }

            if (!validateUploadData(uploadsData)) {
                console.warn('Some uploads have invalid data structure');
            }

            setUploads(uploadsData);

            // Fetch bookmark status for all uploads
            await fetchBookmarkStatus(uploadsData);

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
            setSuccessMessage('Resource deleted successfully!');
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
        if (!resourceId) {
            setError('Invalid resource ID');
            return;
        }
        navigate(`/resources/edit/${resourceId}`);
    };

    const handleView = (resourceId) => {
        if (!resourceId) {
            setError('Invalid resource ID');
            return;
        }
        navigate(`/resources/${resourceId}`);
    };

    const handleDownload = async (upload, e) => {
        e.stopPropagation();

        try {
            if (!upload?.id) {
                setError('Invalid resource');
                setTimeout(() => setError(null), 3000);
                return;
            }

            if (!upload?.filePath) {
                setError('File URL not found');
                setTimeout(() => setError(null), 3000);
                return;
            }

            const newTab = window.open('', '_blank');

            if (!newTab) {
                setError('Popup blocked by browser');
                setTimeout(() => setError(null), 3000);
                return;
            }

            await api.post(`/resources/${upload.id}/download`);
            newTab.location.href = upload.filePath;

            setSuccessMessage('Download started');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Download failed:', error);
            setError(error.response?.data?.message || 'Failed to download resource');
            setTimeout(() => setError(null), 3000);
        }
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
        if (!status) return 'status-badge';

        switch (status?.toLowerCase()) {
            case 'active': return 'status-badge active';
            case 'pending': return 'status-badge pending';
            case 'rejected': return 'status-badge rejected';
            case 'flagged': return 'status-badge flagged';
            default: return 'status-badge';
        }
    };

    const getFileTypeLabel = (type) => {
        if (!type) return 'Document';

        switch (type?.toLowerCase()) {
            case 'pdf': return 'PDF';
            case 'document': return 'Document';
            case 'presentation': return 'Presentation';
            case 'image': return 'Image';
            case 'video': return 'Video';
            case 'link': return 'Link';
            case 'article': return 'Article';
            default: return 'Document';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);

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
                        <span className="success-icon">✓</span>
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <div className="error-content">
                            <span className="error-icon">⚠</span>
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
                        <div className="stat-icon blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" />
                                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Uploads</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="stat-value">{stats.active}</div>
                            <div className="stat-label">Active</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="stat-value">{stats.pending}</div>
                            <div className="stat-label">Pending Review</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div>
                            <div className="stat-value">{stats.views}</div>
                            <div className="stat-label">Total Views</div>
                        </div>
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
                                aria-label="Clear search"
                            >
                                ×
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
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </div>
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
                            Showing {filteredUploads.length} of {uploads.length} uploads
                        </div>
                        <div className="uploads-grid">
                            {filteredUploads.map((upload) => (
                                <div key={upload.id} className="upload-card" onClick={() => handleView(upload.id)}>
                                    <div className="upload-card-header">
                                        <div className="upload-type-badge">
                                            {getFileTypeLabel(upload.type)}
                                        </div>
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
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                                <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {formatDate(upload.uploadedAt)}
                                        </div>
                                        <div className="stat-item" title="Views">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {upload.viewCount || 0}
                                        </div>
                                        <div className="stat-item" title="Downloads">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 3V12M12 12L9 9M12 12L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M5 17V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V17" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {upload.downloadCount || 0}
                                        </div>
                                        <div className="stat-item" title="Rating">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {renderStars(upload.averageRating || 0)}
                                            <span className="rating-count">
                                                ({upload.ratingCount || 0})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="upload-actions">
                                        <button
                                            className="action-btn bookmark"
                                            onClick={(e) => handleBookmark(upload.id, e)}
                                            title={bookmarkedIds.has(upload.id) ? "Remove Bookmark" : "Bookmark this resource"}
                                        >
                                            {bookmarkedIds.has(upload.id) ? '★ Bookmarked' : '☆ Bookmark'}
                                        </button>
                                        <button
                                            className="action-btn view"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(upload.id);
                                            }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="action-btn download"
                                            onClick={(e) => handleDownload(upload, e)}
                                        >
                                            Download
                                        </button>
                                        <button
                                            className="action-btn edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(upload.id);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm({ show: true, resourceId: upload.id, resourceTitle: upload.title });
                                            }}
                                        >
                                            Delete
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
                        <p className="warning-text">This action cannot be undone.</p>
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