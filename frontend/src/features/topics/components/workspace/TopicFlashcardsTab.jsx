import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

const dummyFlashcards = [
  {
    id: 'fc-1',
    front: 'What is Overfitting?',
    back: 'Overfitting happens when a model learns training data too well, including noise, and performs poorly on unseen data.',
    tag: 'ML Basics',
  },
  {
    id: 'fc-2',
    front: 'What does Gradient Descent do?',
    back: 'Gradient Descent updates model parameters to minimize loss by moving in the direction of the negative gradient.',
    tag: 'Optimization',
  },
  {
    id: 'fc-3',
    front: 'Why is Backpropagation used?',
    back: 'Backpropagation computes gradients through the network using the chain rule, enabling efficient training of neural networks.',
    tag: 'Neural Networks',
  },
];

export default function TopicFlashcardsTab() {
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const activeCard = useMemo(() => dummyFlashcards[index], [index]);

  const onNext = () => {
    setShowBack(false);
    setIndex((prev) => (prev + 1) % dummyFlashcards.length);
  };

  const onPrev = () => {
    setShowBack(false);
    setIndex((prev) => (prev - 1 + dummyFlashcards.length) % dummyFlashcards.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Flashcard Practice</CardTitle>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Dummy Data
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <button
            type="button"
            onClick={() => setShowBack((prev) => !prev)}
            className="w-full min-h-[260px] rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 text-left hover:border-blue-200 transition-colors"
          >
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              {showBack ? 'Back' : 'Front'}
            </p>
            <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
              {showBack ? activeCard.back : activeCard.front}
            </p>
            <p className="mt-6 text-sm text-gray-500">Click card to flip</p>
          </button>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <Button type="button" variant="ghost" onClick={() => setShowBack(false)} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset Card
            </Button>

            <Button type="button" variant="outline" onClick={onNext} className="gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Card List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dummyFlashcards.map((card, cardIndex) => (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                setIndex(cardIndex);
                setShowBack(false);
              }}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                index === cardIndex
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">{card.front}</p>
              <p className="text-xs text-gray-500 mt-1">{card.tag}</p>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
