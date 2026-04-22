import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentSidebar from '../../components/common/StudentSidebar';
import {
  getGroupById, leaveGroup, removeMember,
  sendMessage, getMessages,
  createTask, updateTaskStatus, getGroupTasks,
  createEvent, getGroupEvents
} from '../../services/collaboration.service';
import './Collaboration.css';

const TABS = ['Chat', 'Tasks', 'Events', 'Members'];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('Chat');
  const [loading, setLoading] = useState(true);

  // Chat
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedToUserId: '', dueDate: '' });

  // Events
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventTime: '', location: '' });

  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get userId from session check
    fetch('http://localhost:8080/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.userId) setCurrentUserId(d.userId); })
      .catch(() => {});
    loadAll();
  }, [groupId]);

  useEffect(() => {
    if (activeTab === 'Chat') {
      pollRef.current = setInterval(loadMessages, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, groupId]);

  useEffect(() => {
    if (activeTab === 'Chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [gRes, mRes, tRes, eRes] = await Promise.all([
        getGroupById(groupId),
        getMessages(groupId),
        getGroupTasks(groupId),
        getGroupEvents(groupId),
      ]);
      setGroup(gRes.data);
      setMessages(mRes.data);
      setTasks(tRes.data);
      setEvents(eRes.data);
    } catch (e) {
      if (e.response?.status === 401) navigate('/login');
      else setError('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      const res = await getMessages(groupId);
      setMessages(res.data);
    } catch {}
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSendingMsg(true);
    try {
      await sendMessage(groupId, newMsg.trim());
      setNewMsg('');
      await loadMessages();
    } catch (e) {
      setError('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...taskForm,
        assignedToUserId: taskForm.assignedToUserId ? parseInt(taskForm.assignedToUserId) : null,
        dueDate: taskForm.dueDate || null,
      };
      await createTask(groupId, payload);
      setShowTaskForm(false);
      setTaskForm({ title: '', description: '', assignedToUserId: '', dueDate: '' });
      const res = await getGroupTasks(groupId);
      setTasks(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskStatus = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      const res = await getGroupTasks(groupId);
      setTasks(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update task');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEvent(groupId, { ...eventForm, eventTime: eventForm.eventTime + ':00' });
      setShowEventForm(false);
      setEventForm({ title: '', description: '', eventTime: '', location: '' });
      const res = await getGroupEvents(groupId);
      setEvents(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create event');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await leaveGroup(groupId);
      navigate('/collaboration/groups');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await removeMember(groupId, memberId);
      const res = await getGroupById(groupId);
      setGroup(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove member');
    }
  };

  const taskStatusNext = { 'TODO': 'IN_PROGRESS', 'IN_PROGRESS': 'DONE', 'DONE': 'TODO' };
  const taskStatusLabel = { 'TODO': '📋 To Do', 'IN_PROGRESS': '⚡ In Progress', 'DONE': '✅ Done' };
  const taskStatusColor = { 'TODO': '#636e72', 'IN_PROGRESS': '#f39c12', 'DONE': '#27ae60' };

  if (loading) return (
    <div className="collab-layout">
      <StudentSidebar />
      <div className="collab-main"><div className="collab-loading">Loading group...</div></div>
    </div>
  );

  if (!group) return (
    <div className="collab-layout">
      <StudentSidebar />
      <div className="collab-main"><div className="collab-error">Group not found</div></div>
    </div>
  );

  const isAdmin = group.currentUserRole === 'ADMIN';

  return (
    <div className="collab-layout">
      <StudentSidebar />
      <div className="collab-main">
        {/* Group Header */}
        <div className="group-detail-header">
          <div className="group-detail-back" onClick={() => navigate('/collaboration/groups')}>
            ← Back to Groups
          </div>
          <div className="group-detail-info">
            <h1>{group.name}</h1>
            <div className="group-detail-meta">
              <span className="meta-tag">📚 {group.subject}</span>
              <span className="meta-tag">🎯 {group.goal}</span>
              <span className="meta-tag">👥 {group.currentMembers}/{group.maxMembers} members</span>
              {isAdmin && (
                <div className="invite-code-box">
                  🔗 Invite Code: <strong>{group.inviteCode}</strong>
                </div>
              )}
            </div>
          </div>
          <button className="btn-danger-outline" onClick={handleLeave}>Leave Group</button>
        </div>

        {error && <div className="inline-error" onClick={() => setError('')}>{error} ✕</div>}

        {/* Tabs */}
        <div className="collab-tabs">
          {TABS.map(tab => (
            <button key={tab} className={`collab-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'Chat' && '💬 '}
              {tab === 'Tasks' && '📋 '}
              {tab === 'Events' && '📅 '}
              {tab === 'Members' && '👥 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'Chat' && (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">No messages yet. Start the conversation!</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.senderId === currentUserId ? 'own' : ''}`}>
                    {msg.senderId !== currentUserId && (
                      <div className="chat-sender">{msg.senderName}</div>
                    )}
                    <div className="chat-bubble">{msg.content}</div>
                    <div className="chat-time">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                disabled={sendingMsg}
                autoFocus
              />
              <button type="submit" disabled={sendingMsg || !newMsg.trim()} className="btn-primary">
                {sendingMsg ? '...' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'Tasks' && (
          <div className="tab-content">
            <div className="tab-content-header">
              <h2>Group Tasks</h2>
              {isAdmin && (
                <button className="btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
                  {showTaskForm ? 'Cancel' : '+ Add Task'}
                </button>
              )}
            </div>

            {isAdmin && showTaskForm && (
              <form className="inline-form" onSubmit={handleCreateTask}>
                <div className="inline-form-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input required value={taskForm.title}
                      onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Task title" />
                  </div>
                  <div className="form-group">
                    <label>Assign To</label>
                    <select value={taskForm.assignedToUserId}
                      onChange={e => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}>
                      <option value="">Unassigned</option>
                      {group.members?.map(m => (
                        <option key={m.userId} value={m.userId}>{m.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Description</label>
                    <textarea value={taskForm.description} rows={2}
                      onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Optional description" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Create Task</button>
              </form>
            )}

            <div className="tasks-list">
              {tasks.length === 0 ? (
                <div className="tab-empty">No tasks yet. {isAdmin ? 'Add the first task!' : 'Admin will assign tasks.'}</div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-card-left">
                      <button
                        className="task-status-btn"
                        style={{ background: taskStatusColor[task.status] }}
                        onClick={() => handleTaskStatus(task.id, taskStatusNext[task.status])}
                        title="Click to change status"
                      >
                        {taskStatusLabel[task.status]}
                      </button>
                    </div>
                    <div className="task-card-body">
                      <div className="task-title" style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      {task.description && <div className="task-desc">{task.description}</div>}
                      <div className="task-meta">
                        {task.assignedToName && <span>👤 {task.assignedToName}</span>}
                        {task.dueDate && <span>📅 Due: {task.dueDate}</span>}
                        <span>by {task.createdByName}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'Events' && (
          <div className="tab-content">
            <div className="tab-content-header">
              <h2>Scheduled Events</h2>
              {isAdmin && (
                <button className="btn-primary" onClick={() => setShowEventForm(!showEventForm)}>
                  {showEventForm ? 'Cancel' : '+ Add Event'}
                </button>
              )}
            </div>

            {isAdmin && showEventForm && (
              <form className="inline-form" onSubmit={handleCreateEvent}>
                <div className="inline-form-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input required value={eventForm.title}
                      onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="e.g. Study Session" />
                  </div>
                  <div className="form-group">
                    <label>Date & Time *</label>
                    <input required type="datetime-local" value={eventForm.eventTime}
                      onChange={e => setEventForm({ ...eventForm, eventTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input value={eventForm.location}
                      onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g. Library Room 3 / Google Meet" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Description</label>
                    <textarea value={eventForm.description} rows={2}
                      onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="What will you cover?" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Schedule Event</button>
              </form>
            )}

            <div className="events-list">
              {events.length === 0 ? (
                <div className="tab-empty">No events scheduled. {isAdmin ? 'Schedule a study session!' : 'Admin will schedule events.'}</div>
              ) : (
                events.map(ev => {
                  const evDate = new Date(ev.eventTime);
                  const isPast = evDate < new Date();
                  return (
                    <div key={ev.id} className={`event-card ${isPast ? 'past' : ''}`}>
                      <div className="event-date-block">
                        <div className="event-day">{evDate.getDate()}</div>
                        <div className="event-month">{evDate.toLocaleString('default', { month: 'short' })}</div>
                      </div>
                      <div className="event-body">
                        <div className="event-title">{ev.title}</div>
                        <div className="event-time">🕐 {evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        {ev.location && <div className="event-location">📍 {ev.location}</div>}
                        {ev.description && <div className="event-desc">{ev.description}</div>}
                        <div className="event-by">Organized by {ev.createdByName}</div>
                      </div>
                      {isPast && <div className="event-past-tag">Past</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'Members' && (
          <div className="tab-content">
            <div className="tab-content-header">
              <h2>Members ({group.currentMembers})</h2>
              {isAdmin && (
                <div className="invite-code-display">
                  Invite Code: <strong>{group.inviteCode}</strong>
                  <button className="btn-copy" onClick={() => navigator.clipboard.writeText(group.inviteCode)}>Copy</button>
                </div>
              )}
            </div>
            <div className="members-list">
              {group.members?.map(member => (
                <div key={member.userId} className="member-card">
                  <div className="member-avatar">{member.fullName?.charAt(0).toUpperCase()}</div>
                  <div className="member-info">
                    <div className="member-name">{member.fullName}</div>
                    <div className="member-email">{member.email}</div>
                    <div className="member-joined">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="member-actions">
                    <span className="member-role-badge" style={{ background: member.role === 'ADMIN' ? '#6c5ce7' : '#636e72' }}>
                      {member.role}
                    </span>
                    {isAdmin && member.userId !== currentUserId && (
                      <button className="btn-remove" onClick={() => handleRemoveMember(member.userId)}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
