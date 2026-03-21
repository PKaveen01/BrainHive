import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './Dashboard.css';

// Import recharts components
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';

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
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            setUser(currentUser);

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

    // Mock data for charts - replace with real API data
    const teachingLoadData = [
        { week: 'Week 1', sessions: 5, students: 12 },
        { week: 'Week 2', sessions: 7, students: 18 },
        { week: 'Week 3', sessions: 8, students: 22 },
        { week: 'Week 4', sessions: 10, students: 28 },
        { week: 'Week 5', sessions: 12, students: 32 },
    ];

    const ratingTrendData = [
        { month: 'Jan', rating: 4.7 },
        { month: 'Feb', rating: 4.8 },
        { month: 'Mar', rating: 4.85 },
        { month: 'Apr', rating: 4.9 },
        { month: 'May', rating: 4.92 },
        { month: 'Jun', rating: 4.95 },
    ];

    const subjectDistribution = [
        { name: 'Data Structures', sessions: 45, color: '#2563eb' },
        { name: 'Algorithms', sessions: 32, color: '#7c3aed' },
        { name: 'Databases', sessions: 28, color: '#0d9488' },
        { name: 'Web Dev', sessions: 24, color: '#ea580c' },
        { name: 'OS', sessions: 18, color: '#f59e0b' },
    ];

    const studentProgressData = [
        { name: 'Excellent', value: 35, color: '#10b981' },
        { name: 'Good', value: 40, color: '#3b82f6' },
        { name: 'Average', value: 18, color: '#f59e0b' },
        { name: 'Needs Help', value: 7, color: '#ef4444' },
    ];

    const availabilityData = [
        { day: 'Mon', hours: 4 },
        { day: 'Tue', hours: 5 },
        { day: 'Wed', hours: 3 },
        { day: 'Thu', hours: 4 },
        { day: 'Fri', hours: 2 },
        { day: 'Sat', hours: 6 },
        { day: 'Sun', hours: 3 },
    ];

    const sessionCompletionData = [
        { month: 'Jan', completed: 18, cancelled: 2 },
        { month: 'Feb', completed: 22, cancelled: 3 },
        { month: 'Mar', completed: 28, cancelled: 1 },
        { month: 'Apr', completed: 32, cancelled: 4 },
        { month: 'May', completed: 35, cancelled: 2 },
        { month: 'Jun', completed: 38, cancelled: 1 },
    ];

    const feedbackCategories = [
        { category: 'Knowledge', score: 4.9, max: 5 },
        { category: 'Communication', score: 4.8, max: 5 },
        { category: 'Punctuality', score: 4.95, max: 5 },
        { category: 'Helpfulness', score: 4.85, max: 5 },
        { category: 'Clarity', score: 4.7, max: 5 },
    ];

    const proficiencyRadialData = [
        { name: 'Teaching Rating', value: 94, fill: '#2563eb' },
        { name: 'Student Satisfaction', value: 92, fill: '#7c3aed' },
        { name: 'Session Completion', value: 96, fill: '#0d9488' },
        { name: 'Response Rate', value: 98, fill: '#ea580c' },
    ];

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading your tutor dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">🧠 BrainHive</div>
                
                <div className="sidebar-user">
                    <div className="user-avatar tutor-avatar">
                        {user?.name?.charAt(0) || 'D'}
                    </div>
                    <div className="user-info">
                        <h4>Dr. {user?.name?.split(' ')[0] || 'Sarah Mitchell'}</h4>
                        <p>Senior Tutor • Computer Science</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>📊 Overview</h3>
                        <ul>
                            <li className="active" onClick={() => navigate('/tutor-dashboard')}>
                                <span>🏠</span> Dashboard
                            </li>
                            <li onClick={() => navigate('/tutor/analytics')}>
                                <span>📈</span> Analytics
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>🎓 Teaching</h3>
                        <ul>
                            <li onClick={() => navigate('/tutor/help-requests')}>
                                <span>🙋</span> Help Requests
                            </li>
                            <li onClick={() => navigate('/tutor/sessions')}>
                                <span>📅</span> My Sessions
                            </li>
                            <li onClick={() => navigate('/tutor/availability')}>
                                <span>⏰</span> Set Availability
                            </li>
                            <li onClick={() => navigate('/tutor/students')}>
                                <span>👥</span> My Students
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>⭐ Feedback & Ratings</h3>
                        <ul>
                            <li onClick={() => navigate('/tutor/ratings')}>
                                <span>⭐</span> Ratings & Reviews
                            </li>
                            <li onClick={() => navigate('/tutor/feedback')}>
                                <span>💬</span> Student Feedback
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>⚙️ Settings</h3>
                        <ul>
                            <li onClick={() => navigate('/tutor/profile')}>
                                <span>👤</span> Profile Settings
                            </li>
                            <li onClick={() => navigate('/tutor/schedule')}>
                                <span>📅</span> Schedule
                            </li>
                            <li onClick={handleLogout} className="logout-item">
                                <span>🚪</span> Logout
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Welcome Banner */}
                <div className="welcome-banner tutor-banner">
                    <div>
                        <h1 className="welcome-title">
                            Welcome back, Dr. {user?.name?.split(' ')[0] || 'Mitchell'}! 👨‍🏫
                        </h1>
                        <p className="welcome-subtitle">
                            {dashboardData?.user?.department || 'Computer Science Department'} • 
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <div className="tutor-status-badge">
                            🟢 Available for tutoring • {dashboardData?.stats?.activeHours || '4'} hours today
                        </div>
                    </div>
                    <div className="tutor-stats-mini">
                        <div className="mini-stat">
                            <div className="mini-stat-value">{dashboardData?.stats?.totalStudents || 48}</div>
                            <div className="mini-stat-label">Active Students</div>
                        </div>
                        <div className="mini-stat">
                            <div className="mini-stat-value">{dashboardData?.stats?.totalCompleted || 124}</div>
                            <div className="mini-stat-label">Sessions Completed</div>
                        </div>
                        <div className="mini-stat">
                            <div className="mini-stat-value">{dashboardData?.stats?.averageRating || 4.9}</div>
                            <div className="mini-stat-label">Rating</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="stats-grid tutor-stats">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <span className="icon">👥</span>
                        </div>
                        <div>
                            <div className="stat-value">{dashboardData?.stats?.totalStudents || 48}</div>
                            <div className="stat-label">Active Students</div>
                            <div className="stat-trend positive">↑ +8 this month</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <span className="icon">📅</span>
                        </div>
                        <div>
                            <div className="stat-value">{dashboardData?.stats?.monthlySessions || 42}</div>
                            <div className="stat-label">Monthly Sessions</div>
                            <div className="stat-trend positive">↑ +12 from last month</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon teal">
                            <span className="icon">⭐</span>
                        </div>
                        <div>
                            <div className="stat-value">{dashboardData?.stats?.averageRating || 4.9}</div>
                            <div className="stat-label">Average Rating</div>
                            <div className="stat-trend positive">↑ +0.2 this month</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <span className="icon">✅</span>
                        </div>
                        <div>
                            <div className="stat-value">{dashboardData?.stats?.completionRate || 96}%</div>
                            <div className="stat-label">Completion Rate</div>
                            <div className="stat-trend positive">↑ +3%</div>
                        </div>
                    </div>
                </div>

                {/* Teaching Load Trend */}
                <div className="chart-card">
                    <div className="card-header">
                        <h2>📈 Teaching Load Trend</h2>
                        <div className="chart-legend">
                            <span className="legend-item">
                                <span className="legend-dot sessions"></span>
                                Sessions
                            </span>
                            <span className="legend-item">
                                <span className="legend-dot students"></span>
                                Students
                            </span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={teachingLoadData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="week" stroke="#64748b" />
                            <YAxis yAxisId="left" stroke="#64748b" />
                            <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="sessions" fill="#2563eb" name="Sessions" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="students" stroke="#ea580c" strokeWidth={2} name="Students" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="dashboard-grid-layout">
                    {/* Left Column */}
                    <div className="left-column">
                        {/* Subject Distribution */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>📚 Sessions by Subject</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={subjectDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip />
                                    <Bar dataKey="sessions" fill="#2563eb" name="Sessions" radius={[4, 4, 0, 0]}>
                                        {subjectDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Student Progress Distribution */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>🎯 Student Progress Distribution</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={studentProgressData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {studentProgressData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-stats">
                                <div className="pie-stat-item">
                                    <span className="stat-label">Success Rate</span>
                                    <span className="stat-value-small">75% Excellent/Good</span>
                                </div>
                                <div className="pie-stat-item">
                                    <span className="stat-label">Needs Attention</span>
                                    <span className="stat-value-small">7% (3 students)</span>
                                </div>
                            </div>
                        </div>

                        {/* Session Completion Trend */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>📊 Session Completion Trend</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={sessionCompletionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip />
                                    <Legend />
                                    <Area 
                                        type="monotone" 
                                        dataKey="completed" 
                                        stackId="1"
                                        stroke="#10b981" 
                                        fill="#10b981" 
                                        fillOpacity={0.3}
                                        name="Completed Sessions"
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="cancelled" 
                                        stackId="2"
                                        stroke="#ef4444" 
                                        fill="#ef4444" 
                                        fillOpacity={0.3}
                                        name="Cancelled Sessions"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="chart-insight success">
                                ✅ 96% session completion rate - Excellent!
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        {/* Rating Trend */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>⭐ Rating Trend</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={ratingTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis domain={[4.5, 5]} stroke="#64748b" />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="rating" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', r: 4 }}
                                        name="Rating"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="rating-summary">
                                <div className="rating-stat">
                                    <span className="stat-label">Total Reviews</span>
                                    <span className="stat-value-small">{dashboardData?.stats?.totalReviews || 156}</span>
                                </div>
                                <div className="rating-stat">
                                    <span className="stat-label">5-Star Reviews</span>
                                    <span className="stat-value-small">{dashboardData?.stats?.fiveStar || 142} (91%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Categories */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>💬 Feedback Categories</h2>
                            </div>
                            <div className="feedback-categories">
                                {feedbackCategories.map((item, i) => (
                                    <div key={i} className="feedback-item">
                                        <div className="feedback-label">{item.category}</div>
                                        <div className="feedback-bar-container">
                                            <div 
                                                className="feedback-bar"
                                                style={{ width: `${(item.score / item.max) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="feedback-score">{item.score.toFixed(1)}/5</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability Heatmap */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>⏰ Weekly Availability</h2>
                                <button onClick={() => navigate('/tutor/availability')} className="card-link">
                                    Update →
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={availabilityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="day" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip />
                                    <Bar dataKey="hours" fill="#0d9488" name="Available Hours" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="chart-insight">
                                💡 Peak availability: Saturdays (6 hours)
                            </div>
                        </div>

                        {/* Proficiency Radial Chart */}
                        <div className="content-card">
                            <h2 className="badges-title">📊 Tutor Performance Metrics</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <RadialBarChart 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius="20%" 
                                    outerRadius="80%" 
                                    data={proficiencyRadialData}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar
                                        minAngle={15}
                                        label={{ position: 'insideStart', fill: '#fff' }}
                                        background
                                        clockWise
                                        dataKey="value"
                                    />
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                    <Tooltip />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pending Help Requests */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>🙋 Pending Help Requests</h2>
                                <button onClick={() => navigate('/tutor/help-requests')} className="card-link">
                                    View all →
                                </button>
                            </div>
                            <div className="request-list">
                                {(dashboardData?.pendingRequests || [
                                    { student: 'Alex Johnson', subject: 'Data Structures - AVL Trees', time: 'Today, 4:00 PM', topic: 'AVL Tree Rotations' },
                                    { student: 'Emma Davis', subject: 'Algorithms - Dynamic Programming', time: 'Tomorrow, 10:00 AM', topic: 'Knapsack Problem' },
                                    { student: 'Michael Chen', subject: 'Database Systems', time: 'Wed, 2:00 PM', topic: 'SQL Optimization' },
                                ]).map((request, index) => (
                                    <div key={index} className="request-item">
                                        <div className="request-info">
                                            <h3>{request.student}</h3>
                                            <p>{request.subject}</p>
                                            <div className="request-topic">{request.topic}</div>
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
                        <div className="content-card">
                            <div className="card-header">
                                <h2>📅 Upcoming Sessions</h2>
                                <button onClick={() => navigate('/tutor/sessions')} className="card-link">
                                    Manage →
                                </button>
                            </div>
                            <div className="session-list">
                                {(dashboardData?.upcomingSessions || [
                                    { title: 'Data Structures Review', student: 'Alex Johnson', time: 'Today, 4:00 PM', duration: '1.5 hrs' },
                                    { title: 'Algorithms Tutoring', student: 'Emma Davis', time: 'Tomorrow, 10:00 AM', duration: '1 hr' },
                                    { title: 'Database Project Help', student: 'Michael Chen', time: 'Wed, 2:00 PM', duration: '2 hrs' },
                                ]).map((session, index) => (
                                    <div key={index} className="session-item">
                                        <div className="session-dot"></div>
                                        <div className="session-info">
                                            <h3>{session.title}</h3>
                                            <p>With: {session.student}</p>
                                            <div className="session-meta">
                                                <span>📅 {session.time}</span>
                                                <span>⏱️ {session.duration}</span>
                                            </div>
                                        </div>
                                        <button className="session-action-btn">Join</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2>⚡ Quick Stats</h2>
                            </div>
                            <div className="quick-stats">
                                <div className="quick-stat-item">
                                    <span className="stat-label">Response Time</span>
                                    <span className="stat-value-small">2.3 min avg</span>
                                </div>
                                <div className="quick-stat-item">
                                    <span className="stat-label">Repeat Students</span>
                                    <span className="stat-value-small">68%</span>
                                </div>
                                <div className="quick-stat-item">
                                    <span className="stat-label">Earnings (This Month)</span>
                                    <span className="stat-value-small">$1,240</span>
                                </div>
                                <div className="quick-stat-item">
                                    <span className="stat-label">Resources Shared</span>
                                    <span className="stat-value-small">87</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;