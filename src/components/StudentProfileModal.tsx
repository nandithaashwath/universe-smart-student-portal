import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { X, User, GraduationCap, Building2, BookOpen, Target, Sparkles, Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
  isFirstTime?: boolean;
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  isFirstTime = false,
}: Props) {
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });
  const [newSubject, setNewSubject] = useState('');

  if (!isOpen) return null;

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (!formData.currentSubjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        currentSubjects: [...formData.currentSubjects, newSubject.trim()],
      });
    }
    setNewSubject('');
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({
      ...formData,
      currentSubjects: formData.currentSubjects.filter((s) => s !== subject),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#39313A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white border border-[#F0DEE4] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0DEE4] flex items-center justify-between bg-gradient-to-r from-[#F9E9ED] via-[#FFF9F8] to-[#F9E9ED]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F9E9ED] border border-[#F0DEE4] flex items-center justify-center text-[#C58FA3] shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#39313A] tracking-tight">
                {isFirstTime ? 'Set Up Your Student Profile' : 'Academic Profile & Preferences'}
              </h2>
              <p className="text-xs text-[#85808A] mt-0.5">
                UniVerse personalizes exam answers, timetables, and career guidance for your syllabus.
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#85808A] hover:text-[#39313A] hover:bg-[#F9E9ED] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-medium text-[#39313A] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C58FA3]" /> Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] transition-colors"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-xs font-medium text-[#39313A] mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C58FA3]" /> University / College
              </label>
              <input
                type="text"
                required
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="e.g. Dayananda Sagar University"
                className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] transition-colors"
              />
            </div>

            {/* Degree */}
            <div>
              <label className="block text-xs font-medium text-[#39313A] mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#C58FA3]" /> Degree Program
              </label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.Tech / B.E. / BCA / M.Tech"
                className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] transition-colors"
              />
            </div>

            {/* Branch / Major */}
            <div>
              <label className="block text-xs font-medium text-[#39313A] mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#C58FA3]" /> Branch / Specialization
              </label>
              <input
                type="text"
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] transition-colors"
              />
            </div>
          </div>

          {/* Current Semester */}
          <div>
            <label className="block text-xs font-medium text-[#39313A] mb-1.5">
              Current Semester
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((sem) => (
                <button
                  type="button"
                  key={sem}
                  onClick={() => setFormData({ ...formData, semester: `${sem} Semester` })}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                    formData.semester.startsWith(sem)
                      ? 'bg-[#C58FA3] text-white border-[#C58FA3] shadow-xs'
                      : 'bg-[#FFF9F8] text-[#85808A] border-[#F0DEE4] hover:text-[#39313A] hover:border-[#C58FA3]/50'
                  }`}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>

          {/* Current Subjects */}
          <div>
            <label className="block text-xs font-medium text-[#39313A] mb-1.5">
              Current Semester Subjects & Courses
            </label>
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                placeholder="e.g. Machine Learning, Computer Networks..."
                className="flex-1 px-3.5 py-2 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-4 py-2 bg-[#F9E9ED] hover:bg-[#f3d9e0] text-[#A77C94] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-[#F0DEE4]"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Subjects Tags */}
            <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-[#FFF9F8] border border-[#F0DEE4] rounded-2xl">
              {formData.currentSubjects.length === 0 ? (
                <span className="text-xs text-[#85808A] italic py-1">No subjects added yet. Add your semester subjects above.</span>
              ) : (
                formData.currentSubjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9E9ED] border border-[#EACCD6] rounded-xl text-xs text-[#85808A] font-medium"
                  >
                    <span className="text-[#39313A]">{subject}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject)}
                      className="text-[#85808A] hover:text-red-500 transition-colors ml-0.5"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Academic Goals */}
          <div>
            <label className="block text-xs font-medium text-[#39313A] mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#C58FA3]" /> Academic & Career Goals
            </label>
            <textarea
              rows={3}
              value={formData.academicGoals}
              onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
              placeholder="e.g. Score 9.0+ CGPA in sem exams, master DSA and System Design, crack Summer 2027 SWE internship..."
              className="w-full px-3.5 py-2.5 bg-[#FFF9F8] border border-[#F0DEE4] rounded-xl text-sm text-[#39313A] placeholder-[#85808A]/60 focus:outline-none focus:border-[#C58FA3] transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3 items-center">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#85808A] hover:text-[#39313A] transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C58FA3] hover:bg-[#b87d93] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" /> Save Profile & Personalize UniVerse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
