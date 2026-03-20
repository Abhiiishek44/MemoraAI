import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../service/Api';

const TopicContext = createContext();

export const TopicProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Load all topics from the API */
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

  /** Fetch a single topic by ID (used by TopicWorkspace) */
  const getTopicById = useCallback(async (topicId) => {
    const res = await getTopic(topicId);
    return res?.data ?? null;
  }, []);

  /** Create a new topic and prepend to list */
  const addTopic = useCallback(async (data) => {
    const res = await createTopic(data);
    const created = res?.data;
    if (created) {
      setTopics((prev) => [created, ...prev]);
    }
    return created;
  }, []);

  /** Update an existing topic in-place */
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

  /** Delete a topic and remove from list */
  const removeTopic = useCallback(async (topicId) => {
    await deleteTopic(topicId);
    setTopics((prev) =>
      prev.filter((t) => t.id !== topicId && t._id !== topicId)
    );
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
