import { useState } from 'react';
import { StudentProfile, MockTest, MockTestQuestion } from '../../types';
import { generateMockTest, evaluateAnswer } from '../../services/api';
import { X, CheckCircle, Loader2, Sparkles, Send, Award, RefreshCw, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSendToChat: (prompt: string) => void;
}

export default function MockTestModal({
  isOpen,
  onClose,
  studentProfile,
  onSendToChat,
}: Props) {
  const [subject, setSubject] = useState(studentProfile.currentSubjects[0] || 'Operating Systems');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [test, setTest] = useState<MockTest | null>(null);

  // User responses
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, number>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Record<string, MockTestQuestion['evaluation']>>({});

  if (!isOpen) return null;

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setTest(null);
    setSelectedMcqAnswers({});
    setWrittenAnswers({});
    setEvaluations({});

    try {
      const generated = await generateMockTest({
        subject,
        topic,
        difficulty,
        studentProfile,
      });
      setTest(generated);
    } catch (err: any) {
      alert(err.message || 'Failed to generate mock test.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluateWritten = async (question: MockTestQuestion) => {
    const studentAnswer = writtenAnswers[question.id];
    if (!studentAnswer || !studentAnswer.trim()) {
      alert('Please type your answer before requesting AI evaluation.');
      return;
    }

    setEvaluatingQuestionId(question.id);
    try {
      const evalResult = await evaluateAnswer({
        question: question.question,
        maxMarks: question.marks,
        studentAnswer: studentAnswer.trim(),
        rubric: question.rubric,
        subject: test?.subject,
      });

      setEvaluations((prev) => ({
        ...prev,
        [question.id]: evalResult,
      }));

      if (evalResult.awardedMarks >= question.marks * 0.8) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.message || 'Evaluation failed.');
    } finally {
      setEvaluatingQuestionId(null);
    }
  };

  const handleDiscussInChat = () => {
    if (!test) return;
    const prompt = `I took a practice mock test on "${test.title}" for ${test.subject}.
UniVerse, can you generate 3 more challenging questions on this topic and review my performance?`;
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
              <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                Mock Test & Instant AI Examiner
              </h2>
              <p className="text-xs text-[#85808A]">
                Solve university test questions and receive real-time marks, rubrics, and feedback.
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
          {!test ? (
            <form onSubmit={handleStartTest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="General Engineering">General Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#39313A] mb-1.5">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                          difficulty === lvl
                            ? 'bg-[#C58FA3] text-white border-[#C58FA3] shadow-xs'
                            : 'bg-[#FFF9F8] text-[#85808A] border-[#F0DEE4] hover:text-[#39313A] hover:border-[#C58FA3]/50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#39313A] mb-1.5">
                  Topic / Exam Unit
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. CPU Scheduling & Deadlocks or SQL Normalization & Indexing"
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3]"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="w-full py-2.5 bg-[#C58FA3] hover:bg-[#b87d93] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Assembling University Test Paper...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Start Mock Test
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Test Header */}
              <div className="p-4 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#39313A]">{test.title}</h3>
                  <div className="text-xs text-[#85808A] mt-0.5">
                    {test.subject} · {test.totalMarks} Marks · Est. {test.estimatedMinutes} mins
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTest(null)}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#F9E9ED] text-[#39313A] rounded-xl text-xs font-medium flex items-center gap-1 transition-colors border border-[#F0DEE4]"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#85808A]" /> Retake / New
                  </button>
                  <button
                    onClick={handleDiscussInChat}
                    className="px-2.5 py-1.5 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Discuss in Chat
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-5">
                {test.questions.map((q, idx) => {
                  const isMcq = q.type === 'mcq';
                  const evalData = evaluations[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4.5 rounded-2xl bg-[#FFF9F8] border border-[#F0DEE4] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#F9E9ED] border border-[#EACCD6] text-[#A77C94] text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#39313A]">
                            {q.question}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#F9E9ED] text-[#A77C94] text-[10px] font-semibold rounded-md border border-[#EACCD6] shrink-0">
                          {q.marks} Marks
                        </span>
                      </div>

                      {/* MCQ Options */}
                      {isMcq && q.options && (
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedMcqAnswers[q.id] === optIdx;
                            const hasAnswered = selectedMcqAnswers[q.id] !== undefined;
                            const isCorrect = q.correctAnswerIndex === optIdx;

                            let optClasses = 'border-[#F0DEE4] bg-white text-[#39313A] hover:border-[#C58FA3]/50';
                            if (hasAnswered) {
                              if (isCorrect) {
                                optClasses = 'border-emerald-300 bg-emerald-50 text-emerald-900';
                              } else if (isSelected) {
                                optClasses = 'border-red-300 bg-red-50 text-red-900';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  setSelectedMcqAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                  if (isCorrect) {
                                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                                  }
                                }}
                                className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optClasses}`}
                              >
                                <span>{opt}</span>
                                {hasAnswered && isCorrect && (
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}

                          {selectedMcqAnswers[q.id] !== undefined && q.explanation && (
                            <div className="p-2.5 bg-[#F9E9ED]/50 border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] mt-2">
                              <strong className="text-[#A77C94]">Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Written Question (Short or Long) */}
                      {!isMcq && (
                        <div className="space-y-3 pt-1">
                          <textarea
                            rows={3}
                            value={writtenAnswers[q.id] || ''}
                            onChange={(e) => setWrittenAnswers({ ...writtenAnswers, [q.id]: e.target.value })}
                            placeholder={`Type your ${q.marks}-mark model answer here. Include key formulas, points, and definitions...`}
                            className="w-full p-3 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] resize-none"
                          />

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[#85808A]">
                              UniVerse evaluates against actual university marking criteria
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEvaluateWritten(q)}
                              disabled={evaluatingQuestionId === q.id || !writtenAnswers[q.id]?.trim()}
                              className="px-3.5 py-1.5 bg-[#C58FA3] hover:bg-[#b87d93] disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                            >
                              {evaluatingQuestionId === q.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating...
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" /> Evaluate with AI Examiner
                                </>
                              )}
                            </button>
                          </div>

                          {/* Evaluation Result */}
                          {evalData && (
                            <div className="p-3.5 rounded-2xl bg-white border border-[#F0DEE4] space-y-2 mt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#39313A]">
                                  Examiner Evaluation:
                                </span>
                                <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Awarded: {evalData.awardedMarks} / {evalData.maxMarks} Marks ({evalData.grade})
                                </div>
                              </div>

                              <p className="text-xs text-[#39313A] italic">
                                "{evalData.examinerFeedback}"
                              </p>

                              {evalData.strengths && evalData.strengths.length > 0 && (
                                <div className="text-[11px] text-emerald-700">
                                  <strong>Strengths:</strong> {evalData.strengths.join(' · ')}
                                </div>
                              )}

                              {evalData.missingPoints && evalData.missingPoints.length > 0 && (
                                <div className="text-[11px] text-amber-800">
                                  <strong>Missing for Full Marks:</strong> {evalData.missingPoints.join(' · ')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
