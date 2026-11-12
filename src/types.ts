export interface StudentProfile {
  name: string;
  university: string;
  degree: string;
  branch: string;
  semester: string;
  currentSubjects: string[];
  academicGoals: string;
}

export interface Attachment {
  name: string;
  type: string;
  mimeType: string;
  size: number;
  data: string; // base64 string without data:mime;base64, prefix
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  toolContext?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type StudyToolType = 
  | 'cgpa_calculator'
  | 'exam_answers'
  | 'study_timetable'
  | 'doc_analyzer'
  | 'mock_test'
  | 'career_roadmap';

export interface CGPACourse {
  id: string;
  name: string;
  credits: number;
  gradePoint: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string;
  subject: string;
  topic: string;
  type: 'concept' | 'revision' | 'practice' | 'project' | 'break' | 'mock_test';
  completed: boolean;
}

export interface MockTestQuestion {
  id: string;
  type: 'mcq' | 'short_answer' | 'long_answer';
  marks: number;
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
  rubric?: string;
  modelAnswer?: string;
  userAnswer?: string;
  evaluation?: {
    awardedMarks: number;
    maxMarks: number;
    grade: string;
    strengths: string[];
    missingPoints: string[];
    examinerFeedback: string;
    recommendedModelAnswer?: string;
  };
}

export interface MockTest {
  title: string;
  subject: string;
  totalMarks: number;
  estimatedMinutes: number;
  questions: MockTestQuestion[];
}
