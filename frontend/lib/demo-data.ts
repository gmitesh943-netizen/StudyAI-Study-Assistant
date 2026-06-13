import type { DashboardData, QuizQuestion, Flashcard, StudyBlock } from "./api";

export const DEMO_DASHBOARD: DashboardData = {
  stats: {
    study_hours: 42,
    quizzes_completed: 18,
    flashcards_reviewed: 156,
    notes_created: 24,
    page_views: 64,
    active_minutes: 128,
  },
  progress: [
    { subject: "Mathematics", value: 78 },
    { subject: "Physics", value: 65 },
    { subject: "Chemistry", value: 82 },
    { subject: "Biology", value: 71 },
    { subject: "CS", value: 90 },
  ],
  recent_activity: [
    { action: "Completed quiz", time: "2 hours ago", subject: "Calculus II" },
    { action: "Reviewed flashcards", time: "4 hours ago", subject: "Organic Chemistry" },
    { action: "Generated notes", time: "Yesterday", subject: "Data Structures" },
    { action: "AI tutoring session", time: "Yesterday", subject: "Linear Algebra" },
    { action: "Uploaded PDF summary", time: "2 days ago", subject: "Cell Biology" },
  ],
};

export const DEMO_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the derivative of x²?",
    options: ["x", "2x", "x²", "2"],
    correct: 1,
    explanation: "Using the power rule, d/dx(x²) = 2x.",
  },
  {
    id: 2,
    question: "Which organelle is responsible for ATP production?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
    correct: 2,
    explanation: "Mitochondria are the powerhouse of the cell.",
  },
  {
    id: 3,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
    explanation: "Binary search halves the search space each iteration.",
  },
];

export const DEMO_FLASHCARDS: Flashcard[] = [
  { id: 1, front: "Photosynthesis equation", back: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", subject: "Biology" },
  { id: 2, front: "Newton's Second Law", back: "F = ma", subject: "Physics" },
  { id: 3, front: "Pythagorean theorem", back: "a² + b² = c²", subject: "Mathematics" },
  { id: 4, front: "Big O of merge sort", back: "O(n log n)", subject: "CS" },
];

export const DEMO_PLAN: StudyBlock[] = [
  { time: "08:00", subject: "Mathematics", task: "Review calculus integrals", duration: "45 min" },
  { time: "09:00", subject: "Physics", task: "Practice kinematics problems", duration: "60 min" },
  { time: "10:30", subject: "Chemistry", task: "Flashcard review – organic reactions", duration: "30 min" },
  { time: "11:30", subject: "CS", task: "LeetCode – trees & graphs", duration: "90 min" },
  { time: "14:00", subject: "Biology", task: "Read chapter 12 – genetics", duration: "45 min" },
];

export const DEMO_COURSES = [
  { id: 1, title: "Advanced Calculus", instructor: "Dr. Sarah Chen", progress: 72, lessons: 24, image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=240&fit=crop" },
  { id: 2, title: "Organic Chemistry", instructor: "Prof. James Wilson", progress: 45, lessons: 32, image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=240&fit=crop" },
  { id: 3, title: "Data Structures & Algorithms", instructor: "Dr. Alex Kumar", progress: 88, lessons: 40, image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=240&fit=crop" },
  { id: 4, title: "Molecular Biology", instructor: "Dr. Emily Park", progress: 33, lessons: 28, image: "https://images.unsplash.com/photo-1532187863486-abf9db7311c6?w=400&h=240&fit=crop" },
  { id: 5, title: "Classical Mechanics", instructor: "Prof. Michael Torres", progress: 60, lessons: 20, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=240&fit=crop" },
  { id: 6, title: "Machine Learning Basics", instructor: "Dr. Lisa Zhang", progress: 15, lessons: 36, image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=240&fit=crop" },
];

export const DEMO_CHAT_RESPONSES = [
  "Great question! Let me break this down step by step for you.",
  "The key concept here is understanding the underlying principle before applying formulas.",
  "Think of it this way: imagine you're building blocks from the foundation up.",
];
