import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import TutorLayout from './TutorLayout';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './DashboardV2.css';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444'];

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="v2-stat-card" style={{ '--accent': accent }}>
    <div className="v2-stat-icon">{icon}</div>
    <div className="v2-stat-body">
      <div className="v2-stat-value">{value}</div>
      <div className="v2-stat-label">{label}</div>
      {sub && <div className="v2-stat-sub">{sub}</div>}
    </div>
  </div>
);

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [counts, setCounts] = useState({ sessions: 0, requests: 0, lectures: 0 });
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (!stored) { navigate('/login'); return; }

    Promise.allSettled([
      api.get('/dashboard/tutor/info'),
      api.get('/peerhelp/requests/available'),
      api.get('/peerhelp/sessions/upcoming'),
      api.get('/peerhelp/lectures/my'),
      api.get('/peerhelp/ratings/received'),
      api.get('/peerhelp/ratings/my-breakdown'),
    ]).then(([infoRes, reqRes, sessRes, lectRes, ratingsRes, breakdownRes]) => {
      if (infoRes.status === 'fulfilled') setDashboardData(infoRes.value.data);
      if (ratingsRes.status === 'fulfilled') {
        const sorted = [...(ratingsRes.value?.data?.data || [])].sort((a, b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
        setReceivedRatings(sorted);
      }
      if (breakdownRes.status === 'fulfilled') setRatingBreakdown(breakdownRes.value?.data?.data);
      setCounts({
        requests: reqRes.status === 'fulfilled' ? (reqRes.value?.data?.data?.length || 0) : 0,
        sessions: sessRes.status === 'fulfilled' ? (sessRes.value?.data?.data?.length || 0) : 0,
        lectures: lectRes.status === 'fulfilled' ? (lectRes.value?.data?.data?.length || 0) : 0,
      });
    }).catch(err => { if (err?.response?.status === 401) navigate('/login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const renderStars = (rating) => {
    const v = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return '★'.repeat(v) + '☆'.repeat(5 - v);
  };

  const verificationStatus = dashboardData?.verificationStatus || 'PENDING';
  const isAvailable = dashboardData?.isAvailable !== false;
  const stats = dashboardData?.stats || {};
  const avgRating = stats.averageRating != null ? Number(stats.averageRating).toFixed(1) : '—';

  // Rating distribution from breakdown — REAL DATA
  const ratingDist = ratingBreakdown ? [
    { stars: '5★', count: ratingBreakdown.fiveStarCount || 0, color: '#10b981' },
    { stars: '4★', count: ratingBreakdown.fourStarCount || 0, color: '#6366f1' },
    { stars: '3★', count: ratingBreakdown.threeStarCount || 0, color: '#f59e0b' },
    { stars: '2★', count: ratingBreakdown.twoStarCount || 0, color: '#f97316' },
    { stars: '1★', count: ratingBreakdown.oneStarCount || 0, color: '#ef4444' },
  ] : [];

  // Session/request counts bar — REAL DATA
  const workloadData = [
    { name: 'Open Requests', value: counts.requests, fill: '#6366f1' },
    { name: 'Upcoming Sessions', value: counts.sessions, fill: '#8b5cf6' },
    { name: 'My Lectures', value: counts.lectures, fill: '#06b6d4' },
  ];

  // Subject distribution from expert subjects — REAL DATA
  const expertSubjects = dashboardData?.expertSubjects || [];
  const subjectData = expertSubjects.map((s, i) => ({ name: s, value: 1, color: COLORS[i % COLORS.length] }));

  const quickLinks = [
    { path: '/dashboard/tutor/requests', icon: '🙋', label: 'Help Requests', count: counts.requests, color: '#6366f1' },
    { path: '/dashboard/tutor/sessions', icon: '📅', label: 'My Sessions', count: counts.sessions, color: '#8b5cf6' },
    { path: '/dashboard/tutor/lectures', icon: '🎓', label: 'Lectures', count: counts.lectures, color: '#06b6d4' },
    { path: '/dashboard/tutor/availability', icon: '⏰', label: 'Availability', count: null, color: '#f59e0b' },
    { path: '/dashboard/tutor/ratings', icon: '⭐', label: 'Ratings', count: null, color: '#f59e0b' },
    { path: '/dashboard/tutor/analytics', icon: '📊', label: 'Analytics', count: null, color: '#10b981' },
    { path: '/dashboard/tutor/resources/discovery', icon: '🔍', label: 'Discover', count: null, color: '#6366f1' },
    { path: '/dashboard/tutor/resources/bookmarked', icon: '🔖', label: 'Bookmarked', count: null, color: '#8b5cf6' },
  ];

  if (loading) return <div className="v2-loading"><div className="v2-spinner"></div><p>Loading dashboard…</p></div>;

  return (
    <TutorLayout title={null}>
      <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: '#1e2547' }}>
        {/* Hero */}
        <div className="v2-hero" style={{ marginBottom: '1.75rem' }}>
          <div className="v2-hero-text">
            <div className="v2-hero-greeting">Welcome back,</div>
            <h1 className="v2-hero-name">{dashboardData?.fullName?.split(' ')[0] || 'Tutor'} 🎓</h1>
            <p className="v2-hero-program">
              {dashboardData?.qualification || 'Expert Tutor'} ·{' '}
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{avgRating}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Avg Rating</div>
              <div style={{ color: '#fbbf24', fontSize: '1rem', marginTop: '0.2rem' }}>{renderStars(stats.averageRating || 0)}</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalSessions || 0}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Sessions</div>
            </div>
          </div>
        </div>

        {/* Verification banner */}
        {verificationStatus !== 'APPROVED' && (
          <div className="v2-verify-banner">
            ⏳ Your account is <strong style={{ marginLeft: 4, marginRight: 4 }}>{verificationStatus}</strong> — some features may be limited until an admin approves your profile.
          </div>
        )}

        {/* Stats row */}
        <div className="v2-stats-row" style={{ marginBottom: '1.75rem' }}>
          <StatCard icon="🙋" label="Open Requests" value={counts.requests} sub="Awaiting your response" accent="#6366f1"/>
          <StatCard icon="📅" label="Upcoming Sessions" value={counts.sessions} sub="Scheduled with students" accent="#8b5cf6"/>
          <StatCard icon="🎓" label="My Lectures" value={counts.lectures} sub="Active lecture sessions" accent="#06b6d4"/>
          <StatCard icon="📊" label="Credibility Score" value={stats.credibilityScore != null ? Number(stats.credibilityScore).toFixed(1) : '—'} sub="Platform credibility" accent="#10b981"/>
        </div>

        <div className="v2-grid">
          <div className="v2-col-wide">
            {/* Workload bar — REAL */}
            <div className="v2-card">
              <div className="v2-card-head"><h3>📋 Current Workload</h3><span className="v2-badge">Live Data</span></div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={workloadData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={140}/>
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.fill}}>Count: <b>{payload[0]?.value}</b></p></div>;
                  }}/>
                  <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                    {workloadData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rating distribution — REAL (from breakdown) */}
            {ratingDist.length > 0 && (
              <div className="v2-card">
                <div className="v2-card-head"><h3>⭐ Rating Distribution</h3><span className="v2-badge">Live Data</span></div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ratingDist} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false}/>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                    <YAxis type="category" dataKey="stars" tick={{ fontSize: 13, fill: '#94a3b8' }} width={35}/>
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:'#fbbf24'}}>Ratings: <b>{payload[0]?.value}</b></p></div>;
                    }}/>
                    <Bar dataKey="count" name="Ratings" radius={[0,6,6,0]}>
                      {ratingDist.map((d, i) => <Cell key={i} fill={d.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quick links */}
            <div className="v2-card">
              <div className="v2-card-head"><h3>⚡ Quick Access</h3></div>
              <div className="v2-quicklink-grid">
                {quickLinks.map(({ path, icon, label, count, color }) => (
                  <div key={path} className="v2-quicklink-item" style={{ '--accent': color }} onClick={() => navigate(path)}>
                    <div className="v2-quicklink-icon">{icon}</div>
                    <div className="v2-quicklink-label">{label}</div>
                    {count !== null && <div className="v2-quicklink-count" style={{ color }}>{count}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="v2-col-narrow">
            {/* Expert subjects — REAL */}
            {subjectData.length > 0 && (
              <div className="v2-card">
                <div className="v2-card-head"><h3>📚 Expert Subjects</h3><span className="v2-badge">Profile</span></div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={subjectData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                      {subjectData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {subjectData.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span></div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability & Profile */}
            <div className="v2-card">
              <div className="v2-card-head"><h3>🟢 Status</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Availability</span>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: isAvailable ? '#d1fae5' : '#fee2e2', color: isAvailable ? '#065f46' : '#991b1b' }}>
                    {isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Verification</span>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: verificationStatus === 'APPROVED' ? '#d1fae5' : '#fef9c3', color: verificationStatus === 'APPROVED' ? '#065f46' : '#854d0e' }}>
                    {verificationStatus}
                  </span>
                </div>
                <button onClick={() => navigate('/tutor/profile')} className="v2-cta-btn" style={{ marginTop: '0.5rem' }}>View Profile →</button>
              </div>
            </div>

            {/* Latest Ratings — REAL */}
            <div className="v2-card">
              <div className="v2-card-head"><h3>⭐ Latest Reviews</h3><button className="v2-link" onClick={() => navigate('/dashboard/tutor/ratings')}>View all →</button></div>
              {receivedRatings.length === 0 ? (
                <div className="v2-empty"><span>⭐</span><p>No ratings yet. Complete sessions to receive feedback.</p></div>
              ) : (
                <div className="v2-tutor-ratings">
                  {receivedRatings.slice(0, 4).map((item, i) => (
                    <div key={item.id || i} className="v2-tutor-rating-item">
                      <div className="v2-tutor-rating-top">
                        <strong style={{ fontSize: '0.87rem' }}>{item.studentName || 'Student'}</strong>
                        <span className="v2-tutor-rating-stars">{renderStars(item.rating)} <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>({item.rating}/5)</span></span>
                      </div>
                      <p className="v2-tutor-rating-msg">{item.feedback || 'No written feedback.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
};

export default TutorDashboard;
