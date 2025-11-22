
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  Timer, 
  PieChart as ChartIcon, 
  Menu, 
  X, 
  Bell,
  CheckCircle,
  Clock,
  ChevronRight,
  Flame,
  Settings as SettingsIcon,
  BrainCircuit,
  Bot
} from 'lucide-react';
import { Course, Assignment, StudySession, UserStats, ViewState, AssignmentStatus } from './types';
import { INITIAL_COURSES, INITIAL_ASSIGNMENTS, INITIAL_SESSIONS, INITIAL_USER_STATS } from './constants';
import { StudyTimer } from './components/StudyTimer';
import { Analytics } from './components/Analytics';
import { ChatBot } from './components/ChatBot';
import { SettingsView } from './components/SettingsView';
import { AssignmentsView } from './components/AssignmentsView';
import { PlannerView } from './components/PlannerView';
import { CoursesView } from './components/CoursesView';
import { ProcrastinationWidget } from './components/ProcrastinationWidget';
import { StudyPartner } from './components/StudyPartner';

const App = () => {
  // State Management
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Timer Quick Start State
  const [timerInitData, setTimerInitData] = useState<{ courseId?: string, topic?: string }>({});
  
  // Data State (Simulated "Backend")
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [sessions, setSessions] = useState<StudySession[]>(INITIAL_SESSIONS);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);

  // --- CRUD Actions ---

  const handleAddCourse = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleUpdateCourseWeakness = (courseId: string, concepts: string[]) => {
    setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, weakConcepts: concepts } : c
    ));
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm("Are you sure you want to delete this course? This will likely break analytics for existing sessions linked to it.")) {
      setCourses(prev => prev.filter(c => c.id !== id));
      // Optional: Delete associated assignments
      setAssignments(prev => prev.filter(a => a.courseId !== id));
    }
  };

  const handleAddAssignment = (newAssignment: Assignment) => {
    // Ensure createdAt is set if not provided (though AssignmentsView should set it, safe to double check)
    const assignmentWithDate = {
        ...newAssignment,
        createdAt: newAssignment.createdAt || new Date().toISOString()
    };
    setAssignments(prev => [...prev, assignmentWithDate]);
    // Update course total assignments count
    setCourses(curr => curr.map(c => 
        c.id === newAssignment.courseId ? {...c, totalAssignments: c.totalAssignments + 1} : c
    ));
  };

  const handleDeleteAssignment = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        setAssignments(prev => prev.filter(a => a.id !== id));
        // Update course count
        setCourses(curr => curr.map(c => 
            c.id === assignment.courseId ? {...c, totalAssignments: Math.max(0, c.totalAssignments - 1)} : c
        ));
    }
  };

  const handleSaveSession = (courseId: string, durationSeconds: number, notes: string, addToKnowledge: boolean, topic: string = 'General', difficulty: number = 3) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      courseId,
      startTime: new Date().toISOString(),
      durationSeconds,
      notes,
      date: new Date().toISOString().split('T')[0],
      topic,
      difficulty
    };

    setSessions(prev => [newSession, ...prev]);

    // Update Course Hours & Optionally Knowledge Base
    setCourses(prevCourses => prevCourses.map(course => {
      if (course.id === courseId) {
        const hoursToAdd = durationSeconds / 3600;
        let updatedKnowledge = course.knowledge || '';
        
        // If user wants to add these notes to the knowledge base for future AI context
        if (addToKnowledge && notes.trim()) {
            const today = new Date().toLocaleDateString();
            updatedKnowledge += `\n\n[Study Session Log - ${today} - ${topic}]:\n${notes}`;
        }

        return { 
            ...course, 
            hoursCompleted: parseFloat((course.hoursCompleted + hoursToAdd).toFixed(1)),
            knowledge: updatedKnowledge
        };
      }
      return course;
    }));

    // Update User Stats
    setUserStats(prev => ({
      ...prev,
      totalSemesterHours: parseFloat((prev.totalSemesterHours + (durationSeconds / 3600)).toFixed(1))
    }));
    
    // Reset timer init data
    setTimerInitData({});
  };

  const toggleAssignmentStatus = (id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === AssignmentStatus.COMPLETED 
          ? AssignmentStatus.IN_PROGRESS 
          : AssignmentStatus.COMPLETED;
        
        let startedAt = a.startedAt;
        // If moving to IN_PROGRESS for the first time (and previously null), set startedAt
        if (newStatus === AssignmentStatus.IN_PROGRESS && !a.startedAt) {
            startedAt = new Date().toISOString();
        }

        // Update course completed assignments count
        if (newStatus === AssignmentStatus.COMPLETED) {
           setCourses(curr => curr.map(c => 
             c.id === a.courseId ? {...c, completedAssignments: c.completedAssignments + 1} : c
           ));
        } else {
           setCourses(curr => curr.map(c => 
             c.id === a.courseId ? {...c, completedAssignments: c.completedAssignments - 1} : c
           ));
        }
        
        return { ...a, status: newStatus, startedAt };
      }
      return a;
    }));
  };

  const handleBreakPattern = (courseId: string, assignmentName: string) => {
      setTimerInitData({
          courseId,
          topic: `Micro-Sprint: ${assignmentName}`
      });
      setActiveView('TIMER');
  };

  // --- UI Components ---

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-2 ${
        activeView === view 
          ? 'bg-indigo-900/50 text-indigo-300 font-bold border-indigo-500 shadow-[3px_3px_0px_0px_#6366f1] translate-x-[-2px] translate-y-[-2px]' 
          : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'stroke-[3px]' : 'stroke-2'}`} />
      <span className="font-mono text-sm">{label}</span>
    </button>
  );

  const Dashboard = () => {
    const upcomingAssignments = assignments
      .filter(a => a.status !== AssignmentStatus.COMPLETED)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="retro-card p-5 flex flex-col relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-900/30 rounded-full border-2 border-indigo-900 z-0"></div>
            <div className="flex justify-between items-start mb-2 z-10">
              <span className="text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">Phase Progress</span>
            </div>
            <h3 className="text-2xl font-bold text-white z-10 font-mono">{userStats.phaseProgress}%</h3>
            <p className="text-xs text-gray-400 mt-1 z-10 font-bold">{userStats.phaseName}</p>
            <div className="w-full bg-gray-700 h-3 mt-4 border-2 border-black rounded-full overflow-hidden z-10">
              <div className="bg-indigo-500 h-full border-r-2 border-black" style={{ width: `${userStats.phaseProgress}%` }}></div>
            </div>
          </div>

          <div className="retro-card p-5 flex flex-col">
             <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">Weekly Goal</span>
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-white font-mono">{userStats.weeklyHours}<span className="text-gray-500 text-lg">/</span>{userStats.weeklyTarget}h</h3>
            <div className="w-full bg-gray-700 h-3 mt-4 border-2 border-black rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full border-r-2 border-black" style={{ width: `${(userStats.weeklyHours / userStats.weeklyTarget) * 100}%` }}></div>
            </div>
          </div>

           <div className="retro-card p-5 flex flex-col">
             <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">Total Hours</span>
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black text-white font-mono">{userStats.totalSemesterHours}</h3>
            <p className="text-xs font-bold text-emerald-400 mt-1">LIFETIME</p>
          </div>

           <div className="retro-card p-5 flex flex-col">
             <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">Streak</span>
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-3xl font-black text-white font-mono">{userStats.streakDays}</h3>
            <p className="text-xs font-bold text-orange-500 mt-1">DAYS IN A ROW</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             {/* Procrastination Widget (New Feature) */}
             <ProcrastinationWidget 
                assignments={assignments}
                courses={courses}
                onBreakPattern={handleBreakPattern}
             />

             {/* Upcoming Assignments */}
             <div className="retro-card p-6">
                <div className="flex items-center justify-between mb-6 border-b-2 border-gray-700 pb-4">
                <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                    <CalendarCheck className="w-6 h-6 text-indigo-400" />
                    Upcoming Deadlines
                </h3>
                <button onClick={() => setActiveView('ASSIGNMENTS')} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 font-mono">VIEW ALL</button>
                </div>
                <div className="space-y-4">
                {upcomingAssignments.map(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    return (
                    <div key={assignment.id} className="flex items-center p-4 bg-gray-800 border-2 border-gray-700 hover:border-indigo-500 rounded-lg transition-all hover:translate-x-1 group">
                        <div className={`w-2 h-12 ${course?.color || 'bg-gray-600'} border-2 border-black mr-4 shadow-[2px_2px_0px_0px_#000]`}></div>
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] bg-gray-700 text-gray-200`}>
                            {course?.name}
                            </span>
                            {daysLeft <= 3 && <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 border border-black">DUE SOON</span>}
                        </div>
                        <h4 className="font-bold text-white text-sm">{assignment.name}</h4>
                        </div>
                        <div className="text-right font-mono">
                        <div className={`text-lg font-bold ${daysLeft <= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                            {daysLeft}d
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                    );
                })}
                {upcomingAssignments.length === 0 && (
                    <div className="text-center py-10 text-gray-500 font-mono">No active assignments. Chill out. 🏖️</div>
                )}
                </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Quick Timer Start */}
            <div className="retro-card bg-indigo-700 text-white p-6 flex flex-col justify-between relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-indigo-900">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                <Timer className="w-32 h-32 text-indigo-950" />
                </div>
                <div className="relative z-10">
                <div className="w-12 h-1 bg-white mb-4"></div>
                <h3 className="text-2xl font-black font-mono mb-2">FOCUS MODE</h3>
                <p className="text-indigo-100 text-sm mb-8 font-medium">Initialize study sequence. Track progress.</p>
                
                <button 
                    onClick={() => setActiveView('TIMER')}
                    className="w-full bg-white text-black border-2 border-black font-bold py-3 px-4 retro-btn flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                    <Timer className="w-5 h-5" />
                    START TIMER
                </button>
                </div>
            </div>

            {/* Course Load Summary */}
             <div className="retro-card p-4">
                <h3 className="text-sm font-black text-white mb-4 font-mono flex items-center gap-2 uppercase border-b-2 border-black pb-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Subject Load
                </h3>
                <div className="space-y-3">
                    {courses.slice(0, 4).map(course => (
                        <div key={course.id} className="group cursor-pointer" onClick={() => setActiveView('COURSES')}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-400 group-hover:text-white">{course.name}</span>
                                <span className="text-[10px] font-mono text-gray-600">{course.hoursCompleted}h</span>
                            </div>
                             <div className="w-full bg-gray-700 h-1.5 border border-black rounded-full overflow-hidden">
                                <div className={`${course.color} h-full border-r border-black`} style={{ width: `${(course.hoursCompleted / course.totalHoursTarget) * 100}%` }}></div>
                             </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-dots">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-72 bg-gray-900 border-r-2 border-black flex-col fixed h-full z-20 shadow-xl">
        <div className="p-6 border-b-2 border-black bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_0px_#000] border-2 border-black">S</div>
            <div className="leading-none">
              <span className="font-black text-xl text-white block tracking-tighter">SEMESTER</span>
              <span className="font-bold text-sm text-indigo-400 block tracking-widest">FLOW</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-3 mt-6">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="DASHBOARD" />
          <NavItem view="PLANNER" icon={BrainCircuit} label="AI PLANNER" />
          <NavItem view="STUDY_PARTNER" icon={Bot} label="STUDY PARTNER" />
          <NavItem view="ASSIGNMENTS" icon={CalendarCheck} label="ASSIGNMENTS" />
          <NavItem view="COURSES" icon={BookOpen} label="MY COURSES" />
          <NavItem view="TIMER" icon={Timer} label="FOCUS TIMER" />
          <NavItem view="ANALYTICS" icon={ChartIcon} label="ANALYTICS" />
          <div className="pt-6 mt-6 border-t-2 border-gray-800">
            <NavItem view="SETTINGS" icon={SettingsIcon} label="SETTINGS" />
          </div>
        </nav>

        <div className="p-6 border-t-2 border-black bg-gray-800/50">
           {assignments.length > 0 && (
             <div className="bg-gray-900 border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000]">
              <h4 className="font-black text-xs uppercase mb-1 flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Next Deadline
              </h4>
              <p className="text-sm font-bold text-white line-clamp-1">
                  {assignments
                    .filter(a => a.status !== 'COMPLETED')
                    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.name || 'All Clear!'}
              </p>
            </div>
           )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r-2 border-black transform transition-transform duration-200 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-6 flex items-center justify-between border-b-2 border-black">
          <span className="font-black text-xl text-white">MENU</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg border-2 border-transparent hover:border-black"><X className="w-6 h-6 text-white" /></button>
        </div>
        <nav className="px-4 py-4 space-y-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="DASHBOARD" />
          <NavItem view="PLANNER" icon={BrainCircuit} label="AI PLANNER" />
          <NavItem view="STUDY_PARTNER" icon={Bot} label="STUDY PARTNER" />
          <NavItem view="ASSIGNMENTS" icon={CalendarCheck} label="ASSIGNMENTS" />
          <NavItem view="COURSES" icon={BookOpen} label="COURSES" />
          <NavItem view="TIMER" icon={Timer} label="TIMER" />
          <NavItem view="ANALYTICS" icon={ChartIcon} label="ANALYTICS" />
          <NavItem view="SETTINGS" icon={SettingsIcon} label="SETTINGS" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 transition-all relative">
        {/* Top Bar */}
        <header className="sticky top-0 bg-gray-900/90 backdrop-blur-md border-b-2 border-black px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 border-2 border-gray-700 rounded-md hover:border-gray-500" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {activeView.replace('_', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:bg-gray-800 rounded-lg border-2 border-transparent hover:border-gray-700 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-gray-900 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-yellow-400 border-2 border-black flex items-center justify-center text-black font-black text-sm shadow-[2px_2px_0px_0px_#000]">
              JD
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-6 max-w-7xl mx-auto pb-32">
          {activeView === 'DASHBOARD' && <Dashboard />}
          {activeView === 'PLANNER' && (
            <PlannerView 
                courses={courses} 
                assignments={assignments} 
            />
          )}
          {activeView === 'STUDY_PARTNER' && (
            <StudyPartner 
                courses={courses} 
                onSaveSession={handleSaveSession}
                onUpdateCourseWeakness={handleUpdateCourseWeakness}
            />
          )}
          {activeView === 'TIMER' && (
             <StudyTimer 
                courses={courses} 
                onSaveSession={handleSaveSession}
                initialCourseId={timerInitData.courseId}
                initialTopic={timerInitData.topic}
             />
          )}
          {activeView === 'ASSIGNMENTS' && (
            <AssignmentsView 
              assignments={assignments} 
              courses={courses} 
              onToggleStatus={toggleAssignmentStatus}
              onAddAssignment={handleAddAssignment}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}
          {activeView === 'ANALYTICS' && <Analytics courses={courses} sessions={sessions} />}
          {activeView === 'SETTINGS' && (
            <SettingsView 
                courses={courses} 
                onAddCourse={handleAddCourse}
                onDeleteCourse={handleDeleteCourse}
                onUpdateCourse={handleUpdateCourse}
            />
          )}
          {activeView === 'COURSES' && (
            <CoursesView 
              courses={courses} 
              assignments={assignments} 
              sessions={sessions}
            />
          )}
        </div>
        
        {/* AI ChatBot Integration */}
        <ChatBot 
          courses={courses}
          assignments={assignments}
          userStats={userStats}
        />
      </main>
    </div>
  );
};

export default App;
