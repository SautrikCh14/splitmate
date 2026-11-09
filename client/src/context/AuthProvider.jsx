import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';
import * as authService from '../services/authService';
import { AUTH_EXPIRED_EVENT } from '../services/api';

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, ask the server who we are. The HttpOnly cookie travels with the request,
  // so this is how a login survives a refresh without storing anything in localStorage.
  useEffect(() => {
    let cancelled = false;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The API client fires this when a request comes back 401 (session ended).
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (values) => {
    const loggedInUser = await authService.login(values);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (values) => {
    const newUser = await authService.register(values);
    setUser(newUser);
    return newUser;
  }, []);

  // Clearing the user and leaving the page must commit together. React Router runs
  // navigation as a low-priority transition, so if the user were cleared on its own the
  // route guard would redirect to /login before we could reach the landing page.
  const logout = useCallback(async () => {
    await authService.logout();
    startTransition(() => {
      navigate('/', { replace: true });
      setUser(null);
    });
  }, [navigate]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}