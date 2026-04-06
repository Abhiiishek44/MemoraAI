import axios from 'axios';

const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
export const ACCESS_TOKEN_KEY = 'memora_access_token';
export const REFRESH_TOKEN_KEY = 'memora_refresh_token';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token && config.url !== '/auth/refresh') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

    if (status === 401 && refreshToken && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccess = res?.data?.access_token;
        const newRefresh = res?.data?.refresh_token;

        if (newAccess) localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
        if (newRefresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(originalRequest);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
