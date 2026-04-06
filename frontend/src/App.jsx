import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/router/AppRoutes';
import './App.css';
import { AppProviders } from './app/providers/AppProviders';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
