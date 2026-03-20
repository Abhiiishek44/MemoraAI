import axios from "axios";

const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
const ACCESS_TOKEN_KEY = 'memora_access_token';
const REFRESH_TOKEN_KEY = 'memora_refresh_token';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {  
            'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        // Do not attach access token if it's the refresh endpoint, that shouldn't need it
        if (token && config.url !== '/auth/refresh') {
                config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;
        const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

        if (status === 401 && refreshToken && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
            originalRequest._retry = true;
            try {
                // Send refresh token in the body
                const res = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                const newAccess = res?.data?.access_token;
                const newRefresh = res?.data?.refresh_token;

                if (newAccess) localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
                if (newRefresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);

                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return axiosInstance(originalRequest);
            } catch (refreshErr) {
                // Refresh token invalid or expired
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                sessionStorage.removeItem(REFRESH_TOKEN_KEY);
            }
        }

        return Promise.reject(error);
    }
);

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
export default axiosInstance;