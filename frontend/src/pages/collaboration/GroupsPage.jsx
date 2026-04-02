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
  const goalIcon = { EXAM: '🎯', ASSIGNMENT: '📝', PROJECT: '🚀', GENERAL: '💬' };

  return (
    <div className="dashboard">
      <StudentSidebar />
      <div className="main-content">
        <div className="cg-page-header">
          <div>
            <h1>👥 Study Groups</h1>
            <p className="cg-page-subtitle">Collaborate, discuss, and achieve goals together</p>
          </div>
          <div className="cg-header-actions">
            <button className="cg-btn-secondary" onClick={() => { setShowJoin(true); setError(''); }}>
              🔗 Join Group
            </button>
            <button className="cg-btn-primary" onClick={() => { setShowCreate(true); setError(''); }}>
              + Create Group
            </button>
          </div>
        </div>

        {loading ? (
          <div className="cg-loading-state">
            <div className="cg-spinner"></div>
            <p>Loading your groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="cg-empty-state">
            <div className="cg-empty-icon">👥</div>
            <h3>No groups yet</h3>
            <p>Create a study group or join one with an invite code</p>
            <div className="cg-empty-actions">
              <button className="cg-btn-primary" onClick={() => setShowCreate(true)}>Create Group</button>
              <button className="cg-btn-secondary" onClick={() => setShowJoin(true)}>Join with Code</button>
            </div>
          </div>
        ) : (
          <div className="cg-groups-grid">
            {groups.map((g, idx) => (
              <div 
                key={g.id} 
                className="cg-group-card" 
                onClick={() => navigate(`/collaboration/groups/${g.id}`)}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="cg-card-header">
                  <span className="cg-goal-badge" style={{ background: goalColor[g.goal] || '#888' }}>
                    {goalIcon[g.goal]} {g.goal}
                  </span>
                  <span className="cg-members-count">👥 {g.currentMembers}/{g.maxMembers}</span>
                </div>
                <h3 className="cg-group-name">{g.name}</h3>
                <p className="cg-group-subject">📚 {g.subject}</p>
                {g.description && <p className="cg-group-desc">{g.description}</p>}
                <div className="cg-card-footer">
                  <span className="cg-role-badge" style={{ background: g.currentUserRole === 'ADMIN' ? '#8b5cf6' : '#64748b' }}>
                    {g.currentUserRole === 'ADMIN' ? '👑 Admin' : '👤 Member'}
                  </span>
                  <span className="cg-created-by">by {g.createdByName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="cg-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="cg-modal" onClick={e => e.stopPropagation()}>
            <div className="cg-modal-header">
              <h2>Create Study Group</h2>
              <button className="cg-modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            {error && <div className="cg-modal-error">{error}</div>}
            <form onSubmit={handleCreate} className="cg-modal-form">
              <div className="cg-form-group">
                <label>Group Name *</label>
                <input 
                  required 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CS301 Exam Prep" 
                  className="cg-form-input"
                />
              </div>
              <div className="cg-form-group">
                <label>Subject *</label>
                <input 
                  required 
                  value={form.subject} 
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Data Structures" 
                  className="cg-form-input"
                />
              </div>
              <div className="cg-form-group">
                <label>Goal</label>
                <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} className="cg-form-select">
                  {GOALS.map(g => <option key={g} value={g}>{goalIcon[g]} {g}</option>)}
                </select>
              </div>
              <div className="cg-form-group">
                <label>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this group about?" 
                  rows={3} 
                  className="cg-form-textarea"
                />
              </div>
              <div className="cg-form-group">
                <label>Max Members</label>
                <input 
                  type="number" 
                  min={2} 
                  max={50} 
                  value={form.maxMembers}
                  onChange={e => setForm({ ...form, maxMembers: parseInt(e.target.value) })} 
                  className="cg-form-input"
                />
              </div>
              <div className="cg-modal-actions">
                <button type="button" className="cg-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="cg-btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoin && (
        <div className="cg-modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="cg-modal cg-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cg-modal-header">
              <h2>Join a Group</h2>
              <button className="cg-modal-close" onClick={() => setShowJoin(false)}>✕</button>
            </div>
            {error && <div className="cg-modal-error">{error}</div>}
            <form onSubmit={handleJoin} className="cg-modal-form">
              <div className="cg-form-group">
                <label>Invite Code *</label>
                <input 
                  required 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="Enter 8-character invite code" 
                  className="cg-invite-input"
                />
                <p className="cg-input-hint">Ask the group admin for the invite code</p>
              </div>
              <div className="cg-modal-actions">
                <button type="button" className="cg-btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
                <button type="submit" className="cg-btn-primary">Join Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}