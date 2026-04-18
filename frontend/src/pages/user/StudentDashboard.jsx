import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './DashboardV2.css';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444'];

const V2Tooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="v2-tooltip">
      {label && <p className="v2-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff', margin: '2px 0' }}>
          <span className="v2-tooltip-key">{p.name}: </span>
          <span className="v2-tooltip-val">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [lectures, setLectures] = useState([]);
  const [lectureLoading, setLectureLoading] = useState(false);
  const [lectureError, setLectureError] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingForm, setRatingForm] = useState({ rating: 5, feedback: '', wouldRecommend: true });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratedSessionIds, setRatedSessionIds] = useState(new Set());
  const [myRatings, setMyRatings] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) { navigate('/login'); return; }
      setUser(currentUser);
      const [infoRes, ratingsRes] = await Promise.allSettled([
        api.get('/dashboard/student/info'),
        api.get('/peerhelp/ratings/my-ratings'),
      ]);
      if (infoRes.status === 'fulfilled') setDashboardData(infoRes.value.data);
      if (ratingsRes.status === 'fulfilled') setMyRatings(ratingsRes.value.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
    if (location.state?.activeTab === 'lectures') fetchLectures();
  // eslint-disable-next-line
  }, []);

  const fetchLectures = async () => {
    try { setLectureLoading(true); setLectureError('');
      const res = await api.get('/peerhelp/lectures');
      setLectures(res.data?.data || []);
    } catch (err) { setLectureError(err.response?.data?.message || 'Unable to load lectures.'); } 
    finally { setLectureLoading(false); }
  };

  const fetchMyRequests = async () => {
    try { setRequestsLoading(true); setRequestsError('');
      const [reqRes, sessRes] = await Promise.all([
        api.get('/peerhelp/requests/my-requests'),
        api.get('/peerhelp/sessions/my-sessions'),
      ]);
      const requests = reqRes.data?.data || [];
      const sessions = sessRes.data?.data || [];
      const byReq = sessions.reduce((a, s) => { a[s.helpRequestId] = s; return a; }, {});
      setMyRequests(requests.map(r => ({ ...r, session: byReq[r.id] || null })));
    } catch (err) { setRequestsError(err.response?.data?.message || 'Unable to load requests.'); }
    finally { setRequestsLoading(false); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'my-requests' && myRequests.length === 0) fetchMyRequests();
    if (tab === 'lectures' && lectures.length === 0) fetchLectures();
  };

  const openRatingModal = (sessionId, tutorName) => {
    setRatingModal({ sessionId, tutorName });
    setRatingForm({ rating: 5, feedback: '', wouldRecommend: true });
    setRatingMessage('');
  };

  const submitRating = async () => {
    if (!ratingModal) return;
    setRatingSubmitting(true);
    try {
      await api.post('/peerhelp/ratings', { sessionId: ratingModal.sessionId, rating: ratingForm.rating, feedback: ratingForm.feedback || null, wouldRecommend: ratingForm.wouldRecommend });
      setRatedSessionIds(prev => new Set([...prev, ratingModal.sessionId]));
      setRatingMessage('Thank you for your feedback!');
      setTimeout(() => { setRatingModal(null); setRatingMessage(''); }, 2000);
      fetchMyRequests();
    } catch (err) { setRatingMessage(err.response?.data?.message || 'Failed to submit rating.'); }
    finally { setRatingSubmitting(false); }
  };

  const fmt = (v) => { if (!v) return 'Not scheduled'; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleString(); };

  const stats = dashboardData?.stats || {};
  const focusAreas = dashboardData?.focusAreas || [];
  const profileCompletion = dashboardData?.profileCompletion || 0;

  // Subject strength — REAL DATA from profile
  const subjectStrengthData = focusAreas.slice(0, 6).map(s => ({
    name: s.name?.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
    strength: s.strength || 0,
  }));

  // Request status distribution — REAL DATA
  const requestStatusData = (() => {
    if (!myRequests.length) return [];
    const counts = {};
    myRequests.forEach(r => { const s = r.status || 'UNKNOWN'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // Ratings over time — REAL DATA
  const ratingsOverTime = (() => {
    if (!myRatings.length) return [];
    const byMonth = {};
    myRatings.forEach(r => {
      const d = new Date(r.createdAt || Date.now());
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { month: key, count: 0, total: 0 };
      byMonth[key].count++;
      byMonth[key].total += Number(r.rating || 0);
    });
    return Object.values(byMonth).map(m => ({ ...m, avgRating: +(m.total / m.count).toFixed(2) })).slice(-6);
  })();

  // Activity bar — REAL DATA
  const activityData = [
    { name: 'Resources Saved', value: stats.resourcesSaved || 0, fill: '#6366f1' },
    { name: 'Help Sessions', value: stats.helpSessions || 0, fill: '#8b5cf6' },
    { name: 'Ratings Given', value: myRatings.length, fill: '#06b6d4' },
  ];

  if (loading) return <div className="v2-loading"><div className="v2-spinner"></div><p>Loading dashboard…</p></div>;

  return (
    <div className="v2-shell">
      <StudentSidebar user={user} activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="v2-main">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Hero */}
            <div className="v2-hero">
              <div className="v2-hero-text">
                <div className="v2-hero-greeting">Welcome back,</div>
                <h1 className="v2-hero-name">{user?.name?.split(' ')[0] || 'Student'} 👋</h1>
                <p className="v2-hero-program">{dashboardData?.program || 'Computer Science'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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

            {/* Stats */}
            <div className="v2-stats-row">
              <StatCard icon="📚" label="Resources Saved" value={stats.resourcesSaved || 0} sub="Bookmarked materials" accent="#6366f1"/>
              <StatCard icon="🤝" label="Help Sessions" value={stats.helpSessions || 0} sub="Tutor sessions attended" accent="#8b5cf6"/>
              <StatCard icon="⭐" label="Ratings Given" value={myRatings.length} sub="Tutors you've rated" accent="#06b6d4"/>
              <StatCard icon="📋" label="Help Requests" value={myRequests.length || 0} sub="Total submitted" accent="#f59e0b"/>
            </div>

            <div className="v2-grid">
              <div className="v2-col-wide">

                {/* Subject Strength — REAL */}
                <div className="v2-card">
                  <div className="v2-card-head">
                    <h3>📊 Subject Strength</h3>
                    <span className="v2-badge">From Your Profile</span>
                  </div>
                  {subjectStrengthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={subjectStrengthData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)"/>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={55}/>
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]}/>
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:'#6366f1'}}>Strength: <b>{payload[0]?.value}%</b></p><p style={{color:'#94a3b8',fontSize:'0.75rem'}}>Based on profile settings</p></div>;
                        }}/>
                        <Bar dataKey="strength" name="Strength %" radius={[6,6,0,0]}>
                          {subjectStrengthData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="v2-empty"><span>📚</span><p>Add subjects to your profile to see strength data</p><button onClick={() => navigate('/profile/edit')} className="v2-cta-btn">Update Profile</button></div>
                  )}
                </div>

                {/* Activity Overview — REAL */}
                <div className="v2-card">
                  <div className="v2-card-head">
                    <h3>🎯 Activity Overview</h3>
                    <span className="v2-badge">Live Data</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={activityData} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false}/>
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={130}/>
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.fill}}>Count: <b>{payload[0]?.value}</b></p></div>;
                      }}/>
                      <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                        {activityData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Ratings over time — REAL */}
                {ratingsOverTime.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head">
                      <h3>⭐ Ratings You've Given Over Time</h3>
                      <span className="v2-badge">Live Data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={ratingsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)"/>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 5]}/>
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload;
                          return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:'#6366f1'}}>Sessions rated: <b>{d?.count}</b></p><p style={{color:'#8b5cf6'}}>Avg rating given: <b>{d?.avgRating}/5</b></p></div>;
                        }}/>
                        <Area type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#6366f1" fill="url(#rGrad)" strokeWidth={2}
                          dot={{ fill: '#6366f1', r: 5, strokeWidth: 0 }} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="v2-col-narrow">
                {/* Profile alert */}
                {profileCompletion < 100 && (
                  <div className="v2-card v2-alert-card">
                    <div className="v2-alert-icon">⚠️</div>
                    <div><h4>Complete Your Profile</h4><p>Unlock all features by finishing your profile setup.</p><button onClick={() => navigate('/profile/edit')} className="v2-cta-btn">Update Now →</button></div>
                  </div>
                )}

                {/* Request Status Pie — REAL */}
                <div className="v2-card">
                  <div className="v2-card-head">
                    <h3>📋 Request Status</h3>
                    <span className="v2-badge">Live</span>
                  </div>
                  {requestStatusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={requestStatusData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                            {requestStatusData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                          </Pie>
                          <Tooltip content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} requests</p></div>;
                          }}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="v2-legend">
                        {requestStatusData.map((d, i) => (
                          <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="v2-empty"><span>📋</span><p>No help requests yet</p><button onClick={() => navigate('/peerhelp')} className="v2-cta-btn">Request Help</button></div>
                  )}
                </div>

                {/* Focus Areas — REAL */}
                <div className="v2-card">
                  <div className="v2-card-head"><h3>🎓 Focus Areas</h3><button onClick={() => navigate('/profile/edit')} className="v2-link">Edit →</button></div>
                  {focusAreas.length > 0 ? (
                    <div className="v2-focus-list">
                      {focusAreas.slice(0, 5).map((s, i) => (
                        <div key={i} className="v2-focus-item">
                          <div className="v2-focus-name">{s.name}</div>
                          <div className="v2-focus-bar-wrap"><div className="v2-focus-bar" style={{width:`${s.strength||0}%`,background:COLORS[i%COLORS.length]}}/></div>
                          <span className={`v2-focus-badge ${s.strength < 50 ? 'weak' : s.strength < 75 ? 'avg' : 'good'}`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="v2-empty"><span>🎓</span><p>No subjects added yet</p></div>
                  )}
                </div>

                {/* Recent Ratings — REAL */}
                {myRatings.length > 0 && (
                  <div className="v2-card">
                    <div className="v2-card-head"><h3>⭐ Recent Ratings Given</h3></div>
                    <div className="v2-ratings-list">
                      {myRatings.slice(0, 3).map((r, i) => (
                        <div key={i} className="v2-rating-item">
                          <div className="v2-rating-top"><strong>{r.tutorName || 'Tutor'}</strong><span className="v2-stars">{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5-Math.round(r.rating))}</span></div>
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

        {/* ── LECTURES TAB ── */}
        {activeTab === 'lectures' && (
          <div className="v2-tab-content">
            <div className="v2-tab-header"><h2>Available Lectures</h2><button className="v2-refresh-btn" onClick={fetchLectures}>↻ Refresh</button></div>
            {lectureLoading && <div className="v2-loading-inline"><div className="v2-spinner-sm"></div>Loading…</div>}
            {!lectureLoading && lectureError && <div className="v2-error">{lectureError}</div>}
            {!lectureLoading && !lectureError && lectures.length === 0 && <div className="v2-empty-full"><span>🎓</span><p>No lectures available right now.</p></div>}
            <div className="v2-lecture-grid">
              {!lectureLoading && lectures.map(lec => (
                <div key={lec.id} className="v2-lecture-card">
                  <div className="v2-lecture-badge">{lec.subjectName || 'General'}</div>
                  <h3>{lec.title}</h3>
                  <p className="v2-lecture-desc">{lec.description || 'No description provided.'}</p>
                  <div className="v2-lecture-meta"><span>⏱ {lec.durationMinutes||0} min</span><span>👤 {lec.tutorName||'N/A'}</span><span>📅 {fmt(lec.scheduledAt)}</span></div>
                  <div className="v2-lecture-actions">
                    {lec.meetingLink && <a href={lec.meetingLink} target="_blank" rel="noreferrer" className="v2-join-btn">Join Lecture</a>}
                    <button onClick={() => navigate(`/dashboard/student/lectures/${lec.id}`)} className="v2-detail-btn">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === 'my-requests' && (
          <div className="v2-tab-content">
            <div className="v2-tab-header"><h2>My Help Requests</h2><button className="v2-refresh-btn" onClick={fetchMyRequests}>↻ Refresh</button></div>
            {requestsLoading && <div className="v2-loading-inline"><div className="v2-spinner-sm"></div>Loading…</div>}
            {!requestsLoading && requestsError && <div className="v2-error">{requestsError}</div>}
            {!requestsLoading && !requestsError && myRequests.length === 0 && <div className="v2-empty-full"><span>📋</span><p>No help requests found yet.</p></div>}
            <div className="v2-request-list">
              {myRequests.map(req => (
                <div key={req.id} className="v2-request-card">
                  <div className="v2-request-head">
                    <h3>{req.topic}</h3>
                    <span className={`v2-status-badge v2-status-${req.status?.toLowerCase()}`}>{req.status}</span>
                  </div>
                  <div className="v2-request-meta"><span>📚 {req.subjectName}</span><span>📅 {fmt(req.preferredDateTime)}</span></div>
                  <p className="v2-request-desc">{req.description}</p>
                  {req.session ? (
                    <div className="v2-session-details">
                      <h4>Session Details</h4>
                      <div className="v2-session-meta"><span>👤 {req.session.tutorName}</span><span>🕐 {fmt(req.session.scheduledStartTime)}</span>{req.session.meetingLink && <a href={req.session.meetingLink} target="_blank" rel="noreferrer" className="v2-join-btn-sm">Join</a>}</div>
                      {req.session.notes && <p className="v2-session-notes">📝 {req.session.notes}</p>}
                      {req.session.isCompleted && !ratedSessionIds.has(req.session.id) && req.status !== 'RATED' && (
                        <button className="v2-rate-btn" onClick={() => openRatingModal(req.session.id, req.session.tutorName)}>⭐ Rate Tutor</button>
                      )}
                      {(ratedSessionIds.has(req.session.id) || req.status === 'RATED') && <p className="v2-rated-note">✅ Session rated</p>}
                    </div>
                  ) : (
                    <p className="v2-pending-note">⏳ Awaiting tutor assignment</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="v2-modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="v2-modal" onClick={e => e.stopPropagation()}>
            <h3>Rate Your Session</h3>
            <p>How was your session with <strong>{ratingModal.tutorName}</strong>?</p>
            <div className="v2-star-picker">
              {[1,2,3,4,5].map(n => <span key={n} className={`v2-star ${ratingForm.rating >= n ? 'on' : ''}`} onClick={() => setRatingForm(f => ({...f, rating: n}))}>★</span>)}
            </div>
            <textarea rows={3} placeholder="Share your experience…" value={ratingForm.feedback} onChange={e => setRatingForm(f => ({...f, feedback: e.target.value}))} className="v2-textarea"/>
            <label className="v2-checkbox-label"><input type="checkbox" checked={ratingForm.wouldRecommend} onChange={e => setRatingForm(f => ({...f, wouldRecommend: e.target.checked}))}/> I would recommend this tutor</label>
            {ratingMessage && <p className={ratingMessage.startsWith('Thank') ? 'v2-success-msg' : 'v2-error-msg'}>{ratingMessage}</p>}
            <div className="v2-modal-actions">
              <button className="v2-submit-btn" onClick={submitRating} disabled={ratingSubmitting}>{ratingSubmitting ? 'Submitting…' : 'Submit Rating'}</button>
              <button className="v2-cancel-btn" onClick={() => setRatingModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
