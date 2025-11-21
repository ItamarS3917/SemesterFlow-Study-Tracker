
export const CourseId = {
  ALGEBRA: 'ALGEBRA',
  ALGORITHMS: 'ALGORITHMS',
  COMPLEXITY: 'COMPLEXITY',
  CPP: 'CPP'
} as const;

export type CourseId = string;

export enum AssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Course {
  id: string;
  name: string;
  color: string;
  bg: string;
  text: string;
  border: string;
  totalHoursTarget: number;
  hoursCompleted: number;
  totalAssignments: number;
  completedAssignments: number;
  nextExamDate?: string; // ISO Date string
  knowledge?: string; // User provided context/syllabus/notes
}

export interface Assignment {
  id: string;
  courseId: string;
  name: string;
  dueDate: string; // ISO Date string
  estimatedHours: number;
  status: AssignmentStatus;
  notes?: string;
}

export interface StudySession {
  id: string;
  courseId: string;
  startTime: string;
  durationSeconds: number;
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface PlannedSession {
  id: string;
  courseId: string;
  activity: string; // e.g., "Read Chapter 4"
  durationMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string; // Why the AI suggested this
}

export interface DailyPlan {
  date: string;
  summary: string;
  sessions: PlannedSession[];
  totalMinutes: number;
}

export interface UserStats {
  streakDays: number;
  totalSemesterHours: number;
  weeklyHours: number;
  weeklyTarget: number;
  currentPhase: number;
  phaseName: string;
  phaseProgress: number;
}

export type ViewState = 'DASHBOARD' | 'ASSIGNMENTS' | 'COURSES' | 'ANALYTICS' | 'TIMER' | 'SETTINGS' | 'PLANNER';