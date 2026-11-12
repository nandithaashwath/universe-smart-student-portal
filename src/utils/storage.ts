import { StudentProfile, ChatSession, CGPACourse, TimetableSlot } from '../types';

const PROFILE_KEY = 'universe_student_profile';
const SESSIONS_KEY = 'universe_chat_sessions';
const ACTIVE_SESSION_KEY = 'universe_active_session_id';
const CGPA_KEY = 'universe_cgpa_courses';
const TIMETABLE_KEY = 'universe_timetable_slots';

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Alex Chen',
  university: 'Dayananda Sagar University',
  degree: 'B.Tech',
  branch: 'Computer Science & Engineering',
  semester: '4th Semester',
  currentSubjects: [
    'Operating Systems',
    'Database Management Systems',
    'Design & Analysis of Algorithms',
    'Computer Networks',
    'Linear Algebra & Probability'
  ],
  academicGoals: 'Maintain 9.2+ CGPA, master DSA & System Design, and secure a top tier tech summer internship.',
};

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load profile from storage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveStudentProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to storage', e);
  }
}

export function loadChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load sessions from storage', e);
  }

  // Create default first session
  const initialSession: ChatSession = {
    id: 'session-' + Date.now(),
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  return [initialSession];
}

export function saveChatSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to storage', e);
  }
}

export function loadActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch (e) {
    return null;
  }
}

export function saveActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } catch (e) {
    console.error('Failed to save active session id', e);
  }
}

export function loadSavedCourses(): CGPACourse[] {
  try {
    const raw = localStorage.getItem(CGPA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { id: 'c1', name: 'Design & Analysis of Algorithms', credits: 4, gradePoint: 9 },
    { id: 'c2', name: 'Database Management Systems', credits: 4, gradePoint: 10 },
    { id: 'c3', name: 'Operating Systems', credits: 4, gradePoint: 8 },
    { id: 'c4', name: 'Computer Networks', credits: 3, gradePoint: 9 },
    { id: 'c5', name: 'DBMS & OS Lab', credits: 2, gradePoint: 10 },
  ];
}

export function saveCourses(courses: CGPACourse[]): void {
  try {
    localStorage.setItem(CGPA_KEY, JSON.stringify(courses));
  } catch (e) {}
}

export function loadTimetableSlots(): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { id: 't1', day: 'Monday', time: '07:00 - 08:30 AM', subject: 'Operating Systems', topic: 'Process Synchronization & Semaphores', type: 'concept', completed: true },
    { id: 't2', day: 'Monday', time: '05:30 - 07:00 PM', subject: 'Algorithms', topic: 'Dynamic Programming (0/1 Knapsack, LCS)', type: 'practice', completed: false },
    { id: 't3', day: 'Tuesday', time: '07:00 - 08:30 AM', subject: 'DBMS', topic: 'B+ Trees & Query Optimization', type: 'concept', completed: false },
    { id: 't4', day: 'Tuesday', time: '06:00 - 07:30 PM', subject: 'Computer Networks', topic: 'TCP Flow Control & Congestion Avoidance', type: 'revision', completed: false },
    { id: 't5', day: 'Wednesday', time: '07:00 - 08:30 AM', subject: 'Algorithms', topic: 'Graph Algorithms: Dijkstra & Bellman-Ford', type: 'practice', completed: false },
    { id: 't6', day: 'Thursday', time: '07:00 - 08:30 AM', subject: 'Operating Systems', topic: 'Virtual Memory & Page Replacement', type: 'concept', completed: false },
    { id: 't7', day: 'Friday', time: '05:00 - 07:00 PM', subject: 'Course Project', topic: 'Full Stack App Backend & DB Schema setup', type: 'project', completed: false },
    { id: 't8', day: 'Saturday', time: '10:00 - 12:00 PM', subject: 'All Subjects', topic: 'Weekly Mock Test Simulation & Error Analysis', type: 'mock_test', completed: false },
    { id: 't9', day: 'Sunday', time: '09:00 - 10:30 AM', subject: 'All Subjects', topic: 'Spaced Repetition & Weekly Schedule Re-calibration', type: 'revision', completed: false },
  ];
}

export function saveTimetableSlots(slots: TimetableSlot[]): void {
  try {
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(slots));
  } catch (e) {}
}
