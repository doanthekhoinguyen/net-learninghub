import type { Section } from '@/types';

// Maps folderName → section metadata
export const SECTION_MAP: Record<string, { id: string; name: string; nameVi: string; order: number; color: string }> = {
  '0.Setup': { id: '0.Setup', name: '0. Setup', nameVi: '0. Setup', order: 0, color: 'bg-slate-400' },
  '1.CSharpBasic': { id: '1.CSharpBasic', name: '1. C# Cơ Bản', nameVi: '1. C# Cơ Bản', order: 1, color: 'bg-blue-500' },
  '2.DataStructureAndAlgorism': { id: '2.DataStructureAndAlgorism', name: '2. Cấu Trúc Dữ Liệu & Giải Thuật', nameVi: '2. Cấu Trúc Dữ Liệu & Giải Thuật', order: 2, color: 'bg-purple-500' },
  '3.OOP': { id: '3.OOP', name: '3. OOP', nameVi: '3. OOP', order: 3, color: 'bg-violet-500' },
  '4. SQL': { id: '4.SQL', name: '4. SQL', nameVi: '4. SQL', order: 4, color: 'bg-teal-500' },
  '5.CSharpMid': { id: '5.CSharpMid', name: '5. C# Trung Cấp', nameVi: '5. C# Trung Cấp', order: 5, color: 'bg-cyan-500' },
  '6.LinQ': { id: '6.LinQ', name: '6. LINQ', nameVi: '6. LINQ', order: 6, color: 'bg-indigo-500' },
  '7. Entity Framewok': { id: '7.EntityFramework', name: '7. Entity Framework', nameVi: '7. Entity Framework', order: 7, color: 'bg-emerald-500' },
  '7.CSharpAdvance': { id: '7.CSharpAdvance', name: '7. C# Nâng Cao', nameVi: '7. C# Nâng Cao', order: 7, color: 'bg-orange-500' },
  '8. ASP.NET': { id: '8.ASP.NET', name: '8. ASP.NET Core', nameVi: '8. ASP.NET Core', order: 8, color: 'bg-rose-500' },
  '9. Advance': { id: '9.Advance', name: '9. Nâng Cao', nameVi: '9. Nâng Cao', order: 9, color: 'bg-amber-500' },
};

export const SECTIONS: Section[] = Object.entries(SECTION_MAP)
  .map(([folderName, meta]) => ({
    id: meta.id,
    folderName,
    name: meta.name,
    nameVi: meta.nameVi,
    order: meta.order,
    lessons: [],
  }))
  .sort((a, b) => a.order - b.order);

export function getSectionColor(folderName: string): string {
  return SECTION_MAP[folderName]?.color ?? 'bg-slate-400';
}

export function getSectionAccent(folderName: string): string {
  const color = SECTION_MAP[folderName]?.color ?? 'bg-slate-400';
  // Map bg-* to text-*
  return color.replace('bg-', 'text-').replace('-500', '-600').replace('slate-400', 'slate-600');
}

/**
 * Extract lesson title from a slug segment.
 * Examples:
 *   "L101HelloWorld"          → "Hello World"
 *   "L102.Variables"          → "Variables"
 *   "1. ER model"             → "ER model"
 *   "L125QueueStackHashtable" → "Queue Stack Hashtable"
 */
export function getLessonTitleFromSlug(slug: string): string {
  // Handle numbered prefixes like "1. Introduction", "2. DDL", etc.
  const numberedPrefix = slug.match(/^\d+\.\s+(.+)$/);
  if (numberedPrefix) return trimTitle(numberedPrefix[1]);

  // Handle L-prefixed slugs: "L101HelloWorld", "L102.Variables", "L102Operators"
  const lPrefix = slug.match(/^L\d+(?:\.\d+)?(.+)$/);
  if (lPrefix) {
    const raw = lPrefix[1] || '';
    // If it starts with a dot, strip it and remaining digits
    const withoutDot = raw.replace(/^\./, '');
    return trimTitle(withoutDot);
  }

  // Fallback: return as-is, title-casing first char
  return trimTitle(slug);
}

function trimTitle(raw: string): string {
  // Strip trailing digits (e.g. "Variables2" → "Variables")
  const cleaned = raw.replace(/\d+$/, '').trim();
  if (!cleaned) return raw;

  // Title-case: uppercase first char, lowercase the rest
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Normalize a slug to include the section prefix.
 * e.g. "L101HelloWorld" inside "1.CSharpBasic" → "1.CSharpBasic/L101HelloWorld"
 */
export function normalizeSlug(sectionFolder: string, lessonFolder: string): string {
  return `${sectionFolder}/${lessonFolder}`;
}

/**
 * Convert a normalized slug back to individual parts.
 * "1.CSharpBasic/L101HelloWorld" → { section: "1.CSharpBasic", lesson: "L101HelloWorld" }
 */
export function parseNormalizedSlug(normalized: string): { section: string; lesson: string } {
  const idx = normalized.indexOf('/');
  return {
    section: normalized.slice(0, idx),
    lesson: normalized.slice(idx + 1),
  };
}
