import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();

// Body parsing with safe size limit
app.use(express.json({ limit: "1mb" }));

// Robust CORS headers for cross-domain / serverless execution
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Handle Vercel rewrite cases where req.url was rewritten to /api or /
  const matchedPath =
    (req.headers["x-matched-path"] as string) ||
    (req.headers["x-vercel-matched-path"] as string) ||
    (req.headers["x-forwarded-uri"] as string);

  if (matchedPath && (req.url === "/api" || req.url === "/api/" || req.url === "/")) {
    req.url = matchedPath;
  }

  next();
});

// Safely sanitize the Gemini API key (trims leading/trailing whitespace and surrounding quotation marks)
export function getCleanApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || "";
  return rawKey.trim().replace(/^["']|["']$/g, "").trim();
}

// Initialize the GoogleGenAI client dynamically with sanitized credentials
export function getGenAI() {
  const apiKey = getCleanApiKey();
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "smartlearn-ai",
      },
    },
  });
}

// Safe error sanitizer to ensure sensitive secrets are never logged
function sanitizeError(err: any): { message: string; status?: number; name?: string } {
  const rawMsg = err?.message || String(err);
  const sanitizedMsg = rawMsg.replace(/key=[^&\s"']+/gi, "key=[REDACTED]");
  return {
    message: sanitizedMsg,
    status: err?.status,
    name: err?.name,
  };
}

// Resilient AI content generator with multi-model fallback and backoff retry
export async function generateContentWithFallback(options: {
  contents: any;
  config?: any;
}) {
  const ai = getGenAI();

  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
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
        const isQuota =
          errMsg.includes("Quota exceeded") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("429");
        const is503 =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand");

        console.warn(
          `[SmartLearn AI] Model ${model} attempt ${attempt} warning:`,
          sanitizeError(err)
        );

        // If quota is exhausted on this model, fail-over immediately to next candidate
        if (isQuota) {
          break;
        }

        if (is503 && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        } else {
          break;
        }
      }
    }
  }

  const finalMsg = lastError?.message || "AI service is currently busy.";
  let userFriendlyMsg = finalMsg;
  try {
    const parsed = JSON.parse(finalMsg);
    if (parsed?.error?.message) {
      userFriendlyMsg = parsed.error.message;
    }
  } catch {
    // Keep raw string if not JSON
  }

  throw new Error(userFriendlyMsg);
}

// Root /api endpoint for discovery and ping
app.get(["/api", "/api/"], (_req, res) => {
  const apiKey = getCleanApiKey();
  res.json({
    status: "ok",
    appName: "SmartLearn AI API",
    hasApiKey: apiKey.length > 0,
    version: "1.0.0",
  });
});

// Health check endpoint
app.get(["/api/health", "/api/health/", "/health", "/health/"], (_req, res) => {
  const apiKey = getCleanApiKey();
  res.json({
    status: "ok",
    hasApiKey: apiKey.length > 0,
    appName: "SmartLearn AI",
    version: "1.0.0",
    environment: process.env.VERCEL ? "vercel-serverless" : "standalone-server",
  });
});

// AI Tutor chat endpoint
app.post(
  ["/api/tutor/chat", "/api/tutor/chat/", "/tutor/chat", "/tutor/chat/"],
  async (req, res) => {
    try {
      const { messages, academicLevel = "SHS", subject = "General", topic = "" } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required and cannot be empty." });
      }

      const apiKey = getCleanApiKey();
      if (!apiKey) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in your Vercel Project Settings > Environment Variables.",
        });
      }

      const levelDescriptions: Record<string, string> = {
        Primary:
          "Primary / Elementary School student (ages 6-11). Use warm, simple words, short sentences, and fun real-world illustrations.",
        JHS: "Junior High School / Lower Secondary student (ages 12-15). Focus on foundational clarity, clear explanations, intuitive analogies, and breaking down complex jargon.",
        SHS: "Senior High School / Upper Secondary student (ages 15-18). Maintain syllabus rigor (e.g. WASSCE, GCSE, AP prep), clear step-by-step problem-solving, and practical applications.",
        College:
          "College / Tertiary / University student. Emphasize analytical depth, theoretical context, real-world case studies, and critical thinking.",
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
6. Encouraging Wrap-up: Always conclude with an encouraging question or mini-check to test understanding.`;

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

      const reply =
        response.text || "I apologize, I could not generate an answer right now. Please try asking again.";
      res.json({ reply });
    } catch (error: any) {
      console.error("[SmartLearn AI Diagnostic] AI Tutor error:", sanitizeError(error));
      const msg = error?.message || "Failed to process question with AI Tutor.";
      res.status(500).json({ error: msg });
    }
  }
);

// Quiz Generator endpoint
app.post(
  ["/api/quiz/generate", "/api/quiz/generate/", "/quiz/generate", "/quiz/generate/"],
  async (req, res) => {
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

      const apiKey = getCleanApiKey();
      if (!apiKey) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in your Vercel Project Settings > Environment Variables.",
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
          systemInstruction:
            "You are an expert exam question creator and curriculum specialist creating targeted educational practice tests.",
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
                      description:
                        "Comprehensive explanation of why the answer is correct and why other options are false",
                    },
                    studyTip: {
                      type: Type.STRING,
                      description: "Memory trick, formula reminder, or core rule to remember",
                    },
                  },
                  required: [
                    "id",
                    "question",
                    "options",
                    "correctAnswerIndex",
                    "explanation",
                    "studyTip",
                  ],
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
      console.error("[SmartLearn AI Diagnostic] Quiz Generator error:", sanitizeError(error));
      const msg = error?.message || "Failed to generate quiz. Please try again with another topic.";
      res.status(500).json({ error: msg });
    }
  }
);

// Study Notes Generator endpoint
app.post(
  ["/api/notes/generate", "/api/notes/generate/", "/notes/generate", "/notes/generate/"],
  async (req, res) => {
    try {
      const {
        subject = "General Science",
        topic,
        academicLevel = "SHS",
      } = req.body;

      if (!topic || typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "A specific topic is required to generate study notes." });
      }

      const apiKey = getCleanApiKey();
      if (!apiKey) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in your Vercel Project Settings > Environment Variables.",
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
          systemInstruction:
            "You are an award-winning textbook author and master teacher summarizing core academic concepts for students.",
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
      console.error("[SmartLearn AI Diagnostic] Study Notes error:", sanitizeError(error));
      const msg = error?.message || "Failed to generate study notes.";
      res.status(500).json({ error: msg });
    }
  }
);

export default app;
