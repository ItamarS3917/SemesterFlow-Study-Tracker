
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { 
  Bot, 
  Send, 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Save, 
  Map, 
  AlertCircle,
  RefreshCw,
  Zap,
  GraduationCap,
  Smile,
  Frown,
  Loader2
} from 'lucide-react';
import { Course, TeacherPersonality, StudyMode } from '../types';

interface StudyPartnerProps {
  courses: Course[];
  onSaveSession: (courseId: string, durationSeconds: number, notes: string, addToKnowledge: boolean, topic: string, difficulty: number) => void;
  onUpdateCourseWeakness: (courseId: string, concepts: string[]) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ConceptNode {
  id: string;
  label: string;
  relatedTo: string[];
}

export const StudyPartner: React.FC<StudyPartnerProps> = ({ 
  courses, 
  onSaveSession,
  onUpdateCourseWeakness
}) => {
  // Configuration State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [personality, setPersonality] = useState<TeacherPersonality>('SOCRATIC');
  const [mode, setMode] = useState<StudyMode>('GUIDED_LEARNING');
  
  // Chat State
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Concept Map State
  const [conceptMap, setConceptMap] = useState<ConceptNode[]>([]);
  const [isMapping, setIsMapping] = useState(false);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start/Restart Chat
  useEffect(() => {
    if (selectedCourse) {
      startNewSession();
    }
  }, [selectedCourseId, personality, mode]);

  const startNewSession = async () => {
    setMessages([]);
    setConceptMap([]);
    setStartTime(Date.now());
    
    if (!selectedCourse) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let personaInstruction = "";
      switch (personality) {
        case 'STRICT':
          personaInstruction = "You are a strict, no-nonsense professor. You have high standards. Correct errors bluntly. Do not praise mediocrity. Focus on precision.";
          break;
        case 'ENCOURAGING':
          personaInstruction = "You are a warm, supportive tutor. Use emojis. Celebrate small wins. If the student struggles, reassure them that it's normal.";
          break;
        case 'HUMOROUS':
          personaInstruction = "You are a funny, witty study buddy. Use analogies, jokes, and pop culture references to explain complex topics. Keep it lighthearted.";
          break;
        case 'SOCRATIC':
          personaInstruction = "You are a master of the Socratic Method. You ALMOST NEVER give the answer directly. Instead, ask guided questions to help the student derive the answer themselves.";
          break;
      }

      let modeInstruction = "";
      if (mode === 'QUIZ_ME') {
        modeInstruction = "Your goal is to test the student. Generate one tough question at a time based on the course material. Wait for their answer, grade it, and then move to the next.";
      } else {
        modeInstruction = "Your goal is to guide the student through learning. If they say 'I don't understand', break the concept down into smaller, simpler questions. Track which concepts they struggle with.";
      }

      const systemInstruction = `
        ${personaInstruction}
        ${modeInstruction}
        
        Course: ${selectedCourse.name}
        Context/Notes: ${selectedCourse.knowledge || "No specific notes uploaded."}
        Known Weaknesses: ${selectedCourse.weakConcepts?.join(', ') || "None yet."}
        
        IMPORTANT RULES:
        1. Keep responses concise (under 150 words) unless explaining a complex theory.
        2. Format using Markdown.
        3. If you detect a specific concept the user fails to understand, tag it internally to remember it.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: [
            {
                role: 'model',
                parts: [{ text: `[SYSTEM: Session initialized. Personality: ${personality}. Mode: ${mode}.]\n\nHello! I'm ready to help you with ${selectedCourse.name}. ${mode === 'QUIZ_ME' ? 'Shall I start with a question?' : 'What topic are we tackling today?'}` }]
            }
        ]
      });

      setChatSession(chat);
      setMessages([{ 
        role: 'model', 
        text: `Hello! I'm ready to help you with ${selectedCourse.name}. ${mode === 'QUIZ_ME' ? 'Shall I start with a question?' : 'What topic are we tackling today?'}` 
      }]);

    } catch (error) {
      console.error("Failed to init chat", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessageStream({ message: userMsg });
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        fullText += chunk.text;
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: fullText };
          return newHistory;
        });
      }

      // After 3 turns, try to map concepts or update weaknesses
      if (messages.length > 2 && messages.length % 2 === 0) {
        generateConceptMap(fullText);
      }

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateConceptMap = async (lastContext: string) => {
    setIsMapping(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Based on the discussion about ${selectedCourse?.name}:
            "${lastContext}"
            
            Identify key concepts discussed and their relationships.
            Also identify any "Weak Concepts" the student seems to misunderstand.
            
            Return JSON only:
            {
                "nodes": [{ "id": "concept_name", "label": "Concept Name", "relatedTo": ["other_concept_id"] }],
                "weaknesses": ["concept1", "concept2"]
            }
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            if (data.nodes && data.nodes.length > 0) {
                setConceptMap(data.nodes);
            }
            if (data.weaknesses && data.weaknesses.length > 0 && selectedCourse) {
                // Merge new weaknesses with existing ones, unique only
                const current = selectedCourse.weakConcepts || [];
                const updated = Array.from(new Set([...current, ...data.weaknesses]));
                onUpdateCourseWeakness(selectedCourse.id, updated);
            }
        }
    } catch (e) {
        console.error("Mapping failed", e);
    } finally {
        setIsMapping(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!selectedCourse) return;
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const transcript = messages.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n\n');
    
    // AI Summarize for the topic
    const topic = messages.length > 2 ? "AI Study Session" : "Quick Chat";
    
    onSaveSession(
        selectedCourse.id,
        duration,
        `[${mode} - ${personality}]\n\n${transcript}`,
        true, // Add to knowledge base
        topic,
        mode === 'QUIZ_ME' ? 4 : 3
    );
    alert("Session saved to course history and knowledge base!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pb-4">
        
        {/* Course Selector */}
        <div className="retro-card p-4">
            <h3 className="font-bold text-white mb-2 font-mono text-xs uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Target Subject
            </h3>
            <div className="space-y-2">
                {courses.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedCourseId(c.id)}
                        className={`w-full text-left p-2 border-2 text-xs font-mono font-bold uppercase transition-all flex items-center justify-between ${
                            selectedCourseId === c.id 
                            ? `bg-indigo-900 border-indigo-500 text-white shadow-[2px_2px_0px_0px_#6366f1]` 
                            : 'bg-gray-800 border-gray-600 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                        <span>{c.name}</span>
                        {selectedCourseId === c.id && <div className={`w-2 h-2 rounded-full ${c.color}`}></div>}
                    </button>
                ))}
            </div>
        </div>

        {/* Mode & Personality */}
        <div className="retro-card p-4">
            <h3 className="font-bold text-white mb-4 font-mono text-xs uppercase flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" /> Teacher Config
            </h3>
            
            <div className="mb-4">
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Personality</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['SOCRATIC', 'STRICT', 'ENCOURAGING', 'HUMOROUS'] as TeacherPersonality[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPersonality(p)}
                            className={`p-2 text-[10px] border font-mono font-bold uppercase transition-all ${
                                personality === p 
                                ? 'bg-emerald-900 border-emerald-500 text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Study Mode</label>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setMode('GUIDED_LEARNING')}
                        className={`p-3 text-xs border-2 font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                            mode === 'GUIDED_LEARNING' 
                            ? 'bg-blue-900 border-blue-500 text-white' 
                            : 'bg-gray-800 border-gray-700 text-gray-500'
                        }`}
                    >
                        <HelpCircle className="w-4 h-4" />
                        Guided Learning
                    </button>
                    <button
                        onClick={() => setMode('QUIZ_ME')}
                        className={`p-3 text-xs border-2 font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                            mode === 'QUIZ_ME' 
                            ? 'bg-purple-900 border-purple-500 text-white' 
                            : 'bg-gray-800 border-gray-700 text-gray-500'
                        }`}
                    >
                        <Zap className="w-4 h-4" />
                        Quiz Me
                    </button>
                </div>
            </div>
        </div>

        {/* Known Weaknesses */}
        <div className="retro-card p-4 flex-1">
            <h3 className="font-bold text-white mb-2 font-mono text-xs uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> Weak Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
                {selectedCourse?.weakConcepts && selectedCourse.weakConcepts.length > 0 ? (
                    selectedCourse.weakConcepts.map((concept, idx) => (
                        <span key={idx} className="bg-red-900/30 text-red-300 border border-red-800 px-2 py-1 text-[10px] font-mono uppercase">
                            {concept}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-600 text-[10px] font-mono italic">No weaknesses detected yet.</span>
                )}
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-2 retro-card flex flex-col p-0 overflow-hidden relative border-indigo-500 shadow-[6px_6px_0px_0px_#6366f1]">
         {/* Chat Header */}
         <div className="bg-gray-800 p-3 border-b-2 border-black flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="font-mono text-xs font-bold text-white uppercase">
                    {personality} AI • {selectedCourse?.name}
                </span>
            </div>
            <button 
                onClick={handleSaveToNotes}
                className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1 border-b border-indigo-400 hover:border-white transition-colors"
            >
                <Save className="w-3 h-3" /> SAVE SESSION
            </button>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 scrollbar-hide">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-4 border-2 font-mono text-sm shadow-[4px_4px_0px_0px_#000] whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white border-black rounded-tr-none' 
                        : 'bg-gray-800 text-gray-200 border-gray-600 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 p-3 border-2 border-gray-600 rounded-tl-none flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-4 bg-gray-800 border-t-2 border-black">
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={mode === 'QUIZ_ME' ? "Enter your answer..." : "Ask a question..."}
                    className="flex-1 retro-input p-3 font-mono text-sm"
                    autoFocus
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="retro-btn bg-white text-black px-4 hover:bg-gray-200 disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
         </div>
      </div>

      {/* Right Panel: Concept Map */}
      <div className="lg:col-span-1 retro-card p-4 flex flex-col">
        <h3 className="font-bold text-white mb-4 font-mono text-xs uppercase flex items-center justify-between border-b-2 border-black pb-2">
            <span className="flex items-center gap-2"><Map className="w-4 h-4 text-orange-400" /> Concept Map</span>
            {isMapping && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
        </h3>
        
        <div className="flex-1 overflow-y-auto">
            {conceptMap.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 font-mono text-xs text-center p-4">
                    <BrainCircuit className="w-12 h-12 mb-2 opacity-20" />
                    <p>Concepts will appear here as we discuss.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {conceptMap.map((node, i) => (
                        <div key={i} className="animate-fade-in group">
                            <div className="bg-gray-800 border border-gray-600 p-3 text-center shadow-[2px_2px_0px_0px_#000] hover:border-orange-400 transition-colors">
                                <p className="font-bold text-white text-xs font-mono uppercase">{node.label}</p>
                            </div>
                            {node.relatedTo && node.relatedTo.length > 0 && (
                                <div className="flex justify-center my-1">
                                    <div className="w-px h-4 bg-gray-700"></div>
                                </div>
                            )}
                            <div className="flex flex-wrap justify-center gap-2 px-2">
                                {node.relatedTo.map((rel, rIdx) => (
                                    <span key={rIdx} className="text-[9px] bg-gray-900 text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded font-mono uppercase">
                                        {rel}
                                    </span>
                                ))}
                            </div>
                            {/* Visual connector line if not last */}
                            {i < conceptMap.length - 1 && (
                                <div className="flex justify-center my-2">
                                    <div className="w-0.5 h-4 bg-dashed bg-gradient-to-b from-gray-700 to-transparent"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-[9px] text-gray-500 font-mono leading-tight">
                * Concepts are extracted automatically by the Neural Engine during conversation.
            </p>
        </div>
      </div>
    </div>
  );
};
