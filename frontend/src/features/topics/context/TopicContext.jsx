/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useState } from 'react';
import { createTopic, deleteTopic, getTopic, getTopics, updateTopic } from '../../../shared/api/endpoints';

const TopicContext = createContext();

export const TopicProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTopics();
      setTopics(res?.data ?? []);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to load topics. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopicById = useCallback(async (topicId) => {
    const res = await getTopic(topicId);
    return res?.data ?? null;
  }, []);

  const addTopic = useCallback(async (data) => {
    const res = await createTopic(data);
    const created = res?.data;
    if (created) {
      setTopics((prev) => [created, ...prev]);
    }
    return created;
  }, []);

  const editTopic = useCallback(async (topicId, data) => {
    const res = await updateTopic(topicId, data);
    const updated = res?.data;
    if (updated) {
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId || t._id === topicId ? updated : t))
      );
    }
    return updated;
  }, []);

  const removeTopic = useCallback(async (topicId) => {
    await deleteTopic(topicId);
    setTopics((prev) => prev.filter((t) => t.id !== topicId && t._id !== topicId));
  }, []);

  return (
    <TopicContext.Provider
      value={{
        topics,
        loading,
        error,
        fetchTopics,
        getTopicById,
        addTopic,
        editTopic,
        removeTopic,
      }}
    >
      {children}
    </TopicContext.Provider>
  );
};

export const useTopics = () => useContext(TopicContext);
