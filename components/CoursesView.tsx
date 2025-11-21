
import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  History, 
  Target, 
  FileText
} from 'lucide-react';
import { Course, Assignment, StudySession, AssignmentStatus } from '../types';

interface CoursesViewProps {
  courses: Course[];
  assignments: Assignment[];
  sessions: StudySession[];
}

export const CoursesView: React.FC<CoursesViewProps> = ({ 
  courses, 
  assignments, 
  sessions 
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in border-2 border-dashed border-gray-700 rounded-xl">
        <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h3 className="text-xl font-black text-white font-mono">NO COURSES FOUND</h3>
        <p className="text-gray-500 mt-2 font-mono">Initialize courses in Settings.</p>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const courseAssignments = assignments.filter(a => a.courseId === selectedCourse.id);
  const courseSessions = sessions.filter(s => s.courseId === selectedCourse.id).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const completedHours = selectedCourse.hoursCompleted;
  const totalHours = selectedCourse.totalHoursTarget;
  const progress = Math.min(100, Math.round((completedHours / totalHours) * 100));
  
  const completedAssignmentsCount = courseAssignments.filter(a => a.status === AssignmentStatus.COMPLETED).length;
  const totalAssignmentsCount = courseAssignments.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Course Navigation Tabs */}
      <div className="flex flex-wrap gap-3">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className={`retro-btn flex items-center gap-2 px-5 py-3 text-sm font-bold font-mono uppercase transition-all ${
              selectedCourse.id === course.id
                ? `bg-white text-black shadow-[4px_4px_0px_0px_#6366f1]`
                : 'bg-gray-800 text-gray-400 border-gray-600 shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            <div className={`w-3 h-3 border border-black ${course.color}`}></div>
            {course.name}
          </button>
        ))}
      </div>

      {/* Main Dashboard for Selected Course */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Card */}
          <div className={`retro-card p-6 relative overflow-hidden bg-gray-800`}>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-6 h-6 border-2 border-black ${selectedCourse.color} shadow-[2px_2px_0px_0px_#000]`}></div>
                    <h2 className={`text-3xl font-black text-white font-mono uppercase tracking-tighter`}>{selectedCourse.name}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-gray-400 mt-2">
                     <div className="flex items-center gap-2 bg-black px-3 py-1 border border-gray-700 text-xs font-mono font-bold uppercase text-yellow-400">
                        <Target className="w-3 h-3" />
                        <span>Target: {totalHours}H</span>
                     </div>
                     {selectedCourse.nextExamDate && (
                        <div className="flex items-center gap-2 bg-black px-3 py-1 border border-gray-700 text-xs font-mono font-bold uppercase text-red-400">
                            <Calendar className="w-3 h-3" />
                            <span>Exam: {new Date(selectedCourse.nextExamDate).toLocaleDateString()}</span>
                        </div>
                     )}
                  </div>
                </div>
                <div className="text-right bg-black p-2 border-2 border-gray-700 shadow-[4px_4px_0px_0px_#000]">
                    <div className={`text-4xl font-black text-white font-mono`}>{progress}%</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase font-bold">Completion</div>
                </div>
              </div>

              <div className="bg-gray-900 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                 <div className="flex justify-between text-xs font-bold font-mono text-gray-300 mb-2 uppercase">
                    <span>Progress Bar</span>
                    <span>{completedHours} / {totalHours} HRS</span>
                 </div>
                 <div className="w-full bg-gray-800 h-6 border-2 border-black relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]"></div>
                    <div className={`h-full ${selectedCourse.color} border-r-2 border-black transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="retro-card p-6">
            <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-3">
                <h3 className="font-black text-white font-mono uppercase flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                    Active Tasks ({completedAssignmentsCount}/{totalAssignmentsCount})
                </h3>
            </div>
            
            <div className="space-y-3">
                {courseAssignments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 font-mono uppercase text-sm">No tasks assigned.</p>
                ) : (
                    courseAssignments.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(assignment => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 border-2 border-black ${assignment.status === AssignmentStatus.COMPLETED ? 'bg-green-500' : assignment.status === AssignmentStatus.IN_PROGRESS ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                                <div>
                                    <div className={`font-bold font-mono text-sm ${assignment.status === AssignmentStatus.COMPLETED ? 'text-gray-500 line-through' : 'text-white'}`}>
                                        {assignment.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono uppercase">Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="text-xs font-bold font-mono bg-black text-white px-2 py-1 border border-gray-700">
                                {assignment.status === AssignmentStatus.COMPLETED ? 'DONE' : `${assignment.estimatedHours}H EST`}
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>

        {/* Right Column: History & Notes */}
        <div className="space-y-8">
            
            {/* Study History */}
            <div className="retro-card p-6">
                <h3 className="font-black text-white mb-6 font-mono uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                    <History className="w-5 h-5 text-orange-500" />
                    Session Log
                </h3>
                <div className="space-y-4">
                    {courseSessions.length === 0 ? (
                        <div className="text-center text-gray-500 text-xs font-mono uppercase py-4">
                            No data recorded.
                        </div>
                    ) : (
                        courseSessions.slice(0, 5).map(session => (
                            <div key={session.id} className="relative pl-6 border-l-2 border-gray-700">
                                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 border border-black ${selectedCourse.color}`}></div>
                                <div className="text-xs font-bold font-mono text-white uppercase">
                                    {new Date(session.startTime).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500 mb-1 font-mono">
                                    {(session.durationSeconds / 3600).toFixed(1)} HRS
                                </div>
                                {session.notes && (
                                    <div className="text-xs text-gray-300 bg-gray-800 p-2 border border-black font-mono mt-1 shadow-[2px_2px_0px_0px_#000]">
                                        > {session.notes}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Course Notes / Knowledge */}
            <div className="retro-card p-6 flex flex-col h-96">
                <h3 className="font-black text-white mb-4 font-mono uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Data Bank
                </h3>
                <div className="flex-1 bg-black border-2 border-gray-700 p-4 overflow-y-auto text-xs text-green-400 font-mono leading-relaxed whitespace-pre-wrap shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    {selectedCourse.knowledge ? (
                        selectedCourse.knowledge
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600">
                            <p className="uppercase font-bold">No data.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
