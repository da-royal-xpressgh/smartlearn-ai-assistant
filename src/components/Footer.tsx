import React from 'react';
import { AppView } from '../types';
import { GraduationCap, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start space-y-1.5 text-center md:text-left">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>SmartLearn AI</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300">
                v1.0.0
              </span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Empowering self-paced student learning through everyday analogies, interactive quizzes,
              and comprehensive revision notes.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-slate-300 font-medium">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('tutor')}
              className="hover:text-white transition-colors"
            >
              AI Tutor
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="hover:text-white transition-colors"
            >
              Practice Quizzes
            </button>
            <button
              onClick={() => onNavigate('notes')}
              className="hover:text-white transition-colors"
            >
              Study Notes
            </button>
            <button
              onClick={() => onNavigate('guide')}
              className="hover:text-white transition-colors text-sky-400"
            >
              Connect to GitHub Guide
            </button>
          </div>

          {/* Educational Note */}
          <div className="text-center md:text-right text-[11px] text-slate-500">
            <p>Designed for Primary, JHS, SHS & Tertiary students.</p>
            <p className="mt-1 flex items-center justify-center md:justify-end gap-1 text-slate-400">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for curious minds
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
