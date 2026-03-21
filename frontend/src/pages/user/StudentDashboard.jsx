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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [lectures, setLectures] = useState([]);
    const [lectureLoading, setLectureLoading] = useState(false);
    const [lectureError, setLectureError] = useState('');
    const [myRequests, setMyRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState('');

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            // First check if user is authenticated
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            setUser(currentUser);

            // Fetch dashboard data
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

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    const profileCompletion = dashboardData?.profileCompletion || 85;

    const formatDateTime = (value) => {
        if (!value) {
            return 'Not scheduled';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleString();
    };

    const fetchLectures = async () => {
        try {
            setLectureLoading(true);
            setLectureError('');
            const response = await api.get('/peerhelp/lectures');
            setLectures(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching lectures:', error);
            setLectureError(error.response?.data?.message || 'Unable to load lectures.');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLectureLoading(false);
        }
    };

    const handleOpenLectures = async () => {
        setActiveTab('lectures');
        if (lectures.length === 0) {
            await fetchLectures();
        }
    };

    const fetchMyRequests = async () => {
        try {
            setRequestsLoading(true);
            setRequestsError('');

            const [requestsRes, sessionsRes] = await Promise.all([
                api.get('/peerhelp/requests/my-requests'),
                api.get('/peerhelp/sessions/my-sessions')
            ]);

            const requests = requestsRes.data?.data || [];
            const sessions = sessionsRes.data?.data || [];
            const sessionByRequest = sessions.reduce((acc, session) => {
                acc[session.helpRequestId] = session;
                return acc;
            }, {});

            const merged = requests.map((request) => ({
                ...request,
                session: sessionByRequest[request.id] || null
            }));

            setMyRequests(merged);
        } catch (error) {
            console.error('Error fetching my requests:', error);
            setRequestsError(error.response?.data?.message || 'Unable to load your request details.');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleOpenMyRequests = async () => {
        setActiveTab('my-requests');
        if (myRequests.length === 0) {
            await fetchMyRequests();
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            {/* Sidebar */}
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
                            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Discovery</li>
                            <li onClick={() => navigate('/upload')}>Upload</li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>Peer Help</h3>
                        <ul>
                            <li onClick={() => navigate('/request-help')}>Request Help</li>
                            <li className={activeTab === 'my-requests' ? 'active' : ''} onClick={handleOpenMyRequests}>My Requests</li>
                            <li onClick={() => navigate('/find-tutors')}>Find Tutors</li>
                            <li className={activeTab === 'lectures' ? 'active' : ''} onClick={handleOpenLectures}>Lectures</li>
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

            {/* Main Content */}
            <div className="main-content">
                {activeTab === 'dashboard' && (
                <>
                {/* Welcome Banner */}
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

                {/* Warning Banner */}
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

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <span className="icon">📚</span>
                        </div>
                        <div>
                            <div className="stat-value">{dashboardData?.stats?.resourcesSaved || '42'}</div>
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

                <div className="dashboard-grid-layout">
                    {/* Left Column */}
                    <div className="left-column">
                        {/* Academic Focus Areas */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>Academic Focus Areas</h2>
                                <button onClick={() => navigate('/focus-areas')} className="card-link">
                                    Edit Subjects
                                </button>
                            </div>
                            <div className="focus-areas-list">
                                {(dashboardData?.focusAreas || [
                                    { name: 'Data Structures', strength: 30, status: 'Needs attention' },
                                    { name: 'Database Systems', strength: 65, status: 'Average' },
                                    { name: 'Programming (Java)', strength: 90, status: 'Strong' },
                                ]).map((subject, i) => (
                                    <div key={i} className="focus-item">
                                        <div className="focus-name">{subject.name}</div>
                                        <div className="progress-container">
                                            <div className="progress-bar-container">
                                                <div 
                                                    className={`progress-bar ${subject.strength < 50 ? 'weak' : subject.strength < 80 ? 'average' : 'strong'}`}
                                                    style={{ width: `${subject.strength}%` }}
                                                ></div>
                                            </div>
                                            <span className={`status-badge ${subject.strength < 50 ? 'weak' : subject.strength < 80 ? 'average' : 'strong'}`}>
                                                {subject.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Resources */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>Recommended for You</h2>
                                <button onClick={() => navigate('/resources')} className="card-link">
                                    View all →
                                </button>
                            </div>
                            <div className="resources-grid">
                                {(dashboardData?.recommendedResources || [
                                    { title: 'Binary Trees Explained', type: 'PDF Notes', subject: 'Data Structures' },
                                    { title: 'SQL Joins Cheat Sheet', type: 'Study Guide', subject: 'Database Systems' },
                                    { title: 'Java Collections Framework', type: 'Video Tutorial', subject: 'Programming' },
                                    { title: 'Normalization in DBMS', type: 'PDF Notes', subject: 'Database Systems' },
                                ]).slice(0, 4).map((resource, i) => (
                                    <div 
                                        key={i} 
                                        className="resource-card"
                                        onClick={() => navigate(`/resources/${resource.id || i}`)}
                                    >
                                        <div className="resource-subject">{resource.subject}</div>
                                        <h3 className="resource-title">{resource.title}</h3>
                                        <p className="resource-type">{resource.type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        {/* Profile Badges */}
                        <div className="content-card">
                            <h2 className="badges-title">Your Identity</h2>
                            <div className="badges-container">
                                <span className="badge purple">🎓 Student</span>
                                <span className="badge teal">👥 Group Learner</span>
                                <span className="badge orange">🦉 Night Owl</span>
                            </div>
                        </div>

                        {/* Upcoming Schedule */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>Upcoming Schedule</h2>
                            </div>
                            <div className="schedule-list">
                                {(dashboardData?.upcomingSchedule || [
                                    { title: 'Data Structures Tutoring', time: 'Today, 4:00 PM', type: '1-on-1' },
                                    { title: 'CS301 Project Meeting', time: 'Tomorrow, 2:00 PM', type: 'Group' },
                                ]).map((session, i) => (
                                    <div key={i} className="schedule-item">
                                        <div className={`schedule-dot ${i === 0 ? 'brand' : 'teal'}`}></div>
                                        <div className="schedule-content">
                                            <h4>{session.title}</h4>
                                            <div className="schedule-time">
                                                <span>📅</span> {session.time}
                                            </div>
                                        </div>
                                        <span className="schedule-type">{session.type}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="schedule-footer">
                                <button onClick={() => navigate('/calendar')} className="schedule-footer-button">
                                    Open Full Calendar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </>
                )}

                {activeTab === 'lectures' && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>Available Lectures</h2>
                            <button type="button" className="view-all" onClick={fetchLectures}>Refresh</button>
                        </div>
                        <div className="card-content">
                            {lectureLoading && <p className="header-subtitle">Loading lectures...</p>}
                            {!lectureLoading && lectureError && <p className="header-subtitle">{lectureError}</p>}
                            {!lectureLoading && !lectureError && lectures.length === 0 && (
                                <p className="header-subtitle">No lectures available right now.</p>
                            )}
                            {!lectureLoading && !lectureError && lectures.map((lecture) => (
                                <div key={lecture.id} className="session-item lecture-item">
                                    <h3>{lecture.title}</h3>
                                    <p><strong>Subject:</strong> {lecture.subjectName}</p>
                                    <p><strong>Tutor:</strong> {lecture.tutorName}</p>
                                    <p>{lecture.description}</p>
                                    <span className="session-time">📅 {formatDateTime(lecture.scheduledAt)} • {lecture.durationMinutes} mins</span>
                                    {lecture.meetingLink && (
                                        <p>
                                            <a href={lecture.meetingLink} target="_blank" rel="noreferrer">Join lecture</a>
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-accept lecture-details-btn"
                                        onClick={() => navigate(`/dashboard/student/lectures/${lecture.id}`)}
                                    >
                                        More Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'my-requests' && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>My Help Requests</h2>
                            <button type="button" className="view-all" onClick={fetchMyRequests}>Refresh</button>
                        </div>
                        <div className="card-content">
                            {requestsLoading && <p className="header-subtitle">Loading request details...</p>}
                            {!requestsLoading && requestsError && <p className="header-subtitle">{requestsError}</p>}
                            {!requestsLoading && !requestsError && myRequests.length === 0 && (
                                <p className="header-subtitle">No help requests found yet.</p>
                            )}

                            {!requestsLoading && !requestsError && myRequests.map((request) => (
                                <div key={request.id} className="session-item request-detail-item">
                                    <h3>{request.topic}</h3>
                                    <p><strong>Subject:</strong> {request.subjectName}</p>
                                    <p><strong>Status:</strong> {request.status}</p>
                                    <p><strong>Requested Time:</strong> {formatDateTime(request.preferredDateTime)}</p>
                                    <p>{request.description}</p>

                                    {!request.session && (
                                        <p className="request-pending-note">Tutor has not accepted this request yet.</p>
                                    )}

                                    {request.session && (
                                        <div className="request-accept-details">
                                            <h4>Tutor Acceptance Details</h4>
                                            <p><strong>Tutor:</strong> {request.session.tutorName}</p>
                                            <p><strong>Scheduled Start:</strong> {formatDateTime(request.session.scheduledStartTime)}</p>
                                            <p><strong>Scheduled End:</strong> {formatDateTime(request.session.scheduledEndTime)}</p>
                                            {request.session.meetingLink && (
                                                <p>
                                                    <strong>Meeting Link:</strong>{' '}
                                                    <a href={request.session.meetingLink} target="_blank" rel="noreferrer">Join session</a>
                                                </p>
                                            )}
                                            {request.session.notes && (
                                                <p><strong>Tutor Notes:</strong> {request.session.notes}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;