import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

const userGrowthData = [
    { month: 'Jan', students: 820, tutors: 45 },
    { month: 'Feb', students: 890, tutors: 52 },
    { month: 'Mar', students: 945, tutors: 58 },
    { month: 'Apr', students: 1010, tutors: 64 },
    { month: 'May', students: 1085, tutors: 72 },
    { month: 'Jun', students: 1156, tutors: 86 },
];
const resourceActivityData = [
    { week: 'Week 1', uploaded: 45, approved: 38, rejected: 7 },
    { week: 'Week 2', uploaded: 52, approved: 44, rejected: 8 },
    { week: 'Week 3', uploaded: 48, approved: 42, rejected: 6 },
    { week: 'Week 4', uploaded: 55, approved: 47, rejected: 8 },
];
const helpRequestsData = [
    { day: 'Mon', requests: 28, completed: 22 },
    { day: 'Tue', requests: 32, completed: 26 },
    { day: 'Wed', requests: 35, completed: 30 },
    { day: 'Thu', requests: 30, completed: 25 },
    { day: 'Fri', requests: 25, completed: 21 },
    { day: 'Sat', requests: 18, completed: 15 },
    { day: 'Sun', requests: 15, completed: 12 },
];
const subjectDistribution = [
    { name: 'Data Structures', count: 245, color: '#2563eb' },
    { name: 'Algorithms',      count: 198, color: '#7c3aed' },
    { name: 'Databases',       count: 167, color: '#0d9488' },
    { name: 'Web Dev',         count: 143, color: '#ea580c' },
    { name: 'OS',              count: 112, color: '#f59e0b' },
    { name: 'Networks',        count: 98,  color: '#ef4444' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0, totalStudents: 0, totalTutors: 0,
        pendingTutors: 0, totalResources: 0, pendingResources: 0,
        pendingReports: 0, completedSessions: 0, activeGroups: 0,
    });

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => { if (r.data) setStats(prev => ({ ...prev, ...r.data })); })
            .catch(() => {});
    }, []);

    return (
        <AdminLayout pageTitle="Overview">
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalUsers}</h3><p>Total Users</p>
                        <span className="stat-change positive">↑ +12% this month</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon tutors">👨‍🏫</div>
                    <div className="stat-info">
                        <h3>{stats.totalTutors}</h3><p>Active Tutors</p>
                        <span className="stat-change pending" onClick={() => navigate('/admin/tutors')}>
                            {stats.pendingTutors} pending approval
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon resources">📚</div>
                    <div className="stat-info">
                        <h3>{stats.totalResources}</h3><p>Total Resources</p>
                        <span className="stat-change pending" onClick={() => navigate('/admin/resources/pending')}>
                            {stats.pendingResources} pending review
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon help">🤝</div>
                    <div className="stat-info">
                        <h3>{stats.completedSessions ?? '—'}</h3><p>Completed Sessions</p>
                        <span className="stat-change positive">↑ 89% success rate</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon groups">👥</div>
                    <div className="stat-info">
                        <h3>{stats.activeGroups ?? '—'}</h3><p>Active Groups</p>
                        <span className="stat-change positive">↑ +12 this month</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon reports">🚩</div>
                    <div className="stat-info">
                        <h3>{stats.pendingReports ?? 0}</h3><p>Open Reports</p>
                        <span className="stat-change pending" onClick={() => navigate('/admin/resources/reported')}>
                            Needs review
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts row 1 */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>User Growth Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                            <Tooltip /><Legend />
                            <Area type="monotone" dataKey="students" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} name="Students" />
                            <Area type="monotone" dataKey="tutors"   stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} name="Tutors" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Subject Popularity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={subjectDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count"
                                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                                {subjectDistribution.map((e,i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts row 2 */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>Resource Moderation Activity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={resourceActivityData}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis />
                            <Tooltip /><Legend />
                            <Bar dataKey="uploaded" fill="#2563eb" name="Uploaded" />
                            <Bar dataKey="approved" fill="#10b981" name="Approved" />
                            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Help Requests Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={helpRequestsData}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis />
                            <Tooltip /><Legend />
                            <Line type="monotone" dataKey="requests"  stroke="#f59e0b" name="Requests" />
                            <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
