import { useState, useEffect, useRef } from 'react';
import { 
  ChatSession, 
  ChatMessage, 
  StudentProfile, 
  StudyToolType, 
  Attachment 
} from './types';
import { 
  loadStudentProfile, 
  saveStudentProfile, 
  loadChatSessions, 
  saveChatSessions, 
  loadActiveSessionId, 
  saveActiveSessionId 
} from './utils/storage';
import { streamChat } from './services/api';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import StudentProfileModal from './components/StudentProfileModal';

// Study Tools Modals
import CgpaCalculatorModal from './components/tools/CgpaCalculatorModal';
import ExamAnswerModal from './components/tools/ExamAnswerModal';
import TimetableModal from './components/tools/TimetableModal';
import DocumentAnalyzerModal from './components/tools/DocumentAnalyzerModal';
import MockTestModal from './components/tools/MockTestModal';
import CareerRoadmapModal from './components/tools/CareerRoadmapModal';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadChatSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = loadActiveSessionId();
    const all = loadChatSessions();
    if (saved && all.some((s) => s.id === saved)) {
      return saved;
    }
    return all[0]?.id || 'session-' + Date.now();
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => loadStudentProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFirstTimeProfile, setIsFirstTimeProfile] = useState(false);

  // Check if user has set up their profile before
  useEffect(() => {
    const hasConfigured = localStorage.getItem('universe_profile_configured');
    if (!hasConfigured) {
      setIsFirstTimeProfile(true);
      setIsProfileModalOpen(true);
    }
  }, []);

  const [activeToolModal, setActiveToolModal] = useState<StudyToolType | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // AI Generation State
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Current active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: activeSessionId,
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };

  // Sync sessions to localStorage
  const updateSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    saveChatSessions(newSessions);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    saveActiveSessionId(id);
    setStreamingText('');
    setIsLoading(false);
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    const updated = [newSession, ...sessions];
    updateSessions(updated);
    setActiveSessionId(newSession.id);
    saveActiveSessionId(newSession.id);
    setStreamingText('');
    setIsLoading(false);
    setActiveView('chat');
  };

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      const fresh: ChatSession = {
        id: 'session-' + Date.now(),
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      updateSessions([fresh]);
      setActiveSessionId(fresh.id);
      saveActiveSessionId(fresh.id);
    } else {
      updateSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
        saveActiveSessionId(filtered[0].id);
      }
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    updateSessions(updated);
  };

  const handleClearChat = () => {
    const updated = sessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s));
    updateSessions(updated);
    setStreamingText('');
    setIsLoading(false);
  };

  const handleSaveProfile = (updated: StudentProfile) => {
    setStudentProfile(updated);
    saveStudentProfile(updated);
    localStorage.setItem('universe_profile_configured', 'true');
    setIsFirstTimeProfile(false);
  };

  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;
    if (isLoading) return;

    // Switch view to chat if on dashboard
    setActiveView('chat');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      attachments,
    };

    // Calculate auto title if session is brand new
    let sessionTitle = activeSession.title;
    if (activeSession.messages.length === 0 && sessionTitle === 'New Conversation') {
      sessionTitle = content.trim().slice(0, 32) + (content.length > 32 ? '...' : '');
    }

    const updatedSessionMessages = [...activeSession.messages, userMessage];

    // Update session immediately with user message
    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId
        ? {
            ...s,
            title: sessionTitle,
            updatedAt: Date.now(),
            messages: updatedSessionMessages,
          }
        : s
    );
    updateSessions(updatedSessions);

    setIsLoading(true);
    setStreamingText('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build conversation payload for Gemini
      const conversationPayload = updatedSessionMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let accumulated = '';
      accumulated = await streamChat(
        conversationPayload,
        studentProfile,
        undefined,
        attachments,
        (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
        controller.signal
      );

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: accumulated || streamingText || 'I am here to help you excel in your academics.',
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedSessionMessages, assistantMessage];
      const finalizedSessions = sessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: Date.now(),
              messages: finalMessages,
            }
          : s
      );

      updateSessions(finalizedSessions);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted');
      } else {
        console.error('Chat error:', err);
        const errorMessage: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: `⚠️ **UniVerse Notice**: ${err.message || 'Unable to connect to AI server. Please check your network and Gemini API configuration.'}`,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedSessionMessages, errorMessage];
        const finalizedSessions = sessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: finalMessages }
            : s
        );
        updateSessions(finalizedSessions);
      }
    } finally {
      setIsLoading(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFF9F8] text-[#39313A] font-sans selection:bg-[#C58FA3]/20 selection:text-[#39313A]">
      {/* Left Pale Blush Pink Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          handleSelectSession(id);
          setActiveView('chat');
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        studentProfile={studentProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenTool={(tool) => setActiveToolModal(tool)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-[#FFF9F8]">
        {activeView === 'dashboard' ? (
          <Dashboard
            studentProfile={studentProfile}
            onOpenTool={(tool) => setActiveToolModal(tool)}
            onNavigateToChat={(prompt) => {
              setActiveView('chat');
              if (prompt) {
                handleSendMessage(prompt);
              }
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            recentSessions={sessions}
            onSelectSession={(id) => {
              handleSelectSession(id);
              setActiveView('chat');
            }}
          />
        ) : (
          <>
            <ChatWindow
              activeSession={activeSession}
              studentProfile={studentProfile}
              isLoading={isLoading}
              streamingText={streamingText}
              onSendPrompt={(prompt) => handleSendMessage(prompt)}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenTool={(tool) => setActiveToolModal(tool)}
              onClearChat={handleClearChat}
              onBackToDashboard={() => setActiveView('dashboard')}
            />

            {/* Floating Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            />
          </>
        )}
      </main>

      {/* Student Profile Setup Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={studentProfile}
        onSave={handleSaveProfile}
        isFirstTime={isFirstTimeProfile}
      />

      {/* Tool 1: CGPA & Target Calculator Modal */}
      <CgpaCalculatorModal
        isOpen={activeToolModal === 'cgpa_calculator'}
        onClose={() => setActiveToolModal(null)}
        studentProfile={studentProfile}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Tool 2: Exam Answers (2, 5, 10-Mark) Modal */}
      <ExamAnswerModal
        isOpen={activeToolModal === 'exam_answers'}
        onClose={() => setActiveToolModal(null)}
        studentProfile={studentProfile}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Tool 3: Smart Timetable Modal */}
      <TimetableModal
        isOpen={activeToolModal === 'study_timetable'}
        onClose={() => setActiveToolModal(null)}
        studentProfile={studentProfile}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Tool 4: Document & Notes Analyzer Modal */}
      <DocumentAnalyzerModal
        isOpen={activeToolModal === 'doc_analyzer'}
        onClose={() => setActiveToolModal(null)}
        studentProfile={studentProfile}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Tool 5: Mock Test & AI Examiner Modal */}
      <MockTestModal
        isOpen={activeToolModal === 'mock_test'}
        onClose={() => setActiveToolModal(null)}
        studentProfile={studentProfile}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Tool 6: Career & Internship Roadmap Modal */}
      <CareerRoadmapModal
        isOpen={activeToolModal === 'career_roadmap'}
        onClose={() => setActiveToolModal(null)}
        studentProfile={studentProfile}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />
    </div>
  );
}
