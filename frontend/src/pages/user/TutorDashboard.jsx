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

/* single indigo/cyan palette — matches student dashboard */
const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

/* ── Shared tooltip ─────────────────────────────────────── */
const V2Tooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="v2-tooltip">
      {label && <p className="v2-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff', margin: '2px 0' }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

/* ── Stat card with SVG outline icons ───────────────────── */
const StatCard = ({ icon, label, value, sub }) => {
  const icons = {
    requests: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="10" r="3"/>
        <path d="M5 18v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"/>
        <path d="M19 18c0-2.76-3.13-5-7-5s-7 2.24-7 5"/>
      </svg>
    ),
    sessions: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="17" rx="2"/>
        <path d="M16 2v4M8 2v4M3 9h18"/>
        <path d="M8 13h8M8 17h5"/>
      </svg>
    ),
    lectures: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3L2 8l10 5 10-5-10-5z"/>
        <path d="M6 11v6s2 3 6 3 6-3 6-3v-6"/>
        <path d="M22 8v6"/>
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 20V14M8 20V10M12 20V4M16 20V10M20 20V14"/>
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  };
  return (
    <div className="v2-stat-card">
      <div className="v2-stat-icon">{icons[icon] || icons.star}</div>
      <div className="v2-stat-body">
        <div className="v2-stat-value">{value}</div>
        <div className="v2-stat-label">{label}</div>
        {sub && <div className="v2-stat-sub">{sub}</div>}
      </div>
    </div>
  );
};

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
        const sorted = [...(ratingsRes.value?.data?.data || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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

  /* rating distribution — single-hue bars */
  const ratingDist = ratingBreakdown ? [
    { stars: '5★', count: ratingBreakdown.fiveStarCount || 0 },
    { stars: '4★', count: ratingBreakdown.fourStarCount || 0 },
    { stars: '3★', count: ratingBreakdown.threeStarCount || 0 },
    { stars: '2★', count: ratingBreakdown.twoStarCount || 0 },
    { stars: '1★', count: ratingBreakdown.oneStarCount || 0 },
  ] : [];

  const workloadData = [
    { name: 'Open Requests',    value: counts.requests },
    { name: 'Upcoming Sessions', value: counts.sessions },
    { name: 'My Lectures',       value: counts.lectures },
  ];

  const expertSubjects = dashboardData?.expertSubjects || [];
  const subjectData = expertSubjects.map((s, i) => ({ name: s, value: 1, color: COLORS[i % COLORS.length] }));

  const quickLinks = [
    { path: '/dashboard/tutor/requests',            icon: 'requests',  label: 'Help Requests', count: counts.requests  },
    { path: '/dashboard/tutor/sessions',            icon: 'sessions',  label: 'My Sessions',   count: counts.sessions  },
    { path: '/dashboard/tutor/lectures',            icon: 'lectures',  label: 'Lectures',      count: counts.lectures  },
    { path: '/dashboard/tutor/availability',        icon: 'sessions',  label: 'Availability',  count: null             },
    { path: '/dashboard/tutor/ratings',             icon: 'star',      label: 'Ratings',       count: null             },
    { path: '/dashboard/tutor/analytics',           icon: 'analytics', label: 'Analytics',     count: null             },
    { path: '/dashboard/tutor/resources/discovery', icon: 'requests',  label: 'Discover',      count: null             },
    { path: '/dashboard/tutor/resources/bookmarked',icon: 'lectures',  label: 'Bookmarked',    count: null             },
  ];

  if (loading) return <div className="v2-loading"><div className="v2-spinner"></div><p>Loading dashboard…</p></div>;

  return (
    <TutorLayout title={null}>
      <div>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="v2-hero" style={{ marginBottom: '1.75rem' }}>
          <div className="v2-hero-text">
            <div className="v2-hero-greeting">Welcome back,</div>
            <h1 className="v2-hero-name">
              {dashboardData?.fullName?.split(' ')[0] || 'Tutor'}
              {' '}
              <svg style={{ width: 28, height: 28, verticalAlign: 'middle', marginBottom: 4 }} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
                <path d="M12 3L2 8l10 5 10-5-10-5z"/>
                <path d="M6 11v6s2 3 6 3 6-3 6-3v-6"/>
                <path d="M22 8v6"/>
              </svg>
            </h1>
            <p className="v2-hero-program">
              {dashboardData?.qualification || 'Expert Tutor'} ·{' '}
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{avgRating}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: 2 }}>Avg Rating</div>
              <div style={{ color: '#fbbf24', fontSize: '1rem', marginTop: '0.2rem' }}>{renderStars(stats.averageRating || 0)}</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalSessions || 0}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: 2 }}>Total Sessions</div>
            </div>
          </div>
        </div>

        {/* ── Verification banner ───────────────────────────────── */}
        {verificationStatus !== 'APPROVED' && (
          <div className="v2-verify-banner">
            Your account is <strong style={{ marginLeft: 4, marginRight: 4 }}>{verificationStatus}</strong> — some features may be limited until an admin approves your profile.
          </div>
        )}

        {/* ── Stat row ─────────────────────────────────────────── */}
        <div className="v2-stats-row" style={{ marginBottom: '1.75rem' }}>
          <StatCard icon="requests" label="Open Requests"    value={counts.requests} sub="Awaiting your response" />
          <StatCard icon="sessions" label="Upcoming Sessions" value={counts.sessions} sub="Scheduled with students" />
          <StatCard icon="lectures" label="My Lectures"       value={counts.lectures} sub="Active lecture sessions" />
          <StatCard icon="analytics" label="Credibility Score" value={stats.credibilityScore != null ? Number(stats.credibilityScore).toFixed(1) : '—'} sub="Platform credibility" />
        </div>

        {/* ── Main grid ────────────────────────────────────────── */}
        <div className="v2-grid">
          <div className="v2-col-wide">

            {/* Current Workload */}
            <div className="v2-card">
              <div className="v2-card-head">
                <h3>
                  <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6M9 16h4"/>
                  </svg>
                  CURRENT WORKLOAD
                </h3>
                <span className="v2-badge">Live Data</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={workloadData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <defs>
                    <linearGradient id="tutorBarGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4f46e5"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={140}/>
                  <Tooltip content={<V2Tooltip />}/>
                  <Bar dataKey="value" name="Count" fill="url(#tutorBarGrad)" radius={[0, 6, 6, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Distribution */}
            {ratingDist.length > 0 && (
              <div className="v2-card">
                <div className="v2-card-head">
                  <h3>
                    <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    RATING DISTRIBUTION
                  </h3>
                  <span className="v2-badge">Live Data</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ratingDist} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <defs>
                      <linearGradient id="ratingBarGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4f46e5"/>
                        <stop offset="100%" stopColor="#06b6d4"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false}/>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                    <YAxis type="category" dataKey="stars" tick={{ fontSize: 13, fill: '#9ca3af' }} width={35}/>
                    <Tooltip content={<V2Tooltip />}/>
                    <Bar dataKey="count" name="Ratings" fill="url(#ratingBarGrad)" radius={[0, 6, 6, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quick Access */}
            <div className="v2-card">
              <div className="v2-card-head">
                <h3>
                  <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  QUICK ACCESS
                </h3>
              </div>
              <div className="v2-quicklink-grid">
                {quickLinks.map(({ path, icon, label, count }) => {
                  const svgIcons = {
                    requests: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}><circle cx="12" cy="10" r="3"/><path d="M5 18v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"/><path d="M19 18c0-2.76-3.13-5-7-5s-7 2.24-7 5"/></svg>,
                    sessions:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18"/><path d="M8 13h8M8 17h5"/></svg>,
                    lectures:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}><path d="M12 3L2 8l10 5 10-5-10-5z"/><path d="M6 11v6s2 3 6 3 6-3 6-3v-6"/><path d="M22 8v6"/></svg>,
                    analytics: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}><path d="M4 20V14M8 20V10M12 20V4M16 20V10M20 20V14"/></svg>,
                    star:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                  };
                  return (
                    <div key={path} className="v2-quicklink-item" onClick={() => navigate(path)}>
                      <div className="v2-quicklink-icon">{svgIcons[icon] || svgIcons.star}</div>
                      <div className="v2-quicklink-label">{label}</div>
                      {count !== null && <div className="v2-quicklink-count" style={{ color: '#4f46e5' }}>{count}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="v2-col-narrow">
            {/* Expert Subjects */}
            {subjectData.length > 0 && (
              <div className="v2-card">
                <div className="v2-card-head">
                  <h3>
                    <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    EXPERT SUBJECTS
                  </h3>
                  <span className="v2-badge">Profile</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={subjectData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                      {subjectData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{ color: payload[0]?.payload.color }}><b>{payload[0]?.name}</b></p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {subjectData.map((d, i) => (
                    <div key={i} className="v2-legend-item">
                      <span className="v2-legend-dot" style={{ background: d.color }}></span>
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="v2-card">
              <div className="v2-card-head">
                <h3>
                  <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  STATUS
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Availability</span>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: isAvailable ? '#d1fae5' : '#fee2e2', color: isAvailable ? '#065f46' : '#991b1b' }}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Verification</span>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: verificationStatus === 'APPROVED' ? '#d1fae5' : '#fef9c3', color: verificationStatus === 'APPROVED' ? '#065f46' : '#854d0e' }}>
                    {verificationStatus}
                  </span>
                </div>
                <button onClick={() => navigate('/tutor/profile')} className="v2-cta-btn" style={{ marginTop: '0.5rem' }}>View Profile →</button>
              </div>
            </div>

            {/* Latest Reviews */}
            <div className="v2-card">
              <div className="v2-card-head">
                <h3>
                  <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  LATEST REVIEWS
                </h3>
                <button className="v2-link" onClick={() => navigate('/dashboard/tutor/ratings')}>View all →</button>
              </div>
              {receivedRatings.length === 0 ? (
                <div className="v2-empty">
                  <svg style={{ width: 32, height: 32, opacity: 0.3, margin: '0 auto 0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <p>No ratings yet. Complete sessions to receive feedback.</p>
                </div>
              ) : (
                <div className="v2-tutor-ratings">
                  {receivedRatings.slice(0, 4).map((item, i) => (
                    <div key={item.id || i} className="v2-tutor-rating-item">
                      <div className="v2-tutor-rating-top">
                        <strong style={{ fontSize: '0.82rem' }}>{item.studentName || 'Student'}</strong>
                        <span className="v2-tutor-rating-stars">{renderStars(item.rating)} <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({item.rating}/5)</span></span>
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
