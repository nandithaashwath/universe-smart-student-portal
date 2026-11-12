import { useState } from 'react';
import { StudentProfile, StudyToolType, ChatSession } from '../types';
import UniVerseLogo from './UniVerseLogo';
import {
  Sparkles,
  Calendar,
  Calculator,
  FileText,
  Award,
  Briefcase,
  BookOpen,
  ArrowRight,
  MessageSquare,
  GraduationCap,
  Target,
  Clock,
  Compass,
  Edit3,
  Search,
  CheckCircle2
} from 'lucide-react';

interface Props {
  studentProfile: StudentProfile;
  onOpenTool: (tool: StudyToolType) => void;
  onNavigateToChat: (initialPrompt?: string) => void;
  onOpenProfile: () => void;
  recentSessions: ChatSession[];
  onSelectSession: (id: string) => void;
}

export default function Dashboard({
  studentProfile,
  onOpenTool,
  onNavigateToChat,
  onOpenProfile,
  recentSessions,
  onSelectSession,
}: Props) {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onNavigateToChat(quickInput.trim());
    setQuickInput('');
  };

  const tools = [
    {
      id: 'ai_assistant',
      title: 'AI Academic Assistant',
      badge: 'Conversational',
      desc: 'Ask questions, simplify complex academic theories, and get step-by-step guidance.',
      icon: MessageSquare,
      actionText: 'Open Assistant',
      onClick: () => onNavigateToChat(),
    },
    {
      id: 'study_timetable' as StudyToolType,
      title: 'Smart Study Planner',
      badge: '7-Day Routine',
      desc: 'Personalized 7-day revision schedule with 50/10 study breaks, active recall, and mock tests.',
      icon: Calendar,
      actionText: 'Plan Routine',
      onClick: () => onOpenTool('study_timetable'),
    },
    {
      id: 'cgpa_calculator' as StudyToolType,
      title: 'CGPA & Marks Calculator',
      badge: 'Academic Goal',
      desc: 'Simulate SGPA, calculate target marks for internal tests vs end-sem exams, and track honours.',
      icon: Calculator,
      actionText: 'Calculate Now',
      onClick: () => onOpenTool('cgpa_calculator'),
    },
    {
      id: 'doc_analyzer' as StudyToolType,
      title: 'PDF & Notes Analyser',
      badge: 'Document AI',
      desc: 'Upload syllabus PDFs, lecture slides, and notes for instant summaries and flashcards.',
      icon: FileText,
      actionText: 'Analyse Notes',
      onClick: () => onOpenTool('doc_analyzer'),
    },
    {
      id: 'mock_test' as StudyToolType,
      title: 'Quizzes & Mock Tests',
      badge: 'Self-Evaluation',
      desc: 'Interactive university practice tests with automated scoring and detailed examiner feedback.',
      icon: Award,
      actionText: 'Take Practice Test',
      onClick: () => onOpenTool('mock_test'),
    },
    {
      id: 'exam_answers' as StudyToolType,
      title: 'Exam Model Answers',
      badge: 'Strict Accuracy',
      desc: 'Academically rigorous 2, 5, 8 & 10-mark answers with textbook definitions, diagrams, and examples.',
      icon: BookOpen,
      actionText: 'Generate Answers',
      onClick: () => onOpenTool('exam_answers'),
    },
    {
      id: 'career_roadmap' as StudyToolType,
      title: 'Career & Internships',
      badge: '6-Month Plan',
      desc: 'Targeted tech roadmaps, ATS resume bullets, and technical interview preparation.',
      icon: Briefcase,
      actionText: 'View Roadmap',
      onClick: () => onOpenTool('career_roadmap'),
    },
  ];

  const suggestedPrompts = [
    {
      label: 'Database Normalization',
      tag: '5-Mark Answer',
      prompt: 'Explain Database Normalization and give me a 5-mark answer with 1NF, 2NF and 3NF examples.',
    },
    {
      label: 'Banker\'s Algorithm',
      tag: 'OS Theory',
      prompt: 'Explain Banker\'s Algorithm for deadlock avoidance with safety algorithm data structures and worked example.',
    },
    {
      label: '7-Day Study Routine',
      tag: 'Study Planner',
      prompt: `Create a realistic 7-day study timetable for my subjects: ${studentProfile.currentSubjects.slice(0, 3).join(', ')}. Include 50m study / 10m rest breaks and mock tests.`,
    },
    {
      label: 'TCP vs UDP Protocols',
      tag: 'Computer Networks',
      prompt: 'Compare TCP and UDP protocols with transport layer characteristics, 3-way handshake, and comparative table.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full space-y-8">
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-br from-[#FFFFFF] via-[#FFFBFB] to-[#F9E9ED]/50 border border-[#F0DEE4] rounded-3xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(197,143,163,0.06)] relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E9ED] border border-[#EAD6DC] text-xs font-medium text-[#A77C94]">
            <Sparkles className="w-3.5 h-3.5 text-[#C58FA3]" />
            <span>Campus AI Companion</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-[#39313A] tracking-tight">
            Welcome back, {studentProfile.name || 'Scholar'}
          </h1>
          
          <p className="text-sm sm:text-base text-[#85808A] font-normal leading-relaxed">
            Your space to learn, plan and grow.
          </p>

          {/* Quick Ask Input */}
          <form onSubmit={handleQuickAsk} className="pt-2">
            <div className="flex items-center bg-[#FFFFFF] border border-[#EED9DF] rounded-2xl p-1.5 shadow-[0_2px_10px_rgba(197,143,163,0.08)] focus-within:border-[#C58FA3] focus-within:ring-2 focus-within:ring-[#C58FA3]/20 transition-all">
              <div className="pl-3 text-[#A77C94]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Ask UniVerse anything... (e.g. 'Explain 2NF with tables', 'Plan a study routine')"
                className="w-full px-3 py-2 text-xs sm:text-sm text-[#39313A] placeholder-[#85808A]/70 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C58FA3] hover:bg-[#B57D92] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right side floating brand insignia */}
        <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-10">
          <UniVerseLogo iconOnly size="xl" className="opacity-95 shadow-md" />
        </div>

        {/* Decorative soft pastel circle */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#F9E9ED]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Student Academic Snapshot Card */}
      <section className="bg-[#FFFFFF] border border-[#F0DEE4] rounded-2xl p-5 shadow-[0_1px_8px_rgba(197,143,163,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F9E9ED] border border-[#EAD6DC] flex items-center justify-center text-[#C58FA3] shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#39313A]">
                {studentProfile.university || 'University'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F9E9ED] text-[#A77C94] border border-[#EAD6DC]">
                {studentProfile.semester || 'Current Semester'}
              </span>
            </div>
            <p className="text-xs text-[#85808A] mt-0.5">
              {studentProfile.degree} in {studentProfile.branch}
            </p>
          </div>
        </div>

        {/* Subjects & Goals pill summary */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-xs text-[#39313A]">
            <Target className="w-3.5 h-3.5 text-[#C58FA3]" />
            <span className="truncate max-w-[200px]">{studentProfile.academicGoals || 'High Honors'}</span>
          </div>

          <button
            onClick={onOpenProfile}
            className="px-3 py-1.5 bg-[#F9E9ED] hover:bg-[#F3E0E5] text-[#A77C94] border border-[#EAD6DC] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </section>

      {/* Student Tools Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#39313A] tracking-tight">Student Study Tools</h2>
            <p className="text-xs text-[#85808A]">Thoughtfully crafted tools to help you master concepts and prepare for exams.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={tool.onClick}
                className="group bg-[#FFFFFF] border border-[#F0DEE4] hover:border-[#C58FA3]/60 rounded-2xl p-5 shadow-[0_1px_6px_rgba(197,143,163,0.04)] hover:shadow-[0_4px_16px_rgba(197,143,163,0.12)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F9E9ED] border border-[#EAD6DC] flex items-center justify-center text-[#C58FA3] group-hover:bg-[#C58FA3] group-hover:text-white transition-colors duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#FFF9F8] text-[#85808A] border border-[#F0DEE4]">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#39313A] group-hover:text-[#A77C94] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[#85808A] mt-1 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#F7EAEE] flex items-center justify-between text-xs font-semibold text-[#C58FA3] group-hover:text-[#A77C94]">
                  <span>{tool.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Suggested Fast Prompts */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#39313A] tracking-tight">Quick Learning Prompts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestedPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateToChat(item.prompt)}
              className="text-left bg-[#FFFFFF] border border-[#F0DEE4] hover:border-[#C58FA3] rounded-xl p-3.5 shadow-sm hover:shadow-[0_2px_10px_rgba(197,143,163,0.08)] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-medium text-[#A77C94] bg-[#F9E9ED] px-1.5 py-0.5 rounded border border-[#EAD6DC]">
                  {item.tag}
                </span>
                <p className="text-xs font-medium text-[#39313A] mt-2 group-hover:text-[#A77C94] transition-colors leading-snug">
                  {item.label}
                </p>
              </div>
              <span className="text-[11px] text-[#85808A] mt-3 flex items-center gap-1 group-hover:text-[#C58FA3]">
                Ask UniVerse <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity / Chats Preview */}
      {recentSessions.length > 0 && (
        <section className="bg-[#FFFFFF] border border-[#F0DEE4] rounded-2xl p-5 shadow-[0_1px_8px_rgba(197,143,163,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A77C94]" />
              <h2 className="text-sm font-semibold text-[#39313A]">Recent Discussions</h2>
            </div>
            <button
              onClick={() => onNavigateToChat()}
              className="text-xs font-medium text-[#C58FA3] hover:text-[#A77C94] transition-colors"
            >
              View All in Assistant →
            </button>
          </div>

          <div className="divide-y divide-[#F7EAEE]">
            {recentSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onNavigateToChat();
                }}
                className="py-2.5 flex items-center justify-between hover:bg-[#FFF9F8] px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 text-[#C58FA3] shrink-0" />
                  <span className="text-xs font-medium text-[#39313A] truncate">
                    {session.title || 'Untitled Conversation'}
                  </span>
                </div>
                <span className="text-[11px] text-[#85808A] shrink-0 ml-2">
                  {new Date(session.updatedAt || session.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
