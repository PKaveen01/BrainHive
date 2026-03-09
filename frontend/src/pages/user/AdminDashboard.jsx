import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Import recharts components
import {
  LineChart,
  Line,
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
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Dummy Data
    const stats = {
        totalUsers: 1248,
        totalStudents: 1156,
        totalTutors: 86,
        totalAdmins: 6,
        pendingTutors: 12,
        totalResources: 342,
        pendingResources: 18,
        reportedResources: 23,
        totalHelpRequests: 456,
        pendingHelpRequests: 34,
        completedSessions: 389,
        totalGroups: 78,
        activeGroups: 52,
        platformRating: 4.7
    };

    // User growth data
    const userGrowthData = [
        { month: 'Jan', students: 820, tutors: 45, total: 865 },
        { month: 'Feb', students: 890, tutors: 52, total: 942 },
        { month: 'Mar', students: 945, tutors: 58, total: 1003 },
        { month: 'Apr', students: 1010, tutors: 64, total: 1074 },
        { month: 'May', students: 1085, tutors: 72, total: 1157 },
        { month: 'Jun', students: 1156, tutors: 86, total: 1242 }
    ];

    // Resource activity data
    const resourceActivityData = [
        { week: 'Week 1', uploaded: 45, approved: 38, rejected: 7 },
        { week: 'Week 2', uploaded: 52, approved: 44, rejected: 8 },
        { week: 'Week 3', uploaded: 48, approved: 42, rejected: 6 },
        { week: 'Week 4', uploaded: 55, approved: 47, rejected: 8 }
    ];

    // Help requests data
    const helpRequestsData = [
        { day: 'Mon', requests: 28, completed: 22 },
        { day: 'Tue', requests: 32, completed: 26 },
        { day: 'Wed', requests: 35, completed: 30 },
        { day: 'Thu', requests: 30, completed: 25 },
        { day: 'Fri', requests: 25, completed: 21 },
        { day: 'Sat', requests: 18, completed: 15 },
        { day: 'Sun', requests: 15, completed: 12 }
    ];

    // Subject distribution data
    const subjectDistribution = [
        { name: 'Data Structures', count: 245, color: '#2563eb' },
        { name: 'Algorithms', count: 198, color: '#7c3aed' },
        { name: 'Databases', count: 167, color: '#0d9488' },
        { name: 'Web Dev', count: 143, color: '#ea580c' },
        { name: 'Operating Systems', count: 112, color: '#f59e0b' },
        { name: 'Networks', count: 98, color: '#ef4444' }
    ];

    // Pending tutor applications
    const pendingTutors = [
        { id: 1, name: 'Dr. Emily Chen', email: 'emily.chen@university.edu', qualification: 'Ph.D. in Mathematics', subjects: ['Calculus', 'Linear Algebra', 'Statistics'], appliedDate: '2024-03-20', status: 'pending' },
        { id: 2, name: 'Prof. James Wilson', email: 'j.wilson@university.edu', qualification: 'M.Sc. in Physics', subjects: ['Physics', 'Mechanics', 'Thermodynamics'], appliedDate: '2024-03-19', status: 'pending' },
        { id: 3, name: 'Dr. Sarah Ahmed', email: 's.ahmed@university.edu', qualification: 'Ph.D. in Computer Science', subjects: ['Algorithms', 'Data Structures', 'AI'], appliedDate: '2024-03-18', status: 'pending' },
        { id: 4, name: 'Prof. Michael Brown', email: 'm.brown@university.edu', qualification: 'M.Sc. in Chemistry', subjects: ['Organic Chemistry', 'Inorganic Chemistry'], appliedDate: '2024-03-17', status: 'pending' }
    ];

    // Pending resources for moderation
    const pendingResources = [
        { id: 1, title: 'Advanced Algorithms Notes', type: 'PDF', subject: 'Algorithms', uploadedBy: 'Alex Johnson', uploadedDate: '2024-03-21', status: 'pending' },
        { id: 2, title: 'Database Design Tutorial', type: 'Video', subject: 'Databases', uploadedBy: 'Emma Davis', uploadedDate: '2024-03-20', status: 'pending' },
        { id: 3, title: 'Data Structures Cheat Sheet', type: 'PDF', subject: 'Data Structures', uploadedBy: 'Michael Chen', uploadedDate: '2024-03-19', status: 'pending' },
        { id: 4, title: 'Web Development Guide', type: 'Link', subject: 'Web Dev', uploadedBy: 'Sarah Williams', uploadedDate: '2024-03-18', status: 'pending' }
    ];

    // Reported resources
    const reportedResources = [
        { id: 1, title: 'Outdated Programming Notes', reason: 'Outdated Content', reportedBy: 'John Doe', reportedDate: '2024-03-21', status: 'reported' },
        { id: 2, title: 'Incomplete Tutorial', reason: 'Poor Quality', reportedBy: 'Jane Smith', reportedDate: '2024-03-20', status: 'reported' },
        { id: 3, title: 'Copyrighted Material', reason: 'Copyright Issue', reportedBy: 'Admin', reportedDate: '2024-03-19', status: 'reported' }
    ];

    // Recent users
    const recentUsers = [
        { id: 1, name: 'Alice Johnson', email: 'alice@university.edu', role: 'STUDENT', joinedDate: '2024-03-21', status: 'active' },
        { id: 2, name: 'Bob Williams', email: 'bob@university.edu', role: 'STUDENT', joinedDate: '2024-03-20', status: 'active' },
        { id: 3, name: 'Carol Martinez', email: 'carol@university.edu', role: 'TUTOR', joinedDate: '2024-03-19', status: 'pending_approval' },
        { id: 4, name: 'David Lee', email: 'david@university.edu', role: 'STUDENT', joinedDate: '2024-03-18', status: 'active' }
    ];

    const handleApproveTutor = (tutorId) => {
        alert(`Tutor ${tutorId} approved successfully! (Demo)`);
    };

    const handleRejectTutor = (tutorId) => {
        alert(`Tutor ${tutorId} rejected. (Demo)`);
    };

    const handleApproveResource = (resourceId) => {
        alert(`Resource ${resourceId} approved successfully! (Demo)`);
    };

    const handleRejectResource = (resourceId) => {
        alert(`Resource ${resourceId} rejected. (Demo)`);
    };

    const handleRemoveResource = (resourceId) => {
        alert(`Resource ${resourceId} removed. (Demo)`);
    };

    const handleResolveReport = (reportId) => {
        alert(`Report ${reportId} resolved. (Demo)`);
    };

    const handleUserAction = (userId, action) => {
        alert(`${action} user ${userId} (Demo)`);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-logo">🧠 BrainHive Admin</div>
                
                <div className="sidebar-user">
                    <div className="user-avatar">A</div>
                    <div className="user-info">
                        <h4>Admin User</h4>
                        <p>System Administrator</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Dashboard</h3>
                        <ul>
                            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                                <span>📊</span> Overview
                            </li>
                            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                                <span>👥</span> User Management
                            </li>
                            <li className={activeTab === 'tutors' ? 'active' : ''} onClick={() => setActiveTab('tutors')}>
                                <span>👨‍🏫</span> Tutor Approvals
                            </li>
                            <li className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}>
                                <span>📚</span> Resource Moderation
                            </li>
                            <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                                <span>🚩</span> Reported Content
                            </li>
                            <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                                <span>📈</span> Analytics
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>Settings</h3>
                        <ul>
                            <li onClick={() => navigate('/admin/settings')}>
                                <span>⚙️</span> System Settings
                            </li>
                            <li onClick={handleLogout} className="logout-item">
                                <span>🚪</span> Logout
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-date">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="admin-content">
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon users">👥</div>
                                <div className="stat-info">
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Total Users</p>
                                    <span className="stat-change positive">↑ +12% this month</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon tutors">👨‍🏫</div>
                                <div className="stat-info">
                                    <h3>{stats.totalTutors}</h3>
                                    <p>Active Tutors</p>
                                    <span className="stat-change positive">↑ +8 new this week</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon resources">📚</div>
                                <div className="stat-info">
                                    <h3>{stats.totalResources}</h3>
                                    <p>Total Resources</p>
                                    <span className="stat-change pending">{stats.pendingResources} pending review</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon help">🤝</div>
                                <div className="stat-info">
                                    <h3>{stats.completedSessions}</h3>
                                    <p>Completed Sessions</p>
                                    <span className="stat-change positive">↑ 89% success rate</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon groups">👥</div>
                                <div className="stat-info">
                                    <h3>{stats.activeGroups}</h3>
                                    <p>Active Groups</p>
                                    <span className="stat-change positive">↑ +12 this month</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon rating">⭐</div>
                                <div className="stat-info">
                                    <h3>{stats.platformRating}</h3>
                                    <p>Platform Rating</p>
                                    <span className="stat-change positive">Excellent</span>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="charts-row">
                            <div className="chart-card">
                                <h3>User Growth Trend</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={userGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="students" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} name="Students" />
                                        <Area type="monotone" dataKey="tutors" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Tutors" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card">
                                <h3>Subject Popularity</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={subjectDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            dataKey="count"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {subjectDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="charts-row">
                            <div className="chart-card">
                                <h3>Resource Moderation Activity</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={resourceActivityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="week" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="uploaded" fill="#2563eb" name="Uploaded" />
                                        <Bar dataKey="approved" fill="#10b981" name="Approved" />
                                        <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card">
                                <h3>Help Requests Trend</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={helpRequestsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="requests" stroke="#f59e0b" name="Requests" />
                                        <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>User Management</h2>
                            <button className="btn-primary" onClick={() => alert('Add new user (Demo)')}>
                                + Add User
                            </button>
                        </div>

                        <div className="users-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map(user => (
                                        <tr key={user.id}>
                                            <td><strong>{user.name}</strong></td>
                                            <td>{user.email}</td>
                                            <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                                            <td>{user.joinedDate}</td>
                                            <td>
                                                <span className={`status-badge ${user.status}`}>
                                                    {user.status === 'active' ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="action-btn edit" onClick={() => handleUserAction(user.id, 'Edit')}>Edit</button>
                                                <button className="action-btn suspend" onClick={() => handleUserAction(user.id, 'Suspend')}>Suspend</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tutor Approvals Tab */}
                {activeTab === 'tutors' && (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>Pending Tutor Applications ({pendingTutors.length})</h2>
                        </div>

                        <div className="applications-grid">
                            {pendingTutors.map(tutor => (
                                <div key={tutor.id} className="application-card">
                                    <div className="application-header">
                                        <div className="tutor-avatar">{tutor.name.charAt(0)}</div>
                                        <div className="tutor-info">
                                            <h4>{tutor.name}</h4>
                                            <p>{tutor.email}</p>
                                        </div>
                                    </div>
                                    <div className="application-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Qualification:</span>
                                            <span>{tutor.qualification}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Expert Subjects:</span>
                                            <div className="subjects-list">
                                                {tutor.subjects.map((subject, i) => (
                                                    <span key={i} className="subject-tag">{subject}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Applied:</span>
                                            <span>{tutor.appliedDate}</span>
                                        </div>
                                    </div>
                                    <div className="application-actions">
                                        <button className="btn-approve" onClick={() => handleApproveTutor(tutor.id)}>✓ Approve</button>
                                        <button className="btn-reject" onClick={() => handleRejectTutor(tutor.id)}>✗ Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resource Moderation Tab */}
                {activeTab === 'resources' && (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>Pending Resources ({pendingResources.length})</h2>
                        </div>

                        <div className="resources-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Subject</th>
                                        <th>Uploaded By</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingResources.map(resource => (
                                        <tr key={resource.id}>
                                            <td><strong>{resource.title}</strong></td>
                                            <td><span className="type-badge">{resource.type}</span></td>
                                            <td>{resource.subject}</td>
                                            <td>{resource.uploadedBy}</td>
                                            <td>{resource.uploadedDate}</td>
                                            <td>
                                                <button className="action-btn approve" onClick={() => handleApproveResource(resource.id)}>Approve</button>
                                                <button className="action-btn reject" onClick={() => handleRejectResource(resource.id)}>Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reported Content Tab */}
                {activeTab === 'reports' && (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>Reported Content ({reportedResources.length})</h2>
                        </div>

                        <div className="reports-list">
                            {reportedResources.map(report => (
                                <div key={report.id} className="report-card">
                                    <div className="report-header">
                                        <h4>{report.title}</h4>
                                        <span className="report-status">{report.status}</span>
                                    </div>
                                    <div className="report-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Reason:</span>
                                            <span className="report-reason">{report.reason}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Reported By:</span>
                                            <span>{report.reportedBy}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Date:</span>
                                            <span>{report.reportedDate}</span>
                                        </div>
                                    </div>
                                    <div className="report-actions">
                                        <button className="btn-approve" onClick={() => handleResolveReport(report.id)}>Resolve & Keep</button>
                                        <button className="btn-reject" onClick={() => handleRemoveResource(report.id)}>Remove Content</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>Platform Analytics</h2>
                        </div>

                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h3>User Engagement</h3>
                                <div className="analytics-stat">
                                    <div className="stat-value">78%</div>
                                    <div className="stat-label">Active Users</div>
                                </div>
                                <div className="analytics-stat">
                                    <div className="stat-value">32 min</div>
                                    <div className="stat-label">Avg. Session Duration</div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Content Performance</h3>
                                <div className="analytics-stat">
                                    <div className="stat-value">2,847</div>
                                    <div className="stat-label">Total Downloads</div>
                                </div>
                                <div className="analytics-stat">
                                    <div className="stat-value">4.8</div>
                                    <div className="stat-label">Avg. Resource Rating</div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Peer Help Impact</h3>
                                <div className="analytics-stat">
                                    <div className="stat-value">92%</div>
                                    <div className="stat-label">Satisfaction Rate</div>
                                </div>
                                <div className="analytics-stat">
                                    <div className="stat-value">24 hrs</div>
                                    <div className="stat-label">Avg. Response Time</div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Group Collaboration</h3>
                                <div className="analytics-stat">
                                    <div className="stat-value">78</div>
                                    <div className="stat-label">Active Groups</div>
                                </div>
                                <div className="analytics-stat">
                                    <div className="stat-value">342</div>
                                    <div className="stat-label">Tasks Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;