// Thin data-access layer over Firestore. Both index.html and update.html
// import this module — it's the only file that knows about Firestore.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, addDoc,
  getDocs, query, orderBy, limit, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Write one employee's entry into the shared document for a given week.
 * Uses a dot-path field ("entries.<employeeKey>") so only that employee's
 * slice is touched — everyone else's entries for the same week are left
 * exactly as they are. This is what allows up to 5-6 separate inputs to
 * layer into a single shared weekly record.
 *
 * Also appends an immutable copy to weeklyReports/{weekOf}/history so every
 * submission (including edits) is preserved permanently, even if someone
 * later overwrites their own entry.
 */
export async function submitEntry(weekOf, employeeKey, payload) {
  const weekRef = doc(db, "weeklyReports", weekOf);
  const patch = {
    weekOf,
    updatedAt: serverTimestamp(),
  };
  patch["entries." + employeeKey] = payload;
  await setDoc(weekRef, patch, { merge: true });

  await addDoc(collection(db, "weeklyReports", weekOf, "history"), {
    ...payload,
    employeeKey,
    weekOf,
    loggedAt: serverTimestamp(),
  });
}

/** Fetch the shared document for one week (or null if it doesn't exist yet). */
export async function getWeek(weekOf) {
  const snap = await getDoc(doc(db, "weeklyReports", weekOf));
  return snap.exists() ? snap.data() : null;
}

/** List known week IDs (YYYY-MM-DD), most recent first. */
export async function listWeeks(max = 52) {
  const q = query(collection(db, "weeklyReports"), orderBy("weekOf", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.id);
}

/** Full submission history for one week, oldest first. */
export async function getHistory(weekOf) {
  const q = query(collection(db, "weeklyReports", weekOf, "history"), orderBy("loggedAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
