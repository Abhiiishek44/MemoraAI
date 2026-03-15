import React from 'react';
import { 
  BarChart3, 
  Flame, 
  GraduationCap, 
  LibraryBig, 
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Layers
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 95 },
];

const weakAreas = [
  { topic: 'Overfitting', percentage: 45 },
  { topic: 'Database Normalization', percentage: 52 },
  { topic: 'Gradient Descent', percentage: 60 },
];

const topics = [
  { name: 'Machine Learning', score: 72 },
  { name: 'Operating Systems', score: 85 },
  { name: 'Data Structures', score: 91 },
  { name: 'Computer Networks', score: 68 },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, Jane 👋</h1>
          <p className="mt-2 text-gray-500">Here's an overview of your learning progress today.</p>
        </div>
        <Button className="gap-2">
          <GraduationCap className="h-4 w-4" />
          Continue Learning
        </Button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Study Streak</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">7 Days</div>
            <p className="mt-1 text-xs text-gray-500">+1 from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tests Completed</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <LibraryBig className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="mt-1 text-xs text-gray-500">3 new tests available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Flashcards</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">120</div>
            <p className="mt-1 text-xs text-gray-500">Reviewed this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overall Progress</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">76%</div>
            <Progress value={76} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Upcoming Revision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Neural Networks</div>
            <p className="text-sm text-blue-200 mt-1">Due in 2 hours</p>
            <Button variant="secondary" size="sm" className="mt-4 w-full bg-white text-blue-700 hover:bg-gray-50">
              Start Review
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Learning Progress</CardTitle>
            <CardDescription>Your MCQ average score over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weak Areas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-red-100 p-1.5">
                <BrainCircuit className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle>Needs Attention</CardTitle>
            </div>
            <CardDescription>Topics where you struggle</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {weakAreas.map((area, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{area.topic}</span>
                  <span className="font-medium text-red-600">{area.percentage}%</span>
                </div>
                <Progress value={area.percentage} className="bg-red-100 [&>div]:bg-red-500 h-1.5" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-sm">
              Review Weak Areas
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Topic Understanding */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">Topic Understanding</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">{topic.name}</div>
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-gray-900">{topic.score}%</div>
                </div>
                <Progress 
                  value={topic.score} 
                  className={`mt-3 h-1.5 ${
                    topic.score >= 80 ? "[&>div]:bg-green-500" : topic.score >= 70 ? "[&>div]:bg-blue-500" : "[&>div]:bg-orange-500"
                  }`} 
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
