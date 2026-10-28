# SmartLearn AI — AI-Powered Learning Assistant 🎓

SmartLearn AI is an educational web application designed to help students master academic concepts through simple explanations, everyday analogies, interactive multiple-choice practice quizzes, and structured study revision notes.

Whether preparing for Junior High School (JHS), Senior High School (SHS / WASSCE / GCSE), College, or Primary curricula, SmartLearn AI adapts its tone, rigor, and depth to match each student's learning stage.

---

## 🌟 Key Features

### 1. 🤖 AI Tutor with Everyday Analogies
- **Conversational Academic Help:** Ask questions in Mathematics, Integrated Science, Physics, Chemistry, Biology, Economics, ICT, History, and more.
- **Relatable Analogies:** Abstract formulas and concepts are explained using everyday scenarios (e.g. cooking recipes, football matches, smartphones, markets).
- **Step-by-Step Guidance:** Math and science problems broken down into clear, numbered logical steps.
- **Audio Read-Aloud:** Integrated Web Speech API enables students to listen to explanations read aloud at an educational pace.
- **Curriculum Levels:** Instant switching between **Primary**, **JHS**, **SHS**, and **College** modes.
- **Follow-up Suggestions:** Quick prompt chips like *"Explain with an everyday analogy"*, *"Break down step-by-step"*, and *"Common exam mistakes"*.

### 2. 📝 Practice Quiz Generator
- **Custom Multiple-Choice Quizzes:** Choose any subject, enter a topic, and pick between 3 to 10 questions.
- **Instant Interactive Taking:** Responsive option cards, timer, progress bar, and review mode.
- **Comprehensive Score Analysis:** Detailed score percentages, celebration animations, and question-by-question breakdowns.
- **Educational Explanations:** Explains *why* the right answer is correct and clarifies common student misconceptions about the distractors.
- **Tutor Handoff:** Click *"Ask AI Tutor about this question"* on any missed problem to immediately get a deeper explanation.

### 3. 📚 Study & Revision Notes Creator
- **Executive Concept Summaries:** Concise, engaging introductions to the topic.
- **Interactive Checkable Takeaways:** Check off key concepts as you master them during revision.
- **Vocabulary & Definitions:** Both formal academic definitions and plain-language *"Everyday Meanings"*.
- **Real-World Examples:** Concrete applications showing where the concept occurs in everyday life.
- **Interactive Flashcards:** Self-testing revision questions with toggleable answers.
- **Print & PDF Support:** One-click clean printing or saving to PDF for offline study.

### 4. 📊 Student Learning Dashboard
- **Personalized Welcome:** Customizable student greeting saved locally in your browser.
- **Session Progress Tracking:** Tracks topics explored, quizzes completed, and average score.
- **Curated Subject Explorer:** Instant launch pads into foundational STEM and Humanities topics.
- **History & Review:** Revisit past quiz results and previously generated study notes anytime.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **AI Integration** | [Google Gen AI TypeScript SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) |
| **AI Model** | Google Gemini `gemini-3.8-flash` |
| **Backend Proxy** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx) |
| **Client Storage** | Browser `localStorage` (No account creation or database required for v1) |
| **Celebrations** | `canvas-confetti` |

---

## 🔒 Security & Environment Architecture

SmartLearn AI follows best practices for full-stack security:
- **Server-Side AI Proxy:** Gemini API calls are executed strictly on the Node.js/Express server (`/server.ts`).
- **No Client Exposure:** The private `GEMINI_API_KEY` is **never** sent to the client browser or bundled in frontend assets.
- **Git Ignored Secrets:** The `.gitignore` file excludes `.env*` files (while preserving `.env.example`), ensuring API credentials are never accidentally committed to GitHub.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm (Node Package Manager)
- A Google Gemini API Key (obtainable from [Google AI Studio](https://aistudio.google.com/))

### Installation Steps

1. **Clone or Download the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smartlearn-ai.git
   cd smartlearn-ai
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory by copying the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Open `.env` in your text editor and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application in your browser:**
   Navigate to `http://localhost:3000`.

---

## 📦 How to Export from Google AI Studio & Push to GitHub

If you are developing this in Google AI Studio and want to connect it to your personal GitHub account:

### Step 1: Export or Download Code
In Google AI Studio, use the **Export / Download** button to download the workspace folder to your computer.

### Step 2: Create a New GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click **New Repository**.
3. Name your repository (e.g., `smartlearn-ai`).
4. Set visibility to **Public** or **Private**.
5. **Do NOT** initialize with a README, .gitignore, or license (these already exist in this project).
6. Click **Create repository**.

### Step 3: Push to GitHub from Terminal
Open your computer's terminal, navigate to the unzipped project folder, and run:

```bash
# 1. Initialize git in the project root
git init

# 2. Stage all files (sensitive .env files are automatically excluded by .gitignore)
git add .

# 3. Create your initial commit
git commit -m "feat: initial commit of SmartLearn AI learning assistant"

# 4. Set the default branch name to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/smartlearn-ai.git

# 6. Push code to GitHub
git push -u origin main
```

Your code will now be visible on GitHub with clean commits, structured files, and no exposed credentials.

---

## ⚡ Deploying to Vercel

SmartLearn AI is designed as a hybrid architecture: it functions as a long-running Express server in Google AI Studio / local Node, and as serverless functions on Vercel via `/api/index.ts` and `vercel.json`.

### Step 1: Configure Environment Variables in Vercel
In your Vercel Project Dashboard:
1. Go to **Settings** &rarr; **Environment Variables**.
2. Add a new variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/)).
   - **Environments:** Check **Production**, **Preview**, and **Development**.
3. Click **Save**.

### Step 2: Push the Vercel Files to GitHub
Ensure the new `vercel.json` and `api/index.ts` files are committed and pushed:
```bash
git add .
git commit -m "feat: configure Vercel serverless functions and routing"
git push origin main
```

### Step 3: Trigger a Redeploy
If a deployment was already created before setting environment variables, click **Redeploy** (with *Use existing Build Cache* **unchecked**) in the Vercel dashboard.

---

## 🧪 Testing & Verification

To verify the project is working properly:
1. **Health Check:** Open `http://localhost:3000/api/health` to confirm the Express backend and Gemini status.
2. **AI Tutor:** Navigate to the **AI Tutor** tab, select a level (e.g. *JHS* or *SHS*), and ask a question such as *"Explain photosynthesis using an everyday analogy"*. Verify that the response includes clear sections and analogies.
3. **Quiz Generator:** Open **Quiz Generator**, enter a topic like *"Acids and Bases"*, select 5 questions, and click **Generate Practice Quiz**. Answer the questions, click **Submit**, and verify scoring and detailed explanations.
4. **Study Notes:** Open **Study Notes**, enter *"Plate Tectonics"*, and click **Generate Notes**. Verify that summaries, key points, definitions, everyday examples, and flashcard questions appear.
5. **Compilation Check:** Run `npm run lint` or `npm run build` to confirm zero TypeScript compilation errors.

---

## 📄 License
This project is open-source and educational under the Apache 2.0 License.
