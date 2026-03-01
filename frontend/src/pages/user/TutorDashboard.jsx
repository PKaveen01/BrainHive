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

    useEffect(() => {
        fetchDashboardData();
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
            const response = await api.get('/dashboard/tutor/info');
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

    const handleAccept = (student) => {
        alert(`Accepted help request from ${student}`);
    };

    const handleDecline = (student) => {
        alert(`Declined help request from ${student}`);
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
                            <li className="active">Help Requests</li>
                            <li>My Sessions</li>
                            <li>Availability</li>
                            <li>Ratings & Feedback</li>
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
                            {dashboardData?.user?.department || 'Computer Science Department'} • {dashboardData?.user?.date || 'Tuesday, Oct 24'}
                        </p>
                    </div>
                    <div className="header-actions">
                        <span className="status-badge online">Online & Available</span>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{dashboardData?.stats?.totalCompleted || 124}</h3>
                        <p>Total Completed</p>
                    </div>
                    <div className="stat-card">
                        <h3>{dashboardData?.stats?.averageRating || 4.9}</h3>
                        <p>Average Rating</p>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* Pending Help Requests */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>Pending Help Requests</h2>
                            <a href="#" className="view-all">View all →</a>
                        </div>
                        <div className="card-content">
                            {(dashboardData?.pendingRequests || [
                                { student: 'Alex Johnson', subject: 'Data Structures : AVL Trees', time: 'Tomorrow, 2:00 PM' },
                                { student: 'Emma Davis', subject: 'Algorithms : Dynamic Programming', time: 'Thursday, 10:00 AM' }
                            ]).map((request, index) => (
                                <div key={index} className="request-item">
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
                            <a href="#" className="view-all">View schedule →</a>
                        </div>
                        <div className="card-content">
                            <div className="session-item">
                                <h3>Data Structures Review</h3>
                                <p>With: Alex Johnson</p>
                                <span className="session-time">📅 Today, 4:00 PM</span>
                            </div>
                            <div className="session-item">
                                <h3>Algorithms Tutoring</h3>
                                <p>With: Emma Davis</p>
                                <span className="session-time">📅 Tomorrow, 10:00 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;