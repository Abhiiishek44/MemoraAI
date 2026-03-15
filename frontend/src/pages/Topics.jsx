import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, Library, MoreVertical, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';

function readTopics() {
  try {
    const raw = localStorage.getItem('memora_topics');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default function Topics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    setTopics(readTopics());
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Topics</h1>
          <p className="mt-2 text-gray-500">Manage your isolated learning workspaces.</p>
        </div>
        <Button onClick={() => navigate('/upload')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Topic
        </Button>
      </div>

      {topics.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No topics yet</h3>
          <p className="mt-2 text-gray-500">Create your first topic by uploading material. Each topic is an isolated workspace.</p>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Plus className="h-4 w-4" /> Create Topic
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card 
              key={topic.id} 
              className="group cursor-pointer hover:border-blue-200"
              onClick={() => navigate(`/topics/${topic.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-900" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Understanding</span>
                  <span className="font-bold text-gray-900">{topic.understanding}%</span>
                </div>
                <Progress 
                  value={topic.understanding} 
                  className={`h-2 ${topic.understanding < 60 ? '[&>div]:bg-orange-500' : topic.understanding > 80 ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'}`} 
                />
                
                <div className="mt-6 flex gap-6 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span><strong className="text-gray-900">{topic.flashcards}</strong> Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Library className="h-4 w-4 text-gray-400" />
                    <span><strong className="text-gray-900">{topic.tests}</strong> Tests</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
