import { useState } from 'react';
import { CGPACourse, StudentProfile } from '../../types';
import { loadSavedCourses, saveCourses } from '../../utils/storage';
import { X, Calculator, Plus, Trash2, ArrowRight, Target, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSendToChat: (prompt: string) => void;
}

const GRADE_POINTS: { label: string; points: number; desc: string }[] = [
  { label: 'O (Outstanding)', points: 10, desc: '90-100%' },
  { label: 'A+ (Excellent)', points: 9, desc: '80-89%' },
  { label: 'A (Very Good)', points: 8, desc: '70-79%' },
  { label: 'B+ (Good)', points: 7, desc: '60-69%' },
  { label: 'B (Above Average)', points: 6, desc: '55-59%' },
  { label: 'C (Average)', points: 5, desc: '50-54%' },
  { label: 'P (Pass)', points: 4, desc: '40-49%' },
  { label: 'F (Fail)', points: 0, desc: '<40%' },
];

export default function CgpaCalculatorModal({
  isOpen,
  onClose,
  studentProfile,
  onSendToChat,
}: Props) {
  const [courses, setCourses] = useState<CGPACourse[]>(() => loadSavedCourses());
  const [activeTab, setActiveTab] = useState<'sgpa' | 'target'>('sgpa');

  // SGPA Add course state
  const [newCourseName, setNewCourseName] = useState('');
  const [newCredits, setNewCredits] = useState(4);
  const [newGradePoint, setNewGradePoint] = useState(10);

  // Target CGPA simulator state
  const [currentCgpa, setCurrentCgpa] = useState<number>(8.4);
  const [completedCredits, setCompletedCredits] = useState<number>(64);
  const [targetCgpa, setTargetCgpa] = useState<number>(9.0);
  const [upcomingCredits, setUpcomingCredits] = useState<number>(22);

  if (!isOpen) return null;

  // Calculate SGPA
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const totalWeightedPoints = courses.reduce((acc, c) => acc + c.credits * c.gradePoint, 0);
  const calculatedSgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    const updated = [
      ...courses,
      {
        id: 'course-' + Date.now(),
        name: newCourseName.trim(),
        credits: Number(newCredits),
        gradePoint: Number(newGradePoint),
      },
    ];
    setCourses(updated);
    saveCourses(updated);
    setNewCourseName('');
  };

  const handleRemoveCourse = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    saveCourses(updated);
  };

  const handleGradeChange = (id: string, gradePoint: number) => {
    const updated = courses.map((c) => (c.id === id ? { ...c, gradePoint } : c));
    setCourses(updated);
    saveCourses(updated);
  };

  // Calculate Target Required SGPA
  const requiredSgpa =
    upcomingCredits > 0
      ? (targetCgpa * (completedCredits + upcomingCredits) - currentCgpa * completedCredits) / upcomingCredits
      : 0;

  const handleSendSgpaToChat = () => {
    const summary = `Here is my current semester course breakdown:
${courses.map((c) => `- ${c.name} (${c.credits} Credits): Projected Grade ${c.gradePoint}/10`).join('\n')}
Estimated SGPA: ${calculatedSgpa} / 10.0.

UniVerse, based on my academic profile at ${studentProfile.university} (${studentProfile.branch}, ${studentProfile.semester}), please analyze my grade forecast and provide a subject-by-subject high-yield strategy to secure O and A+ grades in all high-credit subjects.`;
    onSendToChat(summary);
    onClose();
  };

  const handleSendTargetToChat = () => {
    const targetSummary = `CGPA Target Plan:
- Current CGPA: ${currentCgpa} (${completedCredits} Credits completed)
- Target CGPA: ${targetCgpa}
- Upcoming Semester: ${upcomingCredits} Credits
- Required SGPA this semester: ${requiredSgpa.toFixed(2)} / 10.0

UniVerse, what is the exact strategy and marks breakdown in internal assessments and end-semester exams for my subjects (${studentProfile.currentSubjects.join(', ')}) to hit an SGPA of ${requiredSgpa.toFixed(2)}?`;
    onSendToChat(targetSummary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#39313A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white border border-[#F0DEE4] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#F0DEE4] flex items-center justify-between bg-gradient-to-r from-[#F9E9ED] via-[#FFF9F8] to-[#F9E9ED]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F9E9ED] border border-[#F0DEE4] flex items-center justify-center text-[#C58FA3]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                CGPA & Required Marks Calculator
              </h2>
              <p className="text-xs text-[#85808A]">
                Calculate semester SGPA, cumulative CGPA, and required exam scores.
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

        {/* Tabs */}
        <div className="flex border-b border-[#F0DEE4] bg-[#FFF9F8] px-6 pt-2.5 gap-2">
          <button
            onClick={() => setActiveTab('sgpa')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sgpa'
                ? 'border-[#C58FA3] text-[#A77C94]'
                : 'border-transparent text-[#85808A] hover:text-[#39313A]'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Semester SGPA Estimator
          </button>
          <button
            onClick={() => setActiveTab('target')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'target'
                ? 'border-[#C58FA3] text-[#A77C94]'
                : 'border-transparent text-[#85808A] hover:text-[#39313A]'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Target CGPA & Exam Marks Simulator
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          {activeTab === 'sgpa' ? (
            <>
              {/* SGPA Score Hero Card */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-[#F9E9ED]/70 to-[#FFF9F8] border border-[#F0DEE4] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#85808A] font-medium">Projected Semester SGPA</div>
                  <div className="text-3xl font-extrabold text-[#39313A] tracking-tight mt-1 flex items-baseline gap-2">
                    <span className="tabular-nums text-[#A77C94]">{calculatedSgpa}</span>
                    <span className="text-sm font-normal text-[#85808A]">/ 10.0</span>
                  </div>
                  <div className="text-xs text-[#85808A] mt-1">
                    {totalCredits} Total Credits · {courses.length} Courses
                  </div>
                </div>
                <button
                  onClick={handleSendSgpaToChat}
                  className="px-4 py-2 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Analyze in UniVerse
                </button>
              </div>

              {/* Add Course Row */}
              <div className="p-3.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-2">
                <div className="text-xs font-medium text-[#39313A]">Add Semester Course</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Subject Name (e.g. Operating Systems)"
                    className="flex-1 px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
                    >
                      <option value={1}>1 Credit (Lab/Seminar)</option>
                      <option value={2}>2 Credits (Lab/Practical)</option>
                      <option value={3}>3 Credits (Core Theory)</option>
                      <option value={4}>4 Credits (Major Theory)</option>
                      <option value={5}>5 Credits (Comprehensive)</option>
                    </select>

                    <select
                      value={newGradePoint}
                      onChange={(e) => setNewGradePoint(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
                    >
                      {GRADE_POINTS.map((g) => (
                        <option key={g.points} value={g.points}>
                          {g.label} ({g.points} pts)
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddCourse}
                      className="px-3 py-2 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <div className="border border-[#F0DEE4] rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9E9ED]/50 text-[#85808A] border-b border-[#F0DEE4]">
                    <tr>
                      <th className="py-2.5 px-3.5 font-medium">Subject</th>
                      <th className="py-2.5 px-3 font-medium">Credits</th>
                      <th className="py-2.5 px-3 font-medium">Expected Grade</th>
                      <th className="py-2.5 px-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0DEE4]">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-[#FFF9F8] transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-[#39313A]">
                          {course.name}
                        </td>
                        <td className="py-2.5 px-3 text-[#85808A] tabular-nums">
                          {course.credits} Credits
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={course.gradePoint}
                            onChange={(e) => handleGradeChange(course.id, Number(e.target.value))}
                            className="bg-[#FFF9F8] border border-[#F0DEE4] text-[#39313A] px-2.5 py-1 rounded-lg text-xs focus:outline-none focus:border-[#C58FA3]"
                          >
                            {GRADE_POINTS.map((g) => (
                              <option key={g.points} value={g.points}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemoveCourse(course.id)}
                            className="text-[#85808A] hover:text-red-500 transition-colors p-1"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Target CGPA Simulator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-1.5">
                  <label className="text-xs text-[#85808A] font-medium">Current Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={currentCgpa}
                    onChange={(e) => setCurrentCgpa(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] font-mono focus:outline-none focus:border-[#C58FA3]"
                  />
                  <div className="text-[11px] text-[#85808A]">Your CGPA up to last semester</div>
                </div>

                <div className="p-3.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-1.5">
                  <label className="text-xs text-[#85808A] font-medium">Completed Credits So Far</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={completedCredits}
                    onChange={(e) => setCompletedCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] font-mono focus:outline-none focus:border-[#C58FA3]"
                  />
                  <div className="text-[11px] text-[#85808A]">e.g. 60-80 for 4th semester</div>
                </div>

                <div className="p-3.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-1.5">
                  <label className="text-xs text-[#85808A] font-medium">Target Desired CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] font-mono focus:outline-none focus:border-[#C58FA3]"
                  />
                  <div className="text-[11px] text-[#85808A]">Goal CGPA to graduate / hit milestone</div>
                </div>

                <div className="p-3.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-1.5">
                  <label className="text-xs text-[#85808A] font-medium">Upcoming Semester Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={upcomingCredits}
                    onChange={(e) => setUpcomingCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] font-mono focus:outline-none focus:border-[#C58FA3]"
                  />
                  <div className="text-[11px] text-[#85808A]">Total credits in this semester (typically 20-25)</div>
                </div>
              </div>

              {/* Target Result Box */}
              <div className="p-4.5 rounded-2xl bg-[#FFF9F8] border border-[#F0DEE4] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#39313A]">
                    Required SGPA in Upcoming Semester:
                  </div>
                  <div className={`text-2xl font-extrabold tabular-nums ${
                    requiredSgpa <= 10.0 && requiredSgpa >= 0
                      ? 'text-[#A77C94]'
                      : 'text-amber-600'
                  }`}>
                    {requiredSgpa.toFixed(2)} / 10.0
                  </div>
                </div>

                {requiredSgpa <= 10.0 && requiredSgpa >= 0 ? (
                  <div className="flex items-start gap-2 text-xs text-[#39313A] bg-[#F9E9ED]/50 p-3 rounded-xl border border-[#F0DEE4]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C58FA3] mt-0.5" />
                    <div>
                      <strong>Achievable Goal!</strong> By securing primarily{' '}
                      {requiredSgpa >= 9.0 ? "'O' and 'A+'" : "'A+' and 'A'"} grades across your upcoming {upcomingCredits} credits, you will reach your target CGPA of {targetCgpa}.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <strong>High Jump Required:</strong> Reaching {targetCgpa} in a single semester requires an SGPA exceeding 10.0. Consider distributing this target across the next 2 or 3 semesters.
                  </div>
                )}

                <button
                  onClick={handleSendTargetToChat}
                  className="w-full py-2.5 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-medium shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Ask UniVerse for Subject-by-Subject Strategy
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
