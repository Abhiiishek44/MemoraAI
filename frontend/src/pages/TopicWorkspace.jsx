import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlipHorizontal, Layers, ChevronLeft, Activity, Zap, Play, CheckCircle,
  Loader2, AlertCircle, RefreshCw, Upload, FileText, Link as LinkIcon, File, X
} from 'lucide-react';
import { uploadTopicMaterial, uploadTopic } from '../service/Api';
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

  // Materials tab state
  const [materials, setMaterials] = useState([]);
  const [uploadType, setUploadType] = useState('file');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadText, setUploadText] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTopic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicById(id);
      setTopic(data);
      setMaterials(data.materials || []);
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadType) return;
    
    setIsUploading(true);
    setUploadMessage({ type: '', text: '' });
    
    try {
      if (uploadType === 'file' && uploadFiles.length > 0) {
        // Upload multiple files
        const promises = uploadFiles.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          return uploadTopicMaterial(id, formData).then(res => ({
            _id: Date.now().toString() + Math.random(),
            name: file.name,
            type: 'file',
            uploadedAt: new Date().toISOString(),
            ...(res.data?.material || res.data || {})
          }));
        });
        
        const uploadedMaterials = await Promise.all(promises);
        setMaterials(prev => [...prev, ...uploadedMaterials]);
        setUploadMessage({ type: 'success', text: `${uploadedMaterials.length} material(s) uploaded successfully!` });
        
      } else {
        // Text or URL upload
        let res;
        if (uploadType === 'text' && uploadText) {
          res = await uploadTopic(id, { type: 'text', content: uploadText });
        } else if (uploadType === 'url' && uploadUrl) {
          res = await uploadTopic(id, { type: 'url', content: uploadUrl });
        } else {
          throw new Error('Please provide the required material content.');
        }
        
        const newMaterial = res.data?.material || res.data || {
          _id: Date.now().toString(),
          name: uploadType === 'url' ? uploadUrl : 'Text Note',
          type: uploadType,
          uploadedAt: new Date().toISOString()
        };
        
        setMaterials(prev => [...prev, newMaterial]);
        setUploadMessage({ type: 'success', text: 'Material uploaded successfully!' });
      }
      
      // Reset form
      setUploadFiles([]);
      setUploadText('');
      setUploadUrl('');
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => {
        setIsModalOpen(false);
        setUploadMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setUploadMessage({ 
        type: 'error', 
        text: err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Failed to upload material.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

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

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="flex flex-col gap-6">
          <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-5">
              <div className="space-y-1">
                <CardTitle className="text-xl">Topic Materials</CardTitle>
                <CardDescription>All materials uploaded for this topic.</CardDescription>
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="h-4 w-4" /> Add Material
              </Button>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100">
                    <FileText className="h-8 w-8 text-blue-500/70" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No materials yet</h3>
                  <p className="max-w-xs text-sm text-gray-500">Upload documents, links, or text notes to build your knowledge base for this topic.</p>
                  <Button variant="outline" onClick={() => setIsModalOpen(true)} className="mt-6 gap-2 bg-white">
                    <Upload className="h-4 w-4" /> Upload your first material
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((mat, i) => (
                    <div key={mat._id || mat.id || i} className="flex flex-col gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 hover:ring-blue-600/20 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform ${mat.type === 'file' ? 'text-blue-600 bg-blue-50/50 border-blue-100' : mat.type === 'url' ? 'text-green-600 bg-green-50/50 border-green-100' : 'text-orange-600 bg-orange-50/50 border-orange-100'}`}>
                          {mat.type === 'file' ? <File className="h-5 w-5" /> : mat.type === 'url' ? <LinkIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <Badge variant="outline" className={`text-[10px] capitalize font-medium px-2 py-0 border-none ${mat.type === 'file' ? 'bg-blue-50 text-blue-700' : mat.type === 'url' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                          {mat.type || 'Material'}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0 mt-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed" title={mat.name || mat.title || 'Untitled Material'}>
                          {mat.name || mat.title || 'Untitled Material'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          {mat.uploadedAt || mat.created_at ? new Date(mat.uploadedAt || mat.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Modal Overlay */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative ring-1 ring-gray-200/50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg"><Upload className="h-4 w-4 text-blue-700" /></div> Add Material
                  </h3>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setUploadMessage({ type: '', text: '' });
                    }} 
                    className="text-gray-400 hover:text-gray-700 transition-colors bg-white hover:bg-gray-100 rounded-full p-2 border border-gray-200/50 shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleUpload} className="space-y-6">
                    <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner">
                      {['file', 'text', 'url'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setUploadType(type)}
                          className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${uploadType === type ? 'bg-white shadow-sm ring-1 ring-gray-200/50 text-blue-600 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    {uploadType === 'file' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select File(s)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-colors relative group bg-gray-50/30">
                          <input 
                            id="file-upload-input"
                            type="file" 
                            multiple
                            onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required={uploadFiles.length === 0}
                          />
                          <div className="bg-white w-14 h-14 mx-auto rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                            <Upload className="h-6 w-6 text-blue-500" />
                          </div>
                          <p className="text-sm text-gray-700 font-semibold">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1.5">SVG, PNG, JPG, DOC, PDF (max. 10MB)</p>
                        </div>
                        {uploadFiles.length > 0 && (
                          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm relative">
                            <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                              <span className="bg-blue-200 text-blue-800 text-xs py-0.5 px-2 rounded-full">{uploadFiles.length}</span> file{uploadFiles.length > 1 ? 's' : ''} ready for upload
                            </p>
                            <ul className="mt-3 flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                              {uploadFiles.map((f, i) => (
                                <li key={i} className="text-xs text-blue-800 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                                  <File className="h-3.5 w-3.5 text-blue-500" /> <span className="truncate font-medium">{f.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uploadType === 'text' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                        <textarea 
                          rows={6}
                          value={uploadText}
                          onChange={(e) => setUploadText(e.target.value)}
                          className="block w-full rounded-xl border-gray-200 shadow-sm border p-4 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 hover:bg-white transition-colors resize-none"
                          placeholder="Type or paste your material text here..."
                          required
                        />
                      </div>
                    )}
                    
                    {uploadType === 'url' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Material Link</label>
                        <input 
                          type="url"
                          value={uploadUrl}
                          onChange={(e) => setUploadUrl(e.target.value)}
                          className="block w-full rounded-xl border-gray-200 shadow-sm border px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 hover:bg-white transition-colors"
                          placeholder="https://example.com/useful-resource"
                          required
                        />
                      </div>
                    )}

                    {uploadMessage.text && (
                      <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in-95 ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {uploadMessage.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        {uploadMessage.text}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUploading} className="gap-2 min-w-[140px] shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {isUploading ? 'Uploading...' : 'Save Material'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other tabs placeholder */}
      {activeTab !== 'overview' && activeTab !== 'materials' && (
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
