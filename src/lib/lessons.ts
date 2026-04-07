import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { SECTION_MAP, getLessonTitleFromSlug, normalizeSlug } from './sections';
import type { LessonMeta } from '@/types';

const ROAD_MAP_BASE = path.resolve(process.cwd(), 'content/net-learning-road-map');

/** Recursively find all file paths matching a pattern under a directory */
function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

/** Get supplementary (non-README) markdown files for a lesson folder */
function getSupplementaryFiles(sectionFolder: string, lessonFolder: string): { name: string; path: string }[] {
  const lessonDir = path.join(ROAD_MAP_BASE, sectionFolder, lessonFolder);
  if (!fs.existsSync(lessonDir)) return [];

  const results: { name: string; path: string }[] = [];
  const entries = fs.readdirSync(lessonDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const nameLower = entry.name.toLowerCase();
    if (!nameLower.endsWith('.md')) continue;
    const base = nameLower.replace(/\.md$/i, '');
    if (base === 'readme') continue;
    results.push({
      name: entry.name.replace(/\.md$/i, ''),
      path: path.join(lessonDir, entry.name),
    });
  }
  return results;
}

/** In-memory cache for lesson data */
let _allLessons: LessonMeta[] | null = null;
let _contentCache: Map<string, string> = new Map();

/**
 * Get all lessons from the road-map directory.
 * Each lesson = a folder containing a README.md
 */
export function getAllLessons(): LessonMeta[] {
  if (_allLessons) return _allLessons;

  const lessons: LessonMeta[] = [];
  const seen = new Set<string>();

  // Find all README.md files
  const readmeFiles = findFiles(ROAD_MAP_BASE, /^readme\.md$/i);

  for (const filePath of readmeFiles) {
    // filePath: /absolute/path/to/road-map/SECTION/lesson-folder/README.md
    const relative = path.relative(ROAD_MAP_BASE, filePath);
    const parts = relative.replace(/\\/g, '/').split('/');

    if (parts.length < 3) continue;

    const sectionFolder = parts[0];
    // lessonFolder may contain slashes if nested (join all middle parts)
    const lessonFolder = parts.slice(1, -1).join('/');
    const key = `${sectionFolder}/${lessonFolder}`;

    if (seen.has(key)) continue;
    seen.add(key);

    const sectionMeta = SECTION_MAP[sectionFolder];
    if (!sectionMeta) continue;

    const title = getLessonTitleFromSlug(path.basename(lessonFolder));
    const slug = normalizeSlug(sectionFolder, lessonFolder);

    lessons.push({
      slug,
      title,
      sectionId: sectionMeta.id,
      sectionName: sectionMeta.name,
      folderName: sectionFolder,
      readmePath: filePath,
      supplementaryFiles: getSupplementaryFiles(sectionFolder, lessonFolder),
    });
  }

  // Sort: by section order, then alphabetically
  _allLessons = lessons.sort((a, b) => {
    const aOrder = (SECTION_MAP[a.folderName]?.order ?? 99) - (SECTION_MAP[b.folderName]?.order ?? 99);
    if (aOrder !== 0) return aOrder;
    return a.slug.localeCompare(b.slug);
  });

  return _allLessons;
}

/**
 * Get the markdown content + metadata for a specific lesson.
 */
export function getLessonContent(slug: string): { content: string; meta: LessonMeta } | null {
  const decodedSlug = decodeURIComponent(slug);
  const lessons = getAllLessons();
  const lesson = lessons.find(l => l.slug === slug || l.slug === decodedSlug);
  if (!lesson) return null;

  let raw: string;
  if (_contentCache.has(lesson.readmePath)) {
    raw = _contentCache.get(lesson.readmePath)!;
  } else {
    try {
      raw = fs.readFileSync(lesson.readmePath, 'utf-8');
      _contentCache.set(lesson.readmePath, raw);
    } catch {
      return null;
    }
  }

  const { content } = matter(raw);
  return { content, meta: lesson };
}

/**
 * Get supplementary file content.
 */
export function getSupplementaryContent(lessonSlug: string, fileName: string): string | null {
  const decodedSlug = decodeURIComponent(lessonSlug);
  const lessons = getAllLessons();
  const lesson = lessons.find(l => l.slug === lessonSlug || l.slug === decodedSlug);
  if (!lesson) return null;

  const suppFile = lesson.supplementaryFiles.find(f => f.name === fileName);
  if (!suppFile) return null;

  if (_contentCache.has(suppFile.path)) {
    return _contentCache.get(suppFile.path)!;
  }
  try {
    const raw = fs.readFileSync(suppFile.path, 'utf-8');
    _contentCache.set(suppFile.path, raw);
    return raw;
  } catch {
    return null;
  }
}

/**
 * Return all lesson content for search indexing.
 */
export function getAllLessonContent(): { slug: string; content: string; title: string }[] {
  const lessons = getAllLessons();
  return lessons
    .map(lesson => {
      let raw: string;
      if (_contentCache.has(lesson.readmePath)) {
        raw = _contentCache.get(lesson.readmePath)!;
      } else {
        try {
          raw = fs.readFileSync(lesson.readmePath, 'utf-8');
          _contentCache.set(lesson.readmePath, raw);
        } catch {
          return null;
        }
      }
      const { content } = matter(raw);
      return { slug: lesson.slug, content, title: lesson.title };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
