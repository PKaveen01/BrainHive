import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';

const formatDateTime = (v) => {
    if (!v) return 'Not scheduled';
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleString();
};

const TutorSessionsPage = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSessions = useCallback(async () => {
        try {
            setError('');
            const res = await api.get('/peerhelp/sessions/upcoming');
            const data = res.data?.data || [];
            setSessions(data.map(item => ({
                id: item.id,
                title: item.requestTopic,
                student: item.studentName,
                time: formatDateTime(item.scheduledStartTime),
                endTime: formatDateTime(item.scheduledEndTime),
                meetingLink: item.meetingLink,
                status: item.status,
            })));
        } catch (err) {
            if (err?.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load sessions.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    return (
        <TutorLayout title="📅 My Sessions">
            {error && <div className="profile-alert profile-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

            <div className="dashboard-card">
                <div className="card-header">
                    <h2>Upcoming Sessions</h2>
                    <button className="view-all" onClick={fetchSessions} disabled={loading}>↻ Refresh</button>
                </div>
                <div className="card-content">
                    {loading && <p className="header-subtitle">Loading sessions...</p>}
                    {!loading && sessions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                            <p className="header-subtitle">No upcoming sessions scheduled.</p>
                            <p className="header-subtitle">Accept help requests to schedule sessions.</p>
                        </div>
                    )}
                    {sessions.map((session) => (
                        <div key={session.id} className="session-item" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px' }}>{session.title}</h3>
                                    <p style={{ margin: '0 0 4px', color: '#64748b' }}>With: <strong>{session.student}</strong></p>
                                    <span className="session-time">🕐 Start: {session.time}</span>
                                    {session.endTime && session.endTime !== 'Not scheduled' && (
                                        <span className="session-time" style={{ marginLeft: '1rem' }}>🏁 End: {session.endTime}</span>
                                    )}
                                </div>
                                {session.status && (
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                                        background: session.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe',
                                        color: session.status === 'COMPLETED' ? '#065f46' : '#1d4ed8',
                                    }}>
                                        {session.status}
                                    </span>
                                )}
                            </div>
                            {session.meetingLink && (
                                <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-accept"
                                    style={{ display: 'inline-block', marginTop: '0.75rem', textDecoration: 'none', padding: '8px 16px' }}
                                >
                                    🔗 Join Meeting
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </TutorLayout>
    );
};

export default TutorSessionsPage;
