import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import TutorLayout from './TutorLayout';
import './Dashboard.css';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [stats, setStats] = useState({ sessions: 0, requests: 0, lectures: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = authService.getCurrentUser();
        if (!stored) { navigate('/login'); return; }

        Promise.allSettled([
            api.get('/dashboard/tutor/info'),
            api.get('/peerhelp/requests/available'),
            api.get('/peerhelp/sessions/upcoming'),
            api.get('/peerhelp/lectures/my'),
        ]).then(([infoRes, reqRes, sessRes, lectRes]) => {
            if (infoRes.status === 'fulfilled') setDashboardData(infoRes.value.data);
            setStats({
                requests: (infoRes.status === 'fulfilled' ? reqRes.value?.data?.data?.length : 0) || 0,
                sessions: (sessRes.status === 'fulfilled' ? sessRes.value?.data?.data?.length : 0) || 0,
                lectures: (lectRes.status === 'fulfilled' ? lectRes.value?.data?.data?.length : 0) || 0,
            });
        }).catch(err => {
            if (err?.response?.status === 401) navigate('/login');
        }).finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return (
        <div className="loading"><div className="loading-spinner"></div><p>Loading dashboard...</p></div>
    );

    const verificationStatus = dashboardData?.verificationStatus || 'PENDING';
    const isAvailable = dashboardData?.isAvailable !== false;

    const quickLinks = [
        { path: '/dashboard/tutor/requests',    icon: '🙋', label: 'Help Requests',      count: stats.requests,  color: '#2563eb' },
        { path: '/dashboard/tutor/sessions',    icon: '📅', label: 'My Sessions',        count: stats.sessions,  color: '#7c3aed' },
        { path: '/dashboard/tutor/lectures',    icon: '🎓', label: 'Lectures',           count: stats.lectures,  color: '#0d9488' },
        { path: '/dashboard/tutor/availability',icon: '⏰', label: 'Availability',       count: null,            color: '#ea580c' },
        { path: '/dashboard/tutor/ratings',     icon: '⭐', label: 'Ratings & Feedback', count: null,            color: '#f59e0b' },
        { path: '/dashboard/tutor/analytics',   icon: '📊', label: 'Analytics',          count: null,            color: '#10b981' },
    ];

    return (
        <TutorLayout title={`Welcome back, ${dashboardData?.fullName?.split(' ')[0] || 'Tutor'}!`}>
            {/* Status bar */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <h3>{stats.sessions}</h3>
                    <p>Upcoming Sessions</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.requests}</h3>
                    <p>Open Requests</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.lectures}</h3>
                    <p>My Lectures</p>
                </div>
                <div className="stat-card">
                    <h3>{dashboardData?.averageRating != null ? Number(dashboardData.averageRating).toFixed(1) : '—'}</h3>
                    <p>Avg Rating</p>
                </div>
            </div>

            {/* Verification notice */}
            {verificationStatus !== 'APPROVED' && (
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, color: '#92400e' }}>
                        ⏳ Your tutor account is <strong>{verificationStatus}</strong>. 
                        Some features may be limited until an admin approves your profile.
                    </p>
                </div>
            )}

            {/* Quick-link cards */}
            <div className="dashboard-card" style={{ marginBottom: 0 }}>
                <div className="card-header"><h2>Quick Access</h2></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', padding: '1rem 0' }}>
                    {quickLinks.map(({ path, icon, label, count, color }) => (
                        <div
                            key={path}
                            onClick={() => navigate(path)}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                background: '#f8fafc',
                                border: `2px solid #e2e8f0`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = '#f0f4ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>{label}</div>
                            {count !== null && (
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{count}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Profile shortcut */}
            <div className="dashboard-card" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <strong>Your Profile</strong>
                    <p className="header-subtitle" style={{ margin: '4px 0 0' }}>
                        {dashboardData?.qualification || 'Complete your profile so students can find you.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: isAvailable ? '#d1fae5' : '#fee2e2', color: isAvailable ? '#065f46' : '#991b1b', fontSize: '0.85rem', fontWeight: 500 }}>
                        {isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                    </span>
                    <button className="btn-save" style={{ padding: '8px 18px' }} onClick={() => navigate('/tutor/profile')}>
                        View Profile
                    </button>
                </div>
            </div>
        </TutorLayout>
    );
};

export default TutorDashboard;
