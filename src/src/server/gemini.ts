import { GoogleGenAI } from '@google/genai';

// Read the key from environment variables
const apiKey = process.env.GEMINI_API_KEY?.trim();

// Throw a descriptive error at startup if the key is missing
if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY is missing. Please add it to your Vercel Environment Variables ' +
    'and ensure it is scoped to the Production environment.'
  );
}

// Initialize the new SDK client
export const ai = new GoogleGenAI({ apiKey });
