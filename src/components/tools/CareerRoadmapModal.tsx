import { StudentProfile } from '../../types';
import { X, Briefcase, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSendToChat: (prompt: string) => void;
}

export default function CareerRoadmapModal({
  isOpen,
  onClose,
  studentProfile,
  onSendToChat,
}: Props) {
  if (!isOpen) return null;

  const handlePrompt = (type: string) => {
    let prompt = '';
    switch (type) {
      case 'resume':
        prompt = `UniVerse, based on my academic profile at ${studentProfile.university} (${studentProfile.degree} in ${studentProfile.branch}, ${studentProfile.semester}), please generate high-impact, ATS-optimized resume bullet points for my projects in ${studentProfile.currentSubjects.slice(0, 3).join(', ')}. Use Google's XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].`;
        break;
      case 'internship':
        prompt = `UniVerse, I am in ${studentProfile.semester} of ${studentProfile.degree} (${studentProfile.branch}) at ${studentProfile.university}. Please create a high-yield 6-month roadmap to land a Tier-1 Summer Tech Internship. Include month-by-month goals for DSA, project building, cold outreach on LinkedIn, and technical interview prep.`;
        break;
      case 'interview':
        prompt = `UniVerse, act as a senior technical interviewer for a software engineering internship role. Review the subjects I'm taking (${studentProfile.currentSubjects.join(', ')}) and conduct a mock technical interview with me starting with an Operating Systems or System Design scenario.`;
        break;
      default:
        prompt = `UniVerse, give me comprehensive career guidance for ${studentProfile.branch} students in ${studentProfile.semester} at ${studentProfile.university}.`;
    }

    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#39313A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white border border-[#F0DEE4] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#F0DEE4] flex items-center justify-between bg-gradient-to-r from-[#F9E9ED] via-[#FFF9F8] to-[#F9E9ED]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F9E9ED] border border-[#F0DEE4] flex items-center justify-center text-[#C58FA3]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                Career & Internship Navigator
              </h2>
              <p className="text-xs text-[#85808A]">
                Milestones, high-impact resume bullets, and internship roadmaps for {studentProfile.branch}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#85808A] hover:text-[#39313A] hover:bg-[#F9E9ED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {/* Quick AI Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handlePrompt('internship')}
              className="p-4.5 rounded-2xl bg-[#FFF9F8] border border-[#F0DEE4] hover:border-[#C58FA3] text-left transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F9E9ED] text-[#C58FA3] flex items-center justify-center mb-3 group-hover:bg-[#C58FA3] group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-[#39313A]">6-Month Internship Plan</div>
              <p className="text-[11px] text-[#85808A] mt-1 leading-snug">
                Step-by-step roadmap from DSA to cold emailing and online assessments.
              </p>
              <div className="text-[11px] text-[#A77C94] font-medium mt-3 flex items-center gap-1">
                Launch Plan <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handlePrompt('resume')}
              className="p-4.5 rounded-2xl bg-[#FFF9F8] border border-[#F0DEE4] hover:border-[#C58FA3] text-left transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-[#39313A]">ATS Resume Bullets</div>
              <p className="text-[11px] text-[#85808A] mt-1 leading-snug">
                Action-oriented bullet points with metrics using the XYZ formula.
              </p>
              <div className="text-[11px] text-emerald-700 font-medium mt-3 flex items-center gap-1">
                Draft Bullets <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handlePrompt('interview')}
              className="p-4.5 rounded-2xl bg-[#FFF9F8] border border-[#F0DEE4] hover:border-[#C58FA3] text-left transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors border border-purple-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-[#39313A]">Mock Tech Interview</div>
              <p className="text-[11px] text-[#85808A] mt-1 leading-snug">
                Simulate a real coding & technical round tailored to your coursework.
              </p>
              <div className="text-[11px] text-purple-700 font-medium mt-3 flex items-center gap-1">
                Start Interview <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>

          {/* Core Milestones for Current Semester */}
          <div className="p-5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#39313A] uppercase tracking-wider">
                {studentProfile.semester} Career Focus Milestones
              </h3>
              <span className="text-[11px] text-[#A77C94] font-medium">{studentProfile.branch}</span>
            </div>

            <div className="space-y-3.5 text-xs text-[#39313A]">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F9E9ED] text-[#A77C94] border border-[#EACCD6] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-[#39313A]">Data Structures & Core CS Fundamentals:</strong>
                  <p className="text-[#85808A] text-[11px] mt-0.5">
                    Maintain consistency with 2-3 LeetCode problems daily (Focus: Graphs, DP, Trees). Align your coursework in Algorithms and OS with standard interview topics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F9E9ED] text-[#A77C94] border border-[#EACCD6] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-[#39313A]">Production-Grade Capstone Project:</strong>
                  <p className="text-[#85808A] text-[11px] mt-0.5">
                    Build a non-trivial project featuring authenticated backend, database indexing, caching (Redis), and clean deployment with CI/CD.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F9E9ED] text-[#A77C94] border border-[#EACCD6] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-[#39313A]">LinkedIn & Referral Strategy:</strong>
                  <p className="text-[#85808A] text-[11px] mt-0.5">
                    Connect with university alumni working at targeted companies. Ask for feedback on your GitHub projects rather than directly asking for jobs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
