import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCcw, Smile, Meh, Frown, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const FLASHCARDS = [
  {
    id: 1,
    question: "What is overfitting in Machine Learning?",
    answer: "When a model learns the training data too well, including its noise and outliers, resulting in poor performance on new, unseen data."
  },
  {
    id: 2,
    question: "Define 'Gradient Descent'.",
    answer: "An optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent."
  },
  {
    id: 3,
    question: "What is the purpose of a validation set?",
    answer: "To tune hyperparameters and prevent overfitting during the training phase, before final evaluation on the test set."
  }
];

export default function FlashcardReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ easy: 0, medium: 0, hard: 0 });

  const progress = ((currentIndex) / FLASHCARDS.length) * 100;

  const handleRate = (rating) => {
    setSessionStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    
    // In a real app we would ping the backend here 
    // e.g. send { cardId: FLASHCARDS[currentIndex].id, rating: 'easy', topicId: id }
    
    if (currentIndex < FLASHCARDS.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Session Complete!</h1>
        <p className="text-gray-500 max-w-md">
          Great job! You reviewed {FLASHCARDS.length} flashcards today. Cards marked 'Easy' will be delayed in your next spaced repetition cycle.
        </p>
        
        <div className="flex gap-4 w-full max-w-sm mt-8 p-6 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm justify-between px-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{sessionStats.easy}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Easy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{sessionStats.medium}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Good</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{sessionStats.hard}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hard</p>
          </div>
        </div>

        <Button onClick={() => navigate(`/topics/${id}`)} className="mt-8 px-8 py-6 rounded-xl shadow-sm text-base font-medium">
          Return to Topic
        </Button>
      </div>
    );
  }

  const currentCard = FLASHCARDS[currentIndex];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col min-h-[600px] h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Flashcard Review</h2>
          <p className="text-sm text-gray-500">Card {currentIndex + 1} of {FLASHCARDS.length}</p>
        </div>
        <Button variant="ghost" className="text-gray-400 gap-2" onClick={() => navigate(`/topics/${id}`)}>
          Exit Session
        </Button>
      </div>

      <Progress value={progress} className="h-1.5 mb-12 bg-gray-100 [&>div]:bg-blue-600" />

      {/* Perspective Container */}
      <div className="flex-1 flex flex-col justify-center items-center perspective-1000 mb-12">
        <div 
          className={`relative w-full max-w-2xl aspect-[3/2] cursor-pointer transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          {/* Front */}
          <div className="absolute w-full h-full bg-white rounded-3xl shadow-lg ring-1 ring-gray-200/50 p-10 flex flex-col items-center justify-center backface-hidden">
            <span className="absolute top-6 left-6 text-sm font-medium tracking-widest text-gray-400 uppercase">Question</span>
            <p className="text-2xl sm:text-3xl font-medium text-gray-900 text-center leading-relaxed">
              {currentCard.question}
            </p>
            <div className="absolute bottom-8 text-gray-400 flex items-center gap-2 animate-pulse text-sm">
              <RefreshCcw className="h-4 w-4" />
              Tap to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-blue-50/50 rounded-3xl shadow-lg ring-1 ring-blue-100 p-10 flex flex-col items-center justify-center backface-hidden rotate-y-180">
            <span className="absolute top-6 left-6 text-sm font-medium tracking-widest text-blue-400 uppercase">Answer</span>
            <p className="text-xl sm:text-2xl font-medium text-gray-800 text-center leading-relaxed">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="h-24 pt-4">
        {isFlipped ? (
          <div className="flex justify-center gap-4 w-full max-w-xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Button 
              onClick={() => handleRate('hard')} 
              variant="outline" 
              className="flex-1 h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
            >
              <Frown className="w-5 h-5 mr-2" />
              Hard
            </Button>
            <Button 
              onClick={() => handleRate('medium')} 
              variant="outline" 
              className="flex-1 h-14 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 bg-white"
            >
              <Meh className="w-5 h-5 mr-2" />
              Good
            </Button>
            <Button 
              onClick={() => handleRate('easy')} 
              variant="outline" 
              className="flex-1 h-14 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 bg-white"
            >
              <Smile className="w-5 h-5 mr-2" />
              Easy
            </Button>
          </div>
        ) : (
          <div className="flex justify-center flex-col items-center gap-1 text-gray-400 animate-in fade-in">
            <div className="h-14"></div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
