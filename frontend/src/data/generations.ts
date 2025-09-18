import { getDbSafe } from "../auth/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

export type GenerationRecord = {
  id: string;
  userId: string;
  filename: string;
  difficulty: string;
  genre: string;
  key: string;
  durationSec: number;
  prompt: string;
  favorite: boolean;
  createdAt?: any;
};

function getUserCollection(db: Firestore, userId: string) {
  return collection(db, "users", userId, "generations");
}

export async function addGenerationRecord(userId: string, data: Omit<GenerationRecord, "id"|"userId">) {
  const db = getDbSafe();
  if (!db) throw new Error("Firestore not configured. Set VITE_FIREBASE_* env vars.");
  const col = getUserCollection(db, userId);
  const ref = await addDoc(col, {
    userId,
    filename: data.filename,
    difficulty: data.difficulty,
    genre: data.genre,
    key: data.key,
    durationSec: data.durationSec,
    prompt: data.prompt,
    favorite: data.favorite ?? false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listGenerationRecords(userId: string): Promise<GenerationRecord[]> {
  const db = getDbSafe();
  if (!db) return [];
  const q = query(getUserCollection(db, userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...(d.data() as any) }));
}

export async function setFavorite(userId: string, id: string, favorite: boolean) {
  const db = getDbSafe();
  if (!db) return;
  const ref = doc(db, "users", userId, "generations", id);
  await updateDoc(ref, { favorite });
}

export async function deleteByIds(userId: string, ids: string[]) {
  const db = getDbSafe();
  if (!db) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(db, "users", userId, "generations", id)));
  await batch.commit();
}


