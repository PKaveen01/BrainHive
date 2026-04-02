import api from './api';

// Groups
export const createGroup = (data) => api.post('/collaboration/groups', data);
export const joinGroup = (inviteCode) => api.post('/collaboration/groups/join', { inviteCode });
export const getMyGroups = () => api.get('/collaboration/groups');
export const getGroupById = (groupId) => api.get(`/collaboration/groups/${groupId}`);
export const leaveGroup = (groupId) => api.delete(`/collaboration/groups/${groupId}/leave`);
export const removeMember = (groupId, targetUserId) => api.delete(`/collaboration/groups/${groupId}/members/${targetUserId}`);

// Messages
export const sendMessage = (groupId, content) => api.post(`/collaboration/groups/${groupId}/messages`, { content });
export const getMessages = (groupId) => api.get(`/collaboration/groups/${groupId}/messages`);

// Tasks
export const createTask = (groupId, data) => api.post(`/collaboration/groups/${groupId}/tasks`, data);
export const updateTaskStatus = (taskId, status) => api.patch(`/collaboration/tasks/${taskId}/status`, { status });
export const getGroupTasks = (groupId) => api.get(`/collaboration/groups/${groupId}/tasks`);

// Events
export const createEvent = (groupId, data) => api.post(`/collaboration/groups/${groupId}/events`, data);
export const getGroupEvents = (groupId) => api.get(`/collaboration/groups/${groupId}/events`);
