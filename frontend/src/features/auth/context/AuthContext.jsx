/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, login as apiLogin, logout as apiLogout, signup as apiSignup } from '../../../shared/api/endpoints';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../../shared/api/axiosClient';

const AuthContext = createContext();

const extractApiErrorMessage = (err, fallbackMessage) => {
  const detail = err?.response?.data?.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.msg) {
          const location = Array.isArray(item?.loc) ? item.loc.slice(1).join('.') : '';
          return location ? `${location}: ${item.msg}` : item.msg;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  return err?.response?.data?.message || fallbackMessage;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getUser();
        if (res?.data) setUser(res.data);
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const res = await apiSignup(userData);
      const access = res?.data?.access_token;
      const refresh = res?.data?.refresh_token;
      const profile = res?.data?.user ?? res?.data;

      if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
      if (refresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      if (profile) setUser(profile);

      return { success: true, data: profile };
    } catch (err) {
      const message = extractApiErrorMessage(err, 'Registration failed');
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const res = await apiLogin(credentials);
      const access = res?.data?.access_token;
      const refresh = res?.data?.refresh_token;
      const profile = res?.data?.user ?? res?.data;

      if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
      if (refresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      if (profile) setUser(profile);

      return { success: true, data: profile };
    } catch (err) {
      const message = extractApiErrorMessage(err, 'Login failed');
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
