import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './Dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    // Discovery page states
    const [courses, setCourses] = useState([]);
    const [recentResources, setRecentResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseResources, setCourseResources] = useState([]);
    const [viewMode, setViewMode] = useState('courses'); // 'courses' or 'resources'
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    // Rating states
    const [ratingModal, setRatingModal] = useState({ show: false, resourceId: null });
    const [userRating, setUserRating] = useState(5);
    const [review, setReview] = useState('');

    useEffect(() => {
        fetchDashboardData();
        fetchDiscoveryData();
    }, []);

    const normalizeUrl = (url) => {
        if (!url || typeof url !== 'string') return '';

        const trimmedUrl = url.trim();
        if (!trimmedUrl) return '';

        if (/^https?:\/\//i.test(trimmedUrl)) {
            return trimmedUrl;
        }

        if (
            trimmedUrl.startsWith('/') ||
            trimmedUrl.startsWith('./') ||
            trimmedUrl.startsWith('../')
        ) {
            return trimmedUrl;
        }

        return `https://${trimmedUrl}`;
    };

    const getViewableUrl = (resource) => {
        const possibleUrls = [
            resource?.linkUrl,
            resource?.url,
            resource?.resourceUrl,
            resource?.link,
            resource?.externalUrl,
            resource?.websiteUrl,
            resource?.fileUrl
        ];

        for (const value of possibleUrls) {
            const normalized = normalizeUrl(value);
            if (normalized) {
                return normalized;
            }
        }

        return '';
    };

    const getDownloadableUrl = (resource) => {
        const possibleUrls = [
            resource?.filePath,
            resource?.fileUrl,
            resource?.downloadUrl,
            resource?.url
        ];

        for (const value of possibleUrls) {
            const normalized = normalizeUrl(value);
            if (normalized) {
                return normalized;
            }
        }

        return '';
    };

    const mapResourceToUI = (r) => ({
        id: r.id,
        title: r.title || 'Untitled Resource',
        type: r.resourceType || r.type || 'Document',
        courseCode: r.courseCode || 'GENERAL',
        courseName: r.subject || r.courseName || 'General',
        semester: r.semester || 'N/A',
        uploader: { name: r.uploadedBy?.name || r.uploader?.name || 'Unknown' },
        saves: r.downloadCount || r.saves || 0,
        rating: r.averageRating || r.rating || 0,
        ratingCount: r.ratingCount || 0,
        tags: Array.isArray(r.tags)
            ? r.tags
            : (r.tags ? r.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
        createdAt: r.uploadedAt || r.createdAt || new Date().toISOString(),
        status: (r.status || 'active').toLowerCase(),
        views: r.viewCount || r.views || 0,
        saved: r.saved || false,
        description: r.description || '',
        fileUrl: r.fileUrl || r.url || '',
        linkUrl: r.linkUrl || r.url || r.fileUrl || '',
        filePath: r.filePath || r.fileUrl || '',
        url: r.url || '',
        resourceUrl: r.resourceUrl || '',
        link: r.link || '',
        downloadUrl: r.downloadUrl || '',
        externalUrl: r.externalUrl || '',
        websiteUrl: r.websiteUrl || '',
        allowRatings: r.allowRatings !== false
    });

    const fetchDashboardData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            setUser(currentUser);

            const response = await api.get('/dashboard/student/info');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDiscoveryData = async () => {
        try {
            const response = await api.get('/resources/search', {
                params: {
                    page: 0,
                    size: 30
                }
            });

            const rawResources = response.data?.content || response.data || [];
            const formattedResources = rawResources.map(mapResourceToUI);

            setRecentResources(formattedResources);

            const groupedCourses = {};
            formattedResources.forEach((resource) => {
                const code = resource.courseCode || 'GENERAL';

                if (!groupedCourses[code]) {
                    groupedCourses[code] = {
                        id: code,
                        code: code,
                        name: resource.courseName || code,
                        semester: resource.semester || 'N/A',
                        resourceCount: 0,
                        hotTopic: resource.tags?.[0] || null
                    };
                }

                groupedCourses[code].resourceCount += 1;

                if (!groupedCourses[code].hotTopic && resource.tags?.length > 0) {
                    groupedCourses[code].hotTopic = resource.tags[0];
                }
            });

            setCourses(Object.values(groupedCourses));
        } catch (error) {
            console.error('Error fetching discovery data:', error);
            setCourses([]);
            setRecentResources([]);
        }
    };

    const fetchCourseResources = async (course) => {
        setLoading(true);
        try {
            const response = await api.get('/resources/search', {
                params: {
                    subject: course.name,
                    semester: course.semester,
                    page: 0,
                    size: 30
                }
            });

            const rawResources = response.data?.content || response.data || [];
            const formattedResources = rawResources
                .map(mapResourceToUI)
                .filter(resource =>
                    resource.courseCode === course.code ||
                    resource.courseName === course.name ||
                    resource.semester === course.semester
                );

            setCourseResources(formattedResources);
            setSelectedCourse(course);
            setViewMode('resources');
        } catch (error) {
            console.error('Error fetching course resources:', error);
            setCourseResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveResource = (resourceId) => {
        if (viewMode === 'resources') {
            setCourseResources(prev => prev.map(resource =>
                resource.id === resourceId
                    ? { ...resource, saved: true, saves: resource.saves + 1 }
                    : resource
            ));
        } else {
            setRecentResources(prev => prev.map(resource =>
                resource.id === resourceId
                    ? { ...resource, saved: true, saves: resource.saves + 1 }
                    : resource
            ));
        }
    };

    const handleRequestHelp = (resourceId) => {
        navigate(`/request-help?resource=${resourceId}`);
    };

    const handleViewResource = async (resource, e) => {
        if (e) e.stopPropagation();

        try {
            const url = getViewableUrl(resource);

            if (!url) {
                console.log('RESOURCE OBJECT:', resource);
                alert('No link found in resource');
                return;
            }

            try {
                if (resource?.id) {
                    await api.post(`/resources/${resource.id}/view`);
                }
            } catch (viewError) {
                console.warn('View count update failed:', viewError);
            }

            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('View failed:', error);
            alert('Failed to open resource');
        }
    };

    const handleDownloadResource = async (resource, e) => {
        if (e) e.stopPropagation();

        try {
            if (!resource?.id) {
                return;
            }

            const downloadUrl = getDownloadableUrl(resource);

            if (!downloadUrl) {
                alert('File URL not found');
                return;
            }

            await api.post(`/resources/${resource.id}/download`);
            window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Download failed:', error);
            alert(error.response?.data?.message || 'Failed to download resource');
        }
    };

    const handleRate = async () => {
        if (!review.trim()) {
            alert('Please write a review before submitting.');
            return;
        }

        try {
            const activeUser = user || authService.getCurrentUser();
            if (!activeUser) {
                alert('Unable to identify user.');
                return;
            }

            // Keeping same rating-submit logic pattern as your working upload page
            const dbUserId = '1';

            const response = await api.post(
                `/resources/${ratingModal.resourceId}/rate?userId=${dbUserId}`,
                {
                    rating: userRating,
                    review: review.trim()
                }
            );

            setRecentResources(prev =>
                prev.map(resource =>
                    resource.id === ratingModal.resourceId
                        ? {
                            ...resource,
                            rating: response.data.averageRating,
                            ratingCount: response.data.ratingCount
                        }
                        : resource
                )
            );

            setCourseResources(prev =>
                prev.map(resource =>
                    resource.id === ratingModal.resourceId
                        ? {
                            ...resource,
                            rating: response.data.averageRating,
                            ratingCount: response.data.ratingCount
                        }
                        : resource
                )
            );

            alert('Rating submitted!');
            setRatingModal({ show: false, resourceId: null });
            setUserRating(5);
            setReview('');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert(error.response?.data || 'Failed to submit rating');
        }
    };

    const handleBackToCourses = () => {
        setViewMode('courses');
        setSelectedCourse(null);
        setCourseResources([]);
    };

    const getResourceTypeIcon = (type) => {
        const icons = {
            'PDF': '📄',
            'Document': '📝',
            'Presentation': '📊',
            'Image': '🖼️',
            'Video': '🎥',
            'Link': '🔗',
            'Article': '📰',
            'Code': '💻',
            'Other': '📎'
        };
        return icons[type] || '📄';
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

    const filteredAndSortedResources = (resources) => {
        let filtered = [...resources];

        if (filterType !== 'all') {
            filtered = filtered.filter(r => r.type === filterType);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.title?.toLowerCase().includes(term) ||
                r.courseCode?.toLowerCase().includes(term) ||
                r.courseName?.toLowerCase().includes(term) ||
                r.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        switch (sortBy) {
            case 'recent':
                return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'saves':
                return filtered.sort((a, b) => b.saves - a.saves);
            case 'rating':
                return filtered.sort((a, b) => b.rating - a.rating);
            default:
                return filtered;
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate('/');
        }
    };

    const profileCompletion = dashboardData?.profileCompletion || 85;

    if (loading && viewMode === 'courses') {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            <div className="sidebar">
                <div className="sidebar-logo">BrainHive</div>

                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="user-info">
                        <h4>{user?.name || 'Alex Johnson'}</h4>
                        <p>Student</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Resources</h3>
                        <ul>
                            <li className="active" onClick={() => {
                                setViewMode('courses');
                                setSelectedCourse(null);
                            }}>Discovery</li>
                            <li onClick={() => navigate('/upload')}>Upload</li>
                            <li onClick={() => navigate('/resources/my-uploads')}>My Uploads</li>
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

                    <div className="nav-section">
                        <h3>Settings</h3>
                        <ul>
                            <li onClick={() => navigate('/profile')}>Profile</li>
                            <li onClick={() => navigate('/schedule')}>Schedule</li>
                            <li onClick={handleLogout} className="logout-item">
                                Logout
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            <div className="main-content">
                {viewMode === 'courses' && (
                    <>
                        <div className="welcome-banner">
                            <div>
                                <h1 className="welcome-title">
                                    Welcome back, {user?.name || 'Alex'}! 👋
                                </h1>
                                <p className="welcome-subtitle">
                                    {dashboardData?.user?.program || 'Computer Science, Year 3'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="profile-status">
                                <div className="progress-circle">
                                    <svg className="progress-svg" viewBox="0 0 48 48">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="progress-bg"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            strokeDasharray={125.6}
                                            strokeDashoffset={125.6 - (125.6 * profileCompletion) / 100}
                                            className="progress-fill"
                                        />
                                    </svg>
                                    <div className="progress-text">
                                        {profileCompletion}%
                                    </div>
                                </div>
                                <div>
                                    <div className="profile-status-label">Profile Status</div>
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="profile-status-link"
                                    >
                                        Complete profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {profileCompletion < 100 && (
                            <div className="warning-banner">
                                <span className="warning-icon">⚠️</span>
                                <div className="warning-content">
                                    <h3>Complete your profile to unlock all features</h3>
                                    <p>Adding your study preferences helps us recommend better resources and study groups.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/profile/edit')}
                                    className="warning-button"
                                >
                                    Update Now
                                </button>
                            </div>
                        )}

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue">
                                    <span className="icon">📚</span>
                                </div>
                                <div>
                                    <div className="stat-value">
                                        {recentResources.length}
                                    </div>
                                    <div className="stat-label">Resources Saved</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon purple">
                                    <span className="icon">👥</span>
                                </div>
                                <div>
                                    <div className="stat-value">{dashboardData?.stats?.helpSessions || '8'}</div>
                                    <div className="stat-label">Help Sessions</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon teal">
                                    <span className="icon">📅</span>
                                </div>
                                <div>
                                    <div className="stat-value">{dashboardData?.stats?.groupProjects || '3'}</div>
                                    <div className="stat-label">Group Projects</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orange">
                                    <span className="icon">🔥</span>
                                </div>
                                <div>
                                    <div className="stat-value">{dashboardData?.stats?.studyStreak || '12 days'}</div>
                                    <div className="stat-label">Study Streak</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="discovery-content">
                    <div className="discovery-search-section">
                        <div className="search-container">
                            <span className="search-icon"></span>
                            <input
                                type="text"
                                placeholder={viewMode === 'courses' ? "Search courses..." : "Search resources in this course..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {viewMode === 'resources' && selectedCourse && (
                        <div className="back-button-container">
                            <button onClick={handleBackToCourses} className="back-button">
                                ← Back to All Courses
                            </button>
                            <h2 className="course-title">{selectedCourse.name} ({selectedCourse.code})</h2>
                        </div>
                    )}

                    {viewMode === 'courses' && (
                        <>
                            <div className="section-header">
                                <h2>Your Course Hub</h2>
                                <p>Browse resources by course</p>
                            </div>
                            <div className="courses-grid">
                                {courses
                                    .filter(course =>
                                        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        course.code.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((course) => (
                                        <div
                                            key={course.id}
                                            className="course-card"
                                            onClick={() => fetchCourseResources(course)}
                                        >
                                            <div className="course-card-header">
                                                <span className="course-code">{course.code}</span>
                                                <span className="course-resource-count">{course.resourceCount} resources</span>
                                            </div>
                                            <h3 className="course-name">{course.name}</h3>
                                            <p className="course-semester">{course.semester}</p>
                                            {course.hotTopic && (
                                                <div className="course-hot-topic">
                                                    <span className="hot-topic-icon">🔥</span>
                                                    <span className="hot-topic-text">{course.hotTopic}</span>
                                                </div>
                                            )}
                                            <button className="browse-button">Browse →</button>
                                        </div>
                                    ))}
                            </div>

                            <div className="section-header">
                                <h2>Recently Added Resources</h2>
                                <p>Latest resources from all courses</p>
                            </div>
                            <div className="resources-table-container">
                                <table className="resources-table">
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            <th>Course</th>
                                            <th>Type</th>
                                            <th>Uploader</th>
                                            <th>Saves</th>
                                            <th>Rating</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentResources
                                            .slice()
                                            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                                            .slice(0, 5)
                                            .map((resource) => (
                                                <tr key={resource.id}>
                                                    <td>
                                                        <div className="resource-info">
                                                            <span className="resource-icon">
                                                                {getResourceTypeIcon(resource.type)}
                                                            </span>
                                                            <div>
                                                                <div className="resource-title">{resource.title}</div>
                                                                <div className="resource-tags">
                                                                    {resource.tags?.slice(0, 2).map(tag => (
                                                                        <span key={tag} className="tag">#{tag}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="course-badge">{resource.courseCode}</span>
                                                    </td>
                                                    <td>{resource.type}</td>
                                                    <td>{resource.uploader?.name}</td>
                                                    <td>{resource.saves}</td>
                                                    <td>
                                                        {resource.ratingCount > 0 ? (
                                                            <>
                                                                {renderStars(resource.rating)}
                                                                <span style={{ marginLeft: '6px', fontSize: '12px', color: '#666' }}>
                                                                    ({resource.ratingCount || 0})
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: '12px', color: '#666' }}>New</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewResource(resource, e);
                                                                }}
                                                                className="action-btn view-btn"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDownloadResource(resource, e)}
                                                                className="action-btn download-btn"
                                                                style={{ display: 'inline-flex', visibility: 'visible', opacity: 1 }}
                                                            >
                                                                Download
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveResource(resource.id);
                                                                }}
                                                                className={`action-btn save-btn ${resource.saved ? 'saved' : ''}`}
                                                            >
                                                                {resource.saved ? 'Saved' : 'Save'}
                                                            </button>
                                                            {resource.allowRatings && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRatingModal({ show: true, resourceId: resource.id });
                                                                    }}
                                                                    className="action-btn"
                                                                >
                                                                    ⭐ Rate
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRequestHelp(resource.id);
                                                                }}
                                                                className="action-btn help-btn"
                                                            >
                                                                Help
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {viewMode === 'resources' && selectedCourse && (
                        <>
                            <div className="stats-grid-mini">
                                <div className="stat-card-mini">
                                    <div className="stat-value-mini">{courseResources.length}</div>
                                    <div className="stat-label-mini">Total Resources</div>
                                </div>
                                <div className="stat-card-mini">
                                    <div className="stat-value-mini">
                                        {courseResources.filter(r => r.status === 'active').length}
                                    </div>
                                    <div className="stat-label-mini">Active</div>
                                </div>
                                <div className="stat-card-mini">
                                    <div className="stat-value-mini">
                                        {courseResources.filter(r => r.status === 'pending').length}
                                    </div>
                                    <div className="stat-label-mini">Pending</div>
                                </div>
                                <div className="stat-card-mini">
                                    <div className="stat-value-mini">
                                        {courseResources.reduce((sum, r) => sum + (r.views || 0), 0)}
                                    </div>
                                    <div className="stat-label-mini">Total Views</div>
                                </div>
                            </div>

                            <div className="filters-bar">
                                <div className="filters-left">
                                    <button
                                        className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilterType('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`filter-btn ${filterType === 'PDF' ? 'active' : ''}`}
                                        onClick={() => setFilterType('PDF')}
                                    >
                                        PDF
                                    </button>
                                    <button
                                        className={`filter-btn ${filterType === 'Video' ? 'active' : ''}`}
                                        onClick={() => setFilterType('Video')}
                                    >
                                        Video
                                    </button>
                                    <button
                                        className={`filter-btn ${filterType === 'Document' ? 'active' : ''}`}
                                        onClick={() => setFilterType('Document')}
                                    >
                                        Document
                                    </button>
                                </div>
                                <div className="filters-right">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="sort-select"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="saves">Most Saved</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="resources-list-container">
                                {filteredAndSortedResources(courseResources).map((resource) => (
                                    <div key={resource.id} className="resource-list-item">
                                        <div className="resource-list-icon">
                                            {getResourceTypeIcon(resource.type)}
                                        </div>
                                        <div className="resource-list-content">
                                            <div className="resource-list-header">
                                                <h3 className="resource-list-title">{resource.title}</h3>
                                                <div className="resource-list-meta">
                                                    <span className="resource-type-badge">{resource.type}</span>
                                                    {resource.status === 'pending' && (
                                                        <span className="status-badge pending">Pending Review</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="resource-list-details">
                                                <span>Uploaded by: {resource.uploader?.name}</span>
                                                <span>•</span>
                                                <span>{new Date(resource.createdAt || 0).toLocaleDateString()}</span>
                                            </div>
                                            <div className="resource-tags-list">
                                                {resource.tags?.map(tag => (
                                                    <span key={tag} className="resource-tag">#{tag}</span>
                                                ))}
                                            </div>
                                            <div className="resource-stats">
                                                <span className="rating">
                                                    {resource.ratingCount > 0 ? (
                                                        <>
                                                            {renderStars(resource.rating)}
                                                            <span style={{ marginLeft: '6px' }}>
                                                                ({resource.ratingCount || 0})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        'New'
                                                    )}
                                                </span>
                                                <span className="saves">🔖 {resource.saves} saves</span>
                                                <span className="views">👁️ {resource.views || 0} views</span>
                                            </div>
                                            <div className="resource-actions">
                                                <button
                                                    onClick={(e) => handleViewResource(resource, e)}
                                                    className="action-button view-button"
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    onClick={(e) => handleDownloadResource(resource, e)}
                                                    className="action-button download-button"
                                                    style={{ display: 'inline-flex', visibility: 'visible', opacity: 1 }}
                                                >
                                                    ⬇️ Download
                                                </button>
                                                <button
                                                    onClick={() => handleSaveResource(resource.id)}
                                                    className={`action-button save-button ${resource.saved ? 'saved' : ''}`}
                                                >
                                                    {resource.saved ? '✓ Saved' : '📌 Save'}
                                                </button>
                                                {resource.allowRatings && (
                                                    <button
                                                        onClick={(e) => {
                                                            if (e) e.stopPropagation();
                                                            setRatingModal({ show: true, resourceId: resource.id });
                                                        }}
                                                        className="action-button"
                                                    >
                                                        ⭐ Rate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRequestHelp(resource.id)}
                                                    className="action-button help-button"
                                                >
                                                    🙋 Request Help
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="upload-resource-section">
                                <button
                                    onClick={() => navigate('/upload', { state: { prefillCourse: selectedCourse } })}
                                    className="upload-resource-btn"
                                >
                                    + Upload Resource for {selectedCourse.name}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {ratingModal.show && (
                <div className="modal-overlay" onClick={() => setRatingModal({ show: false, resourceId: null })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Rate this Resource</h2>

                        <div className="rating-input">
                            <label>Your Rating:</label>
                            <div className="rating-stars">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${userRating >= star ? 'active' : ''}`}
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
                                className="rating-select"
                            >
                                <option value={5}>5 Stars - Excellent</option>
                                <option value={4}>4 Stars - Very Good</option>
                                <option value={3}>3 Stars - Good</option>
                                <option value={2}>2 Stars - Fair</option>
                                <option value={1}>1 Star - Poor</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Write a Review *</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="What did you think about this resource? Share your experience to help others..."
                                rows="4"
                                style={{ resize: 'vertical', width: '100%' }}
                                required
                            />
                            <small style={{ color: '#6b7280', fontSize: '11px', marginTop: '8px', display: 'block' }}>
                                Your review will be visible to other users and helps the community.
                            </small>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setRatingModal({ show: false, resourceId: null });
                                    setUserRating(5);
                                    setReview('');
                                }}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button type="button" onClick={handleRate} className="submit-btn">
                                Submit Rating & Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;