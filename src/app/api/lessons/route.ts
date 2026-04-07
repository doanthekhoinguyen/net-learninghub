import { NextResponse } from 'next/server';
import { getAllLessons, getAllLessonContent } from '@/lib/lessons';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lessons = getAllLessons();
  const content = getAllLessonContent();
  return NextResponse.json({ lessons, content });
}