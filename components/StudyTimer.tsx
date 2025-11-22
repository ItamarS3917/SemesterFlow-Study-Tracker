
import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Check, HardDrive, AlertCircle } from 'lucide-react';
import { Course, CourseId } from '../types';

interface StudyTimerProps {
  courses: Course[];
  onSaveSession: (courseId: CourseId, durationSeconds: number, notes: string, addToKnowledge: boolean) => void;
  initialTopic?: string;
  initialCourseId?: string;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ 
  courses, 
  onSaveSession,
  initialTopic = '',
  initialCourseId
}) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<CourseId>(initialCourseId || courses[0]?.id || '');
  
  // Report State
  const [topic, setTopic] = useState(initialTopic);
  const [notes, setNotes] = useState('');
  const [addToKnowledge, setAddToKnowledge] = useState(false);

  // Effect to handle incoming "Break Pattern" requests (props change)
  useEffect(() => {
    if (initialCourseId) setSelectedCourseId(initialCourseId);
    if (initialTopic) setTopic(initialTopic);
  }, [initialCourseId, initialTopic]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleSave = () => {
    if (seconds < 60) {
      alert("Session too short to save (minimum 1 minute).");
      return;
    }
    const finalNotes = topic.trim() ? `[FOCUS: ${topic.toUpperCase()}] - ${notes}` : notes;
    onSaveSession(selectedCourseId, seconds, finalNotes, addToKnowledge);
    
    // Reset
    setSeconds(0);
    setNotes('');
    setTopic('');
    setAddToKnowledge(false);
    setIsActive(false);
  };

  const handleDiscard = () => {
    if (window.confirm("Discard this session data? It cannot be recovered.")) {
        setSeconds(0);
        setNotes('');
        setTopic('');
        setIsActive(false);
    }
  };

  return (
    <div className="retro-card max-w-xl mx-auto p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2 font-mono">
          <Clock className="w-6 h-6 text-indigo-400" />
          CHRONO_STATION
        </h2>
        <div className={`px-3 py-1 border-2 border-black font-bold text-xs font-mono uppercase shadow-[2px_2px_0px_0px_#000] transition-colors duration-300 ${isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300'}`}>
          {isActive ? '• RECORDING' : 'STANDBY MODE'}
        </div>
      </div>

      {/* Course Selector (Disabled while active) */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-gray-500 mb-2 font-mono uppercase tracking-widest">Target Frequency (Subject)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => !isActive && seconds === 0 && setSelectedCourseId(course.id)}
              disabled={isActive || seconds > 0}
              className={`p-2 border-2 text-center transition-all font-mono text-[10px] font-bold uppercase ${
                selectedCourseId === course.id
                  ? `bg-indigo-900 border-indigo-500 text-white shadow-[2px_2px_0px_0px_#6366f1]`
                  : 'bg-gray-800 border-gray-600 text-gray-500'
              } ${(isActive || seconds > 0) ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
            >
              {course.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Display */}
      <div className="flex flex-col items-center justify-center mb-8 bg-black p-8 border-4 border-gray-800 rounded-lg relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
        
        <div className={`text-7xl font-mono font-bold tracking-widest z-10 transition-colors ${isActive ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'text-gray-600'}`}>
          {formatTime(seconds)}
        </div>
        
        <div className="text-xs font-mono text-gray-500 mt-4 uppercase tracking-[0.3em] z-10">
            {isActive ? '>>> SEQUENCE RUNNING >>>' : '/// SEQUENCE TERMINATED ///'}
        </div>
      </div>
      
      {/* Break Pattern Hint */}
      {initialTopic && !isActive && seconds === 0 && (
         <div className="mb-6 bg-yellow-400/10 border border-yellow-400/30 p-3 text-center animate-pulse">
            <p className="text-xs font-bold text-yellow-400 font-mono uppercase">
               MICRO-SPRINT READY: Just hit play for 5 minutes.
            </p>
         </div>
      )}

      {/* Playback Controls */}
      {seconds === 0 || isActive ? (
          <div className="flex items-center justify-center gap-6 mb-8">
            {!isActive ? (
              <button
                onClick={() => setIsActive(true)}
                className="retro-btn flex items-center justify-center w-20 h-20 bg-green-500 text-black border-2 border-black rounded-full hover:bg-green-400 hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#000]"
              >
                <Play className="w-10 h-10 ml-1 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="retro-btn flex items-center justify-center w-20 h-20 bg-yellow-400 text-black border-2 border-black rounded-full hover:bg-yellow-300 hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#000]"
              >
                <Pause className="w-10 h-10 fill-current" />
              </button>
            )}
          </div>
      ) : null}

      {/* MISSION REPORT FORM (Visible when stopped and has time) */}
      {!isActive && seconds > 0 && (
        <div className="animate-fade-in border-t-4 border-black pt-6 bg-gray-800 -mx-8 px-8 pb-8 border-b-4">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-black text-white font-mono uppercase flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-400" />
                Mission Debrief
             </h3>
             <button 
                onClick={handleDiscard}
                className="text-xs text-red-500 font-bold hover:text-red-400 uppercase border-b border-red-500 hover:border-red-400"
             >
                Discard Data
             </button>
          </div>

          <div className="space-y-4">
             {/* Topic Field */}
             <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 font-mono uppercase">Operation Focus (Topic)</label>
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Linear Algebra Ch. 4"
                    className="retro-input w-full p-3 text-sm font-mono bg-gray-900 border-gray-600 focus:border-indigo-500 text-white"
                />
             </div>

             {/* Notes Field */}
             <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 font-mono uppercase">Log Entry (Observations)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log obstacles, achievements, or key concepts..."
                    className="retro-input w-full p-3 text-sm font-mono bg-gray-900 border-gray-600 focus:border-indigo-500 text-white resize-none h-24"
                />
             </div>

             {/* AI Knowledge Sync */}
             <div 
                onClick={() => setAddToKnowledge(!addToKnowledge)}
                className={`cursor-pointer border-2 border-dashed p-3 transition-all ${addToKnowledge ? 'bg-indigo-900/40 border-indigo-500' : 'border-gray-600 hover:border-gray-500'}`}
             >
                <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 mt-0.5 border-2 border-black flex items-center justify-center transition-colors ${addToKnowledge ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                        {addToKnowledge && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                        <span className={`text-xs font-bold font-mono uppercase block ${addToKnowledge ? 'text-indigo-300' : 'text-gray-400'}`}>
                            Update Neural Net (Knowledge Base)
                        </span>
                        <p className="text-[10px] text-gray-500 font-mono leading-tight mt-1">
                           Check this to append this report to the course's long-term memory. The AI Architect will use this data to personalize future study plans and answers.
                        </p>
                    </div>
                </div>
             </div>

             {/* SAVE BUTTON */}
             <button 
                onClick={handleSave}
                className="retro-btn w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-indigo-50 flex items-center justify-center gap-2 mt-4"
             >
                <HardDrive className="w-4 h-4" />
                Encrypt & Archive Session
             </button>
          </div>
        </div>
      )}

      {/* Tip Footer */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex items-start gap-2 opacity-60">
         <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
         <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
            Consistency Protocol: Sessions under 60 seconds are discarded automatically to prevent data corruption.
         </p>
      </div>
    </div>
  );
};
