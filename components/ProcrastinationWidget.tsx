
import React, { useState } from 'react';
import { AlertTriangle, Clock, Zap, BrainCircuit, ArrowRight, Loader2 } from 'lucide-react';
import { Assignment, AssignmentStatus, Course } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ProcrastinationWidgetProps {
  assignments: Assignment[];
  courses: Course[];
  onBreakPattern: (courseId: string, assignmentName: string) => void;
}

export const ProcrastinationWidget: React.FC<ProcrastinationWidgetProps> = ({ 
  assignments, 
  courses, 
  onBreakPattern 
}) => {
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1. Calculate Procrastination Score
  // Logic: For completed/in-progress tasks, what % of the available time passed before starting?
  const completedOrStarted = assignments.filter(a => a.status !== AssignmentStatus.NOT_STARTED && a.startedAt);
  
  let totalDelayRatio = 0;
  let count = 0;

  completedOrStarted.forEach(a => {
    const created = new Date(a.createdAt).getTime();
    const start = new Date(a.startedAt!).getTime();
    const due = new Date(a.dueDate).getTime();
    
    // Avoid division by zero if created == due (rare)
    const totalTime = Math.max(due - created, 1); 
    const delayTime = start - created;
    
    // Ratio: 0 = Started immediately, 1 = Started at deadline
    const ratio = Math.min(Math.max(delayTime / totalTime, 0), 1);
    
    totalDelayRatio += ratio;
    count++;
  });

  // Default score 0.5 (Average) if no data
  const procrastinationScore = count > 0 ? (totalDelayRatio / count) * 10 : 5;
  
  // 0-3: Proactive, 3-7: Normal, 7-10: Danger
  const scoreLevel = procrastinationScore < 3 ? 'LOW' : procrastinationScore < 7 ? 'MED' : 'HIGH';
  const scoreColor = scoreLevel === 'LOW' ? 'text-green-400' : scoreLevel === 'MED' ? 'text-yellow-400' : 'text-red-500';

  // 2. Identify "Danger Zone" Assignments
  // Logic: Not Started AND (less than 5 days left OR less than 50% time remaining)
  const now = new Date().getTime();
  const dangerZoneAssignments = assignments
    .filter(a => a.status === AssignmentStatus.NOT_STARTED)
    .map(a => {
        const due = new Date(a.dueDate).getTime();
        const created = new Date(a.createdAt).getTime();
        const daysLeft = (due - now) / (1000 * 3600 * 24);
        const timeElapsedPercent = ((now - created) / (due - created)) * 100;
        
        return { ...a, daysLeft, timeElapsedPercent };
    })
    .filter(a => a.daysLeft < 5 || a.timeElapsedPercent > 60)
    .sort((a, b) => a.daysLeft - b.daysLeft) // Most urgent first
    .slice(0, 3); // Top 3

  // AI Analysis Handler
  const handleGetAiAdvice = async () => {
    setIsAnalyzing(true);
    setAiTip(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const historyData = completedOrStarted.map(a => ({
            name: a.name,
            delayPercent: Math.round(((new Date(a.startedAt!).getTime() - new Date(a.createdAt).getTime()) / (new Date(a.dueDate).getTime() - new Date(a.createdAt).getTime())) * 100) + '%'
        }));
        
        const dangerData = dangerZoneAssignments.map(a => ({
            name: a.name,
            daysLeft: Math.round(a.daysLeft)
        }));

        const prompt = `
            Act as a productivity coach. 
            User's Procrastination Score: ${procrastinationScore.toFixed(1)}/10 (High is bad).
            
            History (Delay % before starting): 
            ${JSON.stringify(historyData)}
            
            Current "Danger Zone" tasks:
            ${JSON.stringify(dangerData)}
            
            Task: Give ONE short, punchy, specific psychological tip to break this specific user's pattern. 
            If they have danger zone tasks, focus on "Just start for 5 minutes". 
            Do not be generic. Max 2 sentences.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setAiTip(response.text);
    } catch (e) {
        setAiTip("Just commit to 5 minutes. Action kills anxiety.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (dangerZoneAssignments.length === 0 && scoreLevel === 'LOW') {
      return null; // Don't show if everything is perfect
  }

  return (
    <div className="retro-card p-0 overflow-hidden border-2 border-red-500 shadow-[6px_6px_0px_0px_#ef4444]">
        {/* Header - Hazard Style */}
        <div className="bg-red-600 p-3 flex items-center justify-between">
            <h3 className="text-white font-black font-mono uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-black fill-yellow-400" />
                <span className="tracking-tighter">Procrastination Alert</span>
            </h3>
            <div className="text-xs font-bold bg-black text-red-500 px-2 py-1 font-mono uppercase border border-red-400">
                Score: {procrastinationScore.toFixed(1)}/10
            </div>
        </div>

        <div className="p-5 bg-gray-900">
            {/* Danger Zone List */}
            {dangerZoneAssignments.length > 0 ? (
                <div className="space-y-4 mb-6">
                    <p className="text-xs text-red-400 font-bold font-mono uppercase mb-2">
                        Danger Zone (High Risk of Delay):
                    </p>
                    {dangerZoneAssignments.map(a => {
                        const course = courses.find(c => c.id === a.courseId);
                        return (
                            <div key={a.id} className="bg-gray-800 p-3 border-l-4 border-red-500 flex justify-between items-center group hover:bg-gray-700 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 border border-gray-600 uppercase font-bold text-gray-400`}>
                                            {course?.name}
                                        </span>
                                        <span className="text-[10px] text-red-400 font-bold font-mono">
                                            {a.daysLeft <= 0 ? 'DUE TODAY' : `${Math.ceil(a.daysLeft)} DAYS LEFT`}
                                        </span>
                                    </div>
                                    <div className="font-bold text-white text-sm font-mono">{a.name}</div>
                                </div>
                                
                                <button 
                                    onClick={() => onBreakPattern(a.courseId, a.name)}
                                    className="retro-btn bg-white text-black text-[10px] font-bold uppercase px-3 py-2 hover:bg-yellow-400 flex items-center gap-1 shadow-none translate-x-[2px] translate-y-[2px] hover:translate-x-0 hover:translate-y-0 hover:shadow-[2px_2px_0px_0px_#000]"
                                    title="Start a 5-minute micro-session to overcome friction"
                                >
                                    <Zap className="w-3 h-3 fill-black" />
                                    Break Pattern
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mb-6 p-4 bg-green-900/20 border border-green-800 text-green-400 text-xs font-mono uppercase text-center">
                    No immediate threats detected. Keep it up.
                </div>
            )}

            {/* AI Coaching Section */}
            <div className="border-t border-gray-800 pt-4">
                {!aiTip ? (
                    <button 
                        onClick={handleGetAiAdvice}
                        disabled={isAnalyzing}
                        className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 font-mono text-xs uppercase hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                        {isAnalyzing ? 'Analyzing Patterns...' : 'Analyze Habits & Get Strategy'}
                    </button>
                ) : (
                    <div className="bg-indigo-900/20 border border-indigo-500/50 p-4 animate-fade-in relative">
                        <div className="absolute -top-3 left-4 bg-gray-900 px-2 text-[10px] font-bold text-indigo-400 font-mono uppercase">
                            Strategy Protocol
                        </div>
                        <p className="text-sm text-indigo-100 font-mono leading-relaxed italic">
                            "{aiTip}"
                        </p>
                        <button 
                            onClick={() => setAiTip(null)}
                            className="text-[10px] text-gray-500 mt-2 hover:text-white underline"
                        >
                            CLOSE
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
