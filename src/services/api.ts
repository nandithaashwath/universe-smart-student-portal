import { StudentProfile, Attachment, MockTest } from '../types';

export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  studentProfile: StudentProfile,
  toolContext?: string,
  attachments?: Attachment[],
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      studentProfile,
      toolContext,
      attachments,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream not supported by browser.');
  }

  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      const line = block.trim();
      if (!line.startsWith('data: ')) continue;
      const dataStr = line.replace('data: ', '').trim();

      if (dataStr === '[DONE]') {
        return accumulatedText;
      }

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.text) {
          accumulatedText += parsed.text;
          onChunk?.(parsed.text);
        }
      } catch (err) {
        // If not valid json or stream aborted, handle gracefully
        if (err instanceof Error && err.message !== dataStr) {
          console.warn('Stream parse error:', err);
        }
      }
    }
  }

  return accumulatedText;
}

export async function analyzeDocument(params: {
  documentBase64: string;
  mimeType: string;
  fileName: string;
  analysisType: 'summary' | 'exam_questions' | 'flashcards';
  studentProfile: StudentProfile;
}): Promise<{ fileName: string; analysisType: string; result: string }> {
  const response = await fetch('/api/analyze-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze document');
  }

  return response.json();
}

export async function generateExamAnswer(params: {
  subject: string;
  topic: string;
  marks: 2 | 5 | 8 | 10;
  university?: string;
  studentProfile: StudentProfile;
}): Promise<string> {
  const response = await fetch('/api/exam-answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate exam answer');
  }

  const data = await response.json();
  return data.answer;
}

export async function generateMockTest(params: {
  subject: string;
  topic: string;
  difficulty?: string;
  studentProfile: StudentProfile;
}): Promise<MockTest> {
  const response = await fetch('/api/generate-mock-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate mock test');
  }

  return response.json();
}

export async function evaluateAnswer(params: {
  question: string;
  maxMarks: number;
  studentAnswer: string;
  rubric?: string;
  subject?: string;
}): Promise<{
  awardedMarks: number;
  maxMarks: number;
  grade: string;
  strengths: string[];
  missingPoints: string[];
  examinerFeedback: string;
  recommendedModelAnswer?: string;
}> {
  const response = await fetch('/api/evaluate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to evaluate answer');
  }

  return response.json();
}
