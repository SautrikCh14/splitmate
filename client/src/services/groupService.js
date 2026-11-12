import api from './api';

const groupPath = (id) => `/groups/${encodeURIComponent(id)}`;

export async function listGroups() {
  const { data } = await api.get('/groups');
  return data.groups;
}

export async function createGroup(values) {
  const { data } = await api.post('/groups', values);
  return data.group;
}

export async function getGroup(id) {
  const { data } = await api.get(groupPath(id));
  return data.group;
}

export async function updateGroup(id, values) {
  const { data } = await api.put(groupPath(id), values);
  return data.group;
}

export async function deleteGroup(id) {
  await api.delete(groupPath(id));
}

export async function joinGroup(code) {
  const { data } = await api.post('/groups/join', { code });
  return data.group;
}

export async function leaveGroup(id) {
  await api.post(`${groupPath(id)}/leave`);
}

export async function regenerateInvite(id, expiresInDays) {
  // Leaving the field out means "never expires".
  const body = expiresInDays ? { expiresInDays } : {};
  const { data } = await api.post(`${groupPath(id)}/invite/regenerate`, body);
  return data;
}

export async function addMemberByEmail(id, email) {
  const { data } = await api.post(`${groupPath(id)}/members`, { email });
  return data.message;
}

export async function setMemberRole(id, userId, role) {
  const { data } = await api.put(`${groupPath(id)}/members/${encodeURIComponent(userId)}`, { role });
  return data.member;
}

export async function removeMember(id, userId) {
  await api.delete(`${groupPath(id)}/members/${encodeURIComponent(userId)}`);
}