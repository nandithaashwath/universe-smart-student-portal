import { useState } from 'react';
import { StudentProfile } from '../../types';
import { generateExamAnswer } from '../../services/api';
import { X, Award, Sparkles, Copy, Check, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSendToChat: (prompt: string) => void;
}

export default function ExamAnswerModal({
  isOpen,
  onClose,
  studentProfile,
  onSendToChat,
}: Props) {
  const [subject, setSubject] = useState(studentProfile.currentSubjects[0] || 'Operating Systems');
  const [topic, setTopic] = useState('');
  const [marks, setMarks] = useState<2 | 5 | 8 | 10>(5);
  const [university, setUniversity] = useState(studentProfile.university || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const answer = await generateExamAnswer({
        subject,
        topic,
        marks,
        university,
        studentProfile,
      });
      setResult(answer);
    } catch (err: any) {
      setError(err.message || 'Failed to generate answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDiscussInChat = () => {
    if (!result) return;
    const prompt = `Here is the ${marks}-mark exam answer for "${topic}" in ${subject}:\n\n${result}\n\nUniVerse, can you test me on this topic with a quick follow-up question or suggest related 2-mark definitions?`;
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                  2, 5, 8 & 10-Mark Exam Answer Generator
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F9E9ED] text-[#A77C94] border border-[#EACCD6]">
                  Strict Accuracy
                </span>
              </div>
              <p className="text-xs text-[#85808A]">
                Textbook-level definitions, mathematical notations, worked examples, and tables.
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

        {/* Form and Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-[#39313A] mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
                >
                  {studentProfile.currentSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="Custom">Custom Subject...</option>
                </select>
              </div>

              {/* University */}
              <div>
                <label className="block text-xs font-medium text-[#39313A] mb-1.5">University / Syllabus Pattern</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Dayananda Sagar University / VTU"
                  className="w-full px-3 py-2 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3]"
                />
              </div>
            </div>

            {/* Topic / Question */}
            <div>
              <label className="block text-xs font-medium text-[#39313A] mb-1.5">
                Exam Question or Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Explain Normalization (1NF, 2NF, 3NF, BCNF) with tables and decomposition"
                className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3]"
              />
            </div>

            {/* Marks Selector */}
            <div>
              <label className="block text-xs font-medium text-[#39313A] mb-1.5">
                Target Marks Allocation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { m: 2 as const, label: '2 Marks', desc: 'Crisp textbook definition + 2 bullet points' },
                  { m: 5 as const, label: '5 Marks', desc: 'Core concept + Diagram/Table + Worked example' },
                  { m: 8 as const, label: '8 Marks', desc: 'Deep theory + Step-by-step schema + Example' },
                  { m: 10 as const, label: '10 Marks', desc: 'Comprehensive model answer + Full working' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.m}
                    onClick={() => setMarks(item.m)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      marks === item.m
                        ? 'bg-[#C58FA3] text-white border-[#C58FA3] shadow-xs'
                        : 'bg-[#FFF9F8] border-[#F0DEE4] text-[#85808A] hover:text-[#39313A] hover:border-[#C58FA3]/50'
                    }`}
                  >
                    <div className={`font-semibold text-xs ${marks === item.m ? 'text-white' : 'text-[#A77C94]'}`}>{item.label}</div>
                    <div className={`text-[10px] mt-0.5 leading-snug ${marks === item.m ? 'text-white/80' : 'text-[#85808A]'}`}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-2.5 bg-[#C58FA3] hover:bg-[#b87d93] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Structuring High-Scoring Model Answer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate {marks}-Mark Model Answer
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Generated Result */}
          {result && (
            <div className="border border-[#F0DEE4] rounded-2xl bg-[#FFF9F8] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0DEE4] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#F9E9ED] text-[#A77C94] text-xs font-semibold rounded-lg border border-[#EACCD6]">
                    {marks} Marks Model Answer
                  </span>
                  <span className="text-xs text-[#85808A] font-medium">{subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#F9E9ED] text-[#39313A] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-[#F0DEE4]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDiscussInChat}
                    className="px-2.5 py-1.5 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Discuss in Chat
                  </button>
                </div>
              </div>

              {/* Formatted Content */}
              <div className="text-xs leading-relaxed text-[#39313A] space-y-2">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
