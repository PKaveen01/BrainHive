import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
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
    const [ratingModal, setRatingModal] = useState({ show: false, resourceId: null, resourceTitle: '' });
    const [userRating, setUserRating] = useState(5);
    const [review, setReview] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        views: 0,
        downloads: 0
    });

    // ============= USER ID MAPPING =============
    const getDatabaseUserId = (authUser) => {
        if (!authUser) return null;
        if (authUser.userId) return String(authUser.userId);
        if (authUser.id) return String(authUser.id);
        return null;
    };

    // ============= INITIALIZATION =============
    useEffect(() => {
        const init = async () => {
            let currentUser = authService.getCurrentUser();

            if (!currentUser) {
                navigate('/login');
                return;
            }

            if (!currentUser.userId) {
                try {
                    const resp = await api.get('/auth/check');
                    if (resp.data && resp.data.success && resp.data.userId) {
                        currentUser = { ...currentUser, userId: resp.data.userId };
                        localStorage.setItem('user', JSON.stringify(currentUser));
                    }
                } catch (e) {
                    // session check failed - continue anyway
                }
            }

            setUser(currentUser);
            const userId = getDatabaseUserId(currentUser);
            fetchBookmarks(userId);
        };
        init();
    }, []);

    // ============= FETCH BOOKMARKS =============
    const fetchBookmarks = async (userIdParam) => {
        try {
            setLoading(true);
            setError(null);

            const userId = userIdParam != null ? userIdParam : getDatabaseUserId(user);

            if (!userId) {
                setError('Unable to identify user');
                setLoading(false);
                return;
            }

            let response;
            try {
                response = await api.get(`/resources/user/${userId}/bookmarked`);
            } catch (err) {
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
        } finally {
            setLoading(false);
        }
    };

    // ============= REMOVE BOOKMARK =============
    const handleRemoveBookmark = async (resourceId) => {
        if (!window.confirm('Remove this bookmark?')) return;

        try {
            const userId = getDatabaseUserId(user);
            await api.delete(`/resources/${resourceId}/bookmark?userId=${userId}`);
            await fetchBookmarks();
            setSuccessMessage('Bookmark removed successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error removing bookmark:', error);
            setError('Failed to remove bookmark');
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

            setBookmarks(prevBookmarks =>
                prevBookmarks.map(bookmark => {
                    if (bookmark.id === ratingModal.resourceId) {
                        const existingReviews = bookmark.reviews || [];
                        const updatedReviews = [...existingReviews, newReview];
                        const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

                        return {
                            ...bookmark,
                            reviews: updatedReviews,
                            averageRating: newAverageRating,
                            ratingCount: updatedReviews.length
                        };
                    }
                    return bookmark;
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
        if (!status) return 'bookmarked-status-badge';

        switch (status?.toLowerCase()) {
            case 'active': return 'bookmarked-status-badge bookmarked-active';
            case 'pending': return 'bookmarked-status-badge bookmarked-pending';
            case 'rejected': return 'bookmarked-status-badge bookmarked-rejected';
            case 'flagged': return 'bookmarked-status-badge bookmarked-flagged';
            default: return 'bookmarked-status-badge';
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
            <span className="bookmarked-stars-container">
                {[...Array(Math.max(0, fullStars))].map((_, i) => (
                    <span key={`full-${i}`} className="bookmarked-star bookmarked-full">★</span>
                ))}
                {hasHalfStar && <span className="bookmarked-star bookmarked-half">½</span>}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <span key={`empty-${i}`} className="bookmarked-star bookmarked-empty">☆</span>
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
        <div className="bookmarked-layout">
            {/* Sidebar */}
            <StudentSidebar user={user} />

            {/* Main Content */}
            <div className="bookmarked-main-area">
                {/* Header */}
                <div className="bookmarked-content-header">
                    <div>
                        <h1 className="bookmarked-page-title">Bookmarked Resources</h1>
                        <p className="bookmarked-page-subtitle">Resources you've saved for later</p>
                    </div>
                    <div className="bookmarked-header-actions">
                        <button onClick={() => navigate('/dashboard/student')} className="bookmarked-secondary-btn">
                            Browse Discovery
                        </button>
                        <button onClick={() => navigate('/upload')} className="bookmarked-primary-btn">
                            + Upload New
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bookmarked-success-message">
                        <span className="bookmarked-success-icon">✓</span>
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bookmarked-error-message">
                        <div className="bookmarked-error-content">
                            <span className="bookmarked-error-icon">⚠</span>
                            <span><strong>Error:</strong> {error}</span>
                            <button onClick={() => fetchBookmarks()} className="bookmarked-retry-btn">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="bookmarked-stats-grid">
                    <div className="bookmarked-stat-card">
                        <div className="bookmarked-stat-icon bookmarked-blue">
                            <span className="bookmarked-icon">🔖</span>
                        </div>
                        <div>
                            <div className="bookmarked-stat-value">{stats.total}</div>
                            <div className="bookmarked-stat-label">Total Bookmarks</div>
                        </div>
                    </div>

                    <div className="bookmarked-stat-card">
                        <div className="bookmarked-stat-icon bookmarked-green">
                            <span className="bookmarked-icon">✅</span>
                        </div>
                        <div>
                            <div className="bookmarked-stat-value">{stats.active}</div>
                            <div className="bookmarked-stat-label">Active</div>
                        </div>
                    </div>

                    <div className="bookmarked-stat-card">
                        <div className="bookmarked-stat-icon bookmarked-orange">
                            <span className="bookmarked-icon">⏳</span>
                        </div>
                        <div>
                            <div className="bookmarked-stat-value">{stats.pending}</div>
                            <div className="bookmarked-stat-label">Pending Review</div>
                        </div>
                    </div>

                    <div className="bookmarked-stat-card">
                        <div className="bookmarked-stat-icon bookmarked-purple">
                            <span className="bookmarked-icon">👁️</span>
                        </div>
                        <div>
                            <div className="bookmarked-stat-value">{stats.views}</div>
                            <div className="bookmarked-stat-label">Total Views</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bookmarked-filters-section">
                    <div className="bookmarked-search-box-wrapper">
                        <input
                            type="text"
                            placeholder="Search your bookmarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bookmarked-search-input"
                        />
                        {searchTerm && (
                            <button className="bookmarked-clear-search" onClick={() => setSearchTerm('')}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Bookmarks Grid */}
                {loading ? (
                    <div className="bookmarked-loading-spinner">Loading your bookmarks...</div>
                ) : filteredBookmarks.length === 0 ? (
                    <div className="bookmarked-empty-state">
                        <div className="bookmarked-empty-icon">🔖</div>
                        <h3>No bookmarks yet</h3>
                        <p>
                            {searchTerm
                                ? `No results for "${searchTerm}"`
                                : error
                                    ? error
                                    : 'Bookmark resources while browsing to see them here'}
                        </p>
                        {!searchTerm && !error && (
                            <button onClick={() => navigate('/dashboard/student')} className="bookmarked-primary-btn">
                                Browse Resources
                            </button>
                        )}
                        {error && (
                            <button onClick={() => fetchBookmarks()} className="bookmarked-secondary-btn">
                                Try Again
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="bookmarked-results-stats">
                            Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
                        </div>
                        <div className="bookmarked-uploads-grid">
                            {filteredBookmarks.map((resource) => (
                                <div key={resource.id} className="bookmarked-resource-card">
                                    <div className="bookmarked-resource-card-header">
                                        <div 
                                            className="bookmarked-resource-type-icon"
                                            data-type={resource.type?.toLowerCase() || 'document'}
                                        >
                                            {getTypeIcon(resource.type)}
                                        </div>
                                        <div className="bookmarked-resource-card-actions">
                                            <span className={getStatusBadgeClass(resource.status)}>
                                                {resource.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bookmarked-resource-card-body" onClick={() => handleViewDetails(resource)}>
                                        <h3 className="bookmarked-resource-card-title">{resource.title}</h3>
                                        <div className="bookmarked-resource-meta">
                                            <span className="bookmarked-resource-subject">{resource.subject}</span>
                                            <span className="bookmarked-resource-semester">{resource.semester}</span>
                                        </div>

                                        {resource.description && (
                                            <p className="bookmarked-resource-description">
                                                {resource.description.substring(0, 100)}
                                                {resource.description.length > 100 ? '...' : ''}
                                            </p>
                                        )}

                                        {resource.tags && (
                                            <div className="bookmarked-resource-tags">
                                                {resource.tags.split(',').slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="bookmarked-tag">#{tag.trim()}</span>
                                                ))}
                                                {resource.tags.split(',').length > 3 && (
                                                    <span className="bookmarked-tag-more">+{resource.tags.split(',').length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="bookmarked-resource-stats">
                                            <div className="bookmarked-stat-item" title="Views">
                                                <span>👁️</span> {resource.viewCount || 0}
                                            </div>
                                            <div className="bookmarked-stat-item" title="Downloads">
                                                <span>📥</span> {resource.downloadCount || 0}
                                            </div>
                                            <div className="bookmarked-stat-item" title="Rating">
                                                <span>⭐</span> {resource.averageRating?.toFixed(1) || 0}
                                                <span className="bookmarked-review-count">({resource.ratingCount || 0})</span>
                                            </div>
                                            <div className="bookmarked-stat-item" title="Uploaded">
                                                <span>📅</span> {formatDate(resource.uploadedAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bookmarked-resource-card-footer">
                                        <div className="bookmarked-action-buttons">
                                            <button
                                                className="bookmarked-action-btn bookmarked-view"
                                                onClick={() => handleOpenResource(resource)}
                                                title={resource.link ? 'Open Link' : 'Download'}
                                            >
                                                {resource.link ? '🔗 Open' : '📥 Download'}
                                            </button>
                                            <button
                                                className="bookmarked-action-btn bookmarked-rate"
                                                onClick={() => setRatingModal({ 
                                                    show: true, 
                                                    resourceId: resource.id, 
                                                    resourceTitle: resource.title 
                                                })}
                                                title="Rate this resource"
                                            >
                                                ⭐ Rate
                                            </button>
                                            <button
                                                className="bookmarked-action-btn bookmarked-delete"
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
                    </>
                )}
            </div>

            {/* Resource Details Modal */}
            {detailsModal.show && detailsModal.resource && (
                <div className="bookmarked-modal-overlay" onClick={() => setDetailsModal({ show: false, resource: null })}>
                    <div className="bookmarked-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bookmarked-details-modal-header">
                            <div className="bookmarked-details-type-icon">
                                {getTypeIcon(detailsModal.resource.type)}
                            </div>
                            <div className="bookmarked-details-title-section">
                                <h2>{detailsModal.resource.title}</h2>
                                <div className="bookmarked-details-meta">
                                    <span className="bookmarked-details-subject">{detailsModal.resource.subject}</span>
                                    <span className="bookmarked-details-semester">{detailsModal.resource.semester}</span>
                                    <span className={getStatusBadgeClass(detailsModal.resource.status)}>
                                        {detailsModal.resource.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="bookmarked-modal-close-btn"
                                onClick={() => setDetailsModal({ show: false, resource: null })}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bookmarked-details-modal-body">
                            {detailsModal.resource.description && (
                                <div className="bookmarked-details-section">
                                    <h3>Description</h3>
                                    <p>{detailsModal.resource.description}</p>
                                </div>
                            )}

                            {detailsModal.resource.tags && (
                                <div className="bookmarked-details-section">
                                    <h3>Tags</h3>
                                    <div className="bookmarked-details-tags">
                                        {detailsModal.resource.tags.split(',').map((tag, i) => (
                                            <span key={i} className="bookmarked-tag">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detailsModal.resource.courseCode && (
                                <div className="bookmarked-details-section">
                                    <h3>Course Code</h3>
                                    <p className="bookmarked-course-code">{detailsModal.resource.courseCode}</p>
                                </div>
                            )}

                            <div className="bookmarked-details-section">
                                <h3>Resource Details</h3>
                                <div className="bookmarked-details-grid">
                                    <div className="bookmarked-detail-item">
                                        <span className="bookmarked-detail-label">License:</span>
                                        <span className="bookmarked-detail-value">{detailsModal.resource.license || 'Not specified'}</span>
                                    </div>
                                    <div className="bookmarked-detail-item">
                                        <span className="bookmarked-detail-label">Visibility:</span>
                                        <span className="bookmarked-detail-value">{detailsModal.resource.visibility || 'public'}</span>
                                    </div>
                                    <div className="bookmarked-detail-item">
                                        <span className="bookmarked-detail-label">Uploaded:</span>
                                        <span className="bookmarked-detail-value">{formatDate(detailsModal.resource.uploadedAt)}</span>
                                    </div>
                                    <div className="bookmarked-detail-item">
                                        <span className="bookmarked-detail-label">Ratings:</span>
                                        <span className="bookmarked-detail-value">
                                            {renderStars(detailsModal.resource.averageRating || 0)}
                                            <span style={{ marginLeft: '8px' }}>
                                                ⭐ {detailsModal.resource.averageRating?.toFixed(1) || 0}
                                                ({detailsModal.resource.ratingCount || 0} reviews)
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bookmarked-details-section">
                                <h3>Settings</h3>
                                <div className="bookmarked-settings-indicators">
                                    <span className={`bookmarked-setting-badge ${detailsModal.resource.allowRatings ? 'bookmarked-enabled' : 'bookmarked-disabled'}`}>
                                        {detailsModal.resource.allowRatings ? '✓ Ratings Allowed' : '✗ Ratings Disabled'}
                                    </span>
                                    <span className={`bookmarked-setting-badge ${detailsModal.resource.allowComments ? 'bookmarked-enabled' : 'bookmarked-disabled'}`}>
                                        {detailsModal.resource.allowComments ? '💬 Comments Allowed' : '🔇 Comments Disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="bookmarked-details-section">
                                <h3>Statistics</h3>
                                <div className="bookmarked-stats-row">
                                    <div className="bookmarked-stat-box">
                                        <span className="bookmarked-stat-number">{detailsModal.resource.viewCount || 0}</span>
                                        <span className="bookmarked-stat-label">Views</span>
                                    </div>
                                    <div className="bookmarked-stat-box">
                                        <span className="bookmarked-stat-number">{detailsModal.resource.downloadCount || 0}</span>
                                        <span className="bookmarked-stat-label">Downloads</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bookmarked-details-modal-footer">
                            <button
                                className="bookmarked-download-btn"
                                onClick={() => handleOpenResource(detailsModal.resource)}
                            >
                                {detailsModal.resource.link ? '🔗 Open Link' : '📥 Download'}
                            </button>
                            <button
                                className="bookmarked-rate-btn"
                                onClick={() => {
                                    setDetailsModal({ show: false, resource: null });
                                    setRatingModal({ 
                                        show: true, 
                                        resourceId: detailsModal.resource.id, 
                                        resourceTitle: detailsModal.resource.title 
                                    });
                                }}
                            >
                                ⭐ Rate Resource
                            </button>
                            <button
                                className="bookmarked-delete-btn"
                                onClick={() => {
                                    handleRemoveBookmark(detailsModal.resource.id);
                                    setDetailsModal({ show: false, resource: null });
                                }}
                            >
                                ★ Remove Bookmark
                            </button>
                            <button
                                className="bookmarked-close-btn"
                                onClick={() => setDetailsModal({ show: false, resource: null })}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal.show && (
                <div className="bookmarked-modal-overlay" onClick={() => setRatingModal({ show: false, resourceId: null, resourceTitle: '' })}>
                    <div className="bookmarked-modal-content bookmarked-rating-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Rate: {ratingModal.resourceTitle}</h2>
                        
                        <div className="bookmarked-rating-input">
                            <label>Your Rating:</label>
                            <div className="bookmarked-rating-stars">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`bookmarked-star-btn ${userRating >= star ? 'bookmarked-active' : ''}`}
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
                                className="bookmarked-rating-select"
                            >
                                <option value={5}>5 Stars - Excellent</option>
                                <option value={4}>4 Stars - Very Good</option>
                                <option value={3}>3 Stars - Good</option>
                                <option value={2}>2 Stars - Fair</option>
                                <option value={1}>1 Star - Poor</option>
                            </select>
                        </div>

                        <div className="bookmarked-form-group">
                            <label>Write a Review *</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="What did you think about this resource? Share your experience to help others..."
                                rows="4"
                                className="bookmarked-review-textarea"
                                required
                            />
                            <small className="bookmarked-input-hint">
                                Your review will be visible to other users and helps the community.
                            </small>
                        </div>

                        <div className="bookmarked-modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setRatingModal({ show: false, resourceId: null, resourceTitle: '' });
                                    setUserRating(5);
                                    setReview('');
                                }}
                                className="bookmarked-cancel-btn"
                            >
                                Cancel
                            </button>
                            <button type="button" onClick={handleRate} className="bookmarked-submit-btn">
                                Submit Rating & Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookMarked;