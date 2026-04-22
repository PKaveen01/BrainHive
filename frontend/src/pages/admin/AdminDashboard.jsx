import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import '../user/DashboardV2.css';
import api from '../../services/api';

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

/* ── KPI stat card with SVG icon ─────────────────────────── */
const KpiCard = ({ icon, label, value, onClick }) => (
  <div className="v2-stat-card" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
    <div className="v2-stat-icon">{icon}</div>
    <div className="v2-stat-body">
      <div className="v2-stat-value">{value}</div>
      <div className="v2-stat-label">{label}</div>
    </div>
  </div>
);

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

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/peerhelp/requests/available'),
      api.get('/admin/dashboard-stats'),
    ]).then(([statsRes, usersRes, reqRes]) => {
      if (statsRes.status === 'fulfilled' && statsRes.value.data) setStats(prev => ({ ...prev, ...statsRes.value.data }));
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.data || []);
    }).catch(() => {});
  }, []);

  /* ── Chart data — all REAL ───────────────────────────────── */
  const userRoleDist = [
    { name: 'Students', value: stats.totalStudents, color: '#4f46e5' },
    { name: 'Tutors',   value: stats.totalTutors,   color: '#06b6d4' },
  ].filter(d => d.value > 0);

  const tutorStatusDist = [
    { name: 'Approved', value: stats.approvedTutors, color: '#10b981' },
    { name: 'Pending',  value: stats.pendingTutors,  color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const resourceDist = [
    { name: 'Active',  value: stats.activeResources,  color: '#4f46e5' },
    { name: 'Pending', value: stats.pendingResources,  color: '#f59e0b' },
    { name: 'Flagged', value: stats.flaggedResources,  color: '#ef4444' },
  ].filter(d => d.value > 0);

  const platformMetrics = [
    { label: 'Students',       value: stats.totalStudents   },
    { label: 'Tutors',         value: stats.totalTutors     },
    { label: 'Resources',      value: stats.totalResources  },
    { label: 'Open Reports',   value: stats.pendingReports  },
    { label: 'Active Groups',  value: stats.activeGroups || 0 },
  ];

  const accountStatusDist = (() => {
    if (!users.length) return [];
    const counts = {};
    users.forEach(u => { const s = u.accountStatus || 'ACTIVE'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  const requestStatusDist = (() => {
    if (!requests.length) return [];
    const counts = {};
    requests.forEach(r => { const s = r.status || 'UNKNOWN'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  })();

  /* ── Reusable donut chart ─────────────────────────────────── */
  const DonutChart = ({ data, emptyIcon, emptyMsg }) => (
    data.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
              {data.map((e, i) => <Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="v2-tooltip">
                  <p style={{ color: payload[0]?.payload.color }}><b>{payload[0]?.name}</b></p>
                  <p>Count: <b>{payload[0]?.value}</b></p>
                </div>
              );
            }}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="v2-legend">
          {data.map((d, i) => (
            <div key={i} className="v2-legend-item">
              <span className="v2-legend-dot" style={{ background: d.color }}></span>
              <span>{d.name}</span>
              <span className="v2-legend-val">{d.value}</span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="v2-empty">
        {emptyIcon}
        <p>{emptyMsg}</p>
      </div>
    )
  );

  return (
    <AdminLayout pageTitle="Overview">
      <div>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="v2-hero" style={{ marginBottom: '1.75rem' }}>
          <div className="v2-hero-text">
            <div className="v2-hero-greeting">Admin Control Panel</div>
            <h1 className="v2-hero-name">
              BrainHive Overview{' '}
              <svg style={{ width: 28, height: 28, verticalAlign: 'middle', marginBottom: 4 }} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </h1>
            <p className="v2-hero-program">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', color: 'white', alignItems: 'center' }}>
            {[
              { label: 'Total Users', val: stats.totalUsers },
              { label: 'Resources',   val: stats.totalResources },
              { label: 'Open Reports', val: stats.pendingReports },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '0.25rem' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI stat row ─────────────────────────────────────── */}
        <div className="v2-stats-row" style={{ marginBottom: '1.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <KpiCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            label="Total Users" value={stats.totalUsers} onClick={() => navigate('/admin/users')}
          />
          <KpiCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            label="Students" value={stats.totalStudents} onClick={() => navigate('/admin/users')}
          />
          <KpiCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3L2 8l10 5 10-5-10-5z"/><path d="M6 11v6s2 3 6 3 6-3 6-3v-6"/></svg>}
            label="Approved Tutors" value={stats.approvedTutors} onClick={() => navigate('/admin/tutors')}
          />
          <KpiCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
            label="Pending Tutors" value={stats.pendingTutors} onClick={() => navigate('/admin/tutors')}
          />
          <KpiCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            label="Total Resources" value={stats.totalResources} onClick={() => navigate('/admin/resources/active')}
          />
          <KpiCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            label="Open Reports" value={stats.pendingReports} onClick={() => navigate('/admin/resources/reported')}
          />
        </div>

        {/* ── Charts row 1 ─────────────────────────────────────── */}
        <div className="v2-charts-row">
          <div className="v2-card">
            <div className="v2-card-head">
              <h3>
                <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                USER DISTRIBUTION
              </h3>
              <span className="v2-badge">Live Data</span>
            </div>
            <DonutChart data={userRoleDist}
              emptyIcon={<svg style={{ width: 32, height: 32, opacity: 0.3, margin: '0 auto 0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
              emptyMsg="No user data available"
            />
          </div>

          <div className="v2-card">
            <div className="v2-card-head">
              <h3>
                <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 20V14M8 20V10M12 20V4M16 20V10M20 20V14"/>
                </svg>
                PLATFORM METRICS
              </h3>
              <span className="v2-badge">Live Data</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platformMetrics} layout="vertical" margin={{ left: 20, right: 30 }}>
                <defs>
                  <linearGradient id="adminBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} width={120}/>
                <Tooltip content={<V2Tooltip />}/>
                <Bar dataKey="value" name="Count" fill="url(#adminBarGrad)" radius={[0, 6, 6, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Charts row 2 ─────────────────────────────────────── */}
        <div className="v2-charts-row">
          <div className="v2-card">
            <div className="v2-card-head">
              <h3>
                <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3L2 8l10 5 10-5-10-5z"/><path d="M6 11v6s2 3 6 3 6-3 6-3v-6"/>
                </svg>
                TUTOR VERIFICATION STATUS
              </h3>
              <span className="v2-badge">Live</span>
            </div>
            <DonutChart data={tutorStatusDist}
              emptyIcon={<svg style={{ width: 32, height: 32, opacity: 0.3, margin: '0 auto 0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3L2 8l10 5 10-5-10-5z"/></svg>}
              emptyMsg="No tutor data yet"
            />
          </div>

          <div className="v2-card">
            <div className="v2-card-head">
              <h3>
                <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                RESOURCE STATUS
              </h3>
              <span className="v2-badge">Live</span>
            </div>
            {resourceDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={resourceDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="resourceBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                  <Tooltip content={<V2Tooltip />}/>
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {resourceDist.map((d, i) => <Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="v2-empty">
                <svg style={{ width: 32, height: 32, opacity: 0.3, margin: '0 auto 0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                <p>No resource data</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Charts row 3 ─────────────────────────────────────── */}
        <div className="v2-charts-row">
          <div className="v2-card">
            <div className="v2-card-head">
              <h3>
                <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                ACCOUNT STATUS DISTRIBUTION
              </h3>
              <span className="v2-badge">Live</span>
            </div>
            <DonutChart data={accountStatusDist}
              emptyIcon={<svg style={{ width: 32, height: 32, opacity: 0.3, margin: '0 auto 0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              emptyMsg="No account status data"
            />
          </div>

          <div className="v2-card">
            <div className="v2-card-head">
              <h3>
                <svg style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                OPEN HELP REQUESTS
              </h3>
              <span className="v2-badge">Live</span>
            </div>
            <DonutChart data={requestStatusDist}
              emptyIcon={<svg style={{ width: 32, height: 32, opacity: 0.3, margin: '0 auto 0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
              emptyMsg="No open requests right now"
            />
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────── */}
        <div className="v2-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
          <strong style={{ color: '#111827', marginRight: '0.5rem', fontSize: '0.85rem' }}>Quick Actions:</strong>
          {[
            { label: 'Pending Tutors',    path: '/admin/tutors',              icon: <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
            { label: 'Pending Resources', path: '/admin/resources/pending',   icon: <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
            { label: 'Reports',           path: '/admin/resources/reported',  icon: <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
            { label: 'Manage Users',      path: '/admin/users',               icon: <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} className="v2-cta-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
