export interface LessonMeta {
  slug: string; // "1.CSharpBasic/L101HelloWorld"
  title: string;
  sectionId: string;
  sectionName: string;
  folderName: string;
  readmePath: string;
  supplementaryFiles: { name: string; path: string }[];
}

export interface Section {
  id: string;
  folderName: string;
  name: string;
  nameVi: string;
  order: number;
  lessons: LessonMeta[];
}

export interface Progress {
  completedLessons: string[];
  bookmarks: string[];
  notes: Record<string, string>;
  streak: number;
  lastVisit: string;
  visitedLessons: string[];
}

export interface SearchResult {
  lesson: LessonMeta;
  matches: { key: string; indices: [number, number][] }[];
  score?: number;
}
