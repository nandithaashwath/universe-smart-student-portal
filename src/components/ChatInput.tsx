import React, { useState, useRef, useEffect } from 'react';
import { Attachment } from '../types';
import { Send, Paperclip, X, Mic, MicOff, FileText, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  onSelectPrompt,
}: Props) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 20 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 20MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1] || '';

        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'document',
            mimeType: file.type || 'application/pdf',
            size: file.size,
            data: base64Data,
            previewUrl: file.type.startsWith('image/') ? resultStr : undefined,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const quickPills = [
    { label: '2-Mark Answer', prompt: 'Generate a 2-mark university answer with crisp textbook definition and 2 key points for ' },
    { label: '5-Mark Answer', prompt: 'Generate a 5-mark university exam answer with textbook definitions, diagrams/tables, and a worked example for ' },
    { label: '8-Mark Answer', prompt: 'Generate an 8-mark university model answer with detailed theory, mechanisms, and worked tables for ' },
    { label: '10-Mark Answer', prompt: 'Generate a comprehensive 10-mark university model answer with complete theory, diagrams, and worked examples for ' },
    { label: 'Explain with Analogies', prompt: 'Explain this academic concept in simple terms with an everyday analogy: ' },
    { label: 'Create Timetable', prompt: 'Build a customized 7-day study timetable for upcoming exams' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Quick Prompt Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-[11px] text-[#85808A] shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C58FA3]" /> Fast Prompts:
        </span>
        {quickPills.map((pill) => (
          <button
            key={pill.label}
            type="button"
            onClick={() => {
              setText(pill.prompt);
              textareaRef.current?.focus();
            }}
            className="px-2.5 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#F9E9ED] border border-[#EED9DF] text-[#39313A] hover:text-[#A77C94] text-[11px] whitespace-nowrap transition-colors shadow-sm"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Main Rounded Input Container */}
      <div className="bg-[#FFFFFF] border border-[#EED9DF] rounded-2xl p-2.5 shadow-[0_2px_14px_rgba(197,143,163,0.08)] focus-within:border-[#C58FA3] focus-within:ring-2 focus-within:ring-[#C58FA3]/20 transition-all">
        {/* Attachment Preview Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-2 mb-1 border-b border-[#F0DEE4]">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FFF9F8] border border-[#EED9DF] rounded-xl text-xs text-[#39313A]"
              >
                {att.previewUrl ? (
                  <img src={att.previewUrl} alt="preview" className="w-4 h-4 rounded object-cover" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#C58FA3]" />
                )}
                <span className="truncate max-w-[160px] text-[11px] font-medium">{att.name}</span>
                <span className="text-[10px] text-[#85808A]">
                  ({(att.size / (1024 * 1024)).toFixed(1)}MB)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="text-[#85808A] hover:text-red-500 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.txt,.docx,.doc,image/*"
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-[#85808A] hover:text-[#C58FA3] hover:bg-[#F9E9ED] transition-colors shrink-0"
            title="Attach PDF, notes or images"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask UniVerse anything — concepts, 2/5/8/10 mark answers, timetable, assignments..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#39313A] placeholder-[#85808A]/70 focus:outline-none resize-none py-2 px-1 max-h-40 leading-relaxed"
          />

          {/* Speech to Text Mic Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              isRecording
                ? 'bg-rose-100 text-rose-600 animate-pulse border border-rose-300'
                : 'text-[#85808A] hover:text-[#C58FA3] hover:bg-[#F9E9ED]'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Voice input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button in Dusty Rose */}
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && attachments.length === 0)}
            className="p-2.5 bg-[#C58FA3] hover:bg-[#B57D92] disabled:opacity-40 text-white rounded-xl shadow-md shadow-[#C58FA3]/30 transition-all hover:scale-105 shrink-0"
            title="Send Message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      <div className="text-[11px] text-center text-[#85808A] mt-2">
        UniVerse is personalized for your university curriculum · Strict Academic Accuracy
      </div>
    </div>
  );
}
