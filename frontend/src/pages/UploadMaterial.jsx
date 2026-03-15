import React, { useState } from 'react';
import { UploadCloud, FileText, File, Link as LinkIcon, Loader2, BookOpen, Plus, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

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
  const [topicName, setTopicName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urls, setUrls] = useState(['']);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const addUrl = () => setUrls((s) => [...s, '']);
  const removeUrl = (i) => setUrls((s) => s.filter((_, idx) => idx !== i));
  const updateUrl = (i, v) => setUrls((s) => s.map((val, idx) => (idx === i ? v : val)));

  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    // store minimal metadata for frontend demo
    setFiles((s) => [...s, ...incoming.map((f) => ({ name: f.name, size: f.size, type: f.type }))]);
  };

  const removeFile = (idx) => setFiles((s) => s.filter((_, i) => i !== idx));

  const validate = () => {
    return topicName.trim().length > 0;
  };

  const handleUpload = () => {
    if (!validate()) return alert('Please provide a Topic Name to continue.');

    setIsProcessing(true);

    // Simulate processing: extract content, generate flashcards & MCQs
    setTimeout(() => {
      const topics = readTopics();
      const id = Date.now().toString();
      // naive randomized simulation for counts and understanding
      const flashcards = Math.floor(Math.random() * 21) + 10; // 10-30
      const tests = Math.floor(Math.random() * 3) + 1; // 1-3
      const understanding = Math.floor(Math.random() * 46) + 40; // 40-85

      const newTopic = {
        id,
        name: topicName.trim(),
        textContent: textContent.trim(),
        urls: urls.filter((u) => u.trim()),
        files,
        flashcards,
        tests,
        understanding,
        createdAt: new Date().toISOString(),
      };

      topics.unshift(newTopic);
      writeTopics(topics);
      setIsProcessing(false);
      // navigate to topics list so user can see the created workspace
      navigate('/topics');
    }, 1600);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Upload Study Material</h1>
        <p className="mt-2 text-gray-500">Create a Topic workspace by combining text, URLs and documents in one upload.</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="topicName" className="text-gray-900">Topic Name</Label>
            <Input
              id="topicName"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Machine Learning"
              className="w-full"
            />
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
                <input onChange={handleFileChange} type="file" multiple className="hidden" />
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
              <span>We will process all sources together and create a topic workspace with generated flashcards and MCQs.</span>
            </div>

            <Button onClick={handleUpload} disabled={isProcessing} className="min-w-[160px]">
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
