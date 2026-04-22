import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import './DashboardV2.css';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444'];

const V2Tip = ({ active, payload, label }) => {
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

const TutorAnalyticsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [expertSubjects, setExpertSubjects] = useState([]);

  const load = useCallback(async () => {
    try {
      const [infoRes, ratingsRes, breakdownRes, sessRes, reqRes] = await Promise.allSettled([
        api.get('/dashboard/tutor/info'),
        api.get('/peerhelp/ratings/received'),
        api.get('/peerhelp/ratings/my-breakdown'),
        api.get('/peerhelp/sessions/my-sessions').catch(() => ({ data: { data: [] } })),
        api.get('/peerhelp/requests/available'),
      ]);
      if (infoRes.status === 'fulfilled') {
        setStats(infoRes.value.data?.stats);
        setExpertSubjects(infoRes.value.data?.expertSubjects || []);
      }
      if (ratingsRes.status === 'fulfilled') setReceivedRatings(ratingsRes.value?.data?.data || []);
      if (breakdownRes.status === 'fulfilled') setBreakdown(breakdownRes.value?.data?.data);
      if (sessRes.status === 'fulfilled') setSessions(sessRes.value?.data?.data || []);
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value?.data?.data || []);
    } catch (err) { if (err?.response?.status === 401) navigate('/login'); }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  // ── Rating distribution — REAL from breakdown ──────────────────────────────
  const ratingDist = breakdown ? [
    { stars: '5★', count: breakdown.fiveStarCount || 0, color: '#10b981' },
    { stars: '4★', count: breakdown.fourStarCount || 0, color: '#6366f1' },
    { stars: '3★', count: breakdown.threeStarCount || 0, color: '#f59e0b' },
    { stars: '2★', count: breakdown.twoStarCount || 0, color: '#f97316' },
    { stars: '1★', count: breakdown.oneStarCount || 0, color: '#ef4444' },
  ] : [];

  // ── Ratings over time — REAL from receivedRatings ─────────────────────────
  const ratingsOverTime = (() => {
    if (!receivedRatings.length) return [];
    const byMonth = {};
    receivedRatings.forEach(r => {
      const d = new Date(r.createdAt || Date.now());
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { month: key, count: 0, total: 0, recommend: 0 };
      byMonth[key].count++;
      byMonth[key].total += Number(r.rating || 0);
      if (r.wouldRecommend) byMonth[key].recommend++;
    });
    return Object.values(byMonth)
      .map(m => ({ ...m, avgRating: +(m.total / m.count).toFixed(2), recommendPct: +((m.recommend / m.count) * 100).toFixed(0) }))
      .slice(-8);
  })();

  // ── Expert subjects distribution — REAL ────────────────────────────────────
  const subjectData = expertSubjects.map((s, i) => ({ name: s, value: 1, color: COLORS[i % COLORS.length] }));

  // ── Sessions completion — REAL from sessions list ─────────────────────────
  const sessionStatusData = (() => {
    if (!sessions.length) return [];
    const counts = { Completed: 0, 'Upcoming': 0 };
    sessions.forEach(s => { if (s.isCompleted) counts['Completed']++; else counts['Upcoming']++; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // ── Recommend % from ratings — REAL ───────────────────────────────────────
  const recommendPct = (() => {
    if (!receivedRatings.length) return 0;
    const yes = receivedRatings.filter(r => r.wouldRecommend).length;
    return Math.round((yes / receivedRatings.length) * 100);
  })();

  // ── Radial data from REAL stats ────────────────────────────────────────────
  const radialData = [
    { name: 'Avg Rating', value: Math.round((stats?.averageRating || 0) * 20), fill: '#6366f1' },
    { name: 'Would Recommend', value: recommendPct, fill: '#8b5cf6' },
    { name: 'Sessions Done', value: Math.min(100, (stats?.totalSessions || 0) * 5), fill: '#06b6d4' },
    { name: 'Credibility', value: Math.min(100, Math.round(stats?.credibilityScore || 0)), fill: '#10b981' },
  ];

  return (
    <TutorLayout title={null}>
      <div style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: '#1e2547' }}>
        {/* Hero */}
        <div className="v2-hero" style={{ marginBottom: '1.75rem' }}>
          <div className="v2-hero-text">
            <div className="v2-hero-greeting">Performance Analytics</div>
            <h1 className="v2-hero-name">Your Teaching Impact 📊</h1>
            <p className="v2-hero-program">All metrics derived from your real session and rating data</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', color: 'white' }}>
            {[
              { label: 'Total Sessions', val: stats?.totalSessions ?? '—' },
              { label: 'Avg Rating', val: stats?.averageRating != null ? Number(stats.averageRating).toFixed(1) : '—' },
              { label: 'Credibility', val: stats?.credibilityScore != null ? Number(stats.credibilityScore).toFixed(1) : '—' },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '0.2rem' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="v2-kpi-grid" style={{ marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Sessions', val: stats?.totalSessions ?? '—', accent: '#6366f1' },
            { label: 'Avg Rating', val: stats?.averageRating != null ? Number(stats.averageRating).toFixed(1) : '—', accent: '#f59e0b' },
            { label: 'Credibility Score', val: stats?.credibilityScore != null ? Number(stats.credibilityScore).toFixed(1) : '—', accent: '#10b981' },
            { label: 'Total Reviews', val: receivedRatings.length, accent: '#8b5cf6' },
            { label: 'Would Recommend', val: `${recommendPct}%`, accent: '#06b6d4' },
            { label: 'Open Requests', val: requests.length, accent: '#f97316' },
          ].map((k, i) => (
            <div key={i} className="v2-kpi-card" style={{ '--accent': k.accent }}>
              <div className="v2-kpi-val" style={{ color: k.accent }}>{k.val}</div>
              <div className="v2-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="v2-charts-row">
          {/* Ratings over time — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📈 Rating Trend Over Time</h3><span className="v2-badge">Live Data</span></div>
            {ratingsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={ratingsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="rGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)"/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 5]}/>
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:'#6366f1'}}>Avg Rating: <b>{d.avgRating}/5</b></p><p style={{color:'#10b981'}}>Reviews: <b>{d.count}</b></p><p style={{color:'#f59e0b'}}>Recommend: <b>{d.recommendPct}%</b></p></div>;
                  }}/>
                  <Legend/>
                  <Area type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#6366f1" fill="url(#rGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="v2-empty"><span>📈</span><p>No ratings data available yet. Complete sessions to start building your analytics.</p></div>
            )}
          </div>

          {/* Rating distribution — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>⭐ Rating Distribution</h3><span className="v2-badge">Live Data</span></div>
            {ratingDist.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ratingDist} layout="vertical" margin={{ left: 5, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <YAxis type="category" dataKey="stars" tick={{ fontSize: 14, fill: '#94a3b8' }} width={35}/>
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const total = ratingDist.reduce((s, d) => s + d.count, 0);
                    const pct = total > 0 ? ((payload[0]?.value / total) * 100).toFixed(0) : 0;
                    return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:'#fbbf24'}}>Count: <b>{payload[0]?.value}</b></p><p style={{color:'#94a3b8'}}>Share: <b>{pct}%</b></p></div>;
                  }}/>
                  <Bar dataKey="count" name="Reviews" radius={[0,6,6,0]}>
                    {ratingDist.map((d, i) => <Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="v2-empty"><span>⭐</span><p>No rating data yet</p></div>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="v2-charts-row">
          {/* Session status — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📅 Session Status</h3><span className="v2-badge">Live Data</span></div>
            {sessionStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={sessionStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {sessionStatusData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} sessions</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {sessionStatusData.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="v2-empty"><span>📅</span><p>No session data yet</p></div>
            )}
          </div>

          {/* Expert subjects — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📚 Expert Subjects</h3><span className="v2-badge">Profile Data</span></div>
            {subjectData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={subjectData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                      {subjectData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p style={{color:'#94a3b8',fontSize:'0.75rem'}}>Expert subject</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {subjectData.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="v2-empty"><span>📚</span><p>No expert subjects added</p><button onClick={() => navigate('/dashboard/tutor/profile')} className="v2-cta-btn">Edit Profile</button></div>
            )}
          </div>
        </div>

        {/* Performance radial + feedback */}
        <div className="v2-charts-row">
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🎯 Performance Overview</h3><span className="v2-badge">Computed</span></div>
            <ResponsiveContainer width="100%" height={260}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={10} label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }} background clockWise dataKey="value"/>
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right"/>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return <div className="v2-tooltip"><p style={{color:d.fill}}><b>{d.name}</b></p><p>Score: <b>{payload[0]?.value}</b>/100</p></div>;
                }}/>
              </RadialBarChart>
            </ResponsiveContainer>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 0' }}>
              Avg Rating × 20 · Recommend % · Session Count (capped) · Credibility Score
            </p>
          </div>

          {/* Recent reviews — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>💬 Recent Reviews</h3><button className="v2-link" onClick={() => navigate('/dashboard/tutor/ratings')}>View all →</button></div>
            {receivedRatings.length > 0 ? (
              <div className="v2-tutor-ratings" style={{ maxHeight: 280, overflowY: 'auto' }}>
                {receivedRatings.slice(0, 5).map((r, i) => (
                  <div key={i} className="v2-tutor-rating-item">
                    <div className="v2-tutor-rating-top">
                      <strong style={{ fontSize: '0.85rem' }}>{r.studentName || 'Student'}</strong>
                      <span className="v2-tutor-rating-stars">{'★'.repeat(Math.max(0,Math.min(5,Math.round(Number(r.rating||0)))))}{'☆'.repeat(5-Math.max(0,Math.min(5,Math.round(Number(r.rating||0)))))} <span style={{ color:'#94a3b8', fontSize:'0.75rem' }}>({r.rating}/5)</span></span>
                    </div>
                    <p className="v2-tutor-rating-msg">{r.feedback || 'No written feedback.'}</p>
                    {r.wouldRecommend && <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✅ Would recommend</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="v2-empty"><span>💬</span><p>No reviews yet. Complete sessions to receive feedback.</p></div>
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
};

export default TutorAnalyticsPage;
