import {
  setDoc,
  getDoc,
  doc,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";
import { getDbSafe } from "../auth/firebase";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type NoteItem = {
  name: string;
  midi: number;
  time: number;
  duration: number;
  velocity: number;
};

export type JsonGenerationRecord = {
  id: string;
  displayName: string;
  tempo_bpm: number;
  total_time: number;
  notes: NoteItem[];
  createdAt: any;
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getJsonDocRef(
  db: Firestore,
  userId: string,
  generationId: string
) {
  return doc(db, "users", userId, "jsonGenerations", generationId);
}

// --------------------------------------------------
// SAVE JSON (Prevent duplicate names per user)
// --------------------------------------------------

export async function saveJsonRecord(
  userId: string,
  generationId: string,
  displayName: string,
  jsonData: {
    tempo_bpm: number;
    total_time: number;
    notes: NoteItem[];
  }
) {
  console.log(`[FIRESTORE] Attempting to save record for user ${userId}, generation ${generationId}`);
  const db = getDbSafe();
  if (!db) {
    console.error("[FIRESTORE] Database not initialized. Check your Firebase configuration.");
    throw new Error("FIRESTORE_NOT_CONFIGURED");
  }

  const ref = getJsonDocRef(db, userId, generationId);

  // Prevent duplicate
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const data = existing.data();
    if (data.displayName === displayName) {
      throw new Error("FILENAME_ALREADY_EXISTS");
    }
  }

  try {
    await setDoc(ref, {
      displayName,
      tempo_bpm: jsonData.tempo_bpm,
      total_time: jsonData.total_time,
      notes: jsonData.notes,
      createdAt: serverTimestamp(),
    });
    console.log("[FIRESTORE] Save successful");
  } catch (e) {
    console.error("[FIRESTORE] Error during setDoc:", e);
    throw e;
  }

  return generationId;
}

// --------------------------------------------------
// READ JSON
// --------------------------------------------------

export async function getJsonRecord(
  userId: string,
  generationId: string
): Promise<JsonGenerationRecord | null> {
  const db = getDbSafe();
  if (!db) return null;

  const ref = getJsonDocRef(db, userId, generationId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as any),
  };
}
