import { getDbSafe } from "../auth/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  where,
  type Firestore,
} from "firebase/firestore";

export type UserProgress = {
  userId: string;
  highestLevelPassed: number; // -1 means no lessons passed, 0 means lesson 1 passed, etc.
  updatedAt?: any;
};

export type QuizAttempt = {
  userId: string;
  levelNumber: number;
  score: number;
  totalQuestions: number;
  scorePercent?: number;
  passed: boolean;
  createdAt?: any;
};

function getUserProgressDoc(db: Firestore, userId: string) {
  return doc(db, "users", userId, "progress", "lessonProgression");
}

function getUserAttemptsCollection(db: Firestore, userId: string) {
  return collection(db, "users", userId, "progress");
}

/**
 * Get the user's lesson progression from Firestore
 * Returns -1 if no progression exists (new user)
 */
export async function getUserProgress(userId: string): Promise<number> {
  const db = getDbSafe();
  if (!db) {
    console.warn("Firestore not configured. Returning default progression.");
    return -1;
  }

  try {
    const progressRef = getUserProgressDoc(db, userId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const data = progressSnap.data() as UserProgress;
      return data.highestLevelPassed ?? -1;
    }
    
    // New user - no progression yet
    return -1;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return -1;
  }
}

/**
 * Update the user's highest level passed
 * When a user passes levelNumber N (from URL/test), highestLevelPassed should be set to N - 1
 * This means lesson index N - 1 is passed, so lesson index N is unlocked
 * Example: Passing levelNumber 1 sets highestLevelPassed to 0, unlocking lesson index 1
 */
export async function updateUserProgress(
  userId: string,
  levelPassed: number
): Promise<void> {
  const db = getDbSafe();
  if (!db) {
    throw new Error("Firestore not configured. Set VITE_FIREBASE_* env vars.");
  }

  try {
    const progressRef = getUserProgressDoc(db, userId);
    console.log(`[updateUserProgress] Attempting to update progress for userId: ${userId}, levelPassed: ${levelPassed}`);
    console.log(`[updateUserProgress] Document path: users/${userId}/progress/lessonProgression`);
    
    const currentSnap = await getDoc(progressRef);
    
    let currentHighest = -1;
    if (currentSnap.exists()) {
      const data = currentSnap.data() as UserProgress;
      currentHighest = data.highestLevelPassed ?? -1;
      console.log(`[updateUserProgress] Current highest level: ${currentHighest}`);
    } else {
      console.log(`[updateUserProgress] No existing progress found, creating new record`);
    }

    // Only update if the new level is higher than current
    if (levelPassed > currentHighest) {
      console.log(`[updateUserProgress] Saving new progress: highestLevelPassed = ${levelPassed}`);
      await setDoc(
        progressRef,
        {
          userId,
          highestLevelPassed: levelPassed,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`[updateUserProgress] Successfully saved progress`);
    } else {
      console.log(`[updateUserProgress] New level ${levelPassed} is not higher than current ${currentHighest}, skipping update`);
    }
  } catch (error: any) {
    console.error("Error updating user progress:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    // Re-throw with more context
    throw new Error(`Failed to update user progress: ${error?.message || error} (Code: ${error?.code || 'unknown'})`);
  }
}

/**
 * Record a single quiz attempt for a user.
 * Stored as a new document in the same "progress" subcollection so current Firestore rules still apply.
 */
export async function recordQuizAttempt(
  userId: string,
  levelNumber: number,
  score: number,
  totalQuestions: number
): Promise<void> {
  const db = getDbSafe();
  if (!db) {
    throw new Error("Firestore not configured. Set VITE_FIREBASE_* env vars.");
  }

  try {
    const attemptsCol = getUserAttemptsCollection(db, userId);
    const passed = score >= totalQuestions / 2;
    const scorePercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    await addDoc(attemptsCol, {
      userId,
      levelNumber,
      score,
      totalQuestions,
      scorePercent,
      passed,
      createdAt: serverTimestamp(),
      type: "quizAttempt",
    } satisfies QuizAttempt & { type: string });
  } catch (error: any) {
    console.error("Error recording quiz attempt:", error);
    throw new Error(
      `Failed to record quiz attempt: ${error?.message || error}`
    );
  }
}

/**
 * Load best (highest %) quiz score per lesson for a user.
 * Returns an object keyed by lesson index (0-based), matching `LessonsMenuPage` indexes.
 */
export async function getLessonBestScores(
  userId: string
): Promise<Record<number, number>> {
  const db = getDbSafe();
  if (!db) {
    console.warn("Firestore not configured. Returning empty best-scores map.");
    return {};
  }

  try {
    const attemptsCol = getUserAttemptsCollection(db, userId);
    const q = query(attemptsCol, where("type", "==", "quizAttempt"));
    const snap = await getDocs(q);

    const best: Record<number, number> = {};
    snap.forEach((d) => {
      const data = d.data() as any;
      const levelNumber = Number(data?.levelNumber);
      if (!Number.isFinite(levelNumber) || levelNumber <= 0) return;

      const lessonIndex = levelNumber - 1;
      const scorePercent =
        Number.isFinite(Number(data?.scorePercent))
          ? Number(data.scorePercent)
          : Math.round((Number(data?.score || 0) / Math.max(1, Number(data?.totalQuestions || 1))) * 100);

      best[lessonIndex] = Math.max(best[lessonIndex] ?? 0, scorePercent);
    });

    return best;
  } catch (error) {
    console.error("Error loading lesson best scores:", error);
    return {};
  }
}


