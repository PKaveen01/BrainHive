import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../components/common/StudentSidebar';
import { getMyGroups, createGroup, joinGroup } from '../../services/collaboration.service';
import './Collaboration.css';

const GOALS = ['EXAM', 'ASSIGNMENT', 'PROJECT', 'GENERAL'];

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [form, setForm] = useState({ name: '', description: '', subject: '', goal: 'EXAM', maxMembers: 20 });
  const [error, setError] = useState('');

  useEffect(() => { loadGroups(); }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await getMyGroups();
      setGroups(res.data);
    } catch (e) {
      if (e.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createGroup(form);
      setShowCreate(false);
      setForm({ name: '', description: '', subject: '', goal: 'EXAM', maxMembers: 20 });
      loadGroups();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await joinGroup(inviteCode.trim().toUpperCase());
      setShowJoin(false);
      setInviteCode('');
      loadGroups();
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid invite code');
    }
  };

  const goalColor = { EXAM: '#e74c3c', ASSIGNMENT: '#f39c12', PROJECT: '#3498db', GENERAL: '#2ecc71' };

  return (
    <div className="collab-layout">
      <StudentSidebar />
      <div className="collab-main">
        <div className="collab-header">
          <div>
            <h1>Study Groups</h1>
            <p>Collaborate, discuss, and achieve goals together</p>
          </div>
          <div className="collab-header-actions">
            <button className="btn-secondary" onClick={() => { setShowJoin(true); setError(''); }}>
              🔗 Join Group
            </button>
            <button className="btn-primary" onClick={() => { setShowCreate(true); setError(''); }}>
              + Create Group
            </button>
          </div>
        </div>

        {loading ? (
          <div className="collab-loading">Loading your groups...</div>
        ) : groups.length === 0 ? (
          <div className="collab-empty">
            <div className="collab-empty-icon">👥</div>
            <h3>No groups yet</h3>
            <p>Create a study group or join one with an invite code</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Group</button>
              <button className="btn-secondary" onClick={() => setShowJoin(true)}>Join with Code</button>
            </div>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map(g => (
              <div key={g.id} className="group-card" onClick={() => navigate(`/collaboration/groups/${g.id}`)}>
                <div className="group-card-header">
                  <span className="group-goal-badge" style={{ background: goalColor[g.goal] || '#888' }}>
                    {g.goal}
                  </span>
                  <span className="group-members-count">👥 {g.currentMembers}/{g.maxMembers}</span>
                </div>
                <h3 className="group-card-name">{g.name}</h3>
                <p className="group-card-subject">📚 {g.subject}</p>
                <p className="group-card-desc">{g.description || 'No description'}</p>
                <div className="group-card-footer">
                  <span className="group-role-badge" style={{ background: g.currentUserRole === 'ADMIN' ? '#6c5ce7' : '#636e72' }}>
                    {g.currentUserRole}
                  </span>
                  <span className="group-created">by {g.createdByName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Study Group</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            {error && <div className="modal-error">{error}</div>}
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Group Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CS301 Exam Prep" />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Data Structures" />
              </div>
              <div className="form-group">
                <label>Goal</label>
                <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                  {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this group about?" rows={3} />
              </div>
              <div className="form-group">
                <label>Max Members</label>
                <input type="number" min={2} max={50} value={form.maxMembers}
                  onChange={e => setForm({ ...form, maxMembers: parseInt(e.target.value) })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join a Group</h2>
              <button className="modal-close" onClick={() => setShowJoin(false)}>✕</button>
            </div>
            {error && <div className="modal-error">{error}</div>}
            <form onSubmit={handleJoin} className="modal-form">
              <div className="form-group">
                <label>Invite Code *</label>
                <input required value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                  placeholder="Enter 8-character invite code" style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Join Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
