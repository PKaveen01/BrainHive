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
        return '1'; // Use your actual user ID mapping logic
    };

    // ============= INITIALIZATION =============
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchBookmarks();
    }, []);

    // ============= FETCH BOOKMARKS =============
    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const userId = getDatabaseUserId(user);
            const response = await api.get(`/resources/user/${userId}/bookmarked`);
            const bookmarksData = response.data || [];
            setBookmarks(bookmarksData);
            
            // Calculate stats
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
            fetchBookmarks(); // Refresh list
        } catch (error) {
            console.error('Error removing bookmark:', error);
            alert('Failed to remove bookmark');
        }
    };

    // ============= VIEW DETAILS =============
    const handleViewDetails = (resource) => {
        setDetailsModal({ show: true, resource });
    };

    // ============= DOWNLOAD/OPEN RESOURCE =============
    const handleOpenResource = (resource) => {
        if (resource.link) {
            window.open(resource.link, '_blank');
        } else if (resource.filePath) {
            window.open(`http://localhost:8080${resource.filePath}`, '_blank');
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
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const filteredBookmarks = bookmarks.filter(b => 
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {/* Stats Cards - Matching existing theme */}
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
                                : "Bookmark resources while browsing to see them here"}
                        </p>
                        {!searchTerm && (
                            <button onClick={() => navigate('/dashboard/student')} className="primary-btn">
                                Browse Resources
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
                                            {resource.tags.split(',').map((tag, i) => (
                                                <span key={i} className="tag">{tag.trim()}</span>
                                            ))}
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
                                            {resource.link ? '🔗' : '📥'}
                                        </button>
                                        <button 
                                            className="action-btn delete"
                                            onClick={() => handleRemoveBookmark(resource.id)}
                                            title="Remove Bookmark"
                                        >
                                            ★
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
                                            <span key={i} className="tag">{tag.trim()}</span>
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
                                <h3>Resource Content</h3>
                                <div className="details-content">
                                    {detailsModal.resource.link ? (
                                        <div className="link-preview">
                                            <div className="link-icon">🔗</div>
                                            <a 
                                                href={detailsModal.resource.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="resource-link"
                                            >
                                                {detailsModal.resource.link}
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="file-info">
                                            <div className="file-icon">📄</div>
                                            <div className="file-details">
                                                <p className="file-name">{detailsModal.resource.fileName || 'Document'}</p>
                                                <p className="file-size">
                                                    {detailsModal.resource.fileSize ? 
                                                        `${detailsModal.resource.fileSize} MB` : 
                                                        'Size not available'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

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
                                            ⭐ {detailsModal.resource.averageRating?.toFixed(1) || 0} 
                                            ({detailsModal.resource.ratingCount || 0} reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Settings</h3>
                                <div className="settings-indicators">
                                    <span className={`setting-badge ${detailsModal.resource.allowRatings ? 'enabled' : 'disabled'}`}>
                                        {detailsModal.resource.allowRatings ? '✅ Ratings Allowed' : '❌ Ratings Disabled'}
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