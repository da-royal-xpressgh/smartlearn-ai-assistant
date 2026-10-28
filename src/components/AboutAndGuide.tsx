import React, { useState } from 'react';
import {
  Github,
  Terminal,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const AboutAndGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `# 1. Download or clone this project to your computer
# 2. Open terminal in the project directory:
cd smartlearn-ai

# 3. Initialize Git version control
git init

# 4. Add all files to staging (safe: .env is automatically ignored by .gitignore)
git add .

# 5. Commit your files
git commit -m "Initial commit: SmartLearn AI — AI-Powered Learning Assistant"

# 6. Set main branch
git branch -M main

# 7. Add your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/smartlearn-ai.git

# 8. Push to GitHub!
git push -u origin main`;

  const envSetupCommands = `# Create your local environment file from example
cp .env.example .env

# Open .env and add your Google Gemini API key:
# GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
# APP_URL="http://localhost:3000"

# Install dependencies
npm install

# Run full-stack dev server
npm run dev`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sky-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-300">
            About SmartLearn AI & Developer Guide
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          SmartLearn AI — AI-Powered Learning Assistant
        </h1>
        <p className="text-indigo-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          An educational platform engineered to make complex concepts intuitive for students.
          Equipped with an interactive AI Tutor, adaptive Practice Quiz Generator, and comprehensive
          Study Notes creator.
        </p>
      </div>

      {/* 4 Pillars of SmartLearn AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <h3>Everyday Relatable Analogies</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Abstract formulas and definitions are grounded in relatable real-world metaphors (cooking,
            sports, smartphones, marketplaces) to make learning memorable and intuitive.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            <h3>Multi-Level Syllabus Adaptation</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Easily toggle between <strong>Primary</strong> (ages 6–11), <strong>JHS</strong> (ages
            12–15), <strong>SHS</strong> (ages 15–18, WASSCE/GCSE/AP prep), and{' '}
            <strong>College / Tertiary</strong> depth.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <h3>Active Recall & Revision Notes</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Generate printable, structured revision sheets with plain-language definitions, checkable
            takeaway points, and interactive flashcard questions.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <h3>Secure Server-Side AI</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Private API keys are strictly guarded inside the Node.js Express backend proxy and never
            sent to client browsers or exposed in public Git repositories.
          </p>
        </div>
      </div>

      {/* GitHub Connecting & Exporting Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                How to Export & Connect to GitHub
              </h2>
              <p className="text-xs text-slate-500">
                Step-by-step instructions to push this project to your personal GitHub repository.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1 to 4 Instructions */}
        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Download or Export the Code</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                From the Google AI Studio interface, click the <strong>Export / Download Project</strong>{' '}
                icon or use the download option to save the project folder onto your local computer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Create a New GitHub Repository</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Visit <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700">github.com</code>{' '}
                and click <strong>New Repository</strong>. Name it{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700">smartlearn-ai</code>.
                Leave &quot;Initialize with README&quot; unchecked since this project already has a
                complete README.md and .gitignore.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Run the Git Commands</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Open your terminal, navigate to the folder, and run the following commands:
              </p>
            </div>
          </div>
        </div>

        {/* Copyable Terminal Block */}
        <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Terminal (Bash)</span>
            </div>
            <button
              onClick={() => copyToClipboard(gitCommands, 'git')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition-colors"
            >
              {copiedSection === 'git' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Commands
                </>
              )}
            </button>
          </div>
          <pre className="whitespace-pre">{gitCommands}</pre>
        </div>

        {/* Security & Secrets Note */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">Security Guarantee: </span>
            The <code className="bg-emerald-100 px-1 py-0.5 rounded">.gitignore</code> file is
            pre-configured to prevent any <code className="bg-emerald-100 px-1 py-0.5 rounded">.env</code>{' '}
            secrets from ever being committed to GitHub. Your repository is 100% safe to share publicly.
          </div>
        </div>
      </div>

      {/* Vercel Deployment Instructions */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" /> Deploying to Vercel
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          SmartLearn AI is configured to run seamlessly both in Google AI Studio / local Node (as a persistent server) and on <strong>Vercel</strong> (as serverless API functions via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/index.ts</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">vercel.json</code>).
        </p>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">1. Add Environment Variable in Vercel</span>
            <p className="text-slate-600 text-xs">
              Open your project on <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">vercel.com</a> &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.
            </p>
            <p className="text-slate-800 text-xs font-mono bg-white p-2 rounded border border-slate-200 mt-1">
              Key: <span className="font-bold text-indigo-700">GEMINI_API_KEY</span><br />
              Value: <span className="text-slate-500">[Paste your API key from Google AI Studio]</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">2. Push the Latest Code to GitHub</span>
            <p className="text-slate-600 text-xs">
              Commit the new <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">vercel.json</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">api/index.ts</code> files to your repository:
            </p>
            <p className="text-slate-800 text-xs font-mono bg-slate-900 text-slate-100 p-2.5 rounded mt-1">
              git add . && git commit -m &quot;feat: add vercel serverless support&quot; && git push
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">3. Redeploy</span>
            <p className="text-slate-600 text-xs">
              Vercel will automatically build the frontend and deploy the serverless functions under <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/api/*</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Local Development & Setup */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" /> Local Setup & Running Instructions
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          When running SmartLearn AI locally on your machine, follow these simple setup steps:
        </p>

        <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Local Environment Setup</span>
            </span>
            <button
              onClick={() => copyToClipboard(envSetupCommands, 'env')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition-colors"
            >
              {copiedSection === 'env' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Commands
                </>
              )}
            </button>
          </div>
          <pre className="whitespace-pre">{envSetupCommands}</pre>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900">Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block">Frontend</span>
            <span className="text-slate-500">React 19 + TypeScript + Vite</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block">Styling</span>
            <span className="text-slate-500">Tailwind CSS v4</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block">AI Engine</span>
            <span className="text-slate-500">Google Gemini 3.8 Flash via @google/genai</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block">Backend</span>
            <span className="text-slate-500">Node.js + Express Proxy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
