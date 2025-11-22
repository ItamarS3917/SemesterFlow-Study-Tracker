
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Course, Assignment, StudySession, UserStats } from "../types";
import { INITIAL_USER_STATS } from "../constants";

// Collection References Helpers
const getCollections = (uid: string) => ({
  courses: collection(db, `users/${uid}/courses`),
  assignments: collection(db, `users/${uid}/assignments`),
  sessions: collection(db, `users/${uid}/sessions`),
  statsDoc: doc(db, `users/${uid}/stats/main`)
});

// --- SUBSCRIPTIONS (Real-time) ---

export const subscribeToCourses = (uid: string, callback: (courses: Course[]) => void) => {
  return onSnapshot(getCollections(uid).courses, (snapshot) => {
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    callback(courses);
  });
};

export const subscribeToAssignments = (uid: string, callback: (assignments: Assignment[]) => void) => {
  return onSnapshot(getCollections(uid).assignments, (snapshot) => {
    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
    callback(assignments);
  });
};

export const subscribeToSessions = (uid: string, callback: (sessions: StudySession[]) => void) => {
  return onSnapshot(getCollections(uid).sessions, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySession));
    callback(sessions);
  });
};

export const subscribeToUserStats = (uid: string, callback: (stats: UserStats) => void) => {
  return onSnapshot(getCollections(uid).statsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserStats);
    } else {
      // Initialize stats if they don't exist
      setDoc(getCollections(uid).statsDoc, INITIAL_USER_STATS);
      callback(INITIAL_USER_STATS);
    }
  });
};

// --- CRUD OPERATIONS ---

// Courses
export const addCourseToDB = async (uid: string, course: Course) => {
  // Remove ID from object as Firestore generates it (or we use the one provided if setting doc)
  const { id, ...data } = course;
  await addDoc(getCollections(uid).courses, data);
};

export const updateCourseInDB = async (uid: string, course: Course) => {
  const { id, ...data } = course;
  const courseRef = doc(db, `users/${uid}/courses/${id}`);
  await updateDoc(courseRef, data as any);
};

export const deleteCourseFromDB = async (uid: string, courseId: string) => {
  await deleteDoc(doc(db, `users/${uid}/courses/${courseId}`));
};

// Assignments
export const addAssignmentToDB = async (uid: string, assignment: Assignment) => {
  const { id, ...data } = assignment;
  await addDoc(getCollections(uid).assignments, data);
};

export const updateAssignmentInDB = async (uid: string, assignment: Assignment) => {
  const { id, ...data } = assignment;
  const ref = doc(db, `users/${uid}/assignments/${id}`);
  await updateDoc(ref, data as any);
};

export const deleteAssignmentFromDB = async (uid: string, assignmentId: string) => {
  await deleteDoc(doc(db, `users/${uid}/assignments/${assignmentId}`));
};

// Sessions
export const addSessionToDB = async (uid: string, session: StudySession) => {
  const { id, ...data } = session;
  await addDoc(getCollections(uid).sessions, data);
};

// Stats
export const updateUserStatsInDB = async (uid: string, stats: Partial<UserStats>) => {
  const ref = doc(db, `users/${uid}/stats/main`);
  await updateDoc(ref, stats); // Use updateDoc to merge
};

// Batch / Transaction helper for session completion
// (Updates session, course hours, and user stats atomically)
export const saveSessionTransaction = async (
  uid: string, 
  session: StudySession, 
  course: Course, 
  newStats: UserStats
) => {
  // For simplicity in this demo, we'll do them in parallel promises. 
  // In a real app, use runTransaction for atomicity.
  await Promise.all([
    addSessionToDB(uid, session),
    updateCourseInDB(uid, course),
    updateUserStatsInDB(uid, newStats)
  ]);
};
