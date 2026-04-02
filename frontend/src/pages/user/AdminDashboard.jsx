import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [pendingTutors, setPendingTutors] = useState([]);
    const [allTutors, setAllTutors] = useState([]);
    const [tutorsLoading, setTutorsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [terminateModal, setTerminateModal] = useState(null);
    const [terminateDays, setTerminateDays] = useState(7);
    const [allResources, setAllResources] = useState([]);
    const [resourceFilter, setResourceFilter] = useState('all');
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [lectures, setLectures] = useState([]);
    const [lecturesLoading, setLecturesLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') { navigate('/login'); return; }
        setUser(currentUser);
        fetchStats();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'tutors') fetchTutors();
        else if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'resources') fetchResources();
        else if (activeTab === 'lectures') fetchLectures();
    }, [activeTab]);

    const showSuccess = (msg) => { setActionMessage(msg); setActionError(''); setTimeout(() => setActionMessage(''), 3500); };
    const showError   = (msg) => { setActionError(msg); setActionMessage(''); setTimeout(() => setActionError(''), 4000); };

    const fetchStats = async () => {
        setStatsLoading(true);
        try { const r = await api.get('/admin/stats'); setStats(r.data); }
        catch (e) { if (e.response?.status === 401) { navigate('/login'); return; } }
        finally { setStatsLoading(false); }
    };
    const fetchTutors = async () => {
        setTutorsLoading(true);
        try {
            const [p, a] = await Promise.all([api.get('/admin/tutors/pending'), api.get('/admin/tutors')]);
            setPendingTutors(p.data || []); setAllTutors(a.data || []);
        } catch(e){console.error(e);} finally { setTutorsLoading(false); }
    };
    const fetchUsers = async () => {
        setUsersLoading(true);
        try { const r = await api.get('/admin/users'); setUsers(r.data || []); }
        catch(e){console.error(e);} finally { setUsersLoading(false); }
    };
    const fetchResources = async () => {
        setResourcesLoading(true);
        try { const r = await api.get('/admin/resources'); setAllResources(r.data || []); }
        catch(e){console.error(e);} finally { setResourcesLoading(false); }
    };
    const fetchLectures = async () => {
        setLecturesLoading(true);
        try { const r = await api.get('/admin/lectures'); setLectures(r.data || []); }
        catch(e){console.error(e);} finally { setLecturesLoading(false); }
    };

    const handleApproveTutor = async (id) => {
        setActionLoading(id);
        try { await api.post(`/admin/tutors/${id}/approve`); showSuccess('Tutor approved!'); fetchTutors(); fetchStats(); }
        catch(e){ showError(e.response?.data?.message || 'Failed to approve.'); }
        setActionLoading(null);
    };
    const handleRejectTutor = async (id) => {
        if (!window.confirm('Reject this tutor application?')) return;
        setActionLoading(id);
        try { await api.post(`/admin/tutors/${id}/reject`); showSuccess('Tutor rejected.'); fetchTutors(); fetchStats(); }
        catch(e){ showError(e.response?.data?.message || 'Failed to reject.'); }
        setActionLoading(null);
    };
    const handleTerminateUser = async () => {
        if (!terminateModal) return;
        const u = terminateModal.user;
        setActionLoading(u.id);
        try {
            await api.post(`/admin/users/${u.id}/terminate`, { durationDays: terminateDays });
            showSuccess(`${u.fullName} terminated for ${terminateDays} day(s).`);
            setTerminateModal(null); fetchUsers(); fetchStats();
        } catch(e){ showError(e.response?.data?.message || 'Failed to terminate.'); }
        setActionLoading(null);
    };
    const handleReactivateUser = async (u) => {
        if (!window.confirm(`Reactivate ${u.fullName}?`)) return;
        setActionLoading(u.id);
        try { await api.post(`/admin/users/${u.id}/reactivate`); showSuccess(`${u.fullName} reactivated.`); fetchUsers(); fetchStats(); }
        catch(e){ showError(e.response?.data?.message || 'Failed to reactivate.'); }
        setActionLoading(null);
    };
    const handleRemoveUser = async (u) => {
        if (!window.confirm(`Permanently remove ${u.fullName}? This cannot be undone.`)) return;
        setActionLoading(u.id);
        try { await api.delete(`/admin/users/${u.id}`); showSuccess(`${u.fullName} removed.`); fetchUsers(); fetchStats(); }
        catch(e){ showError(e.response?.data?.message || 'Failed to remove.'); }
        setActionLoading(null);
    };
    const handleApproveResource = async (id) => {
        setActionLoading(id);
        try { await api.post(`/admin/resources/${id}/approve`); showSuccess('Resource approved.'); fetchResources(); fetchStats(); }
        catch(e){ showError('Failed to approve resource.'); }
        setActionLoading(null);
    };
    const handleRemoveResource = async (id) => {
        if (!window.confirm('Remove this resource?')) return;
        setActionLoading(id);
        try { await api.post(`/admin/resources/${id}/remove`); showSuccess('Resource removed.'); fetchResources(); fetchStats(); }
        catch(e){ showError('Failed to remove resource.'); }
        setActionLoading(null);
    };
    const handleDeleteLecture = async (lec) => {
        if (!window.confirm(`Delete lecture "${lec.title}"?`)) return;
        setActionLoading(lec.id);
        try { await api.delete(`/admin/lectures/${lec.id}`); showSuccess('Lecture deleted.'); fetchLectures(); }
        catch(e){ showError('Failed to delete lecture.'); }
        setActionLoading(null);
    };
    const handleLogout = async () => { await authService.logout(); navigate('/'); };

    const fmt   = (dt) => dt ? new Date(dt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
    const fmtDt = (dt) => dt ? new Date(dt).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
    const statusColor = { PENDING:'#f59e0b', APPROVED:'#10b981', REJECTED:'#ef4444', ACTIVE:'#10b981', TERMINATED:'#ef4444' };

    const filteredResources = resourceFilter === 'all' ? allResources : allResources.filter(r => r.status === resourceFilter);
    const resCounts = allResources.reduce((acc,r) => { acc[r.status]=(acc[r.status]||0)+1; return acc; }, {});

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <div className="sidebar-logo">🧠 BrainHive Admin</div>
                <div className="sidebar-user">
                    <div className="user-avatar">A</div>
                    <div className="user-info"><h4>{user?.name || 'Admin'}</h4><p>Administrator</p></div>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {[['overview','📊 Overview'],['tutors','👨‍🏫 Tutor Management'],['users','👥 Users'],['resources','📚 Resources'],['lectures','🎓 Lectures']].map(([tab,label]) => (
                            <li key={tab} className={activeTab===tab?'active':''} onClick={() => setActiveTab(tab)}>
                                {label}
                                {tab==='tutors' && stats?.pendingTutors>0 && <span className="nav-badge">{stats.pendingTutors}</span>}
                            </li>
                        ))}
                    </ul>
                </nav>
                <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
            </div>

            <div className="admin-main">
                {actionMessage && <div className="action-banner success">✅ {actionMessage}</div>}
                {actionError   && <div className="action-banner error">❌ {actionError}</div>}

                {/* OVERVIEW */}
                {activeTab==='overview' && (
                    <div className="admin-content">
                        <div className="content-header"><h2>Platform Overview</h2><button className="btn-refresh" onClick={fetchStats}>🔄 Refresh</button></div>
                        {statsLoading ? <div className="loading-state"><div className="spinner"></div><p>Loading…</p></div> : stats ? (
                            <>
                                <div className="stats-cards">
                                    {[['blue','👥',stats.totalUsers,'Total Users'],['green','🎓',stats.totalStudents,'Students'],['purple','👨‍🏫',stats.totalTutors,'Tutors'],['orange','⏳',stats.pendingTutors,'Pending Tutors'],['teal','📚',stats.totalResources,'Resources'],['red','🚩',(stats.pendingResources||0)+(stats.flaggedResources||0),'Needs Review']].map(([c,ic,v,l]) => (
                                        <div key={l} className={`stat-card ${c}`}><div className="stat-icon">{ic}</div><div className="stat-val">{v??0}</div><div className="stat-lbl">{l}</div></div>
                                    ))}
                                </div>
                                {stats.pendingTutors>0 && <div className="alert-card"><span>⚠️ <strong>{stats.pendingTutors}</strong> tutor application(s) pending.</span><button className="btn-link" onClick={()=>setActiveTab('tutors')}>Review →</button></div>}
                                {((stats.pendingResources||0)+(stats.flaggedResources||0))>0 && <div className="alert-card warning"><span>📋 <strong>{(stats.pendingResources||0)+(stats.flaggedResources||0)}</strong> resource(s) need moderation.</span><button className="btn-link" onClick={()=>setActiveTab('resources')}>Review →</button></div>}
                            </>
                        ) : <p>Failed to load. <button onClick={fetchStats}>Retry</button></p>}
                    </div>
                )}

                {/* TUTORS */}
                {activeTab==='tutors' && (
                    <div className="admin-content">
                        <div className="content-header"><h2>Tutor Management</h2><button className="btn-refresh" onClick={fetchTutors}>🔄 Refresh</button></div>
                        {tutorsLoading ? <div className="loading-state"><div className="spinner"></div><p>Loading…</p></div> : (
                            <>
                                {pendingTutors.length>0 ? (
                                    <>
                                        <h3 className="section-title">⏳ Pending Applications ({pendingTutors.length})</h3>
                                        <div className="tutor-list">
                                            {pendingTutors.map(t => (
                                                <div key={t.id} className="tutor-card">
                                                    <div className="tutor-card-header">
                                                        <div className="tutor-avatar">{(t.name||'T').charAt(0)}</div>
                                                        <div><h4>{t.name}</h4><p>{t.email}</p></div>
                                                        <span className="status-pill pending">PENDING</span>
                                                    </div>
                                                    <div className="tutor-details">
                                                        {t.qualification && <span>🎓 {t.qualification}</span>}
                                                        {t.yearsOfExperience!=null && <span>📅 {t.yearsOfExperience} yrs</span>}
                                                        {t.subject && <span>📚 {t.subject}</span>}
                                                        <span>🗓 {fmt(t.createdAt)}</span>
                                                    </div>
                                                    {t.bio && <p className="tutor-bio">"{t.bio}"</p>}
                                                    <div className="tutor-actions">
                                                        <button className="btn-approve" onClick={()=>handleApproveTutor(t.id)} disabled={actionLoading===t.id}>{actionLoading===t.id?'…':'✅ Approve'}</button>
                                                        <button className="btn-reject"  onClick={()=>handleRejectTutor(t.id)}  disabled={actionLoading===t.id}>{actionLoading===t.id?'…':'❌ Reject'}</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : <div className="empty-state">✅ No pending tutor applications.</div>}
                                <h3 className="section-title">All Tutors ({allTutors.length})</h3>
                                <div className="data-table"><table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Sessions</th><th>Rating</th><th>Status</th></tr></thead>
                                    <tbody>{allTutors.map(t=>(
                                        <tr key={t.id}>
                                            <td>{t.name}</td><td>{t.email}</td>
                                            <td>{t.subject||t.expertSubjects?.join(', ')||'—'}</td>
                                            <td>{t.totalSessions||0}</td>
                                            <td>{(t.averageRating||0).toFixed(1)} ⭐</td>
                                            <td><span className="status-pill" style={{background:(statusColor[t.verificationStatus]||'#9ca3af')+'22',color:statusColor[t.verificationStatus]||'#9ca3af'}}>{t.verificationStatus}</span></td>
                                        </tr>
                                    ))}</tbody>
                                </table></div>
                            </>
                        )}
                    </div>
                )}

                {/* USERS */}
                {activeTab==='users' && (
                    <div className="admin-content">
                        <div className="content-header"><h2>All Users ({users.length})</h2><button className="btn-refresh" onClick={fetchUsers}>🔄 Refresh</button></div>
                        {usersLoading ? <div className="loading-state"><div className="spinner"></div><p>Loading…</p></div> : (
                            <div className="data-table"><table>
                                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                                <tbody>{users.map((u,i)=>(
                                    <tr key={u.id} className={u.accountStatus==='TERMINATED'?'row-terminated':''}>
                                        <td>{i+1}</td>
                                        <td>{u.fullName}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`role-pill ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                                        <td>
                                            <span className="status-pill" style={{background:(statusColor[u.accountStatus]||'#9ca3af')+'22',color:statusColor[u.accountStatus]||'#9ca3af'}}>{u.accountStatus||'ACTIVE'}</span>
                                            {u.terminatedUntil && <span className="terminated-until"> until {fmt(u.terminatedUntil)}</span>}
                                        </td>
                                        <td>{fmt(u.createdAt)}</td>
                                        <td>
                                            <div className="action-btns">
                                                {u.accountStatus==='TERMINATED'
                                                    ? <button className="btn-sm btn-approve" onClick={()=>handleReactivateUser(u)} disabled={actionLoading===u.id}>{actionLoading===u.id?'…':'✅ Reactivate'}</button>
                                                    : <button className="btn-sm btn-warn"    onClick={()=>{setTerminateModal({user:u});setTerminateDays(7);}} disabled={actionLoading===u.id}>🔒 Terminate</button>
                                                }
                                                <button className="btn-sm btn-reject" onClick={()=>handleRemoveUser(u)} disabled={actionLoading===u.id}>{actionLoading===u.id?'…':'🗑 Remove'}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table></div>
                        )}
                    </div>
                )}

                {/* RESOURCES */}
                {activeTab==='resources' && (
                    <div className="admin-content">
                        <div className="content-header"><h2>Resources Management</h2><button className="btn-refresh" onClick={fetchResources}>🔄 Refresh</button></div>
                        <div className="filter-tabs">
                            {[['all',`All (${allResources.length})`],['pending',`Pending (${resCounts['pending']||0})`],['active',`Active (${resCounts['active']||0})`],['flagged',`Flagged (${resCounts['flagged']||0})`],['removed',`Removed (${resCounts['removed']||0})`]].map(([v,l])=>(
                                <button key={v} className={`filter-tab${resourceFilter===v?' active':''}`} onClick={()=>setResourceFilter(v)}>{l}</button>
                            ))}
                        </div>
                        {resourcesLoading ? <div className="loading-state"><div className="spinner"></div><p>Loading…</p></div>
                        : filteredResources.length===0 ? <div className="empty-state">No resources for this filter.</div>
                        : <div className="resource-mod-list">{filteredResources.map(r=>(
                            <div key={r.id} className="resource-mod-card">
                                <div className="resource-mod-header">
                                    <div>
                                        <h4>{r.title}</h4>
                                        <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                                            <span className="badge-subject">{r.subject}</span>
                                            <span className="badge-type">{r.type}</span>
                                        </div>
                                    </div>
                                    <span className="status-pill" style={{
                                        background:r.status==='flagged'?'#fef2f2':r.status==='active'?'#f0fdf4':r.status==='removed'?'#f3f4f6':'#fffbeb',
                                        color:     r.status==='flagged'?'#dc2626':r.status==='active'?'#16a34a':r.status==='removed'?'#6b7280':'#d97706'
                                    }}>{r.status?.toUpperCase()}</span>
                                </div>
                                <div className="resource-mod-meta">
                                    <span>👤 {r.uploadedBy} ({r.uploadedByEmail})</span>
                                    <span>📅 {fmt(r.uploadedAt)}</span>
                                    {r.moderationNotes && <span>📝 {r.moderationNotes}</span>}
                                </div>
                                {r.status!=='removed' && (
                                    <div className="resource-actions">
                                        {r.status!=='active' && <button className="btn-approve" onClick={()=>handleApproveResource(r.id)} disabled={actionLoading===r.id}>{actionLoading===r.id?'…':'✅ Approve'}</button>}
                                        <button className="btn-reject" onClick={()=>handleRemoveResource(r.id)} disabled={actionLoading===r.id}>{actionLoading===r.id?'…':'🗑 Remove'}</button>
                                    </div>
                                )}
                            </div>
                        ))}</div>}
                    </div>
                )}

                {/* LECTURES */}
                {activeTab==='lectures' && (
                    <div className="admin-content">
                        <div className="content-header"><h2>All Lectures ({lectures.length})</h2><button className="btn-refresh" onClick={fetchLectures}>🔄 Refresh</button></div>
                        {lecturesLoading ? <div className="loading-state"><div className="spinner"></div><p>Loading…</p></div>
                        : lectures.length===0 ? <div className="empty-state">No lectures scheduled yet.</div>
                        : <div className="data-table"><table>
                            <thead><tr><th>Title</th><th>Subject</th><th>Tutor</th><th>Scheduled At</th><th>Duration</th><th>Meeting Link</th><th>Actions</th></tr></thead>
                            <tbody>{lectures.map(lec=>(
                                <tr key={lec.id}>
                                    <td><strong>{lec.title}</strong></td>
                                    <td>{lec.subjectName}</td>
                                    <td>{lec.tutorName}</td>
                                    <td>{fmtDt(lec.scheduledAt)}</td>
                                    <td>{lec.durationMinutes} min</td>
                                    <td>{lec.meetingLink ? <a href={lec.meetingLink} target="_blank" rel="noreferrer" className="meeting-link">🔗 Join</a> : <span className="text-muted">—</span>}</td>
                                    <td><button className="btn-sm btn-reject" onClick={()=>handleDeleteLecture(lec)} disabled={actionLoading===lec.id}>{actionLoading===lec.id?'…':'🗑 Delete'}</button></td>
                                </tr>
                            ))}</tbody>
                        </table></div>}
                    </div>
                )}
            </div>

            {/* TERMINATE MODAL */}
            {terminateModal && (
                <div className="modal-overlay" onClick={()=>setTerminateModal(null)}>
                    <div className="modal-box" onClick={e=>e.stopPropagation()}>
                        <h3>🔒 Terminate User</h3>
                        <p>Terminate <strong>{terminateModal.user.fullName}</strong>?</p>
                        <div className="modal-field">
                            <label>Duration</label>
                            <select value={terminateDays} onChange={e=>setTerminateDays(Number(e.target.value))}>
                                {[1,3,7,14,30,90,365].map(d=><option key={d} value={d}>{d===365?'1 year':`${d} day${d>1?'s':''}`}</option>)}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-approve" onClick={handleTerminateUser} disabled={actionLoading===terminateModal.user.id}>{actionLoading===terminateModal.user.id?'…':'Confirm Terminate'}</button>
                            <button className="btn-outline" onClick={()=>setTerminateModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
