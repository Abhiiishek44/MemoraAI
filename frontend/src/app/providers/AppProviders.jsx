import React from 'react';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import { TopicProvider } from '../../features/topics/context/TopicContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <TopicProvider>{children}</TopicProvider>
    </AuthProvider>
  );
};
