import axiosClient from './axiosClient';

export const signup = async (data) => axiosClient.post('/auth/register', data);
export const login = async (data) => axiosClient.post('/auth/login', data);
export const logout = async () => axiosClient.post('/auth/logout');
export const refreshToken = async () => axiosClient.post('/auth/refresh');
export const getUser = async () => axiosClient.get('/auth/me');

export const createTopic = async (data) => axiosClient.post('/topics', data);
export const getTopics = async () => axiosClient.get('/topics');
export const getTopic = async (topicId) => axiosClient.get(`/topics/${topicId}`);
export const updateTopic = async (topicId, data) => axiosClient.patch(`/topics/${topicId}`, data);
export const deleteTopic = async (topicId) => axiosClient.delete(`/topics/${topicId}`);

/**
 * Material APIs
 * Backend base route: /topics/{topic_id}/materials
 */

export const getMaterials = async (topicId) => axiosClient.get(`/topics/${topicId}/materials/`);

export const getMaterial = async (topicId, materialId) =>
  axiosClient.get(`/topics/${topicId}/materials/${materialId}`);

export const deleteMaterial = async (topicId, materialId) =>
  axiosClient.delete(`/topics/${topicId}/materials/${materialId}`);

// NOTE: current backend routes in this repo may not yet expose PATCH for materials.
// Keeping this for frontend completeness and future compatibility.
export const updateMaterial = async (topicId, materialId, data) =>
  axiosClient.patch(`/topics/${topicId}/materials/${materialId}`, data);

export const getMaterialStatus = async (topicId, materialId) =>
  axiosClient.get(`/topics/${topicId}/materials/${materialId}/status`);

export const reprocessMaterial = async (topicId, materialId) =>
  axiosClient.post(`/topics/${topicId}/materials/${materialId}/reprocess`);

export const uploadMaterial = async (topicId, { text, url, file } = {}) => {
  const formData = new FormData();

  if (text) formData.append('text', text);
  if (url) formData.append('url', url);
  if (file) formData.append('file', file);

  return axiosClient.post(`/topics/${topicId}/materials/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Backward-compatible helpers used by existing pages/components
 */
export const uploadTopic = async (topicId, data) => {
  if (data?.type === 'text') {
    return uploadMaterial(topicId, { text: data.content });
  }
  if (data?.type === 'url') {
    return uploadMaterial(topicId, { url: data.content });
  }
  return uploadMaterial(topicId, data);
};

export const uploadTopicMaterial = async (topicId, formData) => {
  return axiosClient.post(`/topics/${topicId}/materials/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
