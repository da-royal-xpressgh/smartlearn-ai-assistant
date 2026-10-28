import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: "SmartLearn AI",
    version: "1.0.0",
  });
});

// Resilient content generator with automatic model fallback and exponential backoff retry
async function generateContentWithFallback(options: {
  contents: any;
  config?: any;
}) {
  // Priority order: gemini-3.5-flash is ultra-reliable and fast, followed by 3.6, 3.8 and flash-latest
  const candidateModels = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Try up to 2 attempts per model with exponential backoff on 503/429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTemporary = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("429");

        console.warn(`[SmartLearn AI] Model ${model} attempt ${attempt} failed: ${errMsg.slice(0, 160)}`);

        if (isTemporary && attempt < 2) {
          // Exponential backoff delay (800ms, then retry)
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        } else {
          // Move to next candidate model
          break;
        }
      }
    }
  }

  // If all candidate models failed, format a clear, student-friendly explanation
  const finalMsg = lastError?.message || "AI service is currently busy.";
  let userFriendlyMsg = finalMsg;
  try {
    const parsed = JSON.parse(finalMsg);
    if (parsed?.error?.message) {
      userFriendlyMsg = parsed.error.message;
    }
  } catch {
    // Keep as string
  }

  throw new Error(userFriendlyMsg);
}

// AI Tutor chat endpoint (supports both standard and trailing-slash paths)
app.post(["/api/tutor/chat", "/api/tutor/chat/"], async (req, res) => {
  try {
    const { messages, academicLevel = "SHS", subject = "General", topic = "" } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required and cannot be empty." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please ensure GEMINI_API_KEY is provided in the environment.",
      });
    }

    const levelDescriptions: Record<string, string> = {
      Primary: "Primary / Elementary School student (ages 6-11). Use warm, simple words, short sentences, and fun real-world illustrations.",
      JHS: "Junior High School / Lower Secondary student (ages 12-15). Focus on foundational clarity, clear explanations, intuitive analogies, and breaking down complex jargon.",
      SHS: "Senior High School / Upper Secondary student (ages 15-18). Maintain syllabus rigor (e.g. WASSCE, GCSE, AP prep), clear step-by-step problem-solving, and practical applications.",
      College: "College / Tertiary / University student. Emphasize analytical depth, theoretical context, real-world case studies, and critical thinking.",
    };

    const levelGuide = levelDescriptions[academicLevel] || levelDescriptions["SHS"];

    const systemInstruction = `You are SmartLearn AI, a supportive, highly knowledgeable, and student-centered educational AI tutor.
Academic Level: ${academicLevel} (${levelGuide})
Active Subject: ${subject || "General Academic"}
${topic ? `Topic Focus: ${topic}` : ""}

Pedagogical Directives:
1. Simplicity & Clarity: Break complex ideas into bite-sized, digestible explanations.
2. Everyday Analogies: Ground abstract concepts in relatable real-life analogies (sports, food, household items, nature, technology, daily life).
3. Step-by-Step Problem Solving: For math, science, or analytical questions, provide numbered, transparent steps and explain the "why" behind each formula or step.
4. Engaging Formatting: Use markdown (headers, bullet points, bold key terms) to make responses scannable and reader-friendly.
5. Accuracy & Verification: Present facts truthfully. If a concept has variations across regional exam boards (e.g., WAEC, Cambridge, College Board), gently remind the student to cross-check with their school syllabus.
6. Encouraging Wrap-up: Always conclude with an encouraging question or mini-check to test understanding (e.g., asking if they want to try a quick test question or explore an example).`;

    // Format conversation history for Gemini API
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await generateContentWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, I could not generate an answer right now. Please try asking again.";
    res.json({ reply });
  } catch (error: any) {
    console.error("AI Tutor error:", error);
    const msg = error?.message || "Failed to process question with AI Tutor.";
    res.status(500).json({ error: msg });
  }
});

// Quiz Generator endpoint (supports both standard and trailing-slash paths)
app.post(["/api/quiz/generate", "/api/quiz/generate/"], async (req, res) => {
  try {
    const {
      subject = "General Science",
      topic,
      academicLevel = "SHS",
      numQuestions = 5,
    } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "A specific topic is required to generate a quiz." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please ensure GEMINI_API_KEY is provided in the environment.",
      });
    }

    const count = Math.min(Math.max(parseInt(String(numQuestions), 10) || 5, 1), 10);

    const prompt = `Generate a high quality practice quiz for students on the topic: "${topic}" in the subject "${subject}".
Target Academic Level: ${academicLevel}.
Generate exactly ${count} multiple-choice questions.

Requirements for each question:
- Clear, unambiguous question stem aligned with the ${academicLevel} syllabus.
- Exactly 4 options.
- One unambiguously correct option (correctAnswerIndex: 0, 1, 2, or 3).
- Detailed explanation explaining both why the correct answer is true, and clarifying common student misconceptions about the distractors.
- A concise 'studyTip' offering a mnemonic or memory aid.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "You are an expert exam question creator and curriculum specialist creating targeted educational practice tests.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            academicLevel: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options (A, B, C, D)",
                  },
                  correctAnswerIndex: {
                    type: Type.INTEGER,
                    description: "Index 0 to 3 of correct answer",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Comprehensive explanation of why the answer is correct and why other options are false",
                  },
                  studyTip: {
                    type: Type.STRING,
                    description: "Memory trick, formula reminder, or core rule to remember",
                  },
                },
                required: ["id", "question", "options", "correctAnswerIndex", "explanation", "studyTip"],
              },
            },
          },
          required: ["topic", "subject", "academicLevel", "questions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Quiz Generator error:", error);
    const msg = error?.message || "Failed to generate quiz. Please try again with another topic.";
    res.status(500).json({ error: msg });
  }
});

// Study Notes Generator endpoint (supports both standard and trailing-slash paths)
app.post(["/api/notes/generate", "/api/notes/generate/"], async (req, res) => {
  try {
    const {
      subject = "General Science",
      topic,
      academicLevel = "SHS",
    } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "A specific topic is required to generate study notes." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please ensure GEMINI_API_KEY is provided in the environment.",
      });
    }

    const prompt = `Create comprehensive, student-friendly Study & Revision Notes for the topic "${topic}" in "${subject}".
Academic Level: ${academicLevel}.

Content must include:
1. A clear, inspiring summary (2-3 paragraphs) introducing the concept and its importance.
2. 5-7 key conceptual points and examination facts.
3. 3-5 definitions of important terms, with both a formal definition and a 'simpleMeaning' (in plain everyday language).
4. 2-3 practical everyday life examples showing where this concept is observed in the real world.
5. 4-5 quick revision check questions with sample answers for self-testing.
6. A memorable study tip or mnemonic.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "You are an award-winning textbook author and master teacher summarizing core academic concepts for students.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            academicLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  formalDefinition: { type: Type.STRING },
                  simpleMeaning: { type: Type.STRING },
                },
                required: ["term", "formalDefinition", "simpleMeaning"],
              },
            },
            everydayExamples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["title", "description"],
              },
            },
            revisionQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ["question", "answer"],
              },
            },
            studyTip: { type: Type.STRING },
          },
          required: [
            "topic",
            "subject",
            "academicLevel",
            "summary",
            "keyPoints",
            "definitions",
            "everydayExamples",
            "revisionQuestions",
            "studyTip",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Study Notes error:", error);
    const msg = error?.message || "Failed to generate study notes.";
    res.status(500).json({ error: msg });
  }
});

// Vite middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SmartLearn AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
