import { AcademicLevel, QuizData, StudyNotesData } from '../types';

export interface ChatMessagePayload {
  role: 'user' | 'model';
  content: string;
}

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (error) {
    return { status: 'offline', hasApiKey: false };
  }
}

export async function askAITutor(
  messages: ChatMessagePayload[],
  academicLevel: AcademicLevel,
  subject: string,
  topic?: string
): Promise<string> {
  const response = await fetch('/api/tutor/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      academicLevel,
      subject,
      topic,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error || `Server responded with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data?.reply || 'No response generated.';
}

export async function generateQuizAPI(
  subject: string,
  topic: string,
  academicLevel: AcademicLevel,
  numQuestions: number
): Promise<QuizData> {
  const response = await fetch('/api/quiz/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      topic,
      academicLevel,
      numQuestions,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error || `Failed to generate quiz (status ${response.status})`;
    throw new Error(errorMessage);
  }

  if (!data?.questions || !Array.isArray(data.questions)) {
    throw new Error('Received malformed quiz data from server. Please try again.');
  }

  return data as QuizData;
}

export async function generateStudyNotesAPI(
  subject: string,
  topic: string,
  academicLevel: AcademicLevel
): Promise<StudyNotesData> {
  const response = await fetch('/api/notes/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      topic,
      academicLevel,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error || `Failed to generate study notes (status ${response.status})`;
    throw new Error(errorMessage);
  }

  if (!data?.summary || !data?.keyPoints) {
    throw new Error('Received incomplete study notes from server. Please try again.');
  }

  return data as StudyNotesData;
}
