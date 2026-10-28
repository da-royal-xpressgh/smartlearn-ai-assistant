import { AcademicLevel, StudiedTopic, QuizSessionResult, StudyNotesData } from '../types';

const STORAGE_KEYS = {
  STUDENT_NAME: 'smartlearn_student_name',
  ACADEMIC_LEVEL: 'smartlearn_academic_level',
  RECENT_TOPICS: 'smartlearn_recent_topics',
  QUIZ_RESULTS: 'smartlearn_quiz_results',
  SAVED_NOTES: 'smartlearn_saved_notes',
};

export const getStudentName = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || 'Student';
  } catch {
    return 'Student';
  }
};

export const setStudentName = (name: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, name.trim() || 'Student');
  } catch (e) {
    console.warn('Failed to save student name to localStorage', e);
  }
};

export const getStoredAcademicLevel = (): AcademicLevel => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.ACADEMIC_LEVEL) as AcademicLevel;
    if (val && ['Primary', 'JHS', 'SHS', 'College'].includes(val)) {
      return val;
    }
    return 'SHS';
  } catch {
    return 'SHS';
  }
};

export const setStoredAcademicLevel = (level: AcademicLevel): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_LEVEL, level);
  } catch (e) {
    console.warn('Failed to save academic level to localStorage', e);
  }
};

export const getRecentTopics = (): StudiedTopic[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_TOPICS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentTopic = (topic: string, subject: string, academicLevel: AcademicLevel, category: 'tutor' | 'quiz' | 'notes'): void => {
  try {
    const existing = getRecentTopics();
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;

    // Filter out duplicate topic+subject
    const filtered = existing.filter(
      (item) => !(item.topic.toLowerCase() === cleanTopic.toLowerCase() && item.subject.toLowerCase() === subject.toLowerCase())
    );

    const newItem: StudiedTopic = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      topic: cleanTopic,
      subject,
      academicLevel,
      lastVisited: Date.now(),
      category,
    };

    const updated = [newItem, ...filtered].slice(0, 15);
    localStorage.setItem(STORAGE_KEYS.RECENT_TOPICS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent topic to localStorage', e);
  }
};

export const clearRecentTopics = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENT_TOPICS);
  } catch (e) {
    console.warn('Failed to clear recent topics', e);
  }
};

export const getQuizResults = (): QuizSessionResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveQuizResult = (result: QuizSessionResult): void => {
  try {
    const existing = getQuizResults();
    const updated = [result, ...existing].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save quiz result', e);
  }
};

export const clearQuizResults = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULTS);
  } catch (e) {
    console.warn('Failed to clear quiz results', e);
  }
};

export const getSavedNotesList = (): StudyNotesData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStudyNote = (notes: StudyNotesData): void => {
  try {
    const existing = getSavedNotesList();
    const filtered = existing.filter(
      (n) => !(n.topic.toLowerCase() === notes.topic.toLowerCase() && n.subject.toLowerCase() === notes.subject.toLowerCase())
    );
    const updated = [notes, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save study notes', e);
  }
};
