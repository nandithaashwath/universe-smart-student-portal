import { useState } from 'react';
import { ChatSession, StudentProfile, StudyToolType } from '../types';
import UniVerseLogo from './UniVerseLogo';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Calculator,
  FileText,
  Award,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  PanelLeftClose,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Props {
  activeView: 'dashboard' | 'chat';
  onSelectView: (view: 'dashboard' | 'chat') => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  studentProfile: StudentProfile;
  onOpenProfile: () => void;
  onOpenTool: (tool: StudyToolType) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  activeView,
  onSelectView,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  studentProfile,
  onOpenProfile,
  onOpenTool,
  isMobileOpen,
  onCloseMobile,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: activeView === 'dashboard',
      onClick: () => {
        onSelectView('dashboard');
        onCloseMobile();
      },
    },
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: MessageSquare,
      isActive: activeView === 'chat',
      onClick: () => {
        onSelectView('chat');
        onCloseMobile();
      },
    },
  ];

  const toolsItems = [
    {
      id: 'study_timetable' as StudyToolType,
      label: 'Study Planner',
      icon: Calendar,
      onClick: () => {
        onOpenTool('study_timetable');
        onCloseMobile();
      },
    },
    {
      id: 'cgpa_calculator' as StudyToolType,
      label: 'CGPA Calculator',
      icon: Calculator,
      onClick: () => {
        onOpenTool('cgpa_calculator');
        onCloseMobile();
      },
    },
    {
      id: 'doc_analyzer' as StudyToolType,
      label: 'PDF Analyser',
      icon: FileText,
      onClick: () => {
        onOpenTool('doc_analyzer');
        onCloseMobile();
      },
    },
    {
      id: 'mock_test' as StudyToolType,
      label: 'Quizzes & Tests',
      icon: Award,
      onClick: () => {
        onOpenTool('mock_test');
        onCloseMobile();
      },
    },
    {
      id: 'exam_answers' as StudyToolType,
      label: 'Model Answers',
      icon: BookOpen,
      onClick: () => {
        onOpenTool('exam_answers');
        onCloseMobile();
      },
    },
    {
      id: 'career_roadmap' as StudyToolType,
      label: 'Career Guidance',
      icon: Briefcase,
      onClick: () => {
        onOpenTool('career_roadmap');
        onCloseMobile();
      },
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#39313A]/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#F9E9ED] border-r border-[#F0DEE4] flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0DEE4] flex items-center justify-between">
          <UniVerseLogo size="md" />

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#85808A] hover:text-[#39313A] hover:bg-[#FFFFFF]/60 lg:hidden transition-colors"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none">
          {/* Main Views */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#85808A]">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    item.isActive
                      ? 'bg-[#FFFFFF] text-[#39313A] shadow-sm shadow-[#C58FA3]/10 border border-[#EED9DF]'
                      : 'text-[#85808A] hover:text-[#39313A] hover:bg-[#FFFFFF]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.isActive ? 'text-[#C58FA3]' : 'text-[#85808A]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tools Menu */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#85808A]">
              Productivity Tools
            </div>
            {toolsItems.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={tool.onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#39313A] hover:bg-[#FFFFFF] hover:shadow-sm border border-transparent hover:border-[#F0DEE4] transition-all text-left group"
                >
                  <Icon className="w-4 h-4 text-[#A77C94] group-hover:text-[#C58FA3] transition-colors" />
                  <span className="truncate">{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conversations Section (Visible when in AI Assistant or as recent list) */}
          <div className="space-y-2 pt-2 border-t border-[#F0DEE4]/70">
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85808A]">
                Discussions
              </span>
              <button
                onClick={() => {
                  onNewChat();
                  onSelectView('chat');
                  onCloseMobile();
                }}
                className="p-1 rounded-lg hover:bg-[#FFFFFF] text-[#C58FA3] transition-colors"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                onNewChat();
                onSelectView('chat');
                onCloseMobile();
              }}
              className="w-full py-2 px-3 bg-[#FFFFFF] hover:bg-[#FFFBFB] text-[#C58FA3] border border-[#EED9DF] rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>

            {/* Sessions List */}
            <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
              {sessions.map((session) => {
                const isSelected = activeView === 'chat' && session.id === activeSessionId;
                const isEditing = editingId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      onSelectView('chat');
                      onCloseMobile();
                    }}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFFFF] text-[#39313A] shadow-sm border border-[#EED9DF] font-medium'
                        : 'text-[#85808A] hover:bg-[#FFFFFF]/60 hover:text-[#39313A]'
                    }`}
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(session.id, e)}
                        className="flex items-center gap-1 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-[#FFF9F8] border border-[#C58FA3] rounded px-1.5 py-0.5 text-xs text-[#39313A] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-[#C58FA3] hover:text-[#B57D92]"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-[#85808A] hover:text-[#39313A]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C58FA3]' : 'text-[#85808A]'}`} />
                          <span className="truncate">{session.title || 'Untitled'}</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleStartRename(session, e)}
                            className="p-1 text-[#85808A] hover:text-[#39313A] rounded transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 text-[#85808A] hover:text-red-500 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-3 border-t border-[#F0DEE4] bg-[#F5E5EA]/40">
          <button
            onClick={() => {
              onOpenProfile();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFFBFB] border border-[#EED9DF] shadow-sm transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#F9E9ED] border border-[#EAD6DC] flex items-center justify-center text-[#C58FA3] font-semibold text-xs shrink-0">
                {studentProfile.name ? studentProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#39313A] truncate">
                  {studentProfile.name || 'Set Up Profile'}
                </p>
                <p className="text-[10px] text-[#85808A] truncate">
                  {studentProfile.semester || 'Student'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-[#C58FA3] group-hover:underline">
              Settings
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
