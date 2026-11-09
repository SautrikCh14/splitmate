import axios from 'axios';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

// One shared Axios instance. In development the Vite proxy forwards /api to Express,
// so the browser sees a single origin and the HttpOnly cookie is sent automatically.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    // A 401 from anywhere except the login, register and "who am I" calls means the
    // session ended, so tell the app to log the user out locally.
    if (status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;