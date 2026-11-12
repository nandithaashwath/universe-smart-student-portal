import { useState, useEffect, useRef } from 'react';
import { ChatSession, StudentProfile, StudyToolType } from '../types';
import { 
  Menu, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar, 
  Calculator, 
  Briefcase, 
  FileText, 
  RotateCcw,
  User,
  Bot,
  LayoutDashboard,
  ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import UniVerseLogo from './UniVerseLogo';

interface Props {
  activeSession: ChatSession;
  studentProfile: StudentProfile;
  isLoading: boolean;
  streamingText: string;
  onSendPrompt: (promptText: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenProfile: () => void;
  onOpenTool: (tool: StudyToolType) => void;
  onClearChat: () => void;
  onBackToDashboard?: () => void;
}

export default function ChatWindow({
  activeSession,
  studentProfile,
  isLoading,
  streamingText,
  onSendPrompt,
  onOpenMobileSidebar,
  onOpenProfile,
  onOpenTool,
  onClearChat,
  onBackToDashboard,
}: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeSession.messages;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isLoading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeech = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanedText = text
        .replace(/[*#`_~]/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const suggestedCards = [
    {
      title: 'Exam Preparation',
      desc: '2, 5, 8 & 10-mark model answers with textbook definitions, diagrams, and worked examples.',
      prompt: `Generate an academically rigorous 5-mark university exam answer for a key topic in ${studentProfile.currentSubjects[0] || 'Operating Systems'} with textbook definitions, clear diagrams/tables, and a worked example.`,
      icon: Award,
      badge: 'Strict Accuracy',
    },
    {
      title: 'Concept Explanation',
      desc: 'Break down complex academic theories using simple, real-world analogies (ELi5).',
      prompt: `Explain a foundational concept from ${studentProfile.currentSubjects[1] || 'Database Management Systems'} using simple intuitive everyday analogies, followed by technical depth and formulas.`,
      icon: BookOpen,
      badge: 'Simple Terms',
    },
    {
      title: 'Smart Study Planning',
      desc: '7-day personalized timetable with 50/10 study breaks, active recall, and weekend mock tests.',
      prompt: `Create a realistic 7-day study timetable for my ${studentProfile.semester} subjects: ${studentProfile.currentSubjects.join(', ')}. I have 3 hours daily, prioritize ${studentProfile.currentSubjects[0] || 'my toughest subject'}, and include 50/10 study breaks, active recall, and weekend mock tests.`,
      icon: Calendar,
      badge: '7-Day Plan',
    },
    {
      title: 'CGPA Strategy',
      desc: 'Simulate target marks and internal assessment scores needed for high honors.',
      prompt: `My target is to achieve a 9.2+ CGPA at ${studentProfile.university} in ${studentProfile.semester}. What is the exact strategy and marks required in internal tests vs end-sem exams for my subjects?`,
      icon: Calculator,
      badge: 'Target SGPA',
    },
    {
      title: 'Assignment & Projects',
      desc: 'Architecture design, theoretical justifications, logic breakdowns, and clean code.',
      prompt: `Help me structure and architect an engineering project/assignment for ${studentProfile.branch}. Give me a problem statement, system architecture, tech stack justification, and step-by-step implementation roadmap.`,
      icon: FileText,
      badge: 'System Design',
    },
    {
      title: 'Career & Internships',
      desc: '6-month skill roadmap, high-impact resume bullets, and interview preparation.',
      prompt: `I am in ${studentProfile.semester} of ${studentProfile.degree} (${studentProfile.branch}) at ${studentProfile.university}. Please craft a 6-month roadmap to crack a tier-1 software engineering summer internship, including resume bullets and interview prep.`,
      icon: Briefcase,
      badge: 'Internship Prep',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFF9F8] overflow-hidden">
      {/* Chat Window Top Bar */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-[#FFFFFF] border-b border-[#F0DEE4] flex items-center justify-between shrink-0 shadow-[0_1px_4px_rgba(197,143,163,0.03)] z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-[#85808A] hover:text-[#39313A] hover:bg-[#F9E9ED] lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#85808A] hover:text-[#39313A] hover:bg-[#F9E9ED] border border-[#EED9DF] transition-colors"
              title="Return to Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#C58FA3]" />
              <span>Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <UniVerseLogo iconOnly size="sm" className="hidden sm:flex" />
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-[#39313A] truncate max-w-[200px] sm:max-w-md">
                {activeSession.title || 'UniVerse Assistant'}
              </h1>
              <p className="text-[11px] text-[#85808A] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active AI Session • {studentProfile.semester || 'Academic Context'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#85808A] hover:text-[#39313A] hover:bg-[#F9E9ED] border border-[#EED9DF] flex items-center gap-1.5 transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#A77C94]" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F9E9ED] hover:bg-[#F3E0E5] border border-[#EAD6DC] text-xs font-medium text-[#A77C94] transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#C58FA3]" />
            <span className="hidden sm:inline">{studentProfile.name.split(' ')[0] || 'Profile'}</span>
          </button>
        </div>
      </header>

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-none">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Screen when conversation is empty */}
          {messages.length === 0 && !streamingText && (
            <div className="py-6 space-y-8 animate-in fade-in duration-300">
              {/* Hero Banner */}
              <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
                <UniVerseLogo iconOnly size="xl" className="mx-auto justify-center mb-1" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#39313A] tracking-tight">
                  Welcome to UniVerse
                </h2>
                <p className="text-sm sm:text-base text-[#85808A] font-normal leading-relaxed max-w-md mx-auto">
                  Your space to learn, plan and grow.
                </p>

                {/* Student Context Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#EED9DF] text-xs text-[#39313A] shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5 text-[#C58FA3]" />
                  <span>
                    Personalized for <strong>{studentProfile.name}</strong> •{' '}
                    <span>{studentProfile.university}</span>
                  </span>
                  <button
                    onClick={onOpenProfile}
                    className="underline text-[#C58FA3] hover:text-[#B57D92] ml-1 text-[11px]"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* 6 Suggested Prompt Cards */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#85808A] px-1">
                  Suggested Questions & Academic Tools
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {suggestedCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        onClick={() => onSendPrompt(card.prompt)}
                        className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#F0DEE4] hover:border-[#C58FA3] text-left transition-all group hover:shadow-md hover:shadow-[#C58FA3]/10 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[#F9E9ED] border border-[#EAD6DC] flex items-center justify-center text-[#C58FA3]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-[#85808A] bg-[#FFF9F8] border border-[#F0DEE4] px-1.5 py-0.5 rounded-full">
                              {card.badge}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-[#39313A] group-hover:text-[#A77C94] transition-colors">
                            {card.title}
                          </div>
                          <p className="text-xs text-[#85808A] mt-1 leading-relaxed">
                            {card.desc}
                          </p>
                        </div>
                        <div className="mt-3 text-[11px] text-[#C58FA3] font-semibold flex items-center gap-1">
                          Ask UniVerse →
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Messages Flow */}
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <UniVerseLogo iconOnly size="sm" className="mt-0.5" />
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  {/* User Attachments if any */}
                  {isUser && message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-2 mb-1.5">
                      {message.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#EED9DF] rounded-xl text-xs text-[#39313A]"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C58FA3]" />
                          <span className="font-medium text-[11px] truncate max-w-[150px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#F5E6EB] border border-[#EED9DF] text-[#39313A] rounded-br-sm shadow-sm'
                        : 'bg-[#FFFFFF] border border-[#F0DEE4] text-[#39313A] rounded-tl-sm shadow-[0_2px_12px_rgba(197,143,163,0.06)]'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <div className="prose max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-base sm:text-lg font-bold text-[#39313A] border-b border-[#F0DEE4] pb-1.5 mt-3 mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-sm sm:text-base font-semibold text-[#A77C94] mt-3 mb-1.5">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-xs sm:text-sm font-semibold text-[#39313A] mt-2 mb-1">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-[#39313A] leading-relaxed mb-2">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 space-y-1 mb-2 text-[#39313A]">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 space-y-1 mb-2 text-[#39313A]">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed">{children}</li>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-[#C58FA3] pl-3 my-2 text-[#39313A]/90 italic bg-[#FFF4F6] py-1 rounded-r">
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3 rounded-xl border border-[#F0DEE4] bg-[#FFFFFF]">
                                <table className="w-full text-xs text-left border-collapse">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-[#F9E9ED] text-[#39313A] border-b border-[#EED9DF] font-semibold">
                                {children}
                              </thead>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-2 border-r border-[#EED9DF] last:border-r-0 font-semibold text-[#39313A]">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 border-t border-[#F0DEE4] border-r border-[#F0DEE4] last:border-r-0 text-[#39313A]">
                                {children}
                              </td>
                            ),
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 rounded bg-[#FFF4F6] text-[#A77C94] font-mono text-[11px] border border-[#EED9DF]">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="p-3 bg-[#FFF4F6] border border-[#EED9DF] rounded-xl overflow-x-auto text-[11px] font-mono text-[#39313A] my-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Action Bar for AI Messages */}
                    {!isUser && (
                      <div className="pt-2 mt-3 border-t border-[#F7EAEE] flex items-center justify-between text-xs text-[#85808A]">
                        <span className="text-[10px]">UniVerse Academic Engine</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="p-1 rounded hover:bg-[#F9E9ED] text-[#85808A] hover:text-[#C58FA3] transition-colors"
                            title="Copy answer"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleSpeech(message.id, message.content)}
                            className="p-1 rounded hover:bg-[#F9E9ED] text-[#85808A] hover:text-[#C58FA3] transition-colors"
                            title={speakingId === message.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {speakingId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-[#C58FA3] animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#C58FA3] text-white flex items-center justify-center shrink-0 shadow-sm mt-1 font-semibold text-xs">
                    {studentProfile.name ? studentProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Ongoing Assistant Response */}
          {isLoading && streamingText && (
            <div className="flex gap-3.5 justify-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-xl bg-[#F9E9ED] border border-[#EAD6DC] text-[#C58FA3] flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="max-w-[85%] sm:max-w-[78%]">
                <div className="rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm leading-relaxed bg-[#FFFFFF] border border-[#F0DEE4] text-[#39313A] shadow-md">
                  <div className="prose max-w-none text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A77C94] mt-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C58FA3] animate-pulse" />
                    <span>Structuring academic response...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thinking / Generating Skeleton state */}
          {isLoading && !streamingText && (
            <div className="flex gap-3.5 justify-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-xl bg-[#F9E9ED] border border-[#EAD6DC] text-[#C58FA3] flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-[#FFFFFF] border border-[#F0DEE4] shadow-sm flex items-center gap-2 text-xs text-[#85808A]">
                <span className="w-2 h-2 rounded-full bg-[#C58FA3] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#C58FA3] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#C58FA3] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 font-medium text-[#A77C94]">Analyzing university syllabus & concepts...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
