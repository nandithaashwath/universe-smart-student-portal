import React, { useState, useRef } from 'react';
import { StudentProfile } from '../../types';
import { analyzeDocument } from '../../services/api';
import { X, FileText, Upload, Sparkles, Copy, Check, MessageSquare, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSendToChat: (prompt: string) => void;
}

export default function DocumentAnalyzerModal({
  isOpen,
  onClose,
  studentProfile,
  onSendToChat,
}: Props) {
  const [file, setFile] = useState<{
    name: string;
    mimeType: string;
    base64: string;
    size: number;
  } | null>(null);

  const [analysisType, setAnalysisType] = useState<'summary' | 'exam_questions' | 'flashcards'>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(',')[1] || '';

      setFile({
        name: selected.name,
        mimeType: selected.type || 'application/pdf',
        base64: base64Data,
        size: selected.size,
      });
      setError(null);
      setResult(null);
    };

    reader.onerror = () => {
      setError('Failed to read file.');
    };

    reader.readAsDataURL(selected);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDocument({
        documentBase64: file.base64,
        mimeType: file.mimeType,
        fileName: file.name,
        analysisType,
        studentProfile,
      });
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
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
    if (!result || !file) return;
    const prompt = `I analyzed my document "${file.name}" with UniVerse. Here are the extracted highlights:
\n${result}\n
UniVerse, can you guide me through the most difficult part of these notes and quiz me on the key formulas?`;
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                PDF & Notes Analyzer
              </h2>
              <p className="text-xs text-[#85808A]">
                Upload lecture slides, syllabus PDFs, or handwritten notes for instant AI synthesis.
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          {/* Upload Area */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.docx,.doc,image/*"
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#F0DEE4] hover:border-[#C58FA3] rounded-3xl p-8 text-center cursor-pointer transition-colors bg-[#FFF9F8] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F9E9ED] border border-[#EACCD6] text-[#C58FA3] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-[#39313A]">Click to upload PDF, Notes or Images</div>
              <div className="text-xs text-[#85808A] mt-1">Supports PDF, Lecture Slides, TXT, PNG, JPEG up to 20MB</div>
            </div>
          ) : (
            <div className="p-4 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9E9ED] border border-[#EACCD6] flex items-center justify-center text-[#C58FA3]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#39313A] truncate max-w-sm">{file.name}</div>
                  <div className="text-[11px] text-[#85808A]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI Analysis
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-[#85808A] hover:text-red-500 transition-colors px-2 py-1"
              >
                Change File
              </button>
            </div>
          )}

          {/* Analysis Type Options */}
          {file && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-[#39313A]">Choose Analysis Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'summary' as const,
                    title: 'Summary & Formulas',
                    desc: 'Core definitions, formulas, and high-yield takeaways.',
                  },
                  {
                    id: 'exam_questions' as const,
                    title: '2, 5 & 10-Mark Questions',
                    desc: 'Generates university exam questions directly from this text.',
                  },
                  {
                    id: 'flashcards' as const,
                    title: 'Active Recall Cards',
                    desc: 'Quick Q&A pairs for rapid exam revision.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAnalysisType(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      analysisType === item.id
                        ? 'bg-[#C58FA3] text-white border-[#C58FA3] shadow-xs'
                        : 'bg-[#FFF9F8] border-[#F0DEE4] text-[#85808A] hover:text-[#39313A] hover:border-[#C58FA3]/50'
                    }`}
                  >
                    <div className={`text-xs font-semibold ${analysisType === item.id ? 'text-white' : 'text-[#A77C94]'}`}>{item.title}</div>
                    <div className={`text-[11px] mt-1 leading-snug ${analysisType === item.id ? 'text-white/80' : 'text-[#85808A]'}`}>{item.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full py-2.5 bg-[#C58FA3] hover:bg-[#b87d93] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Document with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Start AI Analysis
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="border border-[#F0DEE4] rounded-2xl bg-[#FFF9F8] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0DEE4] pb-3">
                <span className="text-xs font-semibold text-[#A77C94]">Analysis Output</span>
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
