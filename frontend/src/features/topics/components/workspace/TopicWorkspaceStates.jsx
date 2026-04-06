import React from 'react';
import { AlertCircle, ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

export function TopicLoadingState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}

export function TopicErrorState({ error, navigate, onRetry }) {
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
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    </div>
  );
}

export function TopicNotFoundState({ navigate }) {
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
