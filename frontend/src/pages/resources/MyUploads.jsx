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
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        views: 0,
        downloads: 0
    });

    // ============= MAPPING AUTH IDs TO DATABASE IDs =============
    // IMPORTANT: Update these mappings based on your actual users
    const AUTH_TO_DB_ID_MAP = {
        // Map by email
        'alex@example.com': '1',
        'john@example.com': '2',
        'sarah@example.com': '3',
        'mike@example.com': '4',
    };

    const getDatabaseUserId = (authUser) => {
        if (!authUser) return null;

        console.log('Getting DB ID for auth user:', authUser);

        // Try to get ID from multiple possible fields
        const possibleIds = [
            authUser.id,
            authUser.userId,
            authUser._id,
            authUser.uid,
            authUser.sub
        ].filter(id => id); // Remove null/undefined

        console.log('Possible IDs from auth user:', possibleIds);

        // Check if any of these IDs are in our map
        for (const id of possibleIds) {
            if (AUTH_TO_DB_ID_MAP[id]) {
                console.log(`Mapped auth ID ${id} to DB ID: ${AUTH_TO_DB_ID_MAP[id]}`);
                return AUTH_TO_DB_ID_MAP[id];
            }
        }

        // Map by email
        if (authUser.email && AUTH_TO_DB_ID_MAP[authUser.email]) {
            console.log(`Mapped email ${authUser.email} to DB ID: ${AUTH_TO_DB_ID_MAP[authUser.email]}`);
            return AUTH_TO_DB_ID_MAP[authUser.email];
        }

        // If ID is already numeric and looks like a DB ID (1,2,3,4)
        for (const id of possibleIds) {
            if (/^\d+$/.test(id)) {
                console.log(`Using numeric ID directly: ${id}`);
                return id;
            }
        }

        console.log('Could not map user to database ID');
        return null;
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        console.log('Current user from auth:', currentUser);
        
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        // For testing: Try with hardcoded ID first to verify backend works
        // Comment this out after testing
        // const testUserId = "1";
        // console.log('🔴 TESTING with hardcoded ID:', testUserId);
        // fetchUploads(testUserId);

        const dbUserId = getDatabaseUserId(currentUser);
        console.log('Final database user ID:', dbUserId);
        
        if (dbUserId) {
            fetchUploads(dbUserId);
        } else {
            setError('Could not identify user. Please check your login.');
            setLoading(false);
        }
    }, []);

    const fetchUploads = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching uploads for user ID:', userId);
            
            // Make sure userId is a string
            const userIdStr = String(userId);
            const response = await api.get(`/resources/user/${userIdStr}`);
            
            console.log('📥 Full API Response:', response);
            console.log('📦 Response data:', response.data);
            console.log('📦 Data type:', typeof response.data);
            console.log('📦 Is array?', Array.isArray(response.data));
            
            // Handle different response formats
            let uploadsData = [];
            if (Array.isArray(response.data)) {
                uploadsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // If it's an object with a content or data property (for paginated responses)
                uploadsData = response.data.content || response.data.data || [];
            }
            
            console.log('📦 Processed uploads data:', uploadsData);
            console.log('📦 Number of uploads:', uploadsData.length);
            
            setUploads(uploadsData);
            
            // Calculate stats
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
            console.error('❌ Error fetching uploads:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            
            setError(error.response?.data?.message || error.message || 'Failed to fetch uploads');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        try {
            await api.delete(`/resources/${resourceId}`);
            const dbUserId = getDatabaseUserId(user);
            fetchUploads(dbUserId);
            alert('Resource deleted successfully');
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert('Failed to delete resource');
        }
    };

    const handleEdit = (resourceId) => {
        navigate(`/resources/edit/${resourceId}`);
    };

    const handleView = (resourceId) => {
        navigate(`/resources/${resourceId}`);
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
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const filteredUploads = uploads.filter(upload => {
        if (filter !== 'all' && upload.status !== filter) return false;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (upload.title?.toLowerCase() || '').includes(term) ||
                   (upload.subject?.toLowerCase() || '').includes(term) ||
                   (upload.description?.toLowerCase() || '').includes(term);
        }
        
        return true;
    });

    // Loading state
    if (loading) {
        return (
            <div className="dashboard">
                {/* Sidebar */}
                <div className="sidebar">
                    <div className="sidebar-logo">BrainHive</div>
                    <div className="sidebar-user">
                        <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
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
                    </nav>
                </div>
                <div className="main-content">
                    <div className="loading-spinner">Loading your uploads...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
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
                            <li className="active" onClick={() => navigate('/resources/my-uploads')}>My Uploads</li>
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

                {/* Error Message (if any) */}
                {error && (
                    <div className="error-message" style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <span className="icon">📚</span>
                        </div>
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Uploads</div>
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

                {/* Filters and Search */}
                <div className="filters-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search your uploads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="filter-tabs">
                        <button 
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({stats.total})
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending ({stats.pending})
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Active ({stats.active})
                        </button>
                    </div>
                </div>

                {/* Uploads List */}
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
                    </div>
                ) : (
                    <div className="uploads-list">
                        {filteredUploads.map((upload) => (
                            <div key={upload.id} className="upload-card">
                                <div className="upload-card-header">
                                    <div className="upload-type-icon">
                                        {getTypeIcon(upload.type)}
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
                                    <span className={getStatusBadgeClass(upload.status)}>
                                        {upload.status || 'pending'}
                                    </span>
                                </div>
                                
                                {upload.description && (
                                    <p className="upload-description">{upload.description}</p>
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
                                        <span>⭐</span> {upload.averageRating?.toFixed(1) || 0} ({upload.ratingCount || 0})
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
                                        onClick={() => handleDelete(upload.id)}
                                        title="Delete resource"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyUploads;