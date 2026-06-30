/**
 * AI Study Agent TypeScript Types
 */

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  skillUsed?: string;
  // If the smart router returns a structured plan or quiz, render it inline
  inlineData?: {
    skillId: "quiz-skill" | "study-plan-skill";
    quiz?: QuizData;
    studyPlan?: StudyPlanData;
  };
}

export interface StudyPlanDay {
  day: number;
  focus: string;
  concepts: string[];
  activity: string;
  buddyTip: string;
  completed?: boolean;
}

export interface StudyPlanData {
  title: string;
  buddyIntro: string;
  days: StudyPlanDay[];
  buddyOutro: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizData {
  quizTitle: string;
  buddyIntro: string;
  questions: QuizQuestion[];
}

export interface KeyConcept {
  concept: string;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface PDFSummaryData {
  documentName: string;
  buddyIntro: string;
  summaryHeadline: string;
  keyConcepts: KeyConcept[];
  flashcards: Flashcard[];
  quickTakeaway: string;
}

export interface StudySession {
  id: string;
  topic: string;
  duration: number; // in minutes
  timestamp: string;
  mood: string;
}

export interface ProgressStats {
  totalMinutes: number;
  streak: number;
  lastStudyDate: string | null;
  actionsCompleted: number;
  unlockedBadgeIds: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
}
