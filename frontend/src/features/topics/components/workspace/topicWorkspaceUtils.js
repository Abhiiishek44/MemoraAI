export const defaultPerformanceLogs = [
  { name: 'Mon', score: 40 },
  { name: 'Tue', score: 55 },
  { name: 'Wed', score: 50 },
  { name: 'Thu', score: 65 },
  { name: 'Fri', score: 70 },
  { name: 'Sat', score: 72 },
];

export const defaultWeakAreas = ['Overfitting', 'Gradient Descent', 'Backpropagation'];

export const toTopicData = (topic) => ({
  id: topic.id ?? topic._id,
  name: topic.name,
  description: topic.description ?? '',
  understanding: topic.understanding ?? 0,
  flashcards: topic.flashcards ?? 0,
  tests: topic.tests ?? 0,
  weakAreas: topic.weakAreas ?? defaultWeakAreas,
  performanceLogs: topic.performanceLogs ?? defaultPerformanceLogs,
});

export const progressColor = (pct) => {
  if (pct >= 80) return '[&>div]:bg-green-500';
  if (pct >= 60) return '[&>div]:bg-blue-500';
  return '[&>div]:bg-orange-500';
};
