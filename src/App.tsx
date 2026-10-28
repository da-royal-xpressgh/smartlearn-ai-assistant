import React, { useState, useEffect } from 'react';
import { AcademicLevel, AppView, QuizSessionResult, StudiedTopic } from './types';
import {
  getStudentName,
  setStudentName,
  getStoredAcademicLevel,
  setStoredAcademicLevel,
  getRecentTopics,
  addRecentTopic,
  getQuizResults,
  saveQuizResult,
} from './utils/storage';
import { checkServerHealth } from './services/api';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AITutor } from './components/AITutor';
import { QuizGenerator } from './components/QuizGenerator';
import { StudyNotes } from './components/StudyNotes';
import { AboutAndGuide } from './components/AboutAndGuide';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [studentName, setStudentNameState] = useState<string>(() => getStudentName());
  const [academicLevel, setAcademicLevelState] = useState<AcademicLevel>(() =>
    getStoredAcademicLevel()
  );
  const [recentTopics, setRecentTopics] = useState<StudiedTopic[]>(() => getRecentTopics());
  const [quizResults, setQuizResults] = useState<QuizSessionResult[]>(() => getQuizResults());
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Cross-view handover states
  const [targetTopic, setTargetTopic] = useState<string>('');
  const [targetSubject, setTargetSubject] = useState<string>('Integrated Science');
  const [preloadedReviewQuiz, setPreloadedReviewQuiz] = useState<QuizSessionResult | null>(null);

  // Check backend server health and API key status on load
  useEffect(() => {
    checkServerHealth().then((res) => {
      setHasApiKey(res.hasApiKey);
    });
  }, []);

  // Update student name
  const handleUpdateStudentName = (name: string) => {
    setStudentName(name);
    setStudentNameState(name);
  };

  // Update academic level
  const handleLevelChange = (level: AcademicLevel) => {
    setStoredAcademicLevel(level);
    setAcademicLevelState(level);
  };

  // Record a studied topic to history
  const handleRecordStudiedTopic = (topic: string, subject: string, category: 'tutor' | 'quiz' | 'notes' = 'tutor') => {
    addRecentTopic(topic, subject, academicLevel, category);
    setRecentTopics(getRecentTopics());
  };

  // Save quiz result
  const handleSaveQuizResult = (result: QuizSessionResult) => {
    saveQuizResult(result);
    setQuizResults(getQuizResults());
    handleRecordStudiedTopic(result.topic, result.subject, 'quiz');
  };

  // Handover: Select topic for AI Tutor
  const handleSelectTopicForTutor = (topic: string, subject: string) => {
    setTargetTopic(topic);
    setTargetSubject(subject);
    setCurrentView('tutor');
  };

  // Handover: Select topic for Quiz Generator
  const handleSelectTopicForQuiz = (topic: string, subject: string) => {
    setTargetTopic(topic);
    setTargetSubject(subject);
    setPreloadedReviewQuiz(null);
    setCurrentView('quiz');
  };

  // Handover: Select topic for Study Notes
  const handleSelectTopicForNotes = (topic: string, subject: string) => {
    setTargetTopic(topic);
    setTargetSubject(subject);
    setCurrentView('notes');
  };

  // Handover: Review a past quiz result
  const handleReviewPastQuiz = (result: QuizSessionResult) => {
    setPreloadedReviewQuiz(result);
    setCurrentView('quiz');
  };

  // Handover: Ask Tutor about a specific question from quiz
  const handleAskTutorAboutQuestion = (questionText: string, subject: string, topic: string) => {
    const prompt = `I was taking a practice quiz on "${topic}" and have a question about this problem:\n\n"${questionText}"\n\nCould you please explain this concept simply, break down how to arrive at the correct answer, and give me an everyday analogy?`;
    setTargetSubject(subject);
    setTargetTopic(topic);
    setCurrentView('tutor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        academicLevel={academicLevel}
        onLevelChange={handleLevelChange}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentView === 'dashboard' && (
          <Dashboard
            studentName={studentName}
            onUpdateStudentName={handleUpdateStudentName}
            academicLevel={academicLevel}
            onLevelChange={handleLevelChange}
            onNavigate={setCurrentView}
            recentTopics={recentTopics}
            quizResults={quizResults}
            onSelectTopicForTutor={handleSelectTopicForTutor}
            onSelectTopicForQuiz={handleSelectTopicForQuiz}
            onSelectTopicForNotes={handleSelectTopicForNotes}
            onReviewQuiz={handleReviewPastQuiz}
          />
        )}

        {currentView === 'tutor' && (
          <AITutor
            academicLevel={academicLevel}
            onLevelChange={handleLevelChange}
            initialTopic={targetTopic}
            initialSubject={targetSubject}
            onLaunchQuizForTopic={handleSelectTopicForQuiz}
            onLaunchNotesForTopic={handleSelectTopicForNotes}
            onRecordStudiedTopic={(topic, subject) =>
              handleRecordStudiedTopic(topic, subject, 'tutor')
            }
          />
        )}

        {currentView === 'quiz' && (
          <QuizGenerator
            academicLevel={academicLevel}
            onLevelChange={handleLevelChange}
            initialTopic={targetTopic}
            initialSubject={targetSubject}
            onSaveQuizResult={handleSaveQuizResult}
            onRecordStudiedTopic={(topic, subject) =>
              handleRecordStudiedTopic(topic, subject, 'quiz')
            }
            onAskTutorAboutQuestion={handleAskTutorAboutQuestion}
            preloadedReview={preloadedReviewQuiz}
            onClearReview={() => setPreloadedReviewQuiz(null)}
          />
        )}

        {currentView === 'notes' && (
          <StudyNotes
            academicLevel={academicLevel}
            onLevelChange={handleLevelChange}
            initialTopic={targetTopic}
            initialSubject={targetSubject}
            onLaunchQuizForTopic={handleSelectTopicForQuiz}
            onRecordStudiedTopic={(topic, subject) =>
              handleRecordStudiedTopic(topic, subject, 'notes')
            }
          />
        )}

        {currentView === 'guide' && <AboutAndGuide />}
      </main>

      {/* Footer */}
      <Footer onNavigate={setCurrentView} />
    </div>
  );
}
