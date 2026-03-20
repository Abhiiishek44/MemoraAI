import axiosInstance from "../utils/Axoisinstance";

export const signup = async (data) => axiosInstance.post('/auth/register', data);

export const login = async (data) => axiosInstance.post('/auth/login', data);

export const logout = async () => axiosInstance.post('/auth/logout');

export const refreshToken = async () => axiosInstance.post('/auth/refresh');



export const getUser = async () => axiosInstance.get('/auth/me');

export const createTopic = async (data) => axiosInstance.post('/topics', data);

export const getTopics = async () => axiosInstance.get('/topics');

export const getTopic = async (topicId) => axiosInstance.get(`/topics/${topicId}`);

export const updateTopic = async (topicId, data) => axiosInstance.patch(`/topics/${topicId}`, data);

export const deleteTopic = async (topicId) => axiosInstance.delete(`/topics/${topicId}`);

export const uploadTopicMaterial = async (topicId, formData) => {
    return axiosInstance.post(`/topics/${topicId}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};