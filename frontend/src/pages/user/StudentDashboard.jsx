import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './DashboardV2.css';

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

/* ─── Shared tooltip ─────────────────────────────────────────── */
const V2Tooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="v2-tooltip">
      {label && <p className="v2-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff', margin: '2px 0' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── Stat card with SVG outline icons ───────────────────────── */
const StatCard = ({ icon, label, value, sub }) => {
  const getIconSvg = (iconName) => {
    const icons = {
      'bookmark': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      'users': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      'star': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      'clipboard': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      'group': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ),
    };
    return icons[iconName] || icons['bookmark'];
  };

  return (
    <div className="v2-stat-card">
      <div className="v2-stat-icon">{getIconSvg(icon)}</div>
      <div className="v2-stat-body">
        <div className="v2-stat-value">{value}</div>
        <div className="v2-stat-label">{label}</div>
        {sub && <div className="v2-stat-sub">{sub}</div>}
      </div>
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────── */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [lectures, setLectures] = useState([]);
  const [lectureLoading, setLectureLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingForm, setRatingForm] = useState({ rating: 5, feedback: '', wouldRecommend: true });
  const [ratedSessionIds, setRatedSessionIds] = useState(new Set());

  const fetchDashboardData = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) { navigate('/login'); return; }
      setUser(currentUser);

      const [infoRes, analyticsRes, ratingsRes] = await Promise.allSettled([
        api.get('/dashboard/student/info'),
        api.get('/dashboard/student/analytics'),
        api.get('/peerhelp/ratings/my-ratings'),
      ]);

      if (infoRes.status === 'fulfilled') setDashboardData(infoRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (ratingsRes.status === 'fulfilled') setMyRatings(ratingsRes.value.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchLectures = async () => {
    try {
      setLectureLoading(true);
      const res = await api.get('/peerhelp/lectures');
      setLectures(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLectureLoading(false); }
  };

  const fetchMyRequests = async () => {
    try {
      const [reqRes, sessRes] = await Promise.all([
        api.get('/peerhelp/requests/my-requests'),
        api.get('/peerhelp/sessions/my-sessions'),
      ]);
      const requests = reqRes.data?.data || [];
      const sessions = sessRes.data?.data || [];
      const byReq = sessions.reduce((a, s) => { a[s.helpRequestId] = s; return a; }, {});
      setMyRequests(requests.map(r => ({ ...r, session: byReq[r.id] || null })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'my-requests' && myRequests.length === 0) fetchMyRequests();
    if (tab === 'lectures' && lectures.length === 0) fetchLectures();
  };

  const stats = dashboardData?.stats || {};
  const focusAreas = dashboardData?.focusAreas || [];
  const profileCompletion = dashboardData?.profileCompletion || 0;

  const subjectStrengthData = focusAreas.slice(0, 6).map(s => ({
    name: s.name?.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
    strength: s.strength || 0,
  }));

  const requestStatusData = analytics?.helpRequestsByStatus || [];
  const sessionCompletionData = analytics?.sessionCompletionStats ? [
    { name: 'Completed', value: analytics.sessionCompletionStats.completed || 0, color: '#4f46e5' },
    { name: 'Pending', value: analytics.sessionCompletionStats.pending || 0, color: '#06b6d4' },
  ].filter(d => d.value > 0) : [];

  if (loading) return (
    <div className="v2-loading">
      <div className="v2-spinner"></div>
      <p>Loading dashboard…</p>
    </div>
  );

  return (
    <div className="v2-shell">
      <StudentSidebar user={user} activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="v2-main">

        {activeTab === 'dashboard' && (
          <>
            {/* Hero Section - Original Style */}
            <div className="v2-hero">
              <div className="v2-hero-text">
                <div className="v2-hero-greeting">Welcome back,</div>
                <h1 className="v2-hero-name">{user?.name?.split(' ')[0] || 'Student'} 👋</h1>
                <p className="v2-hero-program">
                  {dashboardData?.program || 'Computer Science'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="v2-hero-ring">
                <svg viewBox="0 0 120 120" className="v2-ring-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="8"
                    strokeDasharray={`${314 * profileCompletion / 100} 314`}
                    strokeLinecap="round" transform="rotate(-90 60 60)"/>
                </svg>
                <div className="v2-ring-text">
                  <span className="v2-ring-pct">{profileCompletion}%</span>
                  <span className="v2-ring-sub">Profile</span>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="v2-stats-row">
              <StatCard icon="bookmark" label="Resources Saved" value={analytics?.totalBookmarks || stats.resourcesSaved || 0} sub="Bookmarked materials"/>
              <StatCard icon="users" label="Help Sessions" value={analytics?.totalSessions || stats.helpSessions || 0} sub="Tutor sessions attended"/>
              <StatCard icon="star" label="Ratings Given" value={myRatings.length} sub="Tutors rated"/>
              <StatCard icon="clipboard" label="Help Requests" value={analytics?.totalRequests || 0} sub="Total submitted"/>
              <StatCard icon="group" label="Study Groups" value={analytics?.totalGroups || 0} sub="Groups you're in"/>
            </div>

            {/* Main Grid - Only Real Data Graphs */}
            <div className="v2-grid">
              {/* LEFT COLUMN - Wide */}
              <div className="v2-col-wide">
                {/* ① Subject Strength - REAL */}
                <div className="v2-card">
                  <div className="v2-card-head">
                    <h3>📊 Subject Strength</h3>
                    <span className="v2-badge">From Your Profile</span>
                  </div>
                  {subjectStrengthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={subjectStrengthData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5"/>
                            <stop offset="100%" stopColor="#06b6d4"/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-20} textAnchor="end" height={50}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]}/>
                        <Tooltip content={<V2Tooltip />}/>
                        <Bar dataKey="strength" name="Strength %" fill="url(#barGradient)" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="v2-empty"><span>📚</span><p>Add subjects to see strength data</p></div>
                  )}
                </div>

                {/* ② Bookmarks by Subject - REAL */}
                {analytics?.resourcesBySubject?.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>📚 Bookmarks by Subject</h3>
                      <span className="v2-badge">Your Library</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.resourcesBySubject} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <Tooltip content={<V2Tooltip />}/>
                        <Bar dataKey="count" name="Bookmarks" fill="url(#barGradient)" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ③ Bookmarks Over Time - REAL */}
                {analytics?.bookmarksOverTime?.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>🔖 Bookmarks Added Over Time</h3>
                      <span className="v2-badge">Live Data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={analytics.bookmarksOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <Tooltip content={<V2Tooltip />}/>
                        <Area type="monotone" dataKey="bookmarks" name="Bookmarks" stroke="#4f46e5" fill="url(#bookGrad)" strokeWidth={2}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ④ Sessions Over Time - REAL */}
                {analytics?.sessionsOverTime?.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>🤝 Help Sessions Over Time</h3>
                      <span className="v2-badge">Live Data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={analytics.sessionsOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <Tooltip content={<V2Tooltip />}/>
                        <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#06b6d4" fill="url(#sessGrad)" strokeWidth={2}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ⑤ Help Requests by Subject - REAL */}
                {analytics?.helpRequestsBySubject?.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>🆘 Help Requests by Subject</h3>
                      <span className="v2-badge">Live Data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analytics.helpRequestsBySubject} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }}/>
                        <Tooltip content={<V2Tooltip />}/>
                        <Bar dataKey="requests" name="Requests" fill="url(#barGradient)" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Narrow */}
              <div className="v2-col-narrow">
                {/* Profile Completion Alert */}
                {profileCompletion < 100 && (
                  <div className="v2-card v2-alert-card">
                    <span className="v2-alert-icon">⚠️</span>
                    <div>
                      <h4>Complete Your Profile</h4>
                      <p>Unlock all features by finishing your profile setup.</p>
                      <button onClick={() => navigate('/profile/edit')} className="v2-cta-btn">Update Now →</button>
                    </div>
                  </div>
                )}

                {/* Request Status - REAL */}
                {requestStatusData.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>📋 Request Status</h3>
                      <span className="v2-badge">Live</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={requestStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                          paddingAngle={3} dataKey="value" stroke="white" strokeWidth={2}>
                          {requestStatusData.map((e, i) => <Cell key={i} fill={e.color || COLORS[i % COLORS.length]}/>)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="v2-legend">
                      {requestStatusData.map((d, i) => (
                        <div key={i} className="v2-legend-item">
                          <span className="v2-legend-dot" style={{ background: d.color || COLORS[i % COLORS.length] }}></span>
                          <span>{d.name}</span>
                          <span className="v2-legend-val">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Completion - REAL */}
                {sessionCompletionData.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>✅ Session Completion</h3>
                      <span className="v2-badge">Live</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={sessionCompletionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                          paddingAngle={3} dataKey="value" stroke="white" strokeWidth={2}>
                          {sessionCompletionData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="v2-legend">
                      {sessionCompletionData.map((d, i) => (
                        <div key={i} className="v2-legend-item">
                          <span className="v2-legend-dot" style={{ background: d.color }}></span>
                          <span>{d.name}</span>
                          <span className="v2-legend-val">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources by Type - REAL */}
                {analytics?.resourcesByType?.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>📄 Resources by Type</h3>
                      <span className="v2-badge">Your Library</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={analytics.resourcesByType} cx="50%" cy="50%" outerRadius={70}
                          paddingAngle={3} dataKey="value" stroke="white" strokeWidth={2}>
                          {analytics.resourcesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="v2-legend">
                      {analytics.resourcesByType.map((d, i) => (
                        <div key={i} className="v2-legend-item">
                          <span className="v2-legend-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                          <span>{d.name}</span>
                          <span className="v2-legend-val">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Focus Areas - REAL */}
                <div className="v2-card">
                  <div className="v2-card-head">
                    <h3>🎓 Focus Areas</h3>
                    <button onClick={() => navigate('/profile/edit')} className="v2-link">Edit →</button>
                  </div>
                  {focusAreas.length > 0 ? (
                    <div className="v2-focus-list">
                      {focusAreas.slice(0, 5).map((s, i) => (
                        <div key={i} className="v2-focus-item">
                          <div className="v2-focus-name">{s.name}</div>
                          <div className="v2-focus-bar-wrap">
                            <div className="v2-focus-bar" style={{ width: `${s.strength || 0}%` }}/>
                          </div>
                          <span className={`v2-focus-badge ${s.strength < 50 ? 'weak' : s.strength < 75 ? 'avg' : 'good'}`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="v2-empty"><span>🎓</span><p>No subjects added yet</p></div>
                  )}
                </div>

                {/* Study Groups - REAL */}
                {analytics?.groupSummary?.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>👥 My Study Groups</h3>
                      <button onClick={() => navigate('/groups')} className="v2-link">View All →</button>
                    </div>
                    <div className="v2-groups-list">
                      {analytics.groupSummary.slice(0, 4).map((g, i) => (
                        <div key={g.id} className="v2-group-item">
                          <div className="v2-group-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                            {g.name?.charAt(0)?.toUpperCase() || 'G'}
                          </div>
                          <div className="v2-group-info">
                            <div className="v2-group-name">{g.name}</div>
                            <div className="v2-group-meta">{g.subject} · {g.memberCount} members</div>
                          </div>
                          <span className={`v2-group-status ${g.isActive ? 'active' : 'inactive'}`}>
                            {g.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Ratings - REAL */}
                {myRatings.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head"><h3>⭐ Recent Ratings Given</h3></div>
                    <div className="v2-ratings-list">
                      {myRatings.slice(0, 3).map((r, i) => (
                        <div key={i} className="v2-rating-item">
                          <div className="v2-rating-top">
                            <strong>{r.tutorName || 'Tutor'}</strong>
                            <span className="v2-stars">
                              {'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}
                            </span>
                          </div>
                          {r.feedback && <p className="v2-rating-note">{r.feedback}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div className="v2-tab-content">
            <div className="v2-tab-header">
              <h2>Available Lectures</h2>
              <button className="v2-refresh-btn" onClick={fetchLectures}>↻ Refresh</button>
            </div>
            {lectureLoading && <div className="v2-loading-inline"><div className="v2-spinner-sm"></div>Loading…</div>}
            {!lectureLoading && lectures.length === 0 && (
              <div className="v2-empty-full"><span>🎓</span><p>No lectures available right now.</p></div>
            )}
            <div className="v2-lecture-grid">
              {!lectureLoading && lectures.map(lec => (
                <div key={lec.id} className="v2-lecture-card">
                  <div className="v2-lecture-badge">{lec.subjectName || 'General'}</div>
                  <h3>{lec.title}</h3>
                  <p className="v2-lecture-desc">{lec.description || 'No description provided.'}</p>
                  <div className="v2-lecture-meta">
                    <span>⏱ {lec.durationMinutes || 0} min</span>
                    <span>👤 {lec.tutorName || 'N/A'}</span>
                    <span>📅 {new Date(lec.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="v2-lecture-actions">
                    {lec.meetingLink && <a href={lec.meetingLink} target="_blank" rel="noreferrer" className="v2-join-btn">Join Lecture</a>}
                    <button onClick={() => navigate(`/dashboard/student/lectures/${lec.id}`)} className="v2-detail-btn">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="v2-tab-content">
            <div className="v2-tab-header">
              <h2>My Help Requests</h2>
              <button className="v2-refresh-btn" onClick={fetchMyRequests}>↻ Refresh</button>
            </div>
            {/* Request content */}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;