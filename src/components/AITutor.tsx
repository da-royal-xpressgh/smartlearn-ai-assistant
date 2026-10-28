import React, { useState, useRef, useEffect } from 'react';
import { AcademicLevel, ChatMessage, SubjectOption } from '../types';
import { askAITutor } from '../services/api';
import { speechService } from '../utils/speech';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Loader2,
  BookMarked,
  Lightbulb,
} from 'lucide-react';

interface AITutorProps {
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
  initialTopic?: string;
  initialSubject?: string;
  onLaunchQuizForTopic: (topic: string, subject: string) => void;
  onLaunchNotesForTopic: (topic: string, subject: string) => void;
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

export const AITutor: React.FC<AITutorProps> = ({
  academicLevel,
  onLevelChange,
  initialTopic = '',
  initialSubject = 'Integrated Science',
  onLaunchQuizForTopic,
  onLaunchNotesForTopic,
  onRecordStudiedTopic,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'Integrated Science');
  const [currentTopic, setCurrentTopic] = useState<string>(initialTopic || '');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        content: `👋 Hello! I am your **SmartLearn AI Tutor**.\n\nI can help you understand challenging academic topics, break down formulas step-by-step, give everyday real-world analogies, or answer any question.\n\n**Current Level:** \`${academicLevel}\`\n**Current Subject:** \`${selectedSubject}\`\n\nWhat would you like to explore or solve today?`,
        timestamp: Date.now(),
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Synchronize when initialTopic prop changes
  useEffect(() => {
    if (initialTopic && initialTopic !== currentTopic) {
      setCurrentTopic(initialTopic);
      if (initialSubject) {
        setSelectedSubject(initialSubject);
      }
    }
  }, [initialTopic, initialSubject]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Save topic to history
    const effectiveTopic = currentTopic || prompt.slice(0, 45);
    onRecordStudiedTopic(effectiveTopic, selectedSubject);

    try {
      // Map messages for server
      const serverPayload = newMessages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const reply = await askAITutor(
        serverPayload,
        academicLevel,
        selectedSubject,
        currentTopic
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Unable to connect to AI Tutor. Please check your network or try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (speakingMessageId === id) {
      speechService.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      speechService.speak(text, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleResetChat = () => {
    speechService.stop();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Conversation restarted! You are studying **${selectedSubject}** at the **${academicLevel}** level. How can I help you?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const promptSuggestions = [
    '💡 Explain with an everyday analogy',
    '🪜 Break this down step-by-step',
    '🌍 Give 3 practical real-life examples',
    '⚠️ What are common mistakes students make?',
    '📝 Summarize the core takeaway in 3 points',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[550px] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      {/* Top Configuration Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subject:
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {ALL_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Level:
            </span>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs font-medium">
              {(['Primary', 'JHS', 'SHS', 'College'] as AcademicLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    academicLevel === lvl
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Topic Input */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Topic:
            </span>
            <input
              type="text"
              placeholder="e.g. Newton's 2nd Law"
              value={currentTopic}
              onChange={(e) => setCurrentTopic(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 w-44"
            />
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={handleResetChat}
          title="Restart Conversation"
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
        {messages.map((message) => {
          const isAI = message.role === 'model';
          return (
            <div
              key={message.id}
              className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                  isAI
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'bg-indigo-600 text-white shadow-indigo-100'
                }`}
              >
                {/* Content Rendering */}
                <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>

                {/* AI Action Toolbar */}
                {isAI && message.id !== 'welcome-msg' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      {/* Text to Speech Button */}
                      <button
                        onClick={() => handleToggleSpeak(message.id, message.content)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                          speakingMessageId === message.id
                            ? 'bg-indigo-100 text-indigo-700 font-semibold animate-pulse'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Listen to explanation"
                      >
                        {speakingMessageId === message.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" /> Stop Reading
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                          </>
                        )}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Cross-Feature Action Pills */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const topic = currentTopic || 'Topic from Tutor';
                          onLaunchQuizForTopic(topic, selectedSubject);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors font-medium"
                        title="Generate Quiz on this topic"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Practice Quiz
                      </button>

                      <button
                        onClick={() => {
                          const topic = currentTopic || 'Topic from Tutor';
                          onLaunchNotesForTopic(topic, selectedSubject);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
                        title="Generate Study Notes on this topic"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Study Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">SmartLearn AI</span> is formulating an
                explanation for <span className="font-semibold text-indigo-600">{academicLevel}</span> level...
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to get explanation</p>
              <p className="text-red-700 mt-0.5">{errorMessage}</p>
              <button
                onClick={() => handleSendMessage()}
                className="mt-2 text-xs font-semibold underline hover:text-red-900"
              >
                Click here to retry
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Follow-up Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap min-w-max">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Prompts:
          </span>
          {promptSuggestions.map((prompt) => (
            <button
              key={prompt}
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition-colors font-medium disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Composer */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question in ${selectedSubject} or ask for an explanation... (Press Enter to send)`}
            className="w-full resize-none rounded-xl border border-slate-300 p-3 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2.5 bottom-2.5 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Send Question"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>
            💡 SmartLearn AI breaks concepts into simple terms. Check your textbook or syllabus for regional exam specs.
          </span>
          <span className="hidden sm:inline">Press Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
