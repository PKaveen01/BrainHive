import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
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
    
    // Rating Modal State
    const [ratingModal, setRatingModal] = useState({ show: false, resourceId: null, resourceTitle: '' });
    const [userRating, setUserRating] = useState(5);
    const [review, setReview] = useState('');

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
        e.stopPropagation();

        try {
            const dbUserId = getDatabaseUserId(user);
            if (!dbUserId) {
                setError('Unable to identify user');
                return;
            }

            if (bookmarkedIds.has(resourceId)) {
                await api.delete(`/resources/${resourceId}/bookmark?userId=${dbUserId}`);
                setBookmarkedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(resourceId);
                    return newSet;
                });
                setSuccessMessage('Bookmark removed');
            } else {
                await api.post(`/resources/${resourceId}/bookmark?userId=${dbUserId}`);
                setBookmarkedIds(prev => new Set([...prev, resourceId]));
                setSuccessMessage('Resource bookmarked successfully!');
            }

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            setError('Failed to update bookmark');
            setTimeout(() => setError(null), 3000);
        }
    };

    // ============= HANDLE RATING =============
    const handleRate = async () => {
        if (!review.trim()) {
            setError('Please write a review before submitting.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const dbUserId = getDatabaseUserId(user);
            const currentUser = authService.getCurrentUser();

            const newReview = {
                id: Date.now(),
                userId: dbUserId,
                userName: currentUser?.name || currentUser?.fullName || 'Anonymous User',
                userAvatar: (currentUser?.name?.charAt(0) || currentUser?.fullName?.charAt(0) || 'U').toUpperCase(),
                rating: userRating,
                review: review.trim(),
                date: new Date().toISOString(),
                helpful: 0
            };

            // Update the uploads state with the new review
            setUploads(prevUploads =>
                prevUploads.map(upload => {
                    if (upload.id === ratingModal.resourceId) {
                        const existingReviews = upload.reviews || [];
                        const updatedReviews = [...existingReviews, newReview];
                        const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

                        return {
                            ...upload,
                            reviews: updatedReviews,
                            averageRating: newAverageRating,
                            ratingCount: updatedReviews.length
                        };
                    }
                    return upload;
                })
            );

            setSuccessMessage(`Review submitted successfully!\nRating: ${userRating} stars`);
            setTimeout(() => setSuccessMessage(null), 3000);
            
            setRatingModal({ show: false, resourceId: null, resourceTitle: '' });
            setUserRating(5);
            setReview('');
        } catch (error) {
            console.error('Error submitting rating:', error);
            setError('Failed to submit rating. Please try again.');
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

            if (!upload?.filePath && !upload?.link) {
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
            newTab.location.href = upload.filePath || upload.link;

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
        if (!status) return 'myuploads-status-badge';

        switch (status?.toLowerCase()) {
            case 'active': return 'myuploads-status-badge myuploads-active';
            case 'pending': return 'myuploads-status-badge myuploads-pending';
            case 'rejected': return 'myuploads-status-badge myuploads-rejected';
            case 'flagged': return 'myuploads-status-badge myuploads-flagged';
            default: return 'myuploads-status-badge';
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
            <span className="myuploads-stars-container">
                {[...Array(Math.max(0, fullStars))].map((_, i) => (
                    <span key={`full-${i}`} className="myuploads-star myuploads-full">★</span>
                ))}
                {hasHalfStar && <span className="myuploads-star myuploads-half">½</span>}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <span key={`empty-${i}`} className="myuploads-star myuploads-empty">☆</span>
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
            <div className="myuploads-layout">
                <StudentSidebar user={user} />
                <div className="myuploads-main-area">
                    <div className="myuploads-loading-spinner">Loading your uploads...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="myuploads-layout">
            <StudentSidebar user={user} />
            
            <div className="myuploads-main-area">
                {/* Header */}
                <div className="myuploads-content-header">
                    <div>
                        <h1 className="myuploads-page-title">My Uploads</h1>
                        <p className="myuploads-page-subtitle">Manage all resources you've uploaded</p>
                    </div>
                    <div className="myuploads-header-actions">
                        <button onClick={() => navigate('/upload')} className="myuploads-primary-btn">
                            + Upload New
                        </button>
                        <button onClick={() => navigate('/dashboard/student')} className="myuploads-back-btn">
                            ← Dashboard
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="myuploads-success-message">
                        <span className="myuploads-success-icon">✓</span>
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="myuploads-error-message">
                        <div className="myuploads-error-content">
                            <span className="myuploads-error-icon">⚠</span>
                            <span><strong>Error:</strong> {error}</span>
                            <button onClick={handleRetry} className="myuploads-retry-btn">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="myuploads-stats-grid">
                    <div className="myuploads-stat-card">
                        <div className="myuploads-stat-icon myuploads-blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" />
                                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="myuploads-stat-value">{stats.total}</div>
                            <div className="myuploads-stat-label">Total Uploads</div>
                        </div>
                    </div>
                    <div className="myuploads-stat-card">
                        <div className="myuploads-stat-icon myuploads-green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="myuploads-stat-value">{stats.active}</div>
                            <div className="myuploads-stat-label">Active</div>
                        </div>
                    </div>
                    <div className="myuploads-stat-card">
                        <div className="myuploads-stat-icon myuploads-orange">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="myuploads-stat-value">{stats.pending}</div>
                            <div className="myuploads-stat-label">Pending Review</div>
                        </div>
                    </div>
                    <div className="myuploads-stat-card">
                        <div className="myuploads-stat-icon myuploads-purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div>
                            <div className="myuploads-stat-value">{stats.views}</div>
                            <div className="myuploads-stat-label">Total Views</div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="myuploads-filters-section">
                    <div className="myuploads-search-box-wrapper">
                        <input
                            type="text"
                            placeholder="Search your uploads by title, subject, or course code..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`myuploads-search-input ${searchError ? 'myuploads-error' : ''}`}
                        />
                        {searchTerm && (
                            <button
                                className="myuploads-clear-search-btn"
                                onClick={clearSearch}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                        {searchError && (
                            <div className="myuploads-search-error">{searchError}</div>
                        )}
                    </div>

                    <div className="myuploads-filter-tabs-wrapper">
                        <button className={`myuploads-filter-tab ${filter === 'all' ? 'myuploads-active' : ''}`} onClick={() => setFilter('all')}>
                            All ({stats.total})
                        </button>
                        <button className={`myuploads-filter-tab ${filter === 'pending' ? 'myuploads-active' : ''}`} onClick={() => setFilter('pending')}>
                            Pending ({stats.pending})
                        </button>
                        <button className={`myuploads-filter-tab ${filter === 'active' ? 'myuploads-active' : ''}`} onClick={() => setFilter('active')}>
                            Active ({stats.active})
                        </button>
                    </div>

                    <div className="myuploads-sort-wrapper">
                        <label className="myuploads-sort-label">Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="myuploads-sort-select">
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
                    <div className="myuploads-empty-state">
                        <div className="myuploads-empty-icon">
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
                            <button onClick={() => navigate('/upload')} className="myuploads-primary-btn">
                                Upload Your First Resource
                            </button>
                        )}
                        {searchTerm && (
                            <button onClick={clearSearch} className="myuploads-secondary-btn">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="myuploads-uploads-stats">
                            Showing {filteredUploads.length} of {uploads.length} uploads
                        </div>
                        <div className="myuploads-uploads-grid">
                            {filteredUploads.map((upload) => (
                                <div key={upload.id} className="myuploads-upload-card" onClick={() => handleView(upload.id)}>
                                    <div className="myuploads-upload-card-header">
                                        <div 
                                            className="myuploads-upload-type-badge" 
                                            data-type={upload.type?.toLowerCase() || 'document'}
                                        >
                                            {getFileTypeLabel(upload.type)}
                                        </div>
                                        <div className="myuploads-upload-info">
                                            <h3 className="myuploads-upload-title">{upload.title}</h3>
                                            <div className="myuploads-upload-meta">
                                                <span className="myuploads-upload-subject">{upload.subject}</span>
                                                <span className="myuploads-upload-semester">{upload.semester}</span>
                                                {upload.courseCode && (
                                                    <span className="myuploads-upload-course">{upload.courseCode}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="myuploads-upload-status">
                                            <span className={getStatusBadgeClass(upload.status)}>
                                                {upload.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {upload.description && (
                                        <p className="myuploads-upload-description">
                                            {upload.description.length > 100
                                                ? upload.description.substring(0, 100) + '...'
                                                : upload.description}
                                        </p>
                                    )}

                                    {upload.tags && (
                                        <div className="myuploads-upload-tags">
                                            {upload.tags.split(',').map((tag, i) => (
                                                <span key={i} className="myuploads-tag">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="myuploads-upload-stats">
                                        <div className="myuploads-stat-item" title="Upload Date">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                                <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {formatDate(upload.uploadedAt)}
                                        </div>
                                        <div className="myuploads-stat-item" title="Views">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {upload.viewCount || 0}
                                        </div>
                                        <div className="myuploads-stat-item" title="Downloads">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 3V12M12 12L9 9M12 12L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M5 17V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V17" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {upload.downloadCount || 0}
                                        </div>
                                        <div className="myuploads-stat-item" title="Rating">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {renderStars(upload.averageRating || 0)}
                                            <span className="myuploads-rating-count">
                                                ({upload.ratingCount || 0})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="myuploads-upload-actions">
                                        <button
                                            className={`myuploads-action-btn myuploads-bookmark ${bookmarkedIds.has(upload.id) ? 'myuploads-bookmarked' : ''}`}
                                            onClick={(e) => handleBookmark(upload.id, e)}
                                            title={bookmarkedIds.has(upload.id) ? "Remove Bookmark" : "Bookmark this resource"}
                                        >
                                            {bookmarkedIds.has(upload.id) ? '★ Bookmarked' : '☆ Bookmark'}
                                        </button>
                                        <button
                                            className="myuploads-action-btn myuploads-view"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(upload.id);
                                            }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="myuploads-action-btn myuploads-rate"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRatingModal({ 
                                                    show: true, 
                                                    resourceId: upload.id, 
                                                    resourceTitle: upload.title 
                                                });
                                            }}
                                            title="Rate this resource"
                                        >
                                            ⭐ Rate
                                        </button>
                                        <button
                                            className="myuploads-action-btn myuploads-download"
                                            onClick={(e) => handleDownload(upload, e)}
                                        >
                                            Download
                                        </button>
                                        <button
                                            className="myuploads-action-btn myuploads-edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(upload.id);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="myuploads-action-btn myuploads-delete"
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
                <div className="myuploads-modal-overlay" onClick={cancelDelete}>
                    <div className="myuploads-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete <strong>"{deleteConfirm.resourceTitle}"</strong>?</p>
                        <p className="myuploads-warning-text">This action cannot be undone.</p>
                        <div className="myuploads-modal-actions">
                            <button type="button" onClick={cancelDelete} className="myuploads-cancel-btn">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDelete} className="myuploads-delete-confirm-btn">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal.show && (
                <div className="myuploads-modal-overlay" onClick={() => setRatingModal({ show: false, resourceId: null, resourceTitle: '' })}>
                    <div className="myuploads-modal-content myuploads-rating-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Rate: {ratingModal.resourceTitle}</h2>
                        
                        <div className="myuploads-rating-input">
                            <label>Your Rating:</label>
                            <div className="myuploads-rating-stars">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`myuploads-star-btn ${userRating >= star ? 'myuploads-active' : ''}`}
                                        onClick={() => setUserRating(star)}
                                        title={`${star} star${star !== 1 ? 's' : ''}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <select 
                                value={userRating} 
                                onChange={(e) => setUserRating(parseInt(e.target.value))} 
                                className="myuploads-rating-select"
                            >
                                <option value={5}>5 Stars - Excellent</option>
                                <option value={4}>4 Stars - Very Good</option>
                                <option value={3}>3 Stars - Good</option>
                                <option value={2}>2 Stars - Fair</option>
                                <option value={1}>1 Star - Poor</option>
                            </select>
                        </div>

                        <div className="myuploads-form-group">
                            <label>Write a Review *</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="What did you think about this resource? Share your experience to help others..."
                                rows="4"
                                className="myuploads-review-textarea"
                                required
                            />
                            <small className="myuploads-input-hint">
                                Your review will be visible to other users and helps the community.
                            </small>
                        </div>

                        <div className="myuploads-modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setRatingModal({ show: false, resourceId: null, resourceTitle: '' });
                                    setUserRating(5);
                                    setReview('');
                                }}
                                className="myuploads-cancel-btn"
                            >
                                Cancel
                            </button>
                            <button type="button" onClick={handleRate} className="myuploads-submit-btn">
                                Submit Rating & Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyUploads;