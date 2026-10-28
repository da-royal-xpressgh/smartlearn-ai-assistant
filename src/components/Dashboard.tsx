import React, { useState } from 'react';
import { AcademicLevel, AppView, QuizSessionResult, StudiedTopic } from '../types';
import {
  MessageSquare,
  HelpCircle,
  BookOpen,
  Sparkles,
  Trophy,
  History,
  ArrowRight,
  Edit2,
  Check,
  Flame,
  Lightbulb,
  Compass,
} from 'lucide-react';

interface DashboardProps {
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
  onNavigate: (view: AppView) => void;
  recentTopics: StudiedTopic[];
  quizResults: QuizSessionResult[];
  onSelectTopicForTutor: (topic: string, subject: string) => void;
  onSelectTopicForQuiz: (topic: string, subject: string) => void;
  onSelectTopicForNotes: (topic: string, subject: string) => void;
  onReviewQuiz: (result: QuizSessionResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  studentName,
  onUpdateStudentName,
  academicLevel,
  onLevelChange,
  onNavigate,
  recentTopics,
  quizResults,
  onSelectTopicForTutor,
  onSelectTopicForQuiz,
  onSelectTopicForNotes,
  onReviewQuiz,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(studentName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateStudentName(tempName.trim());
    }
    setIsEditingName(false);
  };

  // Quick stats
  const totalQuizzes = quizResults.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          quizResults.reduce((acc, q) => acc + (q.score / q.total) * 100, 0) / totalQuizzes
        )
      : 0;

  // Curated popular topics by subject
  const curatedSubjects = [
    {
      subject: 'Integrated Science',
      icon: '🔬',
      topics: [
        'Photosynthesis & Light Reactions',
        'Human Circulatory System',
        'Acids, Bases & pH Scale',
      ],
    },
    {
      subject: 'Mathematics',
      icon: '📐',
      topics: [
        'Solving Quadratic Equations',
        'Pythagoras Theorem & Trigonometry',
        'Percentages & Compound Interest',
      ],
    },
    {
      subject: 'Economics & Commerce',
      icon: '📊',
      topics: [
        'Law of Demand and Supply',
        'Inflation & Purchasing Power',
        'Trade Deficits & Globalization',
      ],
    },
    {
      subject: 'ICT & Computing',
      icon: '💻',
      topics: [
        'Algorithms & Flowcharts',
        'Cloud Computing & Networks',
        'Computer Security & Phishing',
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to SmartLearn AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-100 font-medium">
                Level: {academicLevel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="px-3 py-1 rounded-lg bg-white text-slate-900 font-bold text-2xl focus:outline-hidden focus:ring-2 focus:ring-sky-300 max-w-xs"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Hello, {studentName}!
                  </h1>
                  <button
                    onClick={() => {
                      setTempName(studentName);
                      setIsEditingName(true);
                    }}
                    title="Change Name"
                    className="p-1.5 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-indigo-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Your AI-powered study companion. Ask difficult questions, understand concepts with
              everyday analogies, practice quizzes, and master revision notes at your own pace.
            </p>
          </div>

          {/* Academic Level Quick Toggle on Banner */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shrink-0">
            <p className="text-xs font-medium text-indigo-100 mb-2">Switch Academic Level</p>
            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-1">
              {(['Primary', 'JHS', 'SHS', 'College'] as AcademicLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    academicLevel === lvl
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{recentTopics.length}</p>
            <p className="text-xs text-slate-500 font-medium">Topics Explored</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
            <p className="text-xs text-slate-500 font-medium">Quizzes Completed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalQuizzes > 0 ? `${avgScore}%` : '—'}</p>
            <p className="text-xs text-slate-500 font-medium">Average Quiz Score</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{academicLevel}</p>
            <p className="text-xs text-slate-500 font-medium">Active Curriculum</p>
          </div>
        </div>
      </div>

      {/* Core Feature Access Cards */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>What would you like to do?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Tutor */}
          <div
            onClick={() => onNavigate('tutor')}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  AI Tutor
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Ask educational questions and get crystal-clear explanations, everyday analogies,
                  and step-by-step working.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Everyday analogies
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Step-by-step
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Voice reader
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Start asking questions</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Quiz Generator */}
          <div
            onClick={() => onNavigate('quiz')}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-2">
                  Practice Quiz Generator
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Generate multiple-choice practice tests on any topic. Test yourself, view scores,
                  and read detailed explanations.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Custom question count
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Instant scoring
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Answer review
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600">
              <span>Create practice quiz</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Study Notes */}
          <div
            onClick={() => onNavigate('notes')}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                  Study Notes Creator
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Enter a topic to generate structured study summaries, key terms, real-world
                  examples, and flashcard questions.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Executive summaries
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Vocabulary
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Print & Copy
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Generate study notes</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Curated Subject Exploration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Explore Recommended Topics</h2>
          </div>
          <span className="text-xs text-slate-500">Click any topic to learn instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {curatedSubjects.map((sub) => (
            <div
              key={sub.subject}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{sub.icon}</span>
                  <h4 className="font-semibold text-slate-900 text-sm">{sub.subject}</h4>
                </div>
                <ul className="space-y-1.5">
                  {sub.topics.map((t) => (
                    <li key={t}>
                      <button
                        onClick={() => onSelectTopicForTutor(t, sub.subject)}
                        className="text-xs text-left text-slate-600 hover:text-indigo-600 hover:underline transition-colors block w-full py-0.5"
                      >
                        • {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs">
                <button
                  onClick={() => onSelectTopicForQuiz(sub.topics[0], sub.subject)}
                  className="text-sky-600 hover:text-sky-800 font-semibold"
                >
                  Quick Quiz →
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => onSelectTopicForNotes(sub.topics[0], sub.subject)}
                  className="text-emerald-600 hover:text-emerald-800 font-semibold"
                >
                  Notes →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Split: Studied Topics & Quiz Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Studied Topics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Recently Studied Topics</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{recentTopics.length} saved</span>
            </div>

            {recentTopics.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No recent topics yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ask the AI Tutor or generate a quiz to start building your study log!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {recentTopics.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{item.topic}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{item.subject}</span>
                        <span>•</span>
                        <span className="font-medium text-indigo-600">{item.academicLevel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectTopicForTutor(item.topic, item.subject)}
                        title="Open in AI Tutor"
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        Ask Tutor
                      </button>
                      <button
                        onClick={() => onSelectTopicForQuiz(item.topic, item.subject)}
                        title="Practice Quiz"
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-200 text-sky-600 hover:bg-sky-50"
                      >
                        Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Session Quiz Results */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Recent Quiz Results</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{quizResults.length} completed</span>
            </div>

            {quizResults.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No quizzes taken in this session</p>
                <p className="text-xs text-slate-500 mt-1">
                  Generate a quiz to test your knowledge and monitor your progress.
                </p>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
                >
                  Take a Quick Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {quizResults.map((res) => {
                  const isPassing = res.percentage >= 60;
                  return (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{res.topic}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {res.subject} • {res.academicLevel}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isPassing
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {res.score}/{res.total} ({res.percentage}%)
                          </span>
                        </div>
                        <button
                          onClick={() => onReviewQuiz(res)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
