import React from 'react';
import { Activity, BookOpen, CheckCircle, Layers, Library, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';

export default function TopicOverviewTab({ topicData, navigate, progressColor }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
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
  );
}
