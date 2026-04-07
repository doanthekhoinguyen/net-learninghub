const STORAGE_KEY = 'nlh_progress';

export interface Progress {
  completedLessons: string[];
  bookmarks: string[];
  notes: Record<string, string>;
  streak: number;
  lastVisit: string;
  visitedLessons: string[];
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') {
    return { completedLessons: [], bookmarks: [], notes: {}, streak: 0, lastVisit: '', visitedLessons: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessons: [], bookmarks: [], notes: {}, streak: 0, lastVisit: '', visitedLessons: [] };
    return JSON.parse(raw);
  } catch {
    return { completedLessons: [], bookmarks: [], notes: {}, streak: 0, lastVisit: '', visitedLessons: [] };
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function toggleCompleted(slug: string): Progress {
  const p = getProgress();
  if (p.completedLessons.includes(slug)) {
    p.completedLessons = p.completedLessons.filter(s => s !== slug);
  } else {
    p.completedLessons.push(slug);
  }
  updateStreak(p);
  saveProgress(p);
  return p;
}

export function toggleBookmark(slug: string): Progress {
  const p = getProgress();
  if (p.bookmarks.includes(slug)) {
    p.bookmarks = p.bookmarks.filter(s => s !== slug);
  } else {
    p.bookmarks.push(slug);
  }
  saveProgress(p);
  return p;
}

export function saveNote(slug: string, note: string): Progress {
  const p = getProgress();
  p.notes[slug] = note;
  saveProgress(p);
  return p;
}

export function updateLastVisit(slug: string): Progress {
  const p = getProgress();
  if (!p.visitedLessons.includes(slug)) {
    p.visitedLessons.push(slug);
  } else {
    p.visitedLessons = p.visitedLessons.filter(s => s !== slug);
    p.visitedLessons.push(slug);
  }
  p.lastVisit = new Date().toISOString();
  updateStreak(p);
  saveProgress(p);
  return p;
}

function updateStreak(p: Progress): void {
  const today = new Date().toDateString();
  const lastDate = p.lastVisit ? new Date(p.lastVisit).toDateString() : null;

  if (!lastDate) {
    p.streak = 1;
    return;
  }
  if (lastDate === today) return; // same day, no change

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    p.streak = (p.streak || 0) + 1; // consecutive day
  } else {
    p.streak = 1; // missed a day → reset
  }
}
