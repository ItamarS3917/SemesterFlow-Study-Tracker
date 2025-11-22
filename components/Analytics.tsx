
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Course, StudySession } from '../types';

interface AnalyticsProps {
  courses: Course[];
  sessions: StudySession[];
}

// Hex mapping for Tailwind colors used in constants.ts
const COLORS: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-orange-500': '#f97316',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-red-500': '#ef4444',
  'bg-yellow-400': '#facc15',
  'bg-gray-600': '#4b5563',
  'bg-indigo-500': '#6366f1',
  'bg-pink-500': '#ec4899',
  'bg-teal-500': '#14b8a6',
  'bg-green-900': '#14532d'
};

export const Analytics: React.FC<AnalyticsProps> = ({ courses, sessions }) => {
  // Prepare data for Course Distribution Pie Chart
  const pieData = courses.map(c => ({
    name: c.name,
    value: c.hoursCompleted,
    // Use hex color from map or fallback to gray
    color: COLORS[c.color] || '#6b7280'
  }));

  const weeklyData = [
    { name: 'Week 1', hours: 15, target: 21 },
    { name: 'Week 2', hours: 22, target: 21 },
    { name: 'Week 3', hours: 18, target: 21 },
    { name: 'Week 4', hours: 28, target: 21 },
    { name: 'Week 5', hours: 25, target: 21 },
    { name: 'Current', hours: 12, target: 21 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Progress & Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Performance */}
        <div className="retro-card p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase border-b-2 border-black pb-2">Weekly Study Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontFamily: 'Space Mono'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontFamily: 'Space Mono'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '2px solid #000', color: '#fff', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #000' }}
                  itemStyle={{ color: '#fff', fontFamily: 'Space Mono' }}
                  cursor={{fill: '#374151'}}
                />
                <Bar dataKey="hours" radius={[0, 0, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours >= entry.target ? '#10b981' : entry.hours >= (entry.target * 0.8) ? '#f59e0b' : '#ef4444'} stroke="#000" strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="retro-card p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase border-b-2 border-black pb-2">Subject Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '2px solid #000', color: '#fff', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #000' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {courses.map((c, i) => (
              <div key={c.id} className="flex items-center text-xs text-gray-300 font-bold font-mono bg-gray-800 px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="w-3 h-3 mr-2 border border-black" style={{ backgroundColor: pieData[i].color }}></div>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Course Stats */}
      <div className="retro-card p-6">
        <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase border-b-2 border-black pb-2">Course Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, idx) => {
                const percentage = Math.min(100, Math.round((course.hoursCompleted / course.totalHoursTarget) * 100));
                const barColor = COLORS[course.color] || '#6b7280';
                
                return (
                    <div key={course.id} className="bg-gray-800 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border border-black" style={{ backgroundColor: barColor }}></span>
                                <span className="font-bold text-white font-mono">{course.name}</span>
                            </div>
                            <span className="text-xs font-bold font-mono text-gray-400">{course.hoursCompleted}/{course.totalHoursTarget} HRS</span>
                        </div>
                        
                        <div className="w-full bg-gray-700 h-4 border-2 border-black mb-3">
                            <div 
                                className="h-full border-r-2 border-black transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%`, backgroundColor: barColor }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs font-mono font-bold text-gray-500 uppercase">
                            <span>Assignments: {course.completedAssignments}/{course.totalAssignments}</span>
                            <span>{percentage}% Done</span>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};
