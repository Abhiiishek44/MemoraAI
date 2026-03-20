import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlipHorizontal, Layers, ChevronLeft, Activity, Zap, Play, CheckCircle,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTopics } from '../context/TopicContext';

const defaultPerformanceLogs = [
  { name: 'Mon', score: 40 },
  { name: 'Tue', score: 55 },
  { name: 'Wed', score: 50 },
  { name: 'Thu', score: 65 },
  { name: 'Fri', score: 70 },
  { name: 'Sat', score: 72 },
];
const defaultWeakAreas = ['Overfitting', 'Gradient Descent', 'Backpropagation'];

export default function TopicWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTopicById } = useTopics();

  const [activeTab, setActiveTab] = useState('overview');
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTopic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicById(id);
      setTopic(data);
    } catch (err) {
      const message =
        err?.response?.status === 404
          ? 'Topic not found.'
          : err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load topic. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, getTopicById]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/topics')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Topics
          </Button>
          <Button onClick={loadTopic} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ── Not Found ── */
  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Topic not found</h2>
        <p className="mt-2 text-gray-500">This topic may have been removed or doesn't exist.</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate('/topics')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Topics
          </Button>
        </div>
      </div>
    );
  }

  const topicData = {
    id: topic.id ?? topic._id,
    name: topic.name,
    description: topic.description ?? '',
    understanding: topic.understanding ?? 0,
    flashcards: topic.flashcards ?? 0,
    tests: topic.tests ?? 0,
    weakAreas: topic.weakAreas ?? defaultWeakAreas,
    performanceLogs: topic.performanceLogs ?? defaultPerformanceLogs,
  };

  const progressColor = (pct) => {
    if (pct >= 80) return '[&>div]:bg-green-500';
    if (pct >= 60) return '[&>div]:bg-blue-500';
    return '[&>div]:bg-orange-500';
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <button
            onClick={() => navigate('/topics')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> All Topics
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{topicData.name}</h1>
          {topicData.description && (
            <p className="mt-1 text-gray-500">{topicData.description}</p>
          )}
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'materials', 'flashcards', 'tests', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                ${activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Understanding progress chart */}
            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
              <CardHeader>
                <CardTitle>Understanding Progression</CardTitle>
                <CardDescription>How your test scores are evolving in this topic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Overall Understanding</span>
                    <span className="font-bold text-gray-900">{topicData.understanding}%</span>
                  </div>
                  <Progress value={topicData.understanding} className={`h-2 ${progressColor(topicData.understanding)}`} />
                </div>
                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={topicData.performanceLogs} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                  <Layers className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{topicData.flashcards}</h3>
                  <p className="text-sm font-medium text-gray-600">Flashcards Available</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-white w-full" onClick={() => navigate(`/flashcards/${topicData.id}`)}>
                    Review Now
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{topicData.tests}</h3>
                  <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-white w-full" onClick={() => navigate(`/tests/${topicData.id}`)}>
                    Take a Test
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="border-none shadow-sm ring-1 ring-orange-100 bg-orange-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                  <Zap className="h-5 w-5 fill-current" /> Weak Areas
                </CardTitle>
                <CardDescription>Topics holding back your score</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mt-4 space-y-3">
                  {topicData.weakAreas.map((area, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-900">{area}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none font-semibold">
                          Requires practice
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white shadow-sm gap-2">
                  <Activity className="h-4 w-4" /> Targeted Practice
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { ext: 'PDF', color: 'text-red-500', name: 'Chapter_4_ML.pdf', time: '2 days ago' },
                    { ext: 'DOC', color: 'text-blue-500', name: 'Notes_Neural_Nets.docx', time: 'Yesterday' },
                  ].map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className={`h-10 w-10 flex items-center justify-center bg-white rounded shadow-sm ${file.color} font-bold text-xs border border-gray-100`}>
                        {file.ext}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">Uploaded {file.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
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
