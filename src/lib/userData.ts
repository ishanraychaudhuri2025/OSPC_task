import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface PurposeCanvasItem {
  id: string;
  ownerId: string;
  title: string;
  why: string;
  how: string;
  what: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastBookmarkItem {
  episodeId: string;
  title: string;
  bookmarkedAt: string;
}

// ------------------- Purpose Canvases -------------------

export async function getUserCanvases(userId: string): Promise<PurposeCanvasItem[]> {
  try {
    const collRef = collection(db, 'users', userId, 'canvases');
    const q = query(collRef, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => docSnap.data() as PurposeCanvasItem);
  } catch (err) {
    console.warn('[UserData] Error fetching user canvases:', err);
    return [];
  }
}

export async function saveUserCanvas(
  userId: string,
  canvasData: { id?: string; title: string; why: string; how: string; what: string }
): Promise<PurposeCanvasItem> {
  const canvasId = canvasData.id || `canvas_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'users', userId, 'canvases', canvasId);
  const now = new Date().toISOString();

  // Check if exists to preserve createdAt
  let createdAt = now;
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      createdAt = existingSnap.data()?.createdAt || now;
    }
  } catch {
    // proceed
  }

  const item: PurposeCanvasItem = {
    id: canvasId,
    ownerId: userId,
    title: canvasData.title.trim() || 'Untitled Purpose Canvas',
    why: canvasData.why.trim(),
    how: canvasData.how.trim(),
    what: canvasData.what.trim(),
    createdAt,
    updatedAt: now,
  };

  await setDoc(docRef, item);
  return item;
}

export async function deleteUserCanvas(userId: string, canvasId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'canvases', canvasId);
  await deleteDoc(docRef);
}

// ------------------- Podcast Bookmarks -------------------

export async function getUserBookmarks(userId: string): Promise<PodcastBookmarkItem[]> {
  try {
    const collRef = collection(db, 'users', userId, 'bookmarks');
    const snap = await getDocs(collRef);
    return snap.docs.map((d) => d.data() as PodcastBookmarkItem);
  } catch (err) {
    console.warn('[UserData] Error fetching bookmarks:', err);
    return [];
  }
}

export async function toggleUserBookmark(
  userId: string,
  episodeId: string,
  title: string
): Promise<boolean> {
  const docRef = doc(db, 'users', userId, 'bookmarks', episodeId);
  const existing = await getDoc(docRef);

  if (existing.exists()) {
    await deleteDoc(docRef);
    return false; // removed
  } else {
    const now = new Date().toISOString();
    await setDoc(docRef, {
      episodeId,
      title,
      bookmarkedAt: now,
    });
    return true; // added
  }
}
