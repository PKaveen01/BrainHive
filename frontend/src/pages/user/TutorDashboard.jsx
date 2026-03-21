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

const TutorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('help-requests');
    const [availableRequests, setAvailableRequests] = useState([]);
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

        if (!lectureForm.subjectId) {
            errors.subjectId = 'Subject is required';
        }

        const title = lectureForm.title.trim();
        if (!title) {
            errors.title = 'Title is required';
        } else if (title.length < 3 || title.length > 200) {
            errors.title = 'Title must be between 3 and 200 characters';
        }

        const description = lectureForm.description.trim();
        if (!description) {
            errors.description = 'Description is required';
        } else if (description.length < 10 || description.length > 2000) {
            errors.description = 'Description must be between 10 and 2000 characters';
        }

        if (!lectureForm.scheduledAt) {
            errors.scheduledAt = 'Date and time is required';
        } else if (new Date(lectureForm.scheduledAt) <= new Date()) {
            errors.scheduledAt = 'Lecture time must be in the future';
        }

        const duration = Number(lectureForm.durationMinutes);
        if (!duration || Number.isNaN(duration)) {
            errors.durationMinutes = 'Duration is required';
        } else if (duration < 15 || duration > 240) {
            errors.durationMinutes = 'Duration must be between 15 and 240 minutes';
        }

        if (lectureForm.meetingLink && lectureForm.meetingLink.length > 500) {
            errors.meetingLink = 'Meeting link cannot exceed 500 characters';
        }

        setLectureErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const fetchPeerHelpData = async () => {
        try {
            setFetchError('');
            const [availableRes, sessionsRes, availabilityRes, lectureRes, subjectRes] = await Promise.allSettled([
                api.get('/peerhelp/requests/available'),
                api.get('/peerhelp/sessions/upcoming'),
                api.get('/peerhelp/availability/me'),
                api.get('/peerhelp/lectures/my'),
                api.get('/peerhelp/subjects')
            ]);

            if (availableRes.status === 'fulfilled') {
                setAvailableRequests((availableRes.value.data?.data || []).map(mapRequestFromApi));
            } else {
                setAvailableRequests([]);
            }

            if (sessionsRes.status === 'fulfilled') {
                setUpcomingSessions((sessionsRes.value.data?.data || []).map(mapSessionFromApi));
            } else {
                setUpcomingSessions([]);
            }

            if (availabilityRes.status === 'fulfilled') {
                setAvailabilitySlots((availabilityRes.value.data?.data || []).map(mapAvailabilityFromApi));
            } else {
                setAvailabilitySlots([]);
            }

            if (lectureRes.status === 'fulfilled') {
                setMyLectures((lectureRes.value.data?.data || []).map(mapLectureFromApi));
            } else {
                setMyLectures([]);
            }

            if (subjectRes.status === 'fulfilled') {
                setLectureSubjects(subjectRes.value.data?.data || []);
            } else {
                setLectureSubjects([]);
            }

            const firstFailure = [availableRes, sessionsRes, availabilityRes, lectureRes, subjectRes]
                .find((result) => result.status === 'rejected');

            if (firstFailure?.reason?.response?.status === 401) {
                navigate('/login');
                return;
            }

            if (firstFailure?.reason) {
                setFetchError(firstFailure.reason.response?.data?.message || 'Some tutor data could not be loaded.');
            }
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

    const validateAcceptForm = () => {
        const errors = {};
        const start = new Date(acceptForm.scheduledStartTime);
        const end = new Date(acceptForm.scheduledEndTime);

        if (!acceptForm.scheduledStartTime || Number.isNaN(start.getTime())) {
            errors.scheduledStartTime = 'Valid start time is required';
        } else if (start <= new Date()) {
            errors.scheduledStartTime = 'Start time must be in the future';
        }

        if (!acceptForm.scheduledEndTime || Number.isNaN(end.getTime())) {
            errors.scheduledEndTime = 'Valid end time is required';
        } else if (end <= start) {
            errors.scheduledEndTime = 'End time must be after start time';
        }

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
        if (acceptErrors[field]) {
            setAcceptErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const submitAcceptForm = async (request) => {
        if (!validateAcceptForm()) {
            return;
        }

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

    const handleLectureInput = (field, value) => {
        setLectureForm((prev) => ({ ...prev, [field]: value }));
        if (lectureErrors[field]) {
            setLectureErrors((prev) => ({ ...prev, [field]: '' }));
        }
        if (lectureMessage) {
            setLectureMessage('');
        }
    };

    const handleCreateLecture = async (event) => {
        event.preventDefault();
        setLectureMessage('');

        if (!validateLectureForm()) {
            return;
        }

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
            setLectureForm({
                subjectId: '',
                title: '',
                description: '',
                scheduledAt: '',
                durationMinutes: 60,
                meetingLink: ''
            });
            await fetchPeerHelpData();
        } catch (error) {
            console.error('Error creating lecture:', error);
            setLectureMessage(error.response?.data?.message || 'Failed to create lecture.');
        } finally {
            setLectureSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            <TutorSidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
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