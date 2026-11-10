import type { Metadata, Viewport } from 'next';
import type { ReactNode, ReactElement } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nawwaf Zayyan Musyafa',
  description: 'Portfolio of Nawwaf Zayyan Musyafa, a Software and AI Engineer building reliable software, intelligent systems, and digital products.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico'
  }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#080808' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
