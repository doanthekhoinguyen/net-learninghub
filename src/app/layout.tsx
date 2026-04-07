import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AppShell } from '@/components/AppShell';
import { getAllLessons } from '@/lib/lessons';
import { SECTIONS } from '@/lib/sections';

export const metadata: Metadata = {
  title: 'Net Learning Hub',
  description: 'Lộ trình học .NET',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lessons = getAllLessons();
  const sections = SECTIONS;

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AppShell lessons={lessons} sections={sections}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}