import axiosInstance from "../utils/Axoisinstance";

export const signup = async (data) => axiosInstance.post('/auth/register', data);

export const login = async (data) => axiosInstance.post('/auth/login', data);

export const logout = async () => axiosInstance.post('/auth/logout');

export const refreshToken = async () => axiosInstance.post('/auth/refresh');
    
export const getUser = async () => axiosInstance.get('/auth/me');