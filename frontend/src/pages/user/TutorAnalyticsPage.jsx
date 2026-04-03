import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadialBarChart, RadialBar,
} from 'recharts';

// Static sample chart data (replace with real API data as endpoints become available)
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
    { name: 'Algorithms',      sessions: 32, color: '#7c3aed' },
    { name: 'Databases',       sessions: 28, color: '#0d9488' },
    { name: 'Web Dev',         sessions: 24, color: '#ea580c' },
    { name: 'OS',              sessions: 18, color: '#f59e0b' },
];
const studentProgressData = [
    { name: 'Excellent',   value: 35, color: '#10b981' },
    { name: 'Good',        value: 40, color: '#3b82f6' },
    { name: 'Average',     value: 18, color: '#f59e0b' },
    { name: 'Needs Help',  value:  7, color: '#ef4444' },
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
    { category: 'Knowledge',     score: 4.9 },
    { category: 'Communication', score: 4.8 },
    { category: 'Punctuality',   score: 4.95 },
    { category: 'Helpfulness',   score: 4.85 },
    { category: 'Clarity',       score: 4.7 },
];
const proficiencyRadialData = [
    { name: 'Teaching Rating',      value: 94, fill: '#2563eb' },
    { name: 'Student Satisfaction', value: 92, fill: '#7c3aed' },
    { name: 'Session Completion',   value: 96, fill: '#0d9488' },
    { name: 'Response Rate',        value: 98, fill: '#ea580c' },
];

const TutorAnalyticsPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    const fetch = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/tutor/info');
            setStats(res.data?.stats);
        } catch (err) {
            if (err?.response?.status === 401) navigate('/login');
        }
    }, [navigate]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <TutorLayout title="📊 Analytics">
            {/* KPI row */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card"><h3>{stats?.totalSessions ?? '—'}</h3><p>Total Sessions</p></div>
                <div className="stat-card"><h3>{stats?.averageRating != null ? Number(stats.averageRating).toFixed(1) : '—'}</h3><p>Avg Rating</p></div>
                <div className="stat-card"><h3>{stats?.credibilityScore != null ? Number(stats.credibilityScore).toFixed(1) : '—'}</h3><p>Credibility Score</p></div>
                <div className="stat-card"><h3>{stats?.pendingRequests ?? '—'}</h3><p>Pending Requests</p></div>
            </div>

            {/* Teaching Load */}
            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h2>📈 Teaching Load Trend</h2>
                    <div className="chart-legend">
                        <span className="legend-item"><span className="legend-dot sessions"></span>Sessions</span>
                        <span className="legend-item"><span className="legend-dot students"></span>Students</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={teachingLoadData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis yAxisId="left" stroke="#64748b" />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="sessions" fill="#2563eb" name="Sessions" radius={[4,4,0,0]} />
                        <Line yAxisId="right" type="monotone" dataKey="students" stroke="#ea580c" strokeWidth={2} name="Students" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="dashboard-grid-layout">
                <div className="left-column">
                    {/* Sessions by subject */}
                    <div className="content-card">
                        <div className="card-header"><h2>📚 Sessions by Subject</h2></div>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={subjectDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" angle={-30} textAnchor="end" height={70} fontSize={11} />
                                <YAxis stroke="#64748b" />
                                <Tooltip />
                                <Bar dataKey="sessions" fill="#2563eb" name="Sessions" radius={[4,4,0,0]}>
                                    {subjectDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Student progress */}
                    <div className="content-card">
                        <div className="card-header"><h2>🎯 Student Progress</h2></div>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={studentProgressData} cx="50%" cy="50%" innerRadius={55} outerRadius={75}
                                    paddingAngle={4} dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {studentProgressData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Session completion */}
                    <div className="content-card">
                        <div className="card-header"><h2>📊 Session Completion</h2></div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={sessionCompletionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Completed" />
                                <Area type="monotone" dataKey="cancelled" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Cancelled" />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="chart-insight success">✅ 96% completion rate</div>
                    </div>
                </div>

                <div className="right-column">
                    {/* Rating trend */}
                    <div className="content-card">
                        <div className="card-header"><h2>⭐ Rating Trend</h2></div>
                        <ResponsiveContainer width="100%" height={190}>
                            <LineChart data={ratingTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis domain={[4.5, 5]} stroke="#64748b" />
                                <Tooltip />
                                <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2}
                                    dot={{ fill: '#f59e0b', r: 4 }} name="Rating" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Feedback categories */}
                    <div className="content-card">
                        <div className="card-header"><h2>💬 Feedback Categories</h2></div>
                        <div className="feedback-categories" style={{ padding: '0.5rem 0' }}>
                            {feedbackCategories.map((item) => (
                                <div key={item.category} className="feedback-item">
                                    <div className="feedback-label">{item.category}</div>
                                    <div className="feedback-bar-container">
                                        <div className="feedback-bar" style={{ width: `${(item.score / 5) * 100}%` }} />
                                    </div>
                                    <div className="feedback-score">{item.score.toFixed(1)}/5</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance metrics radial */}
                    <div className="content-card">
                        <div className="card-header"><h2>📊 Performance Metrics</h2></div>
                        <ResponsiveContainer width="100%" height={230}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%"
                                data={proficiencyRadialData} startAngle={180} endAngle={0}>
                                <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }}
                                    background clockWise dataKey="value" />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                <Tooltip />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </TutorLayout>
    );
};

export default TutorAnalyticsPage;
