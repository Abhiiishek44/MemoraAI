import React from 'react';
import { ChevronLeft, FlipHorizontal, Play } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

export default function TopicWorkspaceHeader({ topicData, navigate }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
      <div>
        <button
          onClick={() => navigate('/topics')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> All Topics
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{topicData.name}</h1>
        {topicData.description && <p className="mt-1 text-gray-500">{topicData.description}</p>}
        <p className="mt-1 text-sm text-gray-400">Topic Workspace — {topicData.understanding}% Understanding</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(`/flashcards/${topicData.id}`)} className="gap-2 bg-white">
          <FlipHorizontal className="h-4 w-4 text-blue-600" /> Review Flashcards
        </Button>
        <Button onClick={() => navigate(`/tests/${topicData.id}`)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Play className="h-4 w-4" /> Start New Test
        </Button>
      </div>
    </div>
  );
}
