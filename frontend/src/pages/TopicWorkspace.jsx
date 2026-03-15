import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FlipHorizontal, Layers, ChevronRight, Activity, Zap, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultMock = {
  weakAreas: ['Overfitting', 'Gradient Descent', 'Backpropagation'],
  performanceLogs: [
    { name: 'Mon', score: 40 },
    { name: 'Tue', score: 55 },
    { name: 'Wed', score: 50 },
    { name: 'Thu', score: 65 },
    { name: 'Fri', score: 70 },
    { name: 'Sat', score: 72 },
  ],
};

export default function TopicWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('memora_topics');
      const topics = raw ? JSON.parse(raw) : [];
      const found = topics.find((t) => t.id === id);
      setTopic(found || null);
    } catch (e) {
      setTopic(null);
    }
  }, [id]);

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Topic not found</h2>
        <p className="mt-2 text-gray-500">This topic may have been removed or not created yet.</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate('/topics')}>Back to topics</Button>
        </div>
      </div>
    );
  }

  const mockData = {
    id: topic.id,
    name: topic.name,
    understanding: topic.understanding ?? 0,
    flashcards: topic.flashcards ?? 0,
    tests: topic.tests ?? 0,
    weakAreas: topic.weakAreas ?? defaultMock.weakAreas,
    performanceLogs: topic.performanceLogs ?? defaultMock.performanceLogs,
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{mockData.name}</h1>
          <p className="mt-2 text-gray-500">Topic Workspace — {mockData.understanding}% Understanding</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/flashcards/${id}`)} className="gap-2 bg-white">
            <FlipHorizontal className="h-4 w-4 text-blue-600" />
            Review Flashcards
          </Button>
          <Button onClick={() => navigate(`/tests/${id}`)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Play className="h-4 w-4" />
            Start New Test
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'materials', 'flashcards', 'tests', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                ${activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
              <CardHeader>
                <CardTitle>Understanding Progression</CardTitle>
                <CardDescription>How your test scores are evolving in this topic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData.performanceLogs} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                  <Layers className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{mockData.flashcards}</h3>
                  <p className="text-sm font-medium text-gray-600">Flashcards Available</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-white w-full" onClick={() => navigate(`/flashcards/${id}`)}>
                    Review Now
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{mockData.tests}</h3>
                  <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-white w-full" onClick={() => navigate(`/tests/${id}`)}>
                    Take a Test
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="border-none shadow-sm ring-1 ring-orange-100 bg-orange-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                  <Zap className="h-5 w-5 fill-current" />
                  Weak Areas
                </CardTitle>
                <CardDescription>Topics holding back your score</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mt-4 space-y-3">
                  {mockData.weakAreas.map((area, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-900">{area}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none font-semibold">Requires practice</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white shadow-sm gap-2">
                  <Activity className="h-4 w-4" />
                  Targeted Practice
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="h-10 w-10 flex items-center justify-center bg-white rounded shadow-sm text-red-500 font-bold text-xs border border-gray-100">
                      PDF
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Chapter_4_ML.pdf</p>
                      <p className="text-xs text-gray-500">Uploaded 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="h-10 w-10 flex items-center justify-center bg-white rounded shadow-sm text-blue-500 font-bold text-xs border border-gray-100">
                      DOC
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Notes_Neural_Nets.docx</p>
                      <p className="text-xs text-gray-500">Uploaded yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white min-h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 capitalize">{activeTab} View</h3>
            <p className="mt-2">This dedicated section is ready for content integration.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
