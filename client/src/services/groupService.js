import api from './api';

export async function listGroups() {
  const { data } = await api.get('/groups');
  return data.groups;
}

export async function createGroup(values) {
  const { data } = await api.post('/groups', values);
  return data.group;
}

export async function getGroup(id) {
  const { data } = await api.get(`/groups/${encodeURIComponent(id)}`);
  return data.group;
}

export async function joinGroup(code) {
  const { data } = await api.post('/groups/join', { code });
  return data.group;
}