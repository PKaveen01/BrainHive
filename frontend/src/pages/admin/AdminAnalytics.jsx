import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import '../user/DashboardV2.css';
import api from '../../services/api';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444','#f97316','#ec4899'];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0, totalStudents: 0, totalTutors: 0, approvedTutors: 0,
    pendingTutors: 0, totalResources: 0, activeResources: 0,
    pendingResources: 0, flaggedResources: 0, pendingReports: 0, activeGroups: 0,
  });
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/peerhelp/requests/available'),
      api.get('/admin/tutors'),
    ]).then(([statsRes, usersRes, reqRes, tutorsRes]) => {
      if (statsRes.status === 'fulfilled' && statsRes.value.data) setStats(prev => ({ ...prev, ...statsRes.value.data }));
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.data || []);
      if (tutorsRes.status === 'fulfilled') setTutors(tutorsRes.value.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── User role distribution — REAL ──────────────────────────────────────────
  const userRoleDist = [
    { name: 'Students', value: stats.totalStudents, color: '#6366f1' },
    { name: 'Tutors', value: stats.totalTutors, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // ── Account status from real users list ────────────────────────────────────
  const accountStatusDist = (() => {
    if (!users.length) return [];
    const counts = {};
    users.forEach(u => { const s = u.accountStatus || 'ACTIVE'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // ── Resource breakdown — REAL ─────────────────────────────────────────────
  const resourceBreakdown = [
    { name: 'Active', value: stats.activeResources, color: '#10b981' },
    { name: 'Pending', value: stats.pendingResources, color: '#f59e0b' },
    { name: 'Flagged', value: stats.flaggedResources, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // ── Tutor verification status — REAL ──────────────────────────────────────
  const tutorVerificationDist = [
    { name: 'Approved', value: stats.approvedTutors, color: '#10b981' },
    { name: 'Pending', value: stats.pendingTutors, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // ── Help request status — REAL ────────────────────────────────────────────
  const requestStatusDist = (() => {
    if (!requests.length) return [];
    const counts = {};
    requests.forEach(r => { const s = r.status || 'UNKNOWN'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // ── Tutor proficiency levels — REAL ───────────────────────────────────────
  const tutorProficiencyDist = (() => {
    if (!tutors.length) return [];
    const counts = {};
    tutors.forEach(t => {
      const p = t.proficiencyLevel || t.tutorProfile?.proficiencyLevel || 'UNKNOWN';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  // ── Platform overview bar — REAL ──────────────────────────────────────────
  const platformOverview = [
    { label: 'Students', value: stats.totalStudents, fill: '#6366f1' },
    { label: 'Tutors', value: stats.totalTutors, fill: '#8b5cf6' },
    { label: 'Resources', value: stats.totalResources, fill: '#06b6d4' },
    { label: 'Active Groups', value: stats.activeGroups || 0, fill: '#10b981' },
    { label: 'Pending Reports', value: stats.pendingReports, fill: '#ef4444' },
  ];

  // ── Radial performance metrics — computed from REAL data ──────────────────
  const radialData = [
    {
      name: 'Tutor Approval Rate',
      value: stats.totalTutors > 0 ? Math.round((stats.approvedTutors / stats.totalTutors) * 100) : 0,
      fill: '#6366f1',
    },
    {
      name: 'Resource Approval Rate',
      value: stats.totalResources > 0 ? Math.round((stats.activeResources / stats.totalResources) * 100) : 0,
      fill: '#8b5cf6',
    },
    {
      name: 'Active User Rate',
      value: stats.totalUsers > 0 ? Math.round(((stats.totalUsers - (users.filter(u => u.accountStatus === 'TERMINATED').length)) / stats.totalUsers) * 100) : 0,
      fill: '#10b981',
    },
    {
      name: 'Report Resolution Rate',
      value: stats.pendingReports === 0 && stats.totalResources > 0 ? 100 : stats.totalResources > 0 ? Math.max(0, Math.round((1 - stats.pendingReports / Math.max(stats.totalResources, 1)) * 100)) : 0,
      fill: '#06b6d4',
    },
  ];

  return (
    <AdminLayout pageTitle="Analytics">
      <div style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: '#1e2547' }}>

        {/* Hero */}
        <div className="v2-hero" style={{ marginBottom: '1.75rem', borderRadius: '16px' }}>
          <div className="v2-hero-text">
            <div className="v2-hero-greeting">Platform Analytics</div>
            <h1 className="v2-hero-name">Real-Time Insights 📊</h1>
            <p className="v2-hero-program">All data sourced directly from the BrainHive database</p>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', color: 'white', alignItems: 'center' }}>
            {[
              { label: 'Total Users', val: stats.totalUsers },
              { label: 'Total Resources', val: stats.totalResources },
              { label: 'Active Groups', val: stats.activeGroups || 0 },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '0.25rem' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="v2-kpi-grid" style={{ marginBottom: '1.75rem' }}>
          {[
            { label: 'Tutor Approval Rate', val: stats.totalTutors > 0 ? `${Math.round((stats.approvedTutors/stats.totalTutors)*100)}%` : '—', accent: '#10b981' },
            { label: 'Resource Active Rate', val: stats.totalResources > 0 ? `${Math.round((stats.activeResources/stats.totalResources)*100)}%` : '—', accent: '#6366f1' },
            { label: 'Pending Actions', val: stats.pendingTutors + stats.pendingResources + stats.pendingReports, accent: '#f59e0b' },
            { label: 'Platform Health', val: radialData[2]?.value != null ? `${radialData[2].value}%` : '—', accent: '#06b6d4' },
          ].map((k, i) => (
            <div key={i} className="v2-kpi-card" style={{ '--accent': k.accent }}>
              <div className="v2-kpi-val" style={{ color: k.accent }}>{k.val}</div>
              <div className="v2-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Row 1 */}
        <div className="v2-charts-row">
          {/* Platform overview — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📊 Platform Overview</h3><span className="v2-badge">Live Data</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platformOverview} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} width={120}/>
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.fill}}>Count: <b>{payload[0]?.value}</b></p></div>;
                }}/>
                <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                  {platformOverview.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance metrics radial — computed from REAL data */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🎯 Performance Rates</h3><span className="v2-badge">Computed</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={10} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} background clockWise dataKey="value"/>
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '0.75rem' }}/>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return <div className="v2-tooltip"><p style={{color:payload[0]?.payload?.fill}}><b>{payload[0]?.payload?.name}</b></p><p>Rate: <b>{payload[0]?.value}%</b></p></div>;
                }}/>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 */}
        <div className="v2-charts-row">
          {/* User distribution — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>👥 User Role Distribution</h3><span className="v2-badge">Live</span></div>
            {userRoleDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={userRoleDist} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                      {userRoleDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const total = userRoleDist.reduce((s,d)=>s+d.value,0);
                      const pct = total > 0 ? ((payload[0]?.value/total)*100).toFixed(0) : 0;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>Count: <b>{payload[0]?.value}</b></p><p style={{color:'#94a3b8'}}>Share: <b>{pct}%</b></p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {userRoleDist.map((d,i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>👥</span><p>No user data</p></div>}
          </div>

          {/* Account status — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🔐 Account Status</h3><span className="v2-badge">Live</span></div>
            {accountStatusDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={accountStatusDist} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                      {accountStatusDist.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} users</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {accountStatusDist.map((d,i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>🔐</span><p>No account data</p></div>}
          </div>
        </div>

        {/* Row 3 */}
        <div className="v2-charts-row">
          {/* Resource breakdown — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>📚 Resource Health</h3><span className="v2-badge">Live</span></div>
            {resourceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={resourceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)"/>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }}/>
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const total = resourceBreakdown.reduce((s,d)=>s+d.value,0);
                    const pct = total > 0 ? ((payload[0]?.value/total)*100).toFixed(0) : 0;
                    return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.color}}>Count: <b>{payload[0]?.value}</b></p><p style={{color:'#94a3b8'}}>Share: <b>{pct}%</b></p></div>;
                  }}/>
                  <Bar dataKey="value" name="Resources" radius={[6,6,0,0]}>
                    {resourceBreakdown.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="v2-empty"><span>📚</span><p>No resource data</p></div>}
          </div>

          {/* Tutor verification — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>👨‍🏫 Tutor Verification</h3><span className="v2-badge">Live</span></div>
            {tutorVerificationDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={tutorVerificationDist} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                      {tutorVerificationDist.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const total = tutorVerificationDist.reduce((s,d)=>s+d.value,0);
                      const pct = total > 0 ? ((payload[0]?.value/total)*100).toFixed(0) : 0;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} tutors <span style={{color:'#94a3b8'}}>({pct}%)</span></p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {tutorVerificationDist.map((d,i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>👨‍🏫</span><p>No tutor verification data</p></div>}
          </div>
        </div>

        {/* Row 4: help requests + tutor proficiency */}
        <div className="v2-charts-row">
          {/* Help request status — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🤝 Help Request Status</h3><span className="v2-badge">Live</span></div>
            {requestStatusDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={requestStatusDist} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                      {requestStatusDist.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="v2-tooltip"><p style={{color:payload[0]?.payload.color}}><b>{payload[0]?.name}</b></p><p>{payload[0]?.value} requests</p></div>;
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="v2-legend">
                  {requestStatusDist.map((d,i) => (
                    <div key={i} className="v2-legend-item"><span className="v2-legend-dot" style={{background:d.color}}></span><span>{d.name}</span><span className="v2-legend-val">{d.value}</span></div>
                  ))}
                </div>
              </>
            ) : <div className="v2-empty"><span>🤝</span><p>No open help requests right now</p></div>}
          </div>

          {/* Tutor proficiency — REAL */}
          <div className="v2-chart-card">
            <div className="v2-card-head"><h3>🏅 Tutor Proficiency Levels</h3><span className="v2-badge">Live</span></div>
            {tutorProficiencyDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={tutorProficiencyDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)"/>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return <div className="v2-tooltip"><p className="v2-tooltip-label">{label}</p><p style={{color:payload[0]?.payload?.color}}>Count: <b>{payload[0]?.value}</b></p></div>;
                  }}/>
                  <Bar dataKey="value" name="Tutors" radius={[6,6,0,0]}>
                    {tutorProficiencyDist.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="v2-empty"><span>🏅</span><p>No proficiency data yet</p></div>}
          </div>
        </div>

        {/* Summary table */}
        <div className="v2-card" style={{ padding: '1.5rem' }}>
          <div className="v2-card-head"><h3>📋 Full Platform Summary</h3><span className="v2-badge">Live Data</span></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e9f5' }}>
                {['Category', 'Total', 'Active / Approved', 'Pending / Other', 'Status'].map((h,i) => (
                  <th key={i} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { cat: '👤 Users', total: stats.totalUsers, active: stats.totalStudents + stats.approvedTutors, pending: stats.pendingTutors, status: 'normal' },
                { cat: '👨‍🏫 Tutors', total: stats.totalTutors, active: stats.approvedTutors, pending: stats.pendingTutors, status: stats.pendingTutors > 0 ? 'warn' : 'good' },
                { cat: '📚 Resources', total: stats.totalResources, active: stats.activeResources, pending: stats.pendingResources + stats.flaggedResources, status: stats.flaggedResources > 0 ? 'warn' : 'good' },
                { cat: '🚩 Reports', total: stats.pendingReports, active: 0, pending: stats.pendingReports, status: stats.pendingReports > 0 ? 'bad' : 'good' },
                { cat: '👥 Groups', total: stats.activeGroups || 0, active: stats.activeGroups || 0, pending: 0, status: 'normal' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 600 }}>{row.cat}</td>
                  <td style={{ padding: '0.7rem 0.75rem', color: '#6366f1', fontWeight: 700 }}>{row.total}</td>
                  <td style={{ padding: '0.7rem 0.75rem', color: '#10b981', fontWeight: 600 }}>{row.active}</td>
                  <td style={{ padding: '0.7rem 0.75rem', color: row.pending > 0 ? '#f59e0b' : '#94a3b8', fontWeight: row.pending > 0 ? 600 : 400 }}>{row.pending}</td>
                  <td style={{ padding: '0.7rem 0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
                      background: row.status === 'good' ? '#d1fae5' : row.status === 'warn' ? '#fef9c3' : row.status === 'bad' ? '#fee2e2' : '#e0e7ff',
                      color: row.status === 'good' ? '#065f46' : row.status === 'warn' ? '#854d0e' : row.status === 'bad' ? '#991b1b' : '#3730a3' }}>
                      {row.status === 'good' ? '✓ OK' : row.status === 'warn' ? '⚠ Review' : row.status === 'bad' ? '⚠ Action Needed' : '— Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
