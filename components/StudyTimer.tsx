
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock, Save } from 'lucide-react';
import { Course, CourseId } from '../types';

interface StudyTimerProps {
  courses: Course[];
  onSaveSession: (courseId: CourseId, durationSeconds: number, notes: string) => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ courses, onSaveSession }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<CourseId>(courses[0].id);
  const [notes, setNotes] = useState('');

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
    onSaveSession(selectedCourseId, seconds, notes);
    setSeconds(0);
    setNotes('');
    setIsActive(false);
  };

  const getCourseColor = (id: CourseId) => {
    return courses.find(c => c.id === id)?.color || 'bg-gray-500';
  };

  return (
    <div className="retro-card max-w-md mx-auto p-8">
      <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2 font-mono">
          <Clock className="w-6 h-6 text-indigo-400" />
          CHRONO
        </h2>
        <div className={`px-3 py-1 border-2 border-black font-bold text-xs font-mono uppercase shadow-[2px_2px_0px_0px_#000] ${isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300'}`}>
          {isActive ? '• REC' : 'STANDBY'}
        </div>
      </div>

      {/* Course Selector */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-gray-400 mb-2 font-mono uppercase">Select Frequency (Course)</label>
        <div className="grid grid-cols-2 gap-3">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => !isActive && setSelectedCourseId(course.id)}
              disabled={isActive}
              className={`p-3 border-2 text-left transition-all font-mono text-sm ${
                selectedCourseId === course.id
                  ? `bg-indigo-900/40 border-indigo-500 shadow-[3px_3px_0px_0px_#6366f1] translate-x-[-2px] translate-y-[-2px]`
                  : 'bg-gray-800 border-gray-600 hover:border-gray-400 text-gray-400'
              } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 border border-black ${course.color}`} />
                <span className={`font-bold ${selectedCourseId === course.id ? 'text-white' : ''}`}>
                  {course.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center mb-8 bg-black p-6 border-4 border-gray-700 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 background-size: 100% 2px, 3px 100%"></div>
        <div className={`text-6xl font-mono font-bold tracking-widest z-10 ${isActive ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-gray-600'}`}>
          {formatTime(seconds)}
        </div>
        <div className="text-xs font-mono text-gray-500 mt-2 uppercase tracking-widest z-10">Hours : Mins : Secs</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {!isActive ? (
          <button
            onClick={() => setIsActive(true)}
            className="retro-btn flex items-center justify-center w-16 h-16 bg-green-500 text-black border-2 border-black rounded-full hover:bg-green-400"
          >
            <Play className="w-8 h-8 ml-1 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="retro-btn flex items-center justify-center w-16 h-16 bg-yellow-400 text-black border-2 border-black rounded-full hover:bg-yellow-300"
          >
            <Pause className="w-8 h-8 fill-current" />
          </button>
        )}
        
        {!isActive && seconds > 0 && (
          <>
            <button
                onClick={handleSave}
                className="retro-btn flex items-center justify-center w-16 h-16 bg-indigo-600 text-white border-2 border-black rounded-full hover:bg-indigo-500"
            >
                <Save className="w-8 h-8" />
            </button>
             <button
                onClick={() => setSeconds(0)}
                className="retro-btn flex items-center justify-center w-12 h-12 bg-gray-700 text-gray-300 border-2 border-black rounded-full hover:bg-gray-600"
            >
                <Square className="w-4 h-4 fill-current" />
            </button>
          </>
        )}
      </div>

      {/* Notes Input */}
      {!isActive && seconds > 0 && (
        <div className="animate-fade-in border-t-2 border-black pt-4">
          <label className="block text-xs font-bold text-gray-400 mb-2 font-mono uppercase">Mission Report (Notes)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you accomplish?"
            className="w-full p-3 border-2 border-gray-600 bg-gray-800 text-white focus:border-indigo-500 focus:shadow-[4px_4px_0px_0px_#6366f1] outline-none transition-all text-sm font-mono"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};