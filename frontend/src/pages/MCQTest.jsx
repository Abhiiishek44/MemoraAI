import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary consequence of an overfitting machine learning model?",
    options: [
      "High bias on training data",
      "Excellent performance on unseen data",
      "Poor generalization to new data",
      "Reduced model complexity"
    ],
    correctAnswer: 2,
    difficulty: "Medium"
  },
  {
    id: 2,
    question: "Which algorithm uses 'Gradient Descent' for optimization?",
    options: [
      "Naive Bayes",
      "K-Means Clustering",
      "Linear Regression",
      "Decision Trees"
    ],
    correctAnswer: 2,
    difficulty: "Easy"
  },
  {
    id: 3,
    question: "In Deep Learning, what prevents the vanishing gradient problem?",
    options: [
      "Sigmoid Activation Functions",
      "L1 Regularization",
      "Residual Connections",
      "Increasing Learning Rate"
    ],
    correctAnswer: 2,
    difficulty: "Hard"
  }
];

export default function MCQTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Timer effect
  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    
    if (timeLeft === 0) {
      handleFinish();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleFinish = () => {
    let finalScore = 0;
    MOCK_QUESTIONS.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) finalScore++;
    });
    setScore(finalScore);
    setIsFinished(true);
  };

  const handleNext = () => {
    if (currentIdx < MOCK_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleFinish();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const accuracy = Math.round((score / MOCK_QUESTIONS.length) * 100);
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
        <p className="text-lg text-gray-500 mb-8">You finished with {formatTime(10 * 60 - timeLeft)} remaining.</p>
        
        <Card className="w-full border-none shadow-sm ring-1 ring-gray-100 overflow-hidden mb-6">
          <div className="bg-gray-50 p-6 flex justify-around items-center border-b border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Score</p>
              <p className="text-3xl font-bold text-gray-900">{score}/{MOCK_QUESTIONS.length}</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-12 pr-12">
              <p className="text-sm font-medium text-gray-500 mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-blue-600">{accuracy}%</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-12">
              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <p className="text-xl font-bold text-green-600 px-3 py-1 bg-green-50 rounded-full">Passed</p>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Identified Weak Areas
            </h3>
            <ul className="space-y-2">
              {accuracy < 100 ? (
                <li className="flex items-center gap-2 text-sm text-gray-700 bg-orange-50 px-3 py-2 rounded-md">
                  <XCircle className="h-4 w-4 text-orange-500" /> Overfitting & Model Evaluation
                </li>
              ) : (
                <li className="text-sm text-gray-500 italic">No weak areas identified in this session! Great job!</li>
              )}
            </ul>
          </div>
        </Card>

        <Button onClick={() => navigate(`/topics/${id}`)} className="w-full sm:w-auto px-8 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Topic
        </Button>
      </div>
    );
  }

  const question = MOCK_QUESTIONS[currentIdx];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pt-4">
      {/* Test Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Machine Learning Quiz</h1>
          <p className="text-sm text-gray-500">Question {currentIdx + 1} of {MOCK_QUESTIONS.length}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant="outline"
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border-none
            ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
            question.difficulty === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
          >
            {question.difficulty}
          </Badge>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm font-mono text-lg font-medium">
            <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-900'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <Progress value={((currentIdx) / MOCK_QUESTIONS.length) * 100} className="h-1.5 rounded-full bg-gray-100 [&>div]:bg-blue-600" />

      {/* Main Question Card */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-white overflow-hidden mt-4">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight mb-8">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const checked = selectedAnswers[currentIdx] === i;
              
              return (
                <label 
                  key={i} 
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${checked 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900' 
                      : 'border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-200'}
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${checked ? 'border-blue-600' : 'border-gray-300 bg-white'}
                  `}>
                    {checked && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                  <span className="font-medium">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
          <Button variant="ghost" className="text-gray-500 hover:text-gray-900" onClick={() => navigate(`/topics/${id}`)}>
            Save & Exit
          </Button>
          <Button 
            className="gap-2 px-8 shadow-sm"
            onClick={handleNext}
            disabled={selectedAnswers[currentIdx] === undefined}
          >
            {currentIdx === MOCK_QUESTIONS.length - 1 ? 'Submit Test' : 'Next Question'}
            {currentIdx !== MOCK_QUESTIONS.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
