
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Calendar, Clock, Sparkles, Check, Trash2, Loader2, AlertCircle, BrainCircuit, Settings } from 'lucide-react';
import { Course, Assignment, PlannedSession, DailyPlan, AssignmentStatus } from '../types';
import { CalendarMenu } from './CalendarMenu';

interface PlannerViewProps {
  courses: Course[];
  assignments: Assignment[];
}

export const PlannerView: React.FC<PlannerViewProps> = ({ courses, assignments }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DailyPlan | null>(null);
  
  // User Preferences
  const [availableHours, setAvailableHours] = useState(3);
  const [focusArea, setFocusArea] = useState('');

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contextData = {
        currentDate: new Date().toLocaleDateString(),
        availableHours: availableHours,
        userFocusRequest: focusArea,
        courses: courses.map(c => ({
          id: c.id,
          name: c.name,
          progressPercentage: Math.round((c.hoursCompleted / c.totalHoursTarget) * 100),
          targetHours: c.totalHoursTarget,
          completedHours: c.hoursCompleted,
          nextExamDate: c.nextExamDate,
          knowledgeBase: c.knowledge || "No specific notes provided."
        })),
        assignments: assignments
          .filter(a => a.status !== AssignmentStatus.COMPLETED)
          .map(a => ({
            courseId: a.courseId,
            name: a.name,
            due: a.dueDate,
            estHours: a.estimatedHours
          }))
      };

      const prompt = `
        Act as an expert academic strategist. 
        Current Date: ${contextData.currentDate}
        Available Time: ${contextData.availableHours} hours
        User Focus Request: ${contextData.userFocusRequest}
        Data: ${JSON.stringify(contextData)}

        Generate a highly optimized study plan for TODAY. 
        Rules:
        1. Check course knowledge base for exams/urgent topics.
        2. Prioritize deadlines within 3 days.
        3. Break time into chunks (30-90m).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              totalMinutes: { type: Type.INTEGER },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    courseId: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                    reasoning: { type: Type.STRING }
                  },
                  required: ["courseId", "activity", "durationMinutes", "priority", "reasoning"]
                }
              }
            },
            required: ["summary", "sessions", "totalMinutes"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        data.sessions = data.sessions.map((s: any, idx: number) => ({ ...s, id: `plan-${idx}` }));
        setGeneratedPlan(data);
      }

    } catch (error) {
      console.error("Planning failed:", error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeSession = (sessionId: string) => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        sessions: generatedPlan.sessions.filter(s => s.id !== sessionId)
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 font-mono uppercase tracking-tighter">
            <BrainCircuit className="w-8 h-8 text-indigo-500" />
            AI Architect
          </h2>
          <p className="text-gray-500 text-xs font-bold font-mono uppercase mt-1 tracking-widest">Strategic Schedule Generation Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="retro-card p-6">
            <h3 className="font-black text-white mb-6 flex items-center gap-2 font-mono uppercase border-b-2 border-black pb-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Parameters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 font-mono uppercase">Available Time</label>
                <div className="bg-gray-800 p-4 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black text-indigo-400 font-mono">{availableHours}H</span>
                        <span className="text-xs text-gray-500 font-mono uppercase">Today</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="8" 
                        step="0.5" 
                        value={availableHours}
                        onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                        className="w-full h-4 bg-gray-700 appearance-none border border-black"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 font-mono uppercase">Primary Directive (Focus)</label>
                <textarea 
                  placeholder="e.g. CALCULUS REVIEW..."
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="retro-input w-full p-4 text-sm font-mono resize-none h-32"
                />
              </div>

              <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="retro-btn w-full bg-indigo-600 text-white py-4 font-black uppercase tracking-wider hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Computing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-800 p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <h4 className="font-black text-indigo-400 mb-2 text-xs font-mono uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                System Info
            </h4>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              The AI scans uploaded course data to optimize task prioritization based on exam proximity and complexity.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!generatedPlan && !isGenerating && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 bg-gray-900/30">
              <Calendar className="w-16 h-16 mb-6 opacity-20" />
              <p className="font-bold font-mono uppercase text-xl">Awaiting Input</p>
              <p className="text-xs font-mono mt-2 text-gray-700">Configure parameters to initialize planning.</p>
            </div>
          )}

          {generatedPlan && (
            <div className="space-y-8">
              {/* Summary Card */}
              <div className="retro-card p-6 border-indigo-500 shadow-[6px_6px_0px_0px_#6366f1]">
                <h3 className="text-xl font-black text-white mb-3 font-mono uppercase">Mission Brief</h3>
                <p className="text-indigo-200 font-mono text-sm leading-relaxed border-l-4 border-indigo-500 pl-4 italic">
                    "{generatedPlan.summary}"
                </p>
                <div className="mt-6 flex items-center gap-4 text-xs font-bold font-mono uppercase text-gray-400 bg-gray-900 p-3 border border-black">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-white" /> Total: {Math.round(generatedPlan.totalMinutes / 60 * 10) / 10} HRS</span>
                  <span className="text-gray-600">|</span>
                  <span className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> {generatedPlan.sessions.length} BLOCKS</span>
                </div>
              </div>

              {/* Session List */}
              <div className="space-y-4">
                {generatedPlan.sessions.map((session) => {
                  const course = courses.find(c => c.id === session.courseId);
                  const now = new Date();
                  const end = new Date(now.getTime() + session.durationMinutes * 60000);

                  return (
                    <div key={session.id} className="retro-card p-0 hover:border-indigo-400 transition-all flex flex-col sm:flex-row animate-fade-in-up overflow-hidden">
                      
                      {/* Time & Priority */}
                      <div className="bg-gray-800 min-w-[120px] flex flex-row sm:flex-col justify-between sm:justify-center items-center p-4 border-b-2 sm:border-b-0 sm:border-r-2 border-black">
                        <div className="text-3xl font-black text-white font-mono">{session.durationMinutes}<span className="text-xs text-gray-500 block font-bold">MIN</span></div>
                        <span className={`text-[10px] font-bold px-2 py-1 border border-black shadow-[1px_1px_0px_0px_#000] uppercase tracking-wider ${
                          session.priority === 'HIGH' ? 'bg-red-500 text-black' :
                          session.priority === 'MEDIUM' ? 'bg-yellow-400 text-black' :
                          'bg-green-400 text-black'
                        }`}>
                          {session.priority}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 border border-black ${course?.color}`}></div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">{course?.name || session.courseId}</span>
                        </div>
                        <h4 className="font-bold text-white text-lg mb-2 font-mono">{session.activity}</h4>
                        <p className="text-xs text-indigo-300 font-mono flex items-start gap-2 bg-indigo-900/20 p-2 border border-indigo-900/50">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {session.reasoning}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="bg-gray-900 p-4 flex sm:flex-col gap-3 justify-center border-t-2 sm:border-t-0 sm:border-l-2 border-black">
                        <div className="retro-btn p-0 bg-white text-black hover:bg-gray-200 w-10 h-10 flex items-center justify-center border border-black">
                             <CalendarMenu 
                                title={`Study: ${session.activity}`}
                                description={`Priority: ${session.priority}\nReasoning: ${session.reasoning}`}
                                startDate={now}
                                endDate={end}
                                buttonClass="w-full h-full flex items-center justify-center text-black"
                                iconClass="w-5 h-5"
                             />
                        </div>

                        <button 
                            onClick={() => removeSession(session.id)}
                            className="retro-btn bg-red-600 text-white hover:bg-red-500 w-10 h-10 flex items-center justify-center border border-black"
                            title="Remove"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  );
                })}

                {generatedPlan.sessions.length === 0 && (
                    <div className="text-center p-8 bg-gray-800 border-2 border-dashed border-gray-700 font-mono text-gray-500 uppercase text-sm">
                        Plan cleared. Re-initialize?
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
