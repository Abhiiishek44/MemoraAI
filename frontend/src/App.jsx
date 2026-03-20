import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { TopicProvider } from './context/TopicContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TopicProvider>
          <AppRoutes />
        </TopicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
