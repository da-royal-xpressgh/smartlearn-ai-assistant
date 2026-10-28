import React, { useState, useEffect } from 'react';
import { AcademicLevel, StudyNotesData, SubjectOption } from '../types';
import { generateStudyNotesAPI } from '../services/api';
import { getSavedNotesList, saveStudyNote } from '../utils/storage';
import { speechService } from '../utils/speech';
import {
  BookOpen,
  Sparkles,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  Volume2,
  VolumeX,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  Loader2,
  Bookmark,
  Share2,
} from 'lucide-react';

interface StudyNotesProps {
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
  initialTopic?: string;
  initialSubject?: string;
  onLaunchQuizForTopic: (topic: string, subject: string) => void;
  onRecordStudiedTopic: (topic: string, subject: string) => void;
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

export const StudyNotes: React.FC<StudyNotesProps> = ({
  academicLevel,
  onLevelChange,
  initialTopic = '',
  initialSubject = 'Integrated Science',
  onLaunchQuizForTopic,
  onRecordStudiedTopic,
}) => {
  const [subject, setSubject] = useState<string>(initialSubject || 'Integrated Science');
  const [topic, setTopic] = useState<string>(initialTopic || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [notesData, setNotesData] = useState<StudyNotesData | null>(null);
  const [masteredKeyPoints, setMasteredKeyPoints] = useState<Record<number, boolean>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedNotes, setSavedNotes] = useState<StudyNotesData[]>(() => getSavedNotesList());

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSubject(initialSubject);
  }, [initialTopic, initialSubject]);

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleGenerateNotes = async () => {
    if (!topic.trim()) {
      setGenerationError('Please enter a topic to generate study notes.');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    speechService.stop();
    setIsSpeaking(false);

    try {
      const data = await generateStudyNotesAPI(subject, topic.trim(), academicLevel);
      setNotesData(data);
      setMasteredKeyPoints({});
      setRevealedQuestions({});

      // Save to local storage notes history
      saveStudyNote(data);
      setSavedNotes(getSavedNotesList());

      // Track recent topic
      onRecordStudiedTopic(topic.trim(), subject);
    } catch (err: any) {
      setGenerationError(
        err?.message || 'Failed to generate study notes. Please check network or try a different topic.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMasteredPoint = (index: number) => {
    setMasteredKeyPoints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleRevealQuestion = (index: number) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyNotes = () => {
    if (!notesData) return;

    let text = `# ${notesData.topic}\nSubject: ${notesData.subject} | Level: ${notesData.academicLevel}\n\n`;
    text += `## Summary\n${notesData.summary}\n\n`;
    text += `## Key Takeaways\n${notesData.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n`;
    text += `## Important Definitions\n${notesData.definitions
      .map((d) => `### ${d.term}\n- Formal: ${d.formalDefinition}\n- Plain Meaning: ${d.simpleMeaning}`)
      .join('\n\n')}\n\n`;
    text += `## Everyday Examples\n${notesData.everydayExamples
      .map((e) => `### ${e.title}\n${e.description}`)
      .join('\n\n')}\n\n`;
    text += `## Revision Questions\n${notesData.revisionQuestions
      .map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`)
      .join('\n\n')}\n\n`;
    if (notesData.studyTip) {
      text += `## Study Tip\n${notesData.studyTip}\n`;
    }

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (!notesData) return;

    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = `Study notes on ${notesData.topic}. ${notesData.summary}. Key points: ${notesData.keyPoints.join(
        '. '
      )}. Everyday examples: ${notesData.everydayExamples.map((e) => `${e.title}: ${e.description}`).join('. ')}.`;
      speechService.speak(textToRead, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sampleTopics = [
    { name: 'Water Cycle & Precipitation', subject: 'Geography' },
    { name: 'Structure of the Atom & Isotopes', subject: 'Chemistry' },
    { name: 'Pythagorean Theorem & Right Triangles', subject: 'Mathematics' },
    { name: 'Functions of Money and Banking', subject: 'Economics & Commerce' },
    { name: 'World War II: Causes and Impact', subject: 'History' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Search & Topic Selector Bar (Hidden when printing) */}
      <div className="print:hidden bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" /> Study Notes Creator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Generate structured revision notes with summaries, everyday analogies, key definitions, and flashcard questions.
            </p>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-500 px-2 uppercase">Level:</span>
            {(['Primary', 'JHS', 'SHS', 'College'] as AcademicLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onLevelChange(lvl)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  academicLevel === lvl
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Topic Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateNotes()}
                placeholder="e.g. Plate Tectonics, Enzymes, or Compound Interest"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                onClick={handleGenerateNotes}
                disabled={isGenerating || !topic.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 shrink-0 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Generate Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sample Topics Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Try:
          </span>
          {sampleTopics.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setTopic(item.name);
                setSubject(item.subject);
              }}
              className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Generation Error Banner */}
        {generationError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="text-red-700 text-xs mt-0.5">{generationError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Crafting Comprehensive Study Notes...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Analyzing curriculum definitions, everyday real-life examples, and revision questions for{' '}
              <span className="font-semibold text-emerald-600">{academicLevel}</span> level.
            </p>
          </div>
        </div>
      )}

      {/* Render Generated Notes Sheet */}
      {notesData && !isGenerating && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden print:border-none print:shadow-none">
          {/* Notes Top Sheet Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
                    {notesData.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
                    Level: {notesData.academicLevel}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{notesData.topic}</h2>
                <p className="text-xs text-emerald-100 mt-1">SmartLearn AI Certified Revision Guide</p>
              </div>

              {/* Action Toolbar (Hidden in Print) */}
              <div className="print:hidden flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSpeaking
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Listen to summary"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" /> Read Aloud
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
                  title="Copy full notes"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Notes
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>

                <button
                  onClick={() => onLaunchQuizForTopic(notesData.topic, notesData.subject)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-all shadow-xs"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600" /> Practice Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Notes Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* 1. Summary Overview */}
            <section className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                1. Executive Concept Summary
              </h3>
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-slate-800 text-sm sm:text-base leading-relaxed">
                {notesData.summary}
              </div>
            </section>

            {/* 2. Key Takeaways Checkable List */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  2. Essential Key Points & Facts
                </h3>
                <span className="text-xs text-slate-400 print:hidden">Check off as you master each</span>
              </div>
              <div className="space-y-2">
                {notesData.keyPoints.map((point, idx) => {
                  const isChecked = !!masteredKeyPoints[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleMasteredPoint(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-indigo-600">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <p className="text-sm font-medium leading-relaxed">{point}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Important Vocabulary & Definitions */}
            <section className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-sky-600" />
                3. Key Terms & Plain-Language Definitions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notesData.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      {def.term}
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                          Formal Definition:
                        </span>
                        <p className="text-slate-700 mt-0.5">{def.formalDefinition}</p>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200">
                        <span className="font-semibold text-sky-700 uppercase tracking-wider text-[10px]">
                          Plain Everyday Meaning:
                        </span>
                        <p className="text-slate-800 font-medium mt-0.5">{def.simpleMeaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Practical Real-Life Examples */}
            <section className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-500" />
                4. Real-World & Everyday Life Examples
              </h3>
              <div className="space-y-3">
                {notesData.everydayExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5"
                  >
                    <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                      <span className="text-amber-600 font-extrabold">Ex #{idx + 1}:</span>
                      {ex.title}
                    </h4>
                    <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">{ex.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Interactive Flashcard Revision Questions */}
            <section className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                5. Self-Testing Flashcard Questions
              </h3>
              <div className="space-y-3">
                {notesData.revisionQuestions.map((q, idx) => {
                  const isRevealed = !!revealedQuestions[idx];
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900">{q.question}</h4>
                        </div>
                        <button
                          onClick={() => toggleRevealQuestion(idx)}
                          className="print:hidden text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0 flex items-center gap-1"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Reveal Answer
                            </>
                          )}
                        </button>
                      </div>

                      {/* Answer Block */}
                      {(isRevealed || true /* always reveal in print */) && (
                        <div
                          className={`p-3 rounded-lg bg-purple-50/70 border border-purple-100 text-xs sm:text-sm text-purple-950 font-medium ${
                            !isRevealed ? 'hidden print:block' : 'block'
                          }`}
                        >
                          <span className="font-bold text-purple-700 block mb-1">Answer:</span>
                          {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 6. Master Study Tip */}
            {notesData.studyTip && (
              <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-4">
                <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Master Study Tip & Exam Advice
                  </h4>
                  <p className="text-sm text-amber-950 font-medium leading-relaxed">
                    {notesData.studyTip}
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Previously Saved Notes Drawer */}
      {savedNotes.length > 0 && !notesData && !isGenerating && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-600" /> Previously Created Revision Notes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedNotes.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setNotesData(item)}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>{item.subject}</span>
                  <span className="text-emerald-700">{item.academicLevel}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{item.topic}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
