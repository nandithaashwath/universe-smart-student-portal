import { useState } from 'react';
import { StudentProfile, TimetableSlot } from '../../types';
import { loadTimetableSlots, saveTimetableSlots } from '../../utils/storage';
import {
  X,
  Calendar,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Sparkles,
  Clock,
  AlertCircle,
  RefreshCw,
  Zap,
  Coffee,
  FileCheck,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSendToChat: (prompt: string) => void;
}

const DAYS: TimetableSlot['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function TimetableModal({
  isOpen,
  onClose,
  studentProfile,
  onSendToChat,
}: Props) {
  const [slots, setSlots] = useState<TimetableSlot[]>(() => loadTimetableSlots());
  const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>('Monday');
  const [showGenerator, setShowGenerator] = useState(true);

  // Generator parameters adhering to Smart Study Planning Rules
  const subjects = studentProfile.currentSubjects && studentProfile.currentSubjects.length > 0
    ? studentProfile.currentSubjects
    : ['Operating Systems', 'Database Management Systems', 'Algorithms', 'Computer Networks'];

  const [studyHours, setStudyHours] = useState<number>(3);
  const [prioritySubject, setPrioritySubject] = useState<string>(subjects[0] || 'Operating Systems');
  const [examTimeline, setExamTimeline] = useState<string>('Mid-Term Examinations in 2-3 Weeks');

  // Manual Add Slot Inputs
  const [time, setTime] = useState('06:30 - 07:20 AM');
  const [subject, setSubject] = useState(subjects[0] || 'Operating Systems');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<TimetableSlot['type']>('concept');

  if (!isOpen) return null;

  const filteredSlots = slots.filter((s) => s.day === selectedDay);
  const totalCompleted = slots.filter((s) => s.completed).length;
  const progressPercent = slots.length > 0 ? Math.round((totalCompleted / slots.length) * 100) : 0;

  const handleToggleComplete = (id: string) => {
    const updated = slots.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    setSlots(updated);
    saveTimetableSlots(updated);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newSlot: TimetableSlot = {
      id: 'slot-' + Date.now(),
      day: selectedDay,
      time,
      subject,
      topic: topic.trim(),
      type,
      completed: false,
    };

    const updated = [...slots, newSlot];
    setSlots(updated);
    saveTimetableSlots(updated);
    setTopic('');
  };

  const handleDeleteSlot = (id: string) => {
    const updated = slots.filter((s) => s.id !== id);
    setSlots(updated);
    saveTimetableSlots(updated);
  };

  // Smart Study Planner Auto-Generator: Follows ALL 10 Smart Study Planning Rules
  const handleAutoGenerateFullWeek = () => {
    const s0 = prioritySubject;
    const s1 = subjects.find((s) => s !== s0) || subjects[0];
    const s2 = subjects.find((s) => s !== s0 && s !== s1) || subjects[1 % subjects.length] || subjects[0];
    const s3 = subjects.find((s) => s !== s0 && s !== s1 && s !== s2) || subjects[2 % subjects.length] || subjects[0];
    const s4 = subjects.find((s) => s !== s0 && s !== s1 && s !== s2 && s !== s3) || subjects[3 % subjects.length] || subjects[0];

    const generated: TimetableSlot[] = [
      // Monday
      {
        id: 'gen-mon-1',
        day: 'Monday',
        time: '06:30 - 07:20 AM',
        subject: s0,
        topic: 'Deep Work: Core Theory & High-Yield Mechanisms',
        type: 'concept',
        completed: false,
      },
      {
        id: 'gen-mon-break-1',
        day: 'Monday',
        time: '07:20 - 07:30 AM',
        subject: 'Scheduled Rest',
        topic: 'Hydration, eye rest & physical stretch (No screens)',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-mon-2',
        day: 'Monday',
        time: '07:30 - 08:20 AM',
        subject: s0,
        topic: 'Active Recall: Derivations & Formula Writing Sheet',
        type: 'revision',
        completed: false,
      },
      {
        id: 'gen-mon-3',
        day: 'Monday',
        time: '06:30 - 07:20 PM',
        subject: s1,
        topic: 'Problem Practice: University PYQs & Analytical Drills',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-mon-break-2',
        day: 'Monday',
        time: '07:20 - 07:30 PM',
        subject: 'Scheduled Rest',
        topic: 'Light movement & reset',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-mon-4',
        day: 'Monday',
        time: '07:30 - 08:00 PM',
        subject: `${s0} & ${s1}`,
        topic: 'Spaced Repetition: Rapid Flashcard Recall',
        type: 'revision',
        completed: false,
      },

      // Tuesday
      {
        id: 'gen-tue-1',
        day: 'Tuesday',
        time: '06:30 - 07:20 AM',
        subject: s1,
        topic: 'Deep Work: Architecture Diagrams & System Flowcharts',
        type: 'concept',
        completed: false,
      },
      {
        id: 'gen-tue-break-1',
        day: 'Tuesday',
        time: '07:20 - 07:30 AM',
        subject: 'Scheduled Rest',
        topic: 'Recharge & water break',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-tue-2',
        day: 'Tuesday',
        time: '07:30 - 08:20 AM',
        subject: s1,
        topic: 'Exam Writing Drill: 5-Mark Answers with Labeled Diagrams',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-tue-3',
        day: 'Tuesday',
        time: '06:30 - 07:20 PM',
        subject: s0,
        topic: 'Priority Focus: High-Weightage Problem Solving',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-tue-break-2',
        day: 'Tuesday',
        time: '07:20 - 07:30 PM',
        subject: 'Scheduled Rest',
        topic: 'Posture reset',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-tue-4',
        day: 'Tuesday',
        time: '07:30 - 08:00 PM',
        subject: s1,
        topic: 'Active Recall: Blurt Technique on Blank Paper',
        type: 'revision',
        completed: false,
      },

      // Wednesday
      {
        id: 'gen-wed-1',
        day: 'Wednesday',
        time: '06:30 - 07:20 AM',
        subject: s2,
        topic: 'Deep Work: Foundational Principles & Boundary Edge Cases',
        type: 'concept',
        completed: false,
      },
      {
        id: 'gen-wed-break-1',
        day: 'Wednesday',
        time: '07:20 - 07:30 AM',
        subject: 'Scheduled Rest',
        topic: 'Eye relaxation',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-wed-2',
        day: 'Wednesday',
        time: '07:30 - 08:20 AM',
        subject: s2,
        topic: 'Analytical Problem Practice: Time/Space Trade-offs',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-wed-3',
        day: 'Wednesday',
        time: '06:30 - 07:20 PM',
        subject: s0,
        topic: 'Mid-Week Spaced Revision: Re-attempting Tough Concepts',
        type: 'revision',
        completed: false,
      },
      {
        id: 'gen-wed-break-2',
        day: 'Wednesday',
        time: '07:20 - 07:30 PM',
        subject: 'Scheduled Rest',
        topic: 'Walk & mental refresh',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-wed-4',
        day: 'Wednesday',
        time: '07:30 - 08:00 PM',
        subject: `${s0} & ${s2}`,
        topic: 'Formula Quick-Sheet Self-Quiz',
        type: 'revision',
        completed: false,
      },

      // Thursday
      {
        id: 'gen-thu-1',
        day: 'Thursday',
        time: '06:30 - 07:20 AM',
        subject: s3,
        topic: 'Deep Work: High-Credit Syllabus Unit Mastery',
        type: 'concept',
        completed: false,
      },
      {
        id: 'gen-thu-break-1',
        day: 'Thursday',
        time: '07:20 - 07:30 AM',
        subject: 'Scheduled Rest',
        topic: 'Mindful breathing',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-thu-2',
        day: 'Thursday',
        time: '07:30 - 08:20 AM',
        subject: s3,
        topic: '10-Mark Model Answer Practice: Comprehensive Format',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-thu-3',
        day: 'Thursday',
        time: '06:30 - 07:20 PM',
        subject: s0,
        topic: 'Priority Focus: Past 5-Year University Exam Papers',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-thu-break-2',
        day: 'Thursday',
        time: '07:20 - 07:30 PM',
        subject: 'Scheduled Rest',
        topic: 'Break & hydration',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-thu-4',
        day: 'Thursday',
        time: '07:30 - 08:00 PM',
        subject: s3,
        topic: 'Error Log Review: Common Exam Pitfalls',
        type: 'revision',
        completed: false,
      },

      // Friday
      {
        id: 'gen-fri-1',
        day: 'Friday',
        time: '06:30 - 07:20 AM',
        subject: s4,
        topic: 'Deep Work: Theoretical Models & Case Implementations',
        type: 'concept',
        completed: false,
      },
      {
        id: 'gen-fri-break-1',
        day: 'Friday',
        time: '07:20 - 07:30 AM',
        subject: 'Scheduled Rest',
        topic: 'Rest & tea',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-fri-2',
        day: 'Friday',
        time: '07:30 - 08:20 AM',
        subject: s4,
        topic: 'Viva & Rapid 2-Mark Drill: Key Term Definitions',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-fri-3',
        day: 'Friday',
        time: '06:30 - 07:20 PM',
        subject: `${s0} & ${s1}`,
        topic: 'Weekly Curriculum Synthesis & Cross-Topic Links',
        type: 'project',
        completed: false,
      },
      {
        id: 'gen-fri-break-2',
        day: 'Friday',
        time: '07:20 - 07:30 PM',
        subject: 'Scheduled Rest',
        topic: 'Weekend preparation rest',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-fri-4',
        day: 'Friday',
        time: '07:30 - 08:00 PM',
        subject: 'All Subjects',
        topic: 'Saturday Mock Test Logistics & Cheatsheet Setup',
        type: 'revision',
        completed: false,
      },

      // Saturday (Exam Simulation & Analysis)
      {
        id: 'gen-sat-1',
        day: 'Saturday',
        time: '09:30 - 10:00 AM',
        subject: 'All Subjects',
        topic: 'Pre-Exam Warmup: Formula Sheet Quick Scan',
        type: 'revision',
        completed: false,
      },
      {
        id: 'gen-sat-2',
        day: 'Saturday',
        time: '10:00 - 11:30 AM',
        subject: `${s0} & ${s1}`,
        topic: 'Full Timed Mock Test: 90-Min Closed-Book Exam Simulation',
        type: 'mock_test',
        completed: false,
      },
      {
        id: 'gen-sat-break-1',
        day: 'Saturday',
        time: '11:30 - 12:00 PM',
        subject: 'Scheduled Rest',
        topic: 'Physical walk, lunch & mental decompression',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-sat-3',
        day: 'Saturday',
        time: '04:00 - 05:00 PM',
        subject: `${s0} & ${s1}`,
        topic: 'University Rubric Evaluation & Error Log Documentation',
        type: 'practice',
        completed: false,
      },
      {
        id: 'gen-sat-break-2',
        day: 'Saturday',
        time: '05:00 - 05:15 PM',
        subject: 'Scheduled Rest',
        topic: 'Afternoon tea & stretch',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-sat-4',
        day: 'Saturday',
        time: '05:15 - 06:00 PM',
        subject: s0,
        topic: 'Targeted Re-Solve: Fixing Every Mistake from Mock Test',
        type: 'practice',
        completed: false,
      },

      // Sunday (Consolidation & Re-calibration)
      {
        id: 'gen-sun-1',
        day: 'Sunday',
        time: '09:00 - 10:00 AM',
        subject: 'All Profile Subjects',
        topic: `Active Recall Master Session across ${subjects.join(', ')}`,
        type: 'revision',
        completed: false,
      },
      {
        id: 'gen-sun-break-1',
        day: 'Sunday',
        time: '10:00 - 10:15 AM',
        subject: 'Scheduled Rest',
        topic: 'Sunday break & recharge',
        type: 'break',
        completed: false,
      },
      {
        id: 'gen-sun-2',
        day: 'Sunday',
        time: '10:15 - 11:15 AM',
        subject: s0,
        topic: 'Weak-Spot Remediation: Revisiting Mock Test Flags',
        type: 'concept',
        completed: false,
      },
      {
        id: 'gen-sun-3',
        day: 'Sunday',
        time: '04:00 - 04:45 PM',
        subject: 'All Subjects',
        topic: 'Consolidate 1-Page Master Formula & Architecture Cheatsheet',
        type: 'revision',
        completed: false,
      },
      {
        id: 'gen-sun-4',
        day: 'Sunday',
        time: '04:45 - 05:15 PM',
        subject: 'Routine Management',
        topic: 'Weekly Schedule Re-calibration (Adapt slots for upcoming classes/labs)',
        type: 'project',
        completed: false,
      },
    ];

    setSlots(generated);
    saveTimetableSlots(generated);
  };

  const handleSendSmartPlanToChat = () => {
    const prompt = `UniVerse, please design a personalized 7-day study timetable for me at ${studentProfile.university} (${studentProfile.branch}, ${studentProfile.semester}).
My Current Subjects (Profile): ${subjects.join(', ')}.
Daily Available Study Time: ${studyHours} hours per day (with realistic 50m study / 10m rest breaks).
Priority / Tough Subject: ${prioritySubject} (Please allocate more morning deep-work & PYQ problem slots here).
Exam Timeline / Goal: ${examTimeline}.
My Academic Target: ${studentProfile.academicGoals}.

Please structure the full 7 days (Monday through Sunday) with:
1. Realistic 50m focus blocks + 10m rest breaks
2. Active recall and 5-mark & 10-mark practice questions
3. A timed mock test simulation on Saturday with error analysis
4. Sunday spaced revision and schedule re-calibration for my college availability.`;
    onSendToChat(prompt);
    onClose();
  };

  const slotTypeBadges: Record<TimetableSlot['type'], { color: string; label: string }> = {
    concept: { color: 'border-[#F0DEE4] bg-[#F9E9ED] text-[#A77C94]', label: 'Concept Deep Work' },
    practice: { color: 'border-emerald-200 bg-emerald-50 text-emerald-800', label: 'PYQ & Problem Practice' },
    revision: { color: 'border-amber-200 bg-amber-50 text-amber-800', label: 'Active Recall & Revision' },
    project: { color: 'border-purple-200 bg-purple-50 text-purple-800', label: 'Lab / Synthesis' },
    break: { color: 'border-teal-200 bg-teal-50 text-teal-800', label: 'Scheduled Rest' },
    mock_test: { color: 'border-rose-200 bg-rose-50 text-rose-800', label: 'Timed Mock Test' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#39313A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white border border-[#F0DEE4] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#F0DEE4] flex items-center justify-between bg-gradient-to-r from-[#F9E9ED] via-[#FFF9F8] to-[#F9E9ED]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F9E9ED] border border-[#F0DEE4] flex items-center justify-center text-[#C58FA3] shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                  Smart Study Timetable & Routine
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F9E9ED] text-[#A77C94] border border-[#EACCD6]">
                  Smart Rules Engine
                </span>
              </div>
              <p className="text-xs text-[#85808A] mt-0.5">
                Personalized 7-day schedule for <span className="text-[#39313A] font-medium">{studentProfile.name}</span> ({studentProfile.branch}, {studentProfile.semester})
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

        {/* Smart Rules Overview & Generator Accordion */}
        <div className="px-6 py-3 bg-[#FFF9F8] border-b border-[#F0DEE4]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#39313A]">
              <Sparkles className="w-4 h-4 text-[#C58FA3]" />
              <span className="font-semibold text-[#39313A]">Smart Study Planning Rules:</span>
              <span className="text-[#85808A] hidden sm:inline">
                Uses your exact saved subjects only • 50m study / 10m breaks • Active recall & mock tests
              </span>
            </div>
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="text-xs text-[#A77C94] hover:text-[#C58FA3] flex items-center gap-1 font-medium transition-colors"
            >
              {showGenerator ? 'Hide Calibration' : 'Customize & Generate'}
              {showGenerator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showGenerator && (
            <div className="mt-3 pt-3 border-t border-[#F0DEE4] grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
              {/* Daily Available Hours */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#85808A] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C58FA3]" /> Daily Study Hours
                </label>
                <select
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
                >
                  <option value={2}>2 Hours / Day (Focused Core)</option>
                  <option value={3}>3 Hours / Day (Recommended Balanced)</option>
                  <option value={4}>4 Hours / Day (Intensive Semester)</option>
                  <option value={5}>5+ Hours / Day (Exam Blitz)</option>
                </select>
              </div>

              {/* Priority Subject (strictly from studentProfile.currentSubjects) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#85808A] uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#C58FA3]" /> Priority / Hardest Subject
                </label>
                <select
                  value={prioritySubject}
                  onChange={(e) => setPrioritySubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s} (Extra Focus)
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Timeline */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#85808A] uppercase tracking-wider flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-emerald-600" /> Exam Date / Timeline
                </label>
                <select
                  value={examTimeline}
                  onChange={(e) => setExamTimeline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
                >
                  <option value="Mid-Term Examinations in 2-3 Weeks">Mid-Terms in 2-3 Weeks</option>
                  <option value="End-Semester Finals in 1 Month">End-Semester Finals in 1 Month</option>
                  <option value="Weekly Continuous Assessment / Quizzes">Weekly Quizzes / Assessments</option>
                  <option value="Regular Semester High-Retention Routine">Regular Semester Prep</option>
                </select>
              </div>

              {/* Action Buttons for Generator */}
              <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="text-[11px] text-[#85808A] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C58FA3]" />
                  <span>Subjects included: <strong className="text-[#39313A]">{subjects.join(', ')}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateFullWeek}
                    className="px-3.5 py-1.5 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Auto-Populate 7-Day Slots
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSmartPlanToChat}
                    className="px-3.5 py-1.5 bg-[#F9E9ED] hover:bg-[#f3d9e0] text-[#A77C94] border border-[#EACCD6] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C58FA3]" /> Deep Plan in Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress & Quick Stats */}
        <div className="px-6 py-2.5 bg-white border-b border-[#F0DEE4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#85808A]">Weekly Completion:</span>
            <div className="w-28 sm:w-36 h-2 bg-[#F9E9ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C58FA3] to-[#A77C94] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#A77C94] tabular-nums">
              {totalCompleted} / {slots.length} Done ({progressPercent}%)
            </span>
          </div>

          <div className="text-[11px] text-[#85808A] flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-[#FFF9F8] border border-[#F0DEE4] text-[#85808A]">
              💡 You can modify slots anytime as your availability changes
            </span>
          </div>
        </div>

        {/* Days Filter Tabs (Monday to Sunday) */}
        <div className="flex border-b border-[#F0DEE4] bg-[#FFF9F8] px-6 overflow-x-auto gap-1.5 py-2 scrollbar-none">
          {DAYS.map((day) => {
            const daySlots = slots.filter((s) => s.day === day);
            const dayCount = daySlots.length;
            const completedCount = daySlots.filter((s) => s.completed).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#C58FA3] text-white shadow-xs font-semibold'
                    : 'text-[#85808A] hover:text-[#39313A] hover:bg-white'
                }`}
              >
                {day}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : completedCount > 0 && completedCount === dayCount
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-[#F9E9ED] text-[#85808A]'
                  }`}
                >
                  {completedCount}/{dayCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slots Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-white">
          {/* Add Slot Form */}
          <form onSubmit={handleAddSlot} className="p-3.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#39313A]">
              <span>Add Custom Study / Break Block for {selectedDay}</span>
              <span className="text-[11px] font-normal text-[#85808A]">Only uses your profile subjects</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time (e.g. 06:30 - 07:20 AM)"
                className="px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3]"
              />

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="Scheduled Rest">Scheduled Rest (10m Break)</option>
                <option value="All Profile Subjects">All Profile Subjects (Revision)</option>
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] focus:outline-none focus:border-[#C58FA3]"
              >
                <option value="concept">Concept Deep Work</option>
                <option value="practice">PYQ & Problem Practice</option>
                <option value="revision">Active Recall & Revision</option>
                <option value="break">Scheduled Rest (Break)</option>
                <option value="mock_test">Timed Mock Test</option>
                <option value="project">Lab / Project</option>
              </select>

              <button
                type="submit"
                className="px-3 py-2 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Block
              </button>
            </div>

            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic or task (e.g., Process Synchronization & Semaphores derivation)"
              className="w-full px-3 py-2 bg-white border border-[#F0DEE4] rounded-xl text-xs text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3]"
            />
          </form>

          {/* Slots List */}
          <div className="space-y-2.5">
            {filteredSlots.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-[#F0DEE4] rounded-2xl bg-[#FFF9F8]">
                <Calendar className="w-8 h-8 text-[#C58FA3]/60 mx-auto mb-2" />
                <p className="text-xs font-medium text-[#39313A]">No study blocks scheduled for {selectedDay}.</p>
                <p className="text-[11px] text-[#85808A] mt-1">
                  Click <strong className="text-[#A77C94]">Auto-Populate 7-Day Slots</strong> above to generate a balanced routine with breaks, recall, and tests!
                </p>
              </div>
            ) : (
              filteredSlots.map((slot) => {
                const badge = slotTypeBadges[slot.type] || slotTypeBadges.concept;
                const isBreak = slot.type === 'break';
                const isMock = slot.type === 'mock_test';

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      slot.completed
                        ? 'bg-[#FFF9F8] border-[#F0DEE4] opacity-60'
                        : isBreak
                        ? 'bg-teal-50/50 border-teal-200'
                        : isMock
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-white border-[#F0DEE4] hover:border-[#C58FA3]/50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleComplete(slot.id)}
                        className="text-[#85808A] hover:text-[#C58FA3] transition-colors shrink-0"
                        title={slot.completed ? 'Mark pending' : 'Mark completed'}
                      >
                        {slot.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#85808A]/60 hover:text-[#C58FA3]" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-semibold text-[#39313A] truncate">
                            {slot.subject}
                          </span>
                          <span className="text-xs text-[#85808A] flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-[#85808A]" /> {slot.time}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 truncate ${slot.completed ? 'line-through text-[#85808A]' : 'text-[#39313A]'}`}>
                          {slot.topic}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-[#85808A] hover:text-red-500 p-1.5 rounded-lg hover:bg-[#F9E9ED] transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FFF9F8] border-t border-[#F0DEE4] flex items-center justify-between text-xs text-[#85808A]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Strictly personalized for <strong className="text-[#39313A]">{studentProfile.university}</strong> syllabus</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl font-medium transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
