export type AcademicLevel = 'Primary' | 'JHS' | 'SHS' | 'College';

export type SubjectOption =
  | 'Integrated Science'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English Language'
  | 'Social Studies'
  | 'History'
  | 'Geography'
  | 'Economics & Commerce'
  | 'ICT & Computing'
  | 'General Knowledge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  studyTip: string;
}

export interface QuizData {
  topic: string;
  subject: string;
  academicLevel: AcademicLevel;
  questions: QuizQuestion[];
}

export interface QuizSessionResult {
  id: string;
  topic: string;
  subject: string;
  academicLevel: AcademicLevel;
  score: number;
  total: number;
  percentage: number;
  timestamp: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
}

export interface StudyTermDefinition {
  term: string;
  formalDefinition: string;
  simpleMeaning: string;
}

export interface EverydayExample {
  title: string;
  description: string;
}

export interface RevisionQuestion {
  question: string;
  answer: string;
}

export interface StudyNotesData {
  topic: string;
  subject: string;
  academicLevel: AcademicLevel;
  summary: string;
  keyPoints: string[];
  definitions: StudyTermDefinition[];
  everydayExamples: EverydayExample[];
  revisionQuestions: RevisionQuestion[];
  studyTip: string;
}

export interface StudiedTopic {
  id: string;
  topic: string;
  subject: string;
  academicLevel: AcademicLevel;
  lastVisited: number;
  category: 'tutor' | 'quiz' | 'notes';
}

export type AppView = 'dashboard' | 'tutor' | 'quiz' | 'notes' | 'guide';
