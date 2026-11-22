import type { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { DigiCraftBanner } from '@/components/DigiCraftBanner';

export const metadata: Metadata = { title: 'Notepad', description: 'A simple place to type.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <DigiCraftBanner />
        <script src="/editor-hook.js" defer></script>
      </body>
    </html>
  );
}