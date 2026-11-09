import api from './api';

export async function register(values) {
  const { data } = await api.post('/auth/register', values);
  return data.user;
}

export async function login(values) {
  const { data } = await api.post('/auth/login', values);
  return data.user;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.user;
}