import React, { useState } from 'react';
import { AcademicLevel, AppView } from '../types';
import {
  GraduationCap,
  MessageSquare,
  HelpCircle,
  BookOpen,
  LayoutDashboard,
  Info,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  academicLevel,
  onLevelChange,
  hasApiKey,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const levels: AcademicLevel[] = ['Primary', 'JHS', 'SHS', 'College'];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz Generator', icon: HelpCircle },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'guide', label: 'Student Guide & GitHub', icon: Info },
  ] as const;

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-900 to-slate-800 bg-clip-text text-transparent">
                  SmartLearn
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI-Powered Learning Assistant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Academic Level & Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <span className="px-2 text-slate-500">Level:</span>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  title={`Target Level: ${lvl}`}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    academicLevel === lvl
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={hasApiKey ? 'Gemini AI connected' : 'Connecting to AI...'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden xl:inline">{hasApiKey ? 'Gemini 3.8 Ready' : 'AI Connecting'}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* Level Switcher on Mobile */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Academic Level
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`py-1.5 text-xs font-semibold rounded-lg text-center ${
                    academicLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
