import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import LectureDetails from './LectureDetails';
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
  RadialBar
} from 'recharts';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [lectures, setLectures] = useState([]);
    const [lectureLoading, setLectureLoading] = useState(false);
    const [lectureError, setLectureError] = useState('');
    const [selectedLectureId, setSelectedLectureId] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState('');
    const [ratingModal, setRatingModal] = useState(null); // { sessionId, tutorName }
    const [ratingForm, setRatingForm] = useState({ rating: 5, feedback: '', wouldRecommend: true });
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [ratingMessage, setRatingMessage] = useState('');
    const [ratedSessionIds, setRatedSessionIds] = useState(new Set());

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    const studyTrendData = [
        { day: 'Mon', hours: 3.5, resources: 4 },
        { day: 'Tue', hours: 2.8, resources: 3 },
        { day: 'Wed', hours: 4.2, resources: 5 },
        { day: 'Thu', hours: 3.0, resources: 3 },
        { day: 'Fri', hours: 2.5, resources: 2 },
        { day: 'Sat', hours: 5.0, resources: 6 },
        { day: 'Sun', hours: 4.5, resources: 5 },
    ];

    const subjectPerformanceData = [
        { subject: 'Data Structures', score: 75, target: 85 },
        { subject: 'Algorithms', score: 68, target: 85 },
        { subject: 'Databases', score: 82, target: 85 },
        { subject: 'Web Dev', score: 90, target: 85 },
        { subject: 'OS', score: 70, target: 85 },
    ];

    const activityDistribution = [
        { name: 'Study Sessions', value: 45, color: '#2563eb' },
        { name: 'Group Work', value: 25, color: '#7c3aed' },
        { name: 'Peer Help', value: 20, color: '#0d9488' },
        { name: 'Resources', value: 10, color: '#ea580c' },
    ];

    const weeklyComparison = [
        { week: 'Week 1', current: 18, previous: 15 },
        { week: 'Week 2', current: 22, previous: 18 },
        { week: 'Week 3', current: 25, previous: 20 },
        { week: 'Week 4', current: 28, previous: 22 },
    ];

    const studyTimeDistribution = [
        { time: 'Morning', hours: 8 },
        { time: 'Afternoon', hours: 12 },
        { time: 'Evening', hours: 15 },
        { time: 'Night', hours: 10 },
    ];

    const proficiencyRadialData = [
        { name: 'Overall', value: 78, fill: '#2563eb' },
        { name: 'Technical', value: 72, fill: '#7c3aed' },
        { name: 'Theoretical', value: 85, fill: '#0d9488' },
        { name: 'Practical', value: 68, fill: '#ea580c' },
    ];

    const profileCompletion = dashboardData?.profileCompletion || 85;

    const formatDateTime = (value) => {
        if (!value) return 'Not scheduled';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
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
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLectureLoading(false);
        }
    };

    const handleOpenLectures = async () => {
        setActiveTab('lectures');
        setSelectedLectureId(null);
        if (lectures.length === 0) await fetchLectures();
    };

    const handleOpenLectureDetails = (id) => {
        setActiveTab('lectures');
        setSelectedLectureId(String(id));
        navigate(`/dashboard/student?tab=lectures&lectureId=${id}`);
    };

    const handleBackToLectureList = () => {
        setSelectedLectureId(null);
        navigate('/dashboard/student?tab=lectures');
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
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleOpenMyRequests = async () => {
        setActiveTab('my-requests');
        if (myRequests.length === 0) await fetchMyRequests();
    };

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        const lectureIdFromQuery = new URLSearchParams(location.search).get('lectureId');

        const openRequestedTab = async () => {
            if (tab === 'lectures') {
                await handleOpenLectures();
            } else if (tab === 'my-requests') {
                await handleOpenMyRequests();
            }

            if (tab === 'lectures' && lectureIdFromQuery) {
                setSelectedLectureId(lectureIdFromQuery);
            } else {
                setSelectedLectureId(null);
            }
        };

        openRequestedTab();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const openRatingModal = (sessionId, tutorName) => {
        setRatingModal({ sessionId, tutorName });
        setRatingForm({ rating: 5, feedback: '', wouldRecommend: true });
        setRatingMessage('');
    };

    const submitRating = async () => {
        if (!ratingModal) return;
        setRatingSubmitting(true);
        try {
            await api.post('/peerhelp/ratings', {
                sessionId: ratingModal.sessionId,
                rating: ratingForm.rating,
                feedback: ratingForm.feedback || null,
                wouldRecommend: ratingForm.wouldRecommend,
            });
            setRatedSessionIds(prev => new Set([...prev, ratingModal.sessionId]));
            setRatingMessage('Thank you for your feedback!');
            setTimeout(() => { setRatingModal(null); setRatingMessage(''); }, 2000);
            fetchMyRequests();
        } catch (err) {
            setRatingMessage(err.response?.data?.message || 'Failed to submit rating. Please try again.');
        } finally {
            setRatingSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <StudentSidebar
                user={user}
                activeTab={activeTab}
                onTabChange={(tab) => {
                    if (tab === 'my-requests') handleOpenMyRequests();
                    else if (tab === 'lectures') handleOpenLectures();
                    else setActiveTab(tab);
                }}
            />

            {/* Main Content */}
            <div className="main-content">
                {activeTab === 'dashboard' && (
                <>
                    {/* Welcome Banner */}
                    <div className="welcome-banner">
                        <div>
                            <h1 className="welcome-title">
                                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                            </h1>
                            <p className="welcome-subtitle">
                                {dashboardData?.user?.program || 'Computer Science, Year 3'} •{' '}
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="study-streak-badge">
                                🔥 {dashboardData?.stats?.studyStreak || '12'} Day Study Streak!
                            </div>
                        </div>
                        <div className="profile-status">
                            <div className="progress-circle">
                                <svg className="progress-svg" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="progress-bg" />
                                    <circle
                                        cx="24" cy="24" r="20"
                                        stroke="currentColor" strokeWidth="4" fill="transparent"
                                        strokeDasharray={125.6}
                                        strokeDashoffset={125.6 - (125.6 * profileCompletion) / 100}
                                        className="progress-fill"
                                    />
                                </svg>
                                <div className="progress-text">{profileCompletion}%</div>
                            </div>
                            <div>
                                <div className="profile-status-label">Profile Status</div>
                                <button onClick={() => navigate('/profile/edit')} className="profile-status-link">
                                    Complete profile →
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
                            <button onClick={() => navigate('/profile/edit')} className="warning-button">
                                Update Now
                            </button>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue"><span className="icon">📚</span></div>
                            <div>
                                <div className="stat-value">{dashboardData?.stats?.resourcesSaved || '42'}</div>
                                <div className="stat-label">Resources Saved</div>
                                <div className="stat-trend positive">↑ +12 this week</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purple"><span className="icon">👥</span></div>
                            <div>
                                <div className="stat-value">{dashboardData?.stats?.helpSessions || '8'}</div>
                                <div className="stat-label">Help Sessions</div>
                                <div className="stat-trend positive">↑ +3 this month</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon teal"><span className="icon">📅</span></div>
                            <div>
                                <div className="stat-value">{dashboardData?.stats?.groupProjects || '3'}</div>
                                <div className="stat-label">Active Groups</div>
                                <div className="stat-trend">↗ 85% attendance</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange"><span className="icon">⭐</span></div>
                            <div>
                                <div className="stat-value">4.8</div>
                                <div className="stat-label">Rating</div>
                                <div className="stat-trend positive">↑ from 4.6</div>
                            </div>
                        </div>
                    </div>

                    {/* Study Trend Chart */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h2>📈 Weekly Study Activity</h2>
                            <div className="chart-legend">
                                <span className="legend-item"><span className="legend-dot hours"></span> Study Hours</span>
                                <span className="legend-item"><span className="legend-dot resources"></span> Resources Used</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={studyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="day" stroke="#64748b" />
                                <YAxis yAxisId="left" stroke="#64748b" />
                                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} name="Study Hours" />
                                <Line yAxisId="right" type="monotone" dataKey="resources" stroke="#ea580c" strokeWidth={2} dot={{ fill: '#ea580c', r: 4 }} name="Resources Used" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dashboard-grid-layout">
                        {/* Left Column */}
                        <div className="left-column">
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>📊 Subject Performance vs Target</h2>
                                    <button onClick={() => navigate('/focus-areas')} className="card-link">View Details →</button>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={subjectPerformanceData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                                        <YAxis type="category" dataKey="subject" stroke="#64748b" width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="score" fill="#2563eb" name="Current Score" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="target" fill="#94a3b8" name="Target Score" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="content-card">
                                <div className="card-header"><h2>🎯 Learning Activity Distribution</h2></div>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={activityDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {activityDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-stats">
                                    <div className="pie-stat-item">
                                        <span className="stat-label">Most Active</span>
                                        <span className="stat-value-small">Study Sessions (45%)</span>
                                    </div>
                                    <div className="pie-stat-item">
                                        <span className="stat-label">Improvement Area</span>
                                        <span className="stat-value-small">Resource Usage (+10%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="card-header"><h2>📅 Weekly Progress Comparison</h2></div>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={weeklyComparison}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="week" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="current" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} name="Current Month" />
                                        <Area type="monotone" dataKey="previous" stackId="2" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} name="Previous Month" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <div className="chart-insight">💡 You're up 28% compared to last month!</div>
                            </div>

                            <div className="content-card">
                                <div className="card-header">
                                    <h2>🎓 Academic Focus Areas</h2>
                                    <button onClick={() => navigate('/focus-areas')} className="card-link">Edit Subjects</button>
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
                        </div>

                        {/* Right Column */}
                        <div className="right-column">
                            <div className="content-card">
                                <h2 className="badges-title">🎯 Proficiency Overview</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={proficiencyRadialData} startAngle={180} endAngle={0}>
                                        <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                        <Tooltip />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="content-card">
                                <div className="card-header"><h2>⏰ Study Time Distribution</h2></div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={studyTimeDistribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" stroke="#64748b" />
                                        <YAxis type="category" dataKey="time" stroke="#64748b" />
                                        <Tooltip />
                                        <Bar dataKey="hours" fill="#0d9488" name="Hours Studied" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="chart-insight">🌙 You're most productive in the evening!</div>
                            </div>

                            <div className="content-card">
                                <h2 className="badges-title">🏆 Achievements & Badges</h2>
                                <div className="badges-container">
                                    <span className="badge purple">🎓 Top Performer</span>
                                    <span className="badge teal">👥 Group Leader</span>
                                    <span className="badge orange">🦉 Night Owl</span>
                                    <span className="badge blue">📚 Resource Master</span>
                                    <span className="badge green">🤝 Peer Helper</span>
                                    <span className="badge pink">⚡ Quick Learner</span>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="card-header"><h2>📅 Upcoming Schedule</h2></div>
                                <div className="schedule-list">
                                    {(dashboardData?.upcomingSchedule || [
                                        { title: 'Data Structures Tutoring', time: 'Today, 4:00 PM', type: '1-on-1' },
                                        { title: 'CS301 Project Meeting', time: 'Tomorrow, 2:00 PM', type: 'Group' },
                                        { title: 'Database Systems Quiz', time: 'Wed, 10:00 AM', type: 'Exam' },
                                    ]).map((session, i) => (
                                        <div key={i} className="schedule-item">
                                            <div className={`schedule-dot ${i === 0 ? 'brand' : i === 1 ? 'teal' : 'orange'}`}></div>
                                            <div className="schedule-content">
                                                <h4>{session.title}</h4>
                                                <div className="schedule-time"><span>📅</span> {session.time}</div>
                                            </div>
                                            <span className="schedule-type">{session.type}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="schedule-footer">
                                    <button onClick={() => navigate('/calendar')} className="schedule-footer-button">
                                        View Full Calendar →
                                    </button>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="card-header"><h2>⚡ Quick Stats</h2></div>
                                <div className="quick-stats">
                                    <div className="quick-stat-item"><span className="stat-label">Total Study Hours</span><span className="stat-value-small">127 hrs</span></div>
                                    <div className="quick-stat-item"><span className="stat-label">Resources Shared</span><span className="stat-value-small">15</span></div>
                                    <div className="quick-stat-item"><span className="stat-label">Help Given</span><span className="stat-value-small">23</span></div>
                                    <div className="quick-stat-item"><span className="stat-label">Group Sessions</span><span className="stat-value-small">18</span></div>
                                    <div className="quick-stat-item"><span className="stat-label">Completion Rate</span><span className="stat-value-small">92%</span></div>
                                    <div className="quick-stat-item"><span className="stat-label">Peer Rating</span><span className="stat-value-small">4.9/5</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                )}

                {activeTab === 'lectures' && (
                    selectedLectureId ? (
                        <LectureDetails
                            embedded
                            lectureIdOverride={selectedLectureId}
                            onBackToList={handleBackToLectureList}
                        />
                    ) : (
                        <div className="dashboard-card lectures-panel-card">
                            <div className="card-header">
                                <h2>Available Lectures</h2>
                                <button type="button" className="view-all" onClick={fetchLectures}>Refresh</button>
                            </div>
                            <div className="card-content lecture-cards-grid">
                                {lectureLoading && <p className="header-subtitle">Loading lectures...</p>}
                                {!lectureLoading && lectureError && <p className="header-subtitle">{lectureError}</p>}
                                {!lectureLoading && !lectureError && lectures.length === 0 && (
                                    <p className="header-subtitle">No lectures available right now.</p>
                                )}
                                {!lectureLoading && !lectureError && lectures.map((lecture) => (
                                    <article key={lecture.id} className="lecture-program-card">
                                        <div className="lecture-program-header">
                                            <span className="lecture-program-subject-chip">{lecture.subjectName || 'General'}</span>
                                            <span className="lecture-program-duration-chip">{lecture.durationMinutes || 0} min</span>
                                        </div>

                                        <h3 className="lecture-program-title">
                                            {lecture.title || 'Untitled Lecture'}
                                        </h3>

                                        <div className="lecture-program-details">
                                            <p><strong>Date</strong><span>{formatDateTime(lecture.scheduledAt)}</span></p>
                                            <p><strong>Tutor</strong><span>{lecture.tutorName || 'N/A'}</span></p>
                                            <p><strong>Type</strong><span>{lecture.meetingLink ? 'Online' : 'Details only'}</span></p>
                                        </div>

                                        <p className="lecture-program-desc">
                                            {lecture.description || 'No description provided.'}
                                        </p>

                                        <div className="lecture-program-actions">
                                            {lecture.meetingLink && (
                                                <a
                                                    href={lecture.meetingLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="lecture-program-link"
                                                >
                                                    Join Lecture
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                className="lecture-program-btn"
                                                onClick={() => handleOpenLectureDetails(lecture.id)}
                                            >
                                                More Details
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )
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
                                                <p><strong>Meeting Link:</strong>{' '}
                                                    <a href={request.session.meetingLink} target="_blank" rel="noreferrer">Join session</a>
                                                </p>
                                            )}
                                            {request.session.notes && (
                                                <p><strong>Tutor Notes:</strong> {request.session.notes}</p>
                                            )}
                                            {request.session.isCompleted && !ratedSessionIds.has(request.session.id) && request.status !== 'RATED' && (
                                                <button
                                                    className="btn-rate-tutor"
                                                    onClick={() => openRatingModal(request.session.id, request.session.tutorName)}
                                                >
                                                    ⭐ Rate Your Tutor
                                                </button>
                                            )}
                                            {(ratedSessionIds.has(request.session.id) || request.status === 'RATED') && (
                                                <p className="rating-done-note">✅ You have rated this session.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── RATING MODAL ───────────────────────────────── */}
            {ratingModal && (
                <div className="modal-overlay" onClick={() => setRatingModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>⭐ Rate Your Session</h3>
                        <p>How was your session with <strong>{ratingModal.tutorName}</strong>?</p>

                        <div className="modal-field">
                            <label>Overall Rating</label>
                            <div className="star-picker">
                                {[1,2,3,4,5].map(n => (
                                    <span
                                        key={n}
                                        className={`star ${ratingForm.rating >= n ? 'filled' : ''}`}
                                        onClick={() => setRatingForm(f => ({ ...f, rating: n }))}
                                    >★</span>
                                ))}
                            </div>
                        </div>

                        <div className="modal-field">
                            <label>Feedback (optional)</label>
                            <textarea
                                rows={3}
                                placeholder="Share your experience..."
                                value={ratingForm.feedback}
                                onChange={e => setRatingForm(f => ({ ...f, feedback: e.target.value }))}
                                className="rating-textarea"
                            />
                        </div>

                        <div className="modal-field">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={ratingForm.wouldRecommend}
                                    onChange={e => setRatingForm(f => ({ ...f, wouldRecommend: e.target.checked }))}
                                />
                                I would recommend this tutor
                            </label>
                        </div>

                        {ratingMessage && (
                            <p className={ratingMessage.startsWith('Thank') ? 'rating-success' : 'rating-error'}>
                                {ratingMessage}
                            </p>
                        )}

                        <div className="modal-actions">
                            <button className="btn-submit-rating" onClick={submitRating} disabled={ratingSubmitting}>
                                {ratingSubmitting ? 'Submitting…' : 'Submit Rating'}
                            </button>
                            <button className="btn-cancel-rating" onClick={() => setRatingModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
