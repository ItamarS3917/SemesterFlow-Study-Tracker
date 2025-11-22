
import { Assignment, AssignmentStatus, Course, CourseId, StudySession, UserStats } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: CourseId.ALGEBRA,
    name: 'Algebra 1',
    color: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    totalHoursTarget: 100,
    hoursCompleted: 45,
    totalAssignments: 8,
    completedAssignments: 4,
    nextExamDate: '2025-12-20',
    weakConcepts: ['Eigenvectors', 'Subspaces']
  },
  {
    id: CourseId.ALGORITHMS,
    name: 'Algorithms',
    color: 'bg-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    totalHoursTarget: 120,
    hoursCompleted: 30,
    totalAssignments: 6,
    completedAssignments: 1,
    nextExamDate: '2026-01-15',
    weakConcepts: ['Dynamic Programming']
  },
  {
    id: CourseId.COMPLEXITY,
    name: 'Complexity Intro',
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    totalHoursTarget: 100,
    hoursCompleted: 35,
    totalAssignments: 7,
    completedAssignments: 5,
    weakConcepts: []
  },
  {
    id: CourseId.CPP,
    name: 'C++ / Python',
    color: 'bg-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    totalHoursTarget: 80,
    hoursCompleted: 25,
    totalAssignments: 6,
    completedAssignments: 2,
    weakConcepts: ['Pointers', 'Memory Management']
  }
];

// Helper to get a date X days ago
const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    courseId: CourseId.ALGEBRA,
    name: 'Maman 11: Vector Spaces',
    dueDate: '2025-11-10T23:59:00',
    estimatedHours: 12,
    status: AssignmentStatus.COMPLETED,
    createdAt: daysAgo(20),
    startedAt: daysAgo(15) // Started 5 days after creation
  },
  {
    id: '2',
    courseId: CourseId.ALGORITHMS,
    name: 'Maman 12: Graph Theory',
    dueDate: '2025-11-15T23:59:00',
    estimatedHours: 15,
    status: AssignmentStatus.IN_PROGRESS,
    createdAt: daysAgo(14),
    startedAt: daysAgo(1) // Started 13 days after creation (Procrastinated!)
  },
  {
    id: '3',
    courseId: CourseId.CPP,
    name: 'Project 1: Pointers',
    dueDate: '2025-11-18T23:59:00',
    estimatedHours: 8,
    status: AssignmentStatus.NOT_STARTED,
    createdAt: daysAgo(10)
  },
  {
    id: '4',
    courseId: CourseId.COMPLEXITY,
    name: 'Maman 13: P vs NP',
    dueDate: '2025-11-25T23:59:00',
    estimatedHours: 10,
    status: AssignmentStatus.NOT_STARTED,
    createdAt: daysAgo(5)
  },
  {
    id: '5',
    courseId: CourseId.ALGEBRA,
    name: 'Maman 12: Linear Maps',
    dueDate: '2025-12-01T23:59:00',
    estimatedHours: 14,
    status: AssignmentStatus.NOT_STARTED,
    createdAt: daysAgo(2)
  }
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 's1',
    courseId: CourseId.ALGEBRA,
    startTime: '2025-11-01T10:00:00',
    durationSeconds: 3600,
    date: '2025-11-01',
    topic: 'Vector Spaces Review',
    difficulty: 3,
    notes: 'Good progress'
  },
  {
    id: 's2',
    courseId: CourseId.ALGORITHMS,
    startTime: '2025-11-02T14:00:00',
    durationSeconds: 7200,
    date: '2025-11-02',
    topic: 'BFS Implementation',
    difficulty: 2,
    notes: 'Easy implementation'
  },
  {
    id: 's3',
    courseId: CourseId.ALGEBRA,
    startTime: '2025-11-03T09:00:00',
    durationSeconds: 5400,
    date: '2025-11-03',
    topic: 'Eigenvalues',
    difficulty: 5,
    notes: 'Very abstract, need more examples'
  },
  {
    id: 's4',
    courseId: CourseId.COMPLEXITY,
    startTime: '2025-11-04T11:00:00',
    durationSeconds: 4500,
    date: '2025-11-04',
    topic: 'Turing Machines',
    difficulty: 4,
    notes: 'Confusing logic'
  }
];

export const INITIAL_USER_STATS: UserStats = {
  streakDays: 15,
  totalSemesterHours: 135,
  weeklyHours: 18.5,
  weeklyTarget: 28,
  currentPhase: 1,
  phaseName: "Assignment Sprint",
  phaseProgress: 73
};
