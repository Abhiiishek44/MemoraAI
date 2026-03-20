import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, File, Link as LinkIcon, Loader2, BookOpen, Plus, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { uploadTopicMaterial } from '../service/Api';

function readTopics() {
  try {
    const raw = localStorage.getItem('memora_topics');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeTopics(topics) {
  localStorage.setItem('memora_topics', JSON.stringify(topics));
}

export default function UploadMaterial() {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urls, setUrls] = useState(['']);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadedTopics = readTopics();
    setTopics(loadedTopics);

    // Parse topicId from URL if present
    const params = new URLSearchParams(location.search);
    const existingTopicId = params.get('topicId');
    if (existingTopicId && loadedTopics.some(t => t.id === existingTopicId)) {
      setSelectedTopicId(existingTopicId);
    } else if (loadedTopics.length > 0) {
      // Default to first topic
      setSelectedTopicId(loadedTopics[0].id);
    }
  }, [location]);

  const addUrl = () => setUrls((s) => [...s, '']);
  const removeUrl = (i) => setUrls((s) => s.filter((_, idx) => idx !== i));
  const updateUrl = (i, v) => setUrls((s) => s.map((val, idx) => (idx === i ? v : val)));

  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    // store minimal metadata for frontend demo
    setFiles((s) => [...s, ...incoming.map((f) => ({ name: f.name, size: f.size, type: f.type, obj: f }))]);
  };

  const removeFile = (idx) => setFiles((s) => s.filter((_, i) => i !== idx));

  const validate = () => {
    return selectedTopicId.trim().length > 0;
  };

  const handleUpload = async () => {
    if (!validate()) return alert('Please select a Topic to continue.');

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('text_content', textContent);
      urls.filter(u => u.trim()).forEach(url => {
        formData.append('urls', url);
      });
      files.forEach(file => {
        formData.append('files', file.obj || file); // assuming file state has file objects
      });

      const response = await uploadTopicMaterial(selectedTopicId, formData);
      const updatedTopic = response.data;
      
      const currentTopics = readTopics();
      const topicIndex = currentTopics.findIndex(t => t.id === selectedTopicId);
      if (topicIndex !== -1) {
        currentTopics[topicIndex] = {
           ...currentTopics[topicIndex], 
           files: currentTopics[topicIndex].files + files.length,
           understanding: (currentTopics[topicIndex].understanding || 0) + 10,
           flashcards: currentTopics[topicIndex].flashcards + 5,
           tests: currentTopics[topicIndex].tests + 1
        };
        writeTopics(currentTopics);
      }

      setIsProcessing(false);
      navigate('/topics');
    } catch (error) {
      console.error('Failed to upload material', error);
      alert('Error uploading material.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Upload Study Material</h1>
          <p className="mt-2 text-gray-500">Enhance your Topic workspace by adding text, URLs, and documents.</p>
        </div>
        {topics.length === 0 && (
          <Button onClick={() => navigate('/topics')} variant="outline">
            Go Create a Topic First
          </Button>
        )}
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="topicSelect" className="text-gray-900">Select Topic</Label>
            {topics.length === 0 ? (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                    You must create a topic from the Topics page before uploading material.
                </div>
            ) : (
                <select 
                    id="topicSelect"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="" disabled>Select a workspace</option>
                    {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="textContent" className="text-gray-900">Paste Text</Label>
              <Textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                placeholder="Paste notes, explanations or summaries here..."
                className="w-full resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900">Website URLs</Label>
              <div className="mt-2 space-y-2">
                {urls.map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={u}
                      onChange={(e) => updateUrl(i, e.target.value)}
                      type="url"
                      placeholder="https://example.com/article"
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeUrl(i)} className="text-gray-500 hover:text-red-600">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div>
                  <Button variant="outline" size="sm" onClick={addUrl} className="gap-2">
                    <Plus className="h-4 w-4" /> Add another URL
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Label className="text-gray-900">Upload Documents</Label>
            <div className="mt-3 flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
                <UploadCloud className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Click to select files (PDF, DOCX, TXT)</span>
                <input onChange={(e) => {
                  const incoming = Array.from(e.target.files || []);
                  setFiles(s => [...s, ...incoming.map(f => ({ name: f.name, size: f.size, type: f.type, obj: f }))]);
                }} type="file" multiple className="hidden" />
              </label>
              <div className="text-sm text-gray-500">Max file size 10MB each</div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded bg-gray-50 text-sm text-gray-700 font-medium">DOC</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: 320 }}>{f.name}</div>
                        <div className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-xs text-red-600">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="h-4 w-4" />
              <span>We will process all sources together and update the topic workspace.</span>
            </div>

            <Button onClick={handleUpload} disabled={isProcessing || topics.length === 0} className="min-w-[160px]">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload & Process'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
