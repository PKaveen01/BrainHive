import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import TutorSidebar from '../peerhelp/TutorSidebar';
import TutorHeader from '../peerhelp/TutorHeader';
import TutorStatsCards from '../peerhelp/TutorStatsCards';
import TutorHelpRequestsPanel from '../peerhelp/TutorHelpRequestsPanel';
import TutorLecturesPanel from '../peerhelp/TutorLecturesPanel';
import './Dashboard.css';

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
    const [activeTab, setActiveTab] = useState('help-requests');
    const [availableRequests, setAvailableRequests] = useState([]);
    const [assignedRequests, setAssignedRequests] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [lectureSubjects, setLectureSubjects] = useState([]);
    const [myLectures, setMyLectures] = useState([]);
    const [lectureForm, setLectureForm] = useState({
        subjectId: '',
        title: '',
        description: '',
        scheduledAt: '',
        durationMinutes: 60,
        meetingLink: ''
    });
    const [lectureErrors, setLectureErrors] = useState({});
    const [lectureMessage, setLectureMessage] = useState('');
    const [lectureSubmitting, setLectureSubmitting] = useState(false);
    const [acceptingRequestId, setAcceptingRequestId] = useState(null);
    const [acceptForm, setAcceptForm] = useState({
        scheduledStartTime: '',
        scheduledEndTime: '',
        meetingLink: '',
        notes: ''
    });
    const [acceptErrors, setAcceptErrors] = useState({});
    const [acceptSubmitting, setAcceptSubmitting] = useState(false);
    const [acceptMessage, setAcceptMessage] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [requestChats, setRequestChats] = useState({});
    const [requestChatInput, setRequestChatInput] = useState({});
    const [chatSending, setChatSending] = useState({});
    const [chatErrors, setChatErrors] = useState({});

    const formatDateTime = (value) => {
        if (!value) return 'Not scheduled';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
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

    const mapLectureFromApi = (item) => ({
        id: item.id,
        title: item.title,
        subjectName: item.subjectName,
        description: item.description,
        tutorName: item.tutorName,
        scheduledAt: formatDateTime(item.scheduledAt),
        durationMinutes: item.durationMinutes,
        meetingLink: item.meetingLink
    });

    const validateLectureForm = () => {
        const errors = {};
        if (!lectureForm.subjectId) errors.subjectId = 'Subject is required';
        const title = lectureForm.title.trim();
        if (!title) errors.title = 'Title is required';
        else if (title.length < 3 || title.length > 200) errors.title = 'Title must be between 3 and 200 characters';
        const description = lectureForm.description.trim();
        if (!description) errors.description = 'Description is required';
        else if (description.length < 10 || description.length > 2000) errors.description = 'Description must be between 10 and 2000 characters';
        if (!lectureForm.scheduledAt) errors.scheduledAt = 'Date and time is required';
        else if (new Date(lectureForm.scheduledAt) <= new Date()) errors.scheduledAt = 'Lecture time must be in the future';
        const duration = Number(lectureForm.durationMinutes);
        if (!duration || Number.isNaN(duration)) errors.durationMinutes = 'Duration is required';
        else if (duration < 15 || duration > 240) errors.durationMinutes = 'Duration must be between 15 and 240 minutes';
        if (lectureForm.meetingLink && lectureForm.meetingLink.length > 500) errors.meetingLink = 'Meeting link cannot exceed 500 characters';
        setLectureErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const fetchPeerHelpData = async () => {
        try {
            setFetchError('');
            const [availableRes, assignedRes, sessionsRes, availabilityRes, lectureRes, subjectRes] = await Promise.allSettled([
                api.get('/peerhelp/requests/available'),
                api.get('/peerhelp/requests/assigned'),
                api.get('/peerhelp/sessions/upcoming'),
                api.get('/peerhelp/availability/me'),
                api.get('/peerhelp/lectures/my'),
                api.get('/peerhelp/subjects')
            ]);

            if (availableRes.status === 'fulfilled') setAvailableRequests((availableRes.value.data?.data || []).map(mapRequestFromApi));
            else setAvailableRequests([]);

            if (assignedRes.status === 'fulfilled') {
                const assigned = (assignedRes.value.data?.data || []).map(mapRequestFromApi);
                setAssignedRequests(assigned);
                await refreshRequestConversations(assigned);
            } else {
                setAssignedRequests([]);
            }

            if (sessionsRes.status === 'fulfilled') setUpcomingSessions((sessionsRes.value.data?.data || []).map(mapSessionFromApi));
            else setUpcomingSessions([]);

            if (availabilityRes.status === 'fulfilled') setAvailabilitySlots((availabilityRes.value.data?.data || []).map(mapAvailabilityFromApi));
            else setAvailabilitySlots([]);

            if (lectureRes.status === 'fulfilled') setMyLectures((lectureRes.value.data?.data || []).map(mapLectureFromApi));
            else setMyLectures([]);

            if (subjectRes.status === 'fulfilled') setLectureSubjects(subjectRes.value.data?.data || []);
            else setLectureSubjects([]);

            const firstFailure = [availableRes, assignedRes, sessionsRes, availabilityRes, lectureRes, subjectRes]
                .find((result) => result.status === 'rejected');

            if (firstFailure?.reason?.response?.status === 401) { navigate('/login'); return; }
            if (firstFailure?.reason) setFetchError(firstFailure.reason.response?.data?.message || 'Some tutor data could not be loaded.');
        } catch (error) {
            console.error('Error fetching peerhelp data:', error);
            setFetchError(error.response?.data?.message || 'Unable to load live tutor data from backend.');
            if (error.response?.status === 401) navigate('/login');
        }
    };

    const fetchDashboardData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) { navigate('/login'); return; }
            setUser(currentUser);
            const response = await api.get('/dashboard/tutor/info');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            if (error.response?.status === 401) navigate('/login');
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

    const validateAcceptForm = () => {
        const errors = {};
        const start = new Date(acceptForm.scheduledStartTime);
        const end = new Date(acceptForm.scheduledEndTime);
        if (!acceptForm.scheduledStartTime || Number.isNaN(start.getTime())) errors.scheduledStartTime = 'Valid start time is required';
        else if (start <= new Date()) errors.scheduledStartTime = 'Start time must be in the future';
        if (!acceptForm.scheduledEndTime || Number.isNaN(end.getTime())) errors.scheduledEndTime = 'Valid end time is required';
        else if (end <= start) errors.scheduledEndTime = 'End time must be after start time';
        setAcceptErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAcceptForm = (requestId) => {
        setAcceptingRequestId(requestId);
        setAcceptErrors({});
        setAcceptMessage('');
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000);
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        setAcceptForm({
            scheduledStartTime: start.toISOString().slice(0, 16),
            scheduledEndTime: end.toISOString().slice(0, 16),
            meetingLink: '',
            notes: ''
        });
    };

    const handleAcceptInput = (field, value) => {
        setAcceptForm((prev) => ({ ...prev, [field]: value }));
        if (acceptErrors[field]) setAcceptErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const submitAcceptForm = async (request) => {
        if (!validateAcceptForm()) return;
        try {
            setAcceptSubmitting(true);
            await api.post(`/peerhelp/requests/${request.id}/approve`, {
                scheduledStartTime: new Date(acceptForm.scheduledStartTime).toISOString(),
                scheduledEndTime: new Date(acceptForm.scheduledEndTime).toISOString(),
                meetingLink: acceptForm.meetingLink.trim() || null,
                notes: acceptForm.notes.trim() || null
            });
            setAcceptMessage(`Request from ${request.student} accepted and scheduled.`);
            setAcceptingRequestId(null);
            await fetchPeerHelpData();
        } catch (error) {
            console.error('Error approving request:', error);
            setAcceptMessage(error.response?.data?.message || 'Failed to approve request.');
        } finally {
            setAcceptSubmitting(false);
        }
    };

    const handleDecline = (student) => {
        alert(`Decline action for ${student} is not exposed in current peerhelp API.`);
    };

    const fetchRequestConversation = async (requestId) => {
        try {
            const response = await api.get(`/peerhelp/requests/${requestId}/messages`);
            setRequestChats((prev) => ({ ...prev, [requestId]: response.data?.data || [] }));
            setChatErrors((prev) => ({ ...prev, [requestId]: '' }));
        } catch (error) {
            console.error('Error fetching request conversation:', error);
            const rawMessage = error.response?.data?.message || '';
            const friendlyMessage = rawMessage.includes('No static resource')
                ? 'Conversation service is updating. Please restart backend and refresh.'
                : (rawMessage || 'Unable to load conversation.');
            setChatErrors((prev) => ({
                ...prev,
                [requestId]: friendlyMessage
            }));
        }
    };

    const refreshRequestConversations = async (requestList) => {
        await Promise.all((requestList || []).map((request) => fetchRequestConversation(request.id)));
    };

    const sendRequestMessage = async (requestId) => {
        const text = (requestChatInput[requestId] || '').trim();
        if (!text) return;

        try {
            setChatSending((prev) => ({ ...prev, [requestId]: true }));
            await api.post(`/peerhelp/requests/${requestId}/messages`, { message: text });
            setRequestChatInput((prev) => ({ ...prev, [requestId]: '' }));
            await fetchRequestConversation(requestId);
        } catch (error) {
            console.error('Error sending request message:', error);
            setChatErrors((prev) => ({
                ...prev,
                [requestId]: error.response?.data?.message || 'Unable to send message.'
            }));
        } finally {
            setChatSending((prev) => ({ ...prev, [requestId]: false }));
        }
    };

    useEffect(() => {
        if (activeTab !== 'help-requests' || assignedRequests.length === 0) return undefined;
        const poller = setInterval(() => {
            refreshRequestConversations(assignedRequests);
        }, 5000);
        return () => clearInterval(poller);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, assignedRequests]);

    const handleLectureInput = (field, value) => {
        setLectureForm((prev) => ({ ...prev, [field]: value }));
        if (lectureErrors[field]) setLectureErrors((prev) => ({ ...prev, [field]: '' }));
        if (lectureMessage) setLectureMessage('');
    };

    const handleCreateLecture = async (event) => {
        event.preventDefault();
        setLectureMessage('');
        if (!validateLectureForm()) return;
        try {
            setLectureSubmitting(true);
            await api.post('/peerhelp/lectures', {
                subjectId: Number(lectureForm.subjectId),
                title: lectureForm.title.trim(),
                description: lectureForm.description.trim(),
                scheduledAt: lectureForm.scheduledAt,
                durationMinutes: Number(lectureForm.durationMinutes),
                meetingLink: lectureForm.meetingLink.trim() || null
            });
            setLectureMessage('Lecture created successfully.');
            setLectureForm({ subjectId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
            await fetchPeerHelpData();
        } catch (error) {
            console.error('Error creating lecture:', error);
            setLectureMessage(error.response?.data?.message || 'Failed to create lecture.');
        } finally {
            setLectureSubmitting(false);
        }
    };

    // Chart data
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
            <TutorSidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            <div className="main-content">
                <TutorHeader user={user} dashboardData={dashboardData} />

                <TutorStatsCards
                    upcomingSessionsCount={upcomingSessions.length}
                    availableRequestsCount={availableRequests.length}
                    myLecturesCount={myLectures.length}
                />

                {fetchError && <p className="header-subtitle">{fetchError}</p>}

                {activeTab === 'help-requests' && (
                    <TutorHelpRequestsPanel
                        availableRequests={availableRequests}
                        assignedRequests={assignedRequests}
                        acceptMessage={acceptMessage}
                        fetchPeerHelpData={fetchPeerHelpData}
                        handleDecline={handleDecline}
                        openAcceptForm={openAcceptForm}
                        acceptingRequestId={acceptingRequestId}
                        submitAcceptForm={submitAcceptForm}
                        acceptForm={acceptForm}
                        acceptErrors={acceptErrors}
                        handleAcceptInput={handleAcceptInput}
                        setAcceptingRequestId={setAcceptingRequestId}
                        acceptSubmitting={acceptSubmitting}
                        upcomingSessions={upcomingSessions}
                        requestChats={requestChats}
                        requestChatInput={requestChatInput}
                        setRequestChatInput={setRequestChatInput}
                        chatSending={chatSending}
                        chatErrors={chatErrors}
                        sendRequestMessage={sendRequestMessage}
                        setActiveTab={setActiveTab}
                    />
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

                {activeTab === 'analytics' && (
                    <>
                        {/* Teaching Load Trend */}
                        <div className="chart-card">
                            <div className="card-header">
                                <h2>📈 Teaching Load Trend</h2>
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="legend-dot sessions"></span> Sessions</span>
                                    <span className="legend-item"><span className="legend-dot students"></span> Students</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={teachingLoadData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="week" stroke="#64748b" />
                                    <YAxis yAxisId="left" stroke="#64748b" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="sessions" fill="#2563eb" name="Sessions" radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="students" stroke="#ea580c" strokeWidth={2} name="Students" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="dashboard-grid-layout">
                            <div className="left-column">
                                <div className="content-card">
                                    <div className="card-header"><h2>📚 Sessions by Subject</h2></div>
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

                                <div className="content-card">
                                    <div className="card-header"><h2>🎯 Student Progress Distribution</h2></div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={studentProgressData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                {studentProgressData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pie-stats">
                                        <div className="pie-stat-item"><span className="stat-label">Success Rate</span><span className="stat-value-small">75% Excellent/Good</span></div>
                                        <div className="pie-stat-item"><span className="stat-label">Needs Attention</span><span className="stat-value-small">7% (3 students)</span></div>
                                    </div>
                                </div>

                                <div className="content-card">
                                    <div className="card-header"><h2>📊 Session Completion Trend</h2></div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={sessionCompletionData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Completed Sessions" />
                                            <Area type="monotone" dataKey="cancelled" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Cancelled Sessions" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    <div className="chart-insight success">✅ 96% session completion rate - Excellent!</div>
                                </div>
                            </div>

                            <div className="right-column">
                                <div className="content-card">
                                    <div className="card-header"><h2>⭐ Rating Trend</h2></div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={ratingTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#64748b" />
                                            <YAxis domain={[4.5, 5]} stroke="#64748b" />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Rating" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="rating-summary">
                                        <div className="rating-stat"><span className="stat-label">Total Reviews</span><span className="stat-value-small">{dashboardData?.stats?.totalReviews || 156}</span></div>
                                        <div className="rating-stat"><span className="stat-label">5-Star Reviews</span><span className="stat-value-small">{dashboardData?.stats?.fiveStar || 142} (91%)</span></div>
                                    </div>
                                </div>

                                <div className="content-card">
                                    <div className="card-header"><h2>💬 Feedback Categories</h2></div>
                                    <div className="feedback-categories">
                                        {feedbackCategories.map((item, i) => (
                                            <div key={i} className="feedback-item">
                                                <div className="feedback-label">{item.category}</div>
                                                <div className="feedback-bar-container">
                                                    <div className="feedback-bar" style={{ width: `${(item.score / item.max) * 100}%` }}></div>
                                                </div>
                                                <div className="feedback-score">{item.score.toFixed(1)}/5</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="content-card">
                                    <div className="card-header">
                                        <h2>⏰ Weekly Availability</h2>
                                        <button onClick={() => navigate('/tutor/availability')} className="card-link">Update →</button>
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
                                    <div className="chart-insight">💡 Peak availability: Saturdays (6 hours)</div>
                                </div>

                                <div className="content-card">
                                    <h2 className="badges-title">📊 Tutor Performance Metrics</h2>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={proficiencyRadialData} startAngle={180} endAngle={0}>
                                            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                            <Tooltip />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'ratings' && (
                    <div className="dashboard-card">
                        <div className="card-header"><h2>Ratings & Feedback</h2></div>
                        <div className="card-content">
                            <p className="header-subtitle">Ratings API integration can be added next from /api/peerhelp/ratings endpoints.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'lectures' && (
                    <TutorLecturesPanel
                        lectureSubjects={lectureSubjects}
                        lectureForm={lectureForm}
                        handleLectureInput={handleLectureInput}
                        lectureErrors={lectureErrors}
                        lectureMessage={lectureMessage}
                        handleCreateLecture={handleCreateLecture}
                        lectureSubmitting={lectureSubmitting}
                        myLectures={myLectures}
                        fetchPeerHelpData={fetchPeerHelpData}
                    />
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;