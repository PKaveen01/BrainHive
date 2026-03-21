import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './Dashboard.css';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('help-requests');
    const [availableRequests, setAvailableRequests] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [fetchError, setFetchError] = useState('');

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

    const mapRequestFromApi = (item) => ({
        id: item.id,
        student: item.studentName,
        subject: `${item.subjectName} : ${item.topic}`,
        time: formatDateTime(item.preferredDateTime),
        raw: item
    });

    const mapSessionFromApi = (item) => ({
        id: item.id,
        title: item.requestTopic,
        student: item.studentName,
        time: formatDateTime(item.scheduledStartTime)
    });

    const mapAvailabilityFromApi = (item) => ({
        id: item.id,
        day: item.dayOfWeek,
        time: `${item.startTime} - ${item.endTime}`,
        type: item.isRecurring ? 'Recurring' : 'One-time'
    });

    const fetchPeerHelpData = async () => {
        try {
            setFetchError('');
            const [availableRes, sessionsRes, availabilityRes] = await Promise.all([
                api.get('/peerhelp/requests/available'),
                api.get('/peerhelp/sessions/upcoming'),
                api.get('/peerhelp/availability/me')
            ]);

            setAvailableRequests((availableRes.data?.data || []).map(mapRequestFromApi));
            setUpcomingSessions((sessionsRes.data?.data || []).map(mapSessionFromApi));
            setAvailabilitySlots((availabilityRes.data?.data || []).map(mapAvailabilityFromApi));
        } catch (error) {
            console.error('Error fetching peerhelp data:', error);
            setFetchError(error.response?.data?.message || 'Unable to load live tutor data from backend.');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

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
            const response = await api.get('/dashboard/tutor/info');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            await fetchPeerHelpData();
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    const handleAccept = (student) => {
        alert(`You selected help request from ${student}. Session approval flow can be added next.`);
    };

    const handleDecline = (student) => {
        alert(`Decline action for ${student} is not exposed in current peerhelp API.`);
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
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="user-info">
                        <h4>Dr. {user?.name || 'Sarah Mitchell'}</h4>
                        <p>Tutor</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Teaching & Schedule</h3>
                        <ul>
                            <li
                                className={activeTab === 'help-requests' ? 'active' : ''}
                                onClick={() => setActiveTab('help-requests')}
                            >
                                Help Requests
                            </li>
                            <li
                                className={activeTab === 'my-sessions' ? 'active' : ''}
                                onClick={() => setActiveTab('my-sessions')}
                            >
                                My Sessions
                            </li>
                            <li
                                className={activeTab === 'availability' ? 'active' : ''}
                                onClick={() => setActiveTab('availability')}
                            >
                                Availability
                            </li>
                            <li
                                className={activeTab === 'ratings' ? 'active' : ''}
                                onClick={() => setActiveTab('ratings')}
                            >
                                Ratings & Feedback
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>Profile</h3>
                        <ul>
                            <li>My Profile</li>
                            <li>Settings</li>
                            <li onClick={handleLogout} style={{ cursor: 'pointer', color: '#e53e3e' }}>
                                Logout
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Welcome back, Dr. {user?.name || 'Mitchell'}!</h1>
                        <p className="header-subtitle">
                            {dashboardData?.user?.department || user?.email || 'Tutor Portal'}
                        </p>
                    </div>
                    <div className="header-actions">
                        <span className="status-badge online">Online & Available</span>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{upcomingSessions.length}</h3>
                        <p>Upcoming Sessions</p>
                    </div>
                    <div className="stat-card">
                        <h3>{availableRequests.length}</h3>
                        <p>Available Requests</p>
                    </div>
                </div>

                {fetchError && <p className="header-subtitle">{fetchError}</p>}

                {activeTab === 'help-requests' && (
                <div className="dashboard-grid">
                    {/* Pending Help Requests */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>Pending Help Requests</h2>
                            <button type="button" className="view-all" onClick={fetchPeerHelpData}>Refresh</button>
                        </div>
                        <div className="card-content">
                            {availableRequests.length === 0 && (
                                <p className="header-subtitle">No live help requests found in database.</p>
                            )}
                            {availableRequests.map((request) => (
                                <div key={request.id} className="request-item">
                                    <div className="request-info">
                                        <h3>{request.student}</h3>
                                        <p>{request.subject}</p>
                                        <span className="request-time">📅 {request.time}</span>
                                    </div>
                                    <div className="request-actions">
                                        <button 
                                            className="btn-decline"
                                            onClick={() => handleDecline(request.student)}
                                        >
                                            Decline
                                        </button>
                                        <button 
                                            className="btn-accept"
                                            onClick={() => handleAccept(request.student)}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Sessions */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>Upcoming Sessions</h2>
                            <button type="button" className="view-all" onClick={() => setActiveTab('my-sessions')}>View schedule →</button>
                        </div>
                        <div className="card-content">
                            {upcomingSessions.length === 0 && (
                                <p className="header-subtitle">No live upcoming sessions found in database.</p>
                            )}
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="session-item">
                                    <h3>{session.title}</h3>
                                    <p>With: {session.student}</p>
                                    <span className="session-time">📅 {session.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {activeTab === 'my-sessions' && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>My Upcoming Sessions</h2>
                            <button type="button" className="view-all" onClick={fetchPeerHelpData}>Refresh</button>
                        </div>
                        <div className="card-content">
                            {upcomingSessions.length === 0 && (
                                <p className="header-subtitle">No live upcoming sessions found in database.</p>
                            )}
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="session-item">
                                    <h3>{session.title}</h3>
                                    <p>With: {session.student}</p>
                                    <span className="session-time">📅 {session.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'availability' && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>My Availability</h2>
                            <button type="button" className="view-all" onClick={fetchPeerHelpData}>Refresh</button>
                        </div>
                        <div className="card-content">
                            {availabilitySlots.length === 0 && (
                                <p className="header-subtitle">No live availability slots found in database.</p>
                            )}
                            {availabilitySlots.map((slot) => (
                                <div key={slot.id} className="session-item">
                                    <h3>{slot.day}</h3>
                                    <p>{slot.time}</p>
                                    <span className="session-time">{slot.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ratings' && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>Ratings & Feedback</h2>
                        </div>
                        <div className="card-content">
                            <p className="header-subtitle">Ratings API integration can be added next from /api/peerhelp/ratings endpoints.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;