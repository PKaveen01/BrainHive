import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './BookMarked.css';

const BookMarked = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailsModal, setDetailsModal] = useState({ show: false, resource: null });
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        views: 0,
        downloads: 0
    });

    // ============= USER ID MAPPING =============
    const AUTH_TO_DB_ID_MAP = {
        'alex@example.com': '1',
        'john@example.com': '2',
        'sarah@example.com': '3',
        'mike@example.com': '4',
    };

    const getDatabaseUserId = (authUser) => {
        if (!authUser) return null;

        if (authUser.email && AUTH_TO_DB_ID_MAP[authUser.email]) {
            return AUTH_TO_DB_ID_MAP[authUser.email];
        }

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

        for (const id of possibleIds) {
            if (/^\d+$/.test(String(id))) {
                return String(id);
            }
        }

        return '1';
    };

    // ============= INITIALIZATION =============
    useEffect(() => {
        const currentUser = authService.getCurrentUser();

        if (!currentUser) {
            navigate('/login');
            return;
        }

        setUser(currentUser);
        fetchBookmarks(currentUser);
    }, [navigate]);

    // ============= FETCH BOOKMARKS =============
    const fetchBookmarks = async (providedUser = null) => {
        try {
            setLoading(true);
            setError(null);

            const activeUser = providedUser || user || authService.getCurrentUser();
            const userId = getDatabaseUserId(activeUser);

            if (!activeUser || !userId) {
                setError('Unable to identify user');
                setBookmarks([]);
                setStats({
                    total: 0,
                    pending: 0,
                    active: 0,
                    views: 0,
                    downloads: 0
                });
                setLoading(false);
                return;
            }

            if (!user) {
                setUser(activeUser);
            }

            let response;
            try {
                response = await api.get(`/resources/user/${userId}/bookmarked`);
            } catch (error) {
                response = await api.get(`/bookmarks/user/${userId}`);
            }

            let bookmarksData = [];
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    bookmarksData = response.data;
                } else if (response.data.content && Array.isArray(response.data.content)) {
                    bookmarksData = response.data.content;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    bookmarksData = response.data.data;
                } else if (response.data.bookmarks && Array.isArray(response.data.bookmarks)) {
                    bookmarksData = response.data.bookmarks;
                }
            }

            setBookmarks(bookmarksData);

            const pending = bookmarksData.filter(b => b?.status === 'pending').length;
            const active = bookmarksData.filter(b => b?.status === 'active').length;
            const totalViews = bookmarksData.reduce((sum, b) => sum + (b?.viewCount || 0), 0);
            const totalDownloads = bookmarksData.reduce((sum, b) => sum + (b?.downloadCount || 0), 0);

            setStats({
                total: bookmarksData.length,
                pending,
                active,
                views: totalViews,
                downloads: totalDownloads
            });

        } catch (error) {
            console.error('Error fetching bookmarks:', error);

            if (error.response?.status === 404) {
                setError('No bookmarks found. Start bookmarking resources to see them here!');
            } else if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Failed to load bookmarks. Please try again.');
            }

            setBookmarks([]);
            setStats({
                total: 0,
                pending: 0,
                active: 0,
                views: 0,
                downloads: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // ============= REMOVE BOOKMARK =============
    const handleRemoveBookmark = async (resourceId) => {
        if (!window.confirm('Remove this bookmark?')) return;

        try {
            const activeUser = user || authService.getCurrentUser();
            const userId = getDatabaseUserId(activeUser);

            if (!userId) {
                setError('Unable to identify user');
                setTimeout(() => setError(null), 3000);
                return;
            }

            await api.delete(`/resources/${resourceId}/bookmark?userId=${userId}`);
            await fetchBookmarks(activeUser);
            setSuccessMessage('Bookmark removed successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error removing bookmark:', error);
            setError('Failed to remove bookmark');
            setTimeout(() => setError(null), 3000);
        }
    };

    // ============= VIEW DETAILS =============
    const handleViewDetails = (resource) => {
        setDetailsModal({ show: true, resource });
    };

    // ============= DOWNLOAD/OPEN RESOURCE =============
    const handleOpenResource = async (resource) => {
        try {
            if (resource.link) {
                window.open(resource.link, '_blank');
                if (resource.id) {
                    await api.post(`/resources/${resource.id}/download`);
                }
            } else if (resource.filePath) {
                window.open(`http://localhost:8080${resource.filePath}`, '_blank');
                if (resource.id) {
                    await api.post(`/resources/${resource.id}/download`);
                }
            }
        } catch (error) {
            console.error('Error opening resource:', error);
            setError('Failed to open resource');
        }
    };

    // ============= UTILITY FUNCTIONS =============
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
            if (isNaN(date.getTime())) return 'Invalid date';

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

    const filteredBookmarks = bookmarks.filter(b => {
        if (!b) return false;
        const term = searchTerm.toLowerCase();
        return (b.title?.toLowerCase() || '').includes(term) ||
               (b.subject?.toLowerCase() || '').includes(term) ||
               (b.description?.toLowerCase() || '').includes(term);
    });

    return (
        <div className="bookmarked-container">
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
                            <li onClick={() => navigate('/resources/my-uploads')}>My Uploads</li>
                            <li className="active" onClick={() => navigate('/resources/bookmarked')}>Bookmarked</li>
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
                        <h1 className="page-title">Bookmarked Resources</h1>
                        <p className="page-subtitle">Resources you've saved for later</p>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => navigate('/dashboard/student')} className="secondary-btn">
                            Browse Discovery
                        </button>
                        <button onClick={() => navigate('/upload')} className="primary-btn">
                            + Upload New
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
                        <span className="error-icon">⚠</span>
                        <strong>Error:</strong> {error}
                        <button
                            onClick={() => fetchBookmarks(user || authService.getCurrentUser())}
                            className="retry-btn"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <span className="icon">🔖</span>
                        </div>
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Bookmarks</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                            <span className="icon">✅</span>
                        </div>
                        <div>
                            <div className="stat-value">{stats.active}</div>
                            <div className="stat-label">Active</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <span className="icon">⏳</span>
                        </div>
                        <div>
                            <div className="stat-value">{stats.pending}</div>
                            <div className="stat-label">Pending Review</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <span className="icon">👁️</span>
                        </div>
                        <div>
                            <div className="stat-value">{stats.views}</div>
                            <div className="stat-label">Total Views</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="filters-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search your bookmarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Bookmarks Grid */}
                {loading ? (
                    <div className="loading-spinner">Loading your bookmarks...</div>
                ) : filteredBookmarks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔖</div>
                        <h3>No bookmarks yet</h3>
                        <p>
                            {searchTerm
                                ? `No results for "${searchTerm}"`
                                : error
                                    ? error
                                    : "Bookmark resources while browsing to see them here"}
                        </p>
                        {!searchTerm && !error && (
                            <button onClick={() => navigate('/dashboard/student')} className="primary-btn">
                                Browse Resources
                            </button>
                        )}
                        {error && (
                            <button
                                onClick={() => fetchBookmarks(user || authService.getCurrentUser())}
                                className="secondary-btn"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="uploads-grid">
                        {filteredBookmarks.map((resource) => (
                            <div key={resource.id} className="resource-card">
                                <div className="resource-card-header">
                                    <div className="resource-type-icon">
                                        {getTypeIcon(resource.type)}
                                    </div>
                                    <div className="resource-card-actions">
                                        <span className={getStatusBadgeClass(resource.status)}>
                                            {resource.status || 'pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="resource-card-body" onClick={() => handleViewDetails(resource)}>
                                    <h3 className="resource-card-title">{resource.title}</h3>
                                    <div className="resource-meta">
                                        <span className="resource-subject">{resource.subject}</span>
                                        <span className="resource-semester">{resource.semester}</span>
                                    </div>

                                    {resource.description && (
                                        <p className="resource-description">
                                            {resource.description.substring(0, 100)}
                                            {resource.description.length > 100 ? '...' : ''}
                                        </p>
                                    )}

                                    {resource.tags && (
                                        <div className="resource-tags">
                                            {resource.tags.split(',').slice(0, 3).map((tag, i) => (
                                                <span key={i} className="tag">#{tag.trim()}</span>
                                            ))}
                                            {resource.tags.split(',').length > 3 && (
                                                <span className="tag-more">+{resource.tags.split(',').length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="resource-stats">
                                        <div className="stat-item" title="Views">
                                            <span>👁️</span> {resource.viewCount || 0}
                                        </div>
                                        <div className="stat-item" title="Downloads">
                                            <span>📥</span> {resource.downloadCount || 0}
                                        </div>
                                        <div className="stat-item" title="Rating">
                                            <span>⭐</span> {resource.averageRating?.toFixed(1) || 0}
                                            <span className="review-count">({resource.ratingCount || 0})</span>
                                        </div>
                                        <div className="stat-item" title="Uploaded">
                                            <span>📅</span> {formatDate(resource.uploadedAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="resource-card-footer">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view"
                                            onClick={() => handleOpenResource(resource)}
                                            title={resource.link ? "Open Link" : "Download"}
                                        >
                                            {resource.link ? '🔗 Open' : '📥 Download'}
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleRemoveBookmark(resource.id)}
                                            title="Remove Bookmark"
                                        >
                                            ★ Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resource Details Modal */}
            {detailsModal.show && detailsModal.resource && (
                <div className="modal-overlay" onClick={() => setDetailsModal({ show: false, resource: null })}>
                    <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="details-modal-header">
                            <div className="details-type-icon">
                                {getTypeIcon(detailsModal.resource.type)}
                            </div>
                            <div className="details-title-section">
                                <h2>{detailsModal.resource.title}</h2>
                                <div className="details-meta">
                                    <span className="details-subject">{detailsModal.resource.subject}</span>
                                    <span className="details-semester">{detailsModal.resource.semester}</span>
                                    <span className={getStatusBadgeClass(detailsModal.resource.status)}>
                                        {detailsModal.resource.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setDetailsModal({ show: false, resource: null })}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="details-modal-body">
                            {detailsModal.resource.description && (
                                <div className="details-section">
                                    <h3>Description</h3>
                                    <p>{detailsModal.resource.description}</p>
                                </div>
                            )}

                            {detailsModal.resource.tags && (
                                <div className="details-section">
                                    <h3>Tags</h3>
                                    <div className="details-tags">
                                        {detailsModal.resource.tags.split(',').map((tag, i) => (
                                            <span key={i} className="tag">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detailsModal.resource.courseCode && (
                                <div className="details-section">
                                    <h3>Course Code</h3>
                                    <p className="course-code">{detailsModal.resource.courseCode}</p>
                                </div>
                            )}

                            <div className="details-section">
                                <h3>Resource Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">License:</span>
                                        <span className="detail-value">{detailsModal.resource.license || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Visibility:</span>
                                        <span className="detail-value">{detailsModal.resource.visibility || 'public'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Uploaded:</span>
                                        <span className="detail-value">{formatDate(detailsModal.resource.uploadedAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Ratings:</span>
                                        <span className="detail-value">
                                            {renderStars(detailsModal.resource.averageRating || 0)}
                                            <span style={{ marginLeft: '8px' }}>
                                                ⭐ {detailsModal.resource.averageRating?.toFixed(1) || 0}
                                                ({detailsModal.resource.ratingCount || 0} reviews)
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Settings</h3>
                                <div className="settings-indicators">
                                    <span className={`setting-badge ${detailsModal.resource.allowRatings ? 'enabled' : 'disabled'}`}>
                                        {detailsModal.resource.allowRatings ? '✓ Ratings Allowed' : '✗ Ratings Disabled'}
                                    </span>
                                    <span className={`setting-badge ${detailsModal.resource.allowComments ? 'enabled' : 'disabled'}`}>
                                        {detailsModal.resource.allowComments ? '💬 Comments Allowed' : '🔇 Comments Disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Statistics</h3>
                                <div className="stats-row">
                                    <div className="stat-box">
                                        <span className="stat-number">{detailsModal.resource.viewCount || 0}</span>
                                        <span className="stat-label">Views</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-number">{detailsModal.resource.downloadCount || 0}</span>
                                        <span className="stat-label">Downloads</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="details-modal-footer">
                            <button
                                className="download-btn"
                                onClick={() => handleOpenResource(detailsModal.resource)}
                            >
                                {detailsModal.resource.link ? '🔗 Open Link' : '📥 Download'}
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => {
                                    handleRemoveBookmark(detailsModal.resource.id);
                                    setDetailsModal({ show: false, resource: null });
                                }}
                            >
                                ★ Remove Bookmark
                            </button>
                            <button
                                className="close-btn"
                                onClick={() => setDetailsModal({ show: false, resource: null })}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookMarked;