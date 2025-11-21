
import React, { useState, useRef } from 'react';
import { Trash2, Plus, Settings, BookOpen, FileText, Save, X, UploadCloud, File, Loader2, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface SettingsViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateCourse: (course: Course) => void;
}

const PRESET_COLORS = [
  { name: 'Blue', bg: 'bg-blue-900', text: 'text-blue-300', color: 'bg-blue-500', border: 'border-blue-700' },
  { name: 'Green', bg: 'bg-green-900', text: 'text-green-300', color: 'bg-green-500', border: 'border-green-700' },
  { name: 'Purple', bg: 'bg-purple-900', text: 'text-purple-300', color: 'bg-purple-500', border: 'border-purple-700' },
  { name: 'Orange', bg: 'bg-orange-900', text: 'text-orange-300', color: 'bg-orange-500', border: 'border-orange-700' },
  { name: 'Pink', bg: 'bg-pink-900', text: 'text-pink-300', color: 'bg-pink-500', border: 'border-pink-700' },
  { name: 'Teal', bg: 'bg-teal-900', text: 'text-teal-300', color: 'bg-teal-500', border: 'border-teal-700' },
  { name: 'Indigo', bg: 'bg-indigo-900', text: 'text-indigo-300', color: 'bg-indigo-500', border: 'border-indigo-700' },
  { name: 'Red', bg: 'bg-red-900', text: 'text-red-300', color: 'bg-red-500', border: 'border-red-700' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ courses, onAddCourse, onDeleteCourse, onUpdateCourse }) => {
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTarget, setNewCourseTarget] = useState(100);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  
  // Knowledge Base Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [knowledgeInput, setKnowledgeInput] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const colorTheme = PRESET_COLORS[selectedColorIdx];
    const newCourse: Course = {
      id: Date.now().toString(),
      name: newCourseName,
      totalHoursTarget: newCourseTarget,
      hoursCompleted: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      knowledge: '',
      ...colorTheme
    };

    onAddCourse(newCourse);
    setNewCourseName('');
    setNewCourseTarget(100);
  };

  const openKnowledgeModal = (course: Course) => {
    setEditingCourse(course);
    setKnowledgeInput(course.knowledge || '');
  };

  const saveKnowledge = () => {
    if (editingCourse) {
      onUpdateCourse({
        ...editingCourse,
        knowledge: knowledgeInput
      });
      setEditingCourse(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessingFile(true);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        // @ts-ignore 
        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
          alert('PDF processing library not loaded. Please refresh the page.');
          setIsProcessingFile(false);
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        extractedText = `\n\n--- START OF UPLOADED FILE: ${file.name} ---\n`;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += `[Page ${i}] ${pageText}\n`;
        }
        
        extractedText += `--- END OF FILE: ${file.name} ---\n`;

      } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const text = await file.text();
        extractedText = `\n\n--- START OF UPLOADED FILE: ${file.name} ---\n${text}\n--- END OF FILE: ${file.name} ---\n`;
      } else {
        alert('Unsupported file type. Please upload PDF or Text files (.txt, .md).');
        setIsProcessingFile(false);
        return;
      }

      setKnowledgeInput(prev => prev + extractedText);

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to read file. Please try again or check if the PDF is valid.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="retro-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          Application Settings
        </h2>

        {/* Manage Courses Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Manage Courses
          </h3>
          
          <div className="space-y-3 mb-6">
            {courses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl border border-gray-700 group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${course.color} shadow-[0_0_5px_currentColor]`}></div>
                  <div>
                    <div className="font-medium text-gray-200">{course.name}</div>
                    <div className="text-xs text-gray-500">Target: {course.totalHoursTarget}h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openKnowledgeModal(course)}
                    className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center gap-1"
                    title="Edit Course Knowledge/Notes"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium hidden md:inline">Knowledge</span>
                  </button>
                  <button 
                    onClick={() => onDeleteCourse(course.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Course Form */}
          <form onSubmit={handleAdd} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h4 className="text-sm font-bold text-gray-400 mb-3">Add New Course</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Course Name</label>
                <input 
                  type="text" 
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Introduction to CS"
                  className="retro-input w-full p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Target Hours</label>
                <input 
                  type="number" 
                  value={newCourseTarget}
                  onChange={(e) => setNewCourseTarget(parseInt(e.target.value))}
                  className="retro-input w-full p-2 rounded-lg text-sm"
                  min="10"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Color Theme</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((theme, idx) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`w-8 h-8 rounded-full ${theme.color} transition-transform ${selectedColorIdx === idx ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="retro-btn w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 border border-gray-700"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </form>
        </div>

        <div className="pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500">
                Note: Deleting a course will also hide its associated assignments and history from the dashboard.
            </p>
        </div>
      </div>

      {/* Knowledge Base Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="retro-card w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] border-2 border-indigo-500">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${editingCourse.color} shadow-[0_0_8px_currentColor]`}></div>
                <h3 className="font-bold text-white">Edit Knowledge Base: {editingCourse.name}</h3>
              </div>
              <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-900">
              {/* File Upload Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                   <label className="block text-sm font-medium text-gray-300">Upload Materials</label>
                   <span className="text-xs text-gray-500">PDF or Text files</span>
                </div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-all ${isProcessingFile ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.txt,.md,.json"
                    onChange={handleFileUpload}
                  />
                  {isProcessingFile ? (
                    <>
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                      <span className="text-sm text-indigo-400 font-medium">Extracting text from file...</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-indigo-900/30 p-3 rounded-full mb-3 border border-indigo-800">
                        <UploadCloud className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">Click to upload PDF or Text</span>
                      <span className="text-xs text-gray-500 mt-1">Content will be extracted and added below</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-2 flex justify-between items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Course Notes & Context</label>
                  <p className="text-xs text-gray-500">
                    The AI uses this text to answer your questions.
                  </p>
                </div>
                {knowledgeInput.length > 0 && (
                  <button 
                    onClick={() => {
                        if (window.confirm("Are you sure you want to clear all notes for this course?")) {
                            setKnowledgeInput("");
                        }
                    }}
                    className="text-xs text-red-500 hover:text-red-400 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Notes
                  </button>
                )}
              </div>
              
              <textarea
                className="retro-input w-full h-64 p-4 rounded-xl text-sm font-mono resize-none leading-relaxed"
                placeholder="Example: 
- Exam covers Chapters 1-5..."
                value={knowledgeInput}
                onChange={(e) => setKnowledgeInput(e.target.value)}
              />
              <div className="text-right text-xs text-gray-500 mt-2">
                {knowledgeInput.length} characters
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
              <button 
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveKnowledge}
                className="retro-btn px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Knowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};