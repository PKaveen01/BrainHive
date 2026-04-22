import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import '../user/DashboardV2.css';
import api from '../../services/api';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444'];

const V2Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="v2-tooltip">
      {label && <p className="v2-tooltip-label">{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#fff', margin: '2px 0' }}>{p.name}: <b>{p.value}</b></p>)}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0, totalStudents: 0, totalTutors: 0, approvedTutors: 0,
    pendingTutors: 0, totalResources: 0, activeResources: 0,
    pendingResources: 0, flaggedResources: 0, pendingReports: 0,
    activeGroups: 0, completedSessions: 0,
  });
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/peerhelp/requests/available'),
      api.get('/admin/dashboard-stats'),
    ]).then(([statsRes, usersRes, reqRes, dashRes]) => {
      if (statsRes.status === 'fulfilled' && statsRes.value.data) setStats(prev => ({ ...prev, ...statsRes.value.data }));
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.data || []);
      if (dashRes.status === 'fulfilled') setDashboardStats(dashRes.value.data);
    }).catch(() => {});
  }, []);

  // ── User role distribution — REAL ──────────────────────────────────────────
  const userRoleDist = [
    { name: 'Students', value: stats.totalStudents, color: '#6366f1' },
    { name: 'Tutors', value: stats.totalTutors, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // ── Tutor verification status — REAL ─────────────────────────────────────
  const tutorStatusDist = [
    { name: 'Approved', value: stats.approvedTutors, color: '#10b981' },
    { name: 'Pending', value: stats.pendingTutors, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // ── Resource status — REAL ────────────────────────────────────────────────
  const resourceDist = [
    { name: 'Active', value: stats.activeResources, fill: '#10b981' },
    { name: 'Pending', value: stats.pendingResources, fill: '#f59e0b' },
    { name: 'Flagged', value: stats.flaggedResources, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  // ── User account status from users list — REAL ────────────────────────────
  const accountStatusDist = (() => {
    if (!users.length) return [];
    const counts = {};
    users.forEach(u => { const s = u.accountStatus || 'ACTIVE'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // ── Help request status — REAL ────────────────────────────────────────────
  const requestStatusDist = (() => {
    if (!requests.length) return [];
    const counts = {};
    requests.forEach(r => { const s = r.status || 'UNKNOWN'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // ── User growth simulation from real totals — monthly snapshot ────────────
  const growthData = [
    { label: 'Students', value: stats.totalStudents, color: '#6366f1' },
    { label: 'Tutors', value: stats.totalTutors, color: '#8b5cf6' },
    { label: 'Resources', value: stats.totalResources, color: '#06b6d4' },
    { label: 'Pending Reports', value: stats.pendingReports, color: '#ef4444' },
    { label: 'Active Groups', value: stats.activeGroups || 0, color: '#10b981' },
  ];

  return (
    <AdminLayout pageTitle="Overview">
      <div style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>

        {/* Hero Banner */}
        <div className="v2-hero" style={{ marginBottom: '1.75rem', borderRadius: '16px' }}>
          <div className="v2-hero-text">
            <div className="v2-hero-greeting">Admin Control Panel</div>
            <h1 className="v2-hero-name">BrainHive Overview 🧠</h1>
            <p className="v2-hero-program">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', color: 'white', alignItems: 'center' }}>
            {[
              { label: 'Total Users', val: stats.totalUsers },
              { label: 'Resources', val: stats.totalResources },
              { label: 'Open Reports', val: stats.pendingReports },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '0.25rem' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="v2-kpi-grid" style={{ marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Users', val: stats.totalUsers, accent: '#6366f1', click: () => navigate('/admin/users') },
            { label: 'Students', val: stats.totalStudents, accent: '#8b5cf6', click: () => navigate('/admin/users') },
            { label: 'Approved Tutors', val: stats.approvedTutors, accent: '#06b6d4', click: () => navigate('/admin/tutors') },
            { label: 'Pending Tutors', val: stats.pendingTutors, accent: '#f59e0b', click: () => navigate('/admin/tutors') },
            { label: 'Total Resources', val: stats.totalResources, accent: '#10b981', click: () => navigate('/admin/resources/active') },
            { label: 'Open Reports', val: stats.pendingReports, accent: '#ef4444', click: () => navigate('/admin/resources/reported') },
          ].map((k, i) => (
            <div key={i} className="v2-kpi-card" style={{ '--accent': k.accent, cursor: k.click ? 'pointer' : 'default' }} onClick={k.click}>
              <div className="v2-kpi-val" style={{ color: k.accent }}>{k.val}</div>
              <div className="v2-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="v2-charts-row">
          {/* User distribution — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>👥 User Distribution</h3><span className="v2-badge">Live Data</span></div>
            {userRoleDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={userRoleDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {userRoleDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const total = userRoleDist.reduce((s, d) => s + d.value, 0);
                      const pct = total > 0 ? ((payload[0]?.value / total) * 100).toFixed(0) : 0;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>Count: <b>{payload[0]?.value}</b></p><p style={{color:'#94a3b8'}}>Share: <b>{pct}%</b></p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {userRoleDist.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>👥</span><p>No user data available</p></div>}
          </div>

          {/* Platform metrics bar — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📊 Platform Metrics</h3><span className="v2-badge">Live Data</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={growthData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} width={130}/>
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.color}}>Count: <b>{payload[0]?.value}</b></p></div>;
                }}/>
                <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                  {growthData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="v2-charts-row">
          {/* Tutor verification status — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>👨‍🏫 Tutor Verification Status</h3><span className="v2-badge">Live</span></div>
            {tutorStatusDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={tutorStatusDist} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                      {tutorStatusDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} tutors</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {tutorStatusDist.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>👨‍🏫</span><p>No tutor data yet</p></div>}
          </div>

          {/* Resource status — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📚 Resource Status</h3><span className="v2-badge">Live</span></div>
            {resourceDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={resourceDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)"/>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }}/>
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.fill}}>Count: <b>{payload[0]?.value}</b></p></div>;
                  }}/>
                  <Bar dataKey="value" name="Count" radius={[6,6,0,0]}>
                    {resourceDist.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="v2-empty"><span>📚</span><p>No resource data</p></div>}
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="v2-charts-row">
          {/* Account status dist — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🔐 Account Status Distribution</h3><span className="v2-badge">Live</span></div>
            {accountStatusDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={accountStatusDist} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                      {accountStatusDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} users</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {accountStatusDist.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>🔐</span><p>No account status data</p></div>}
          </div>

          {/* Open requests status — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🤝 Open Help Requests</h3><span className="v2-badge">Live</span></div>
            {requestStatusDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={requestStatusDist} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                      {requestStatusDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} requests</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {requestStatusDist.map((d, i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="v2-empty"><span>🤝</span><p>No open requests right now</p></div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="v2-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
          <strong style={{ color: '#1e2547', marginRight: '0.5rem' }}>Quick Actions:</strong>
          {[
            { label: '📋 Pending Tutors', path: '/admin/tutors', accent: '#f59e0b' },
            { label: '📚 Pending Resources', path: '/admin/resources/pending', accent: '#6366f1' },
            { label: '🚩 Reports', path: '/admin/resources/reported', accent: '#ef4444' },
            { label: '👥 Manage Users', path: '/admin/users', accent: '#8b5cf6' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} className="v2-cta-btn" style={{ background: a.accent }}>{a.label}</button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
