import React, { useState, useEffect } from 'react';
import { AcademicLevel, QuizData, QuizQuestion, QuizSessionResult, SubjectOption } from '../types';
import { generateQuizAPI } from '../services/api';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Lightbulb,
  MessageSquare,
  BookOpen,
  Check,
  Timer,
} from 'lucide-react';

interface QuizGeneratorProps {
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
  initialTopic?: string;
  initialSubject?: string;
  onSaveQuizResult: (result: QuizSessionResult) => void;
  onRecordStudiedTopic: (topic: string, subject: string) => void;
  onAskTutorAboutQuestion: (questionText: string, subject: string, topic: string) => void;
  preloadedReview?: QuizSessionResult | null;
  onClearReview: () => void;
}

const ALL_SUBJECTS: SubjectOption[] = [
  'Integrated Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English Language',
  'Social Studies',
  'History',
  'Geography',
  'Economics & Commerce',
  'ICT & Computing',
  'General Knowledge',
];

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  academicLevel,
  onLevelChange,
  initialTopic = '',
  initialSubject = 'Integrated Science',
  onSaveQuizResult,
  onRecordStudiedTopic,
  onAskTutorAboutQuestion,
  preloadedReview = null,
  onClearReview,
}) => {
  // Setup Form State
  const [subject, setSubject] = useState<string>(initialSubject || 'Integrated Science');
  const [topic, setTopic] = useState<string>(initialTopic || '');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; percentage: number } | null>(
    null
  );

  // Timer State (seconds)
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Sync initial props
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSubject(initialSubject);
  }, [initialTopic, initialSubject]);

  // Load preloaded review from dashboard if provided
  useEffect(() => {
    if (preloadedReview) {
      setActiveQuiz({
        topic: preloadedReview.topic,
        subject: preloadedReview.subject,
        academicLevel: preloadedReview.academicLevel,
        questions: preloadedReview.questions,
      });
      setSelectedAnswers(preloadedReview.userAnswers || {});
      setQuizScore({
        score: preloadedReview.score,
        total: preloadedReview.total,
        percentage: preloadedReview.percentage,
      });
      setIsSubmitted(true);
      setCurrentQuestionIndex(0);
    }
  }, [preloadedReview]);

  // Timer tick while taking quiz
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeQuiz && !isSubmitted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeQuiz, isSubmitted]);

  const handleStartGeneration = async () => {
    if (!topic.trim()) {
      setGenerationError('Please enter a topic to generate a quiz.');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    onClearReview();

    try {
      const quiz = await generateQuizAPI(subject, topic.trim(), academicLevel, numQuestions);
      setActiveQuiz(quiz);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setQuizScore(null);
      setCurrentQuestionIndex(0);
      setSecondsElapsed(0);

      // Record in recent study topics
      onRecordStudiedTopic(topic.trim(), subject);
    } catch (err: any) {
      setGenerationError(
        err?.message || 'Failed to generate quiz. Please check network or try a different topic.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const total = activeQuiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const scoreData = { score: correctCount, total, percentage };
    setQuizScore(scoreData);
    setIsSubmitted(true);

    // Trigger confetti celebration if student scored >= 70%
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback if canvas is not supported
      }
    }

    // Save result to session history
    const sessionResult: QuizSessionResult = {
      id: `quiz-res-${Date.now()}`,
      topic: activeQuiz.topic,
      subject: activeQuiz.subject,
      academicLevel: activeQuiz.academicLevel,
      score: correctCount,
      total,
      percentage,
      timestamp: Date.now(),
      questions: activeQuiz.questions,
      userAnswers: selectedAnswers,
    };

    onSaveQuizResult(sessionResult);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizScore(null);
    setCurrentQuestionIndex(0);
    setSecondsElapsed(0);
  };

  const handleResetToSetup = () => {
    setActiveQuiz(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizScore(null);
    onClearReview();
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick suggestion topics
  const sampleTopics = [
    { name: 'Photosynthesis & Plant Biology', subject: 'Biology' },
    { name: "Newton's Laws of Motion", subject: 'Physics' },
    { name: 'Algebra: Linear & Quadratic Equations', subject: 'Mathematics' },
    { name: 'Acids, Bases and Salts', subject: 'Chemistry' },
    { name: 'Price Elasticity of Demand', subject: 'Economics & Commerce' },
  ];

  // 1. SETUP VIEW: If no active quiz
  if (!activeQuiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Header Intro */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Practice Quiz Generator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
            Generate custom multiple-choice quizzes tailored to your academic level. Test your
            knowledge, earn scores, and read full step-by-step explanations for each question.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Configure Your Quiz
          </h2>

          {/* Academic Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Target Academic Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Primary', 'JHS', 'SHS', 'College'] as AcademicLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onLevelChange(lvl)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    academicLevel === lvl
                      ? 'bg-sky-50 border-sky-500 text-sky-800 font-bold ring-2 ring-sky-200'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-sm">{lvl}</div>
                  <div className="text-[11px] text-slate-500">
                    {lvl === 'Primary' && 'Ages 6–11'}
                    {lvl === 'JHS' && 'Junior High'}
                    {lvl === 'SHS' && 'Senior High'}
                    {lvl === 'College' && 'Tertiary'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Select Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              3. Enter Specific Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartGeneration()}
              placeholder="e.g. Chemical Bonding: Covalent vs Ionic, or The French Revolution"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 font-medium">Or pick a popular topic:</span>
            <div className="flex flex-wrap gap-2">
              {sampleTopics.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setTopic(item.name);
                    setSubject(item.subject);
                  }}
                  className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              4. Number of Questions
            </label>
            <div className="flex items-center gap-3">
              {[3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                    numQuestions === num
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {generationError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to Generate Quiz</p>
                <p className="text-red-700 mt-0.5">{generationError}</p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating {numQuestions} Questions for{' '}
                {academicLevel}...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Practice Quiz
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. ACTIVE QUIZ OR RESULTS REVIEW VIEW
  const currentQ: QuizQuestion = activeQuiz.questions[currentQuestionIndex];
  const totalQuestions = activeQuiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Banner: Quiz Info & Timer */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            {activeQuiz.subject} • {activeQuiz.academicLevel}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{activeQuiz.topic}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <Timer className="w-4 h-4 text-slate-500" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={handleResetToSetup}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            New Quiz
          </button>
        </div>
      </div>

      {/* Results Header (If Submitted) */}
      {isSubmitted && quizScore && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                <Trophy className="w-4 h-4 text-amber-300" /> Quiz Completed
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {quizScore.percentage >= 80
                  ? '🎉 Outstanding Mastery!'
                  : quizScore.percentage >= 60
                  ? '👍 Good Job! Solid Foundation'
                  : '📚 Keep Practicing, You Will Master This!'}
              </h2>
              <p className="text-indigo-200 text-sm max-w-md">
                You answered {quizScore.score} out of {quizScore.total} questions correctly. Review the
                explanations below to reinforce key concepts.
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 w-36">
              <div className="text-4xl font-black text-sky-300">{quizScore.percentage}%</div>
              <div className="text-xs font-semibold text-white/80 mt-1">
                {quizScore.score} / {quizScore.total} Correct
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3">
            <button
              onClick={handleRetakeQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Retake This Quiz
            </button>
            <button
              onClick={handleResetToSetup}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors border border-white/20"
            >
              Generate Another Topic
            </button>
          </div>
        </div>
      )}

      {/* Question Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {activeQuiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isCurrent = currentQuestionIndex === idx;

            let bgColor = 'bg-slate-200';
            if (isSubmitted) {
              const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
              bgColor = isCorrect ? 'bg-emerald-500' : 'bg-rose-500';
            } else if (isCurrent) {
              bgColor = 'bg-sky-600 ring-2 ring-sky-200';
            } else if (isAnswered) {
              bgColor = 'bg-sky-400';
            }

            return (
              <button
                key={q.id || idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-2.5 flex-1 rounded-full transition-all ${bgColor}`}
                title={`Go to Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Question Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Question #{currentQuestionIndex + 1}
            </span>
            {isSubmitted && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                  selectedAnswers[currentQuestionIndex] === currentQ.correctAnswerIndex
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedAnswers[currentQuestionIndex] === currentQ.correctAnswerIndex ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </>
                )}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
            const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
            const isCorrectOption = currentQ.correctAnswerIndex === optIdx;

            let cardStyle =
              'border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-slate-800 bg-white';
            let badgeStyle = 'bg-slate-100 text-slate-600';

            if (isSubmitted) {
              if (isCorrectOption) {
                cardStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-400';
                badgeStyle = 'bg-emerald-600 text-white font-bold';
              } else if (isSelected && !isCorrectOption) {
                cardStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 font-medium ring-1 ring-rose-300';
                badgeStyle = 'bg-rose-600 text-white font-bold';
              } else {
                cardStyle = 'border-slate-200 text-slate-400 bg-slate-50/50';
                badgeStyle = 'bg-slate-200 text-slate-500';
              }
            } else if (isSelected) {
              cardStyle = 'border-sky-500 bg-sky-50 text-sky-900 font-semibold ring-2 ring-sky-200';
              badgeStyle = 'bg-sky-600 text-white font-bold';
            }

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}
                  >
                    {letter}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>

                {isSubmitted && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                {!isSubmitted && isSelected && (
                  <div className="w-3 h-3 rounded-full bg-sky-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Post-Submission Explanation & Tips */}
        {isSubmitted && (
          <div className="mt-6 space-y-4 pt-6 border-t border-slate-200">
            {/* Detailed Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Explanation & Concept Breakdown</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{currentQ.explanation}</p>
            </div>

            {/* Study Tip Mnemonic */}
            {currentQ.studyTip && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Study Tip: </span>
                  {currentQ.studyTip}
                </div>
              </div>
            )}

            {/* Ask AI Tutor About This Question Button */}
            <div className="pt-2">
              <button
                onClick={() =>
                  onAskTutorAboutQuestion(currentQ.question, activeQuiz.subject, activeQuiz.topic)
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Ask AI Tutor to Explain This Question Further
              </button>
            </div>
          </div>
        )}

        {/* Navigation & Submit Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : !isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" /> Submit Quiz ({answeredCount}/{totalQuestions})
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
