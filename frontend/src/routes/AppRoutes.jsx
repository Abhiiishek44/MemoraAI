import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import Dashboard from '../pages/DashBoard';
import UploadMaterial from '../pages/UploadMaterial';
import Topics from '../pages/Topics';
import TopicWorkspace from '../pages/TopicWorkspace';
import MCQTest from '../pages/MCQTest';
import FlashcardReview from '../pages/FlashcardReview';
import Signup from '../pages/Signup';
import Login from '../pages/Login';

export default function AppRoutes() {

  return (
    <Routes>
      {/* Public / Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route path='signup' element={<Signup />} />
        <Route path='login' element={<Login />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadMaterial />} />
          <Route path="topics" element={<Topics />} />
          <Route path="topics/:id" element={<TopicWorkspace />} />
          <Route path="tests/:id" element={<MCQTest />} />
          <Route path="flashcards/:id" element={<FlashcardReview />} />
          {/* Placeholder routes for others */}
          <Route path="flashcards" element={<div className="p-4">Flashcards Page</div>} />
          <Route path="tests" element={<div className="p-4">Tests Page</div>} />
          <Route path="tests/generated" element={<div className="p-4"><h1 className="text-2xl font-bold">Quiz Generated!</h1><p>Quiz interface goes here...</p></div>} />
          <Route path="weak-areas" element={<div className="p-4">Weak Areas Page</div>} />
          <Route path="progress" element={<div className="p-4">Progress Page</div>} />
          <Route path="settings" element={<div className="p-4">Settings Page</div>} />
        </Route>
      </Route>
    </Routes>
   
  );
}
