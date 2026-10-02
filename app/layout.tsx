import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Inkwell — A Modern Blogging Platform',
    template: '%s — Inkwell',
  },
  description:
    'Inkwell is a clean, typography-focused blogging platform for writers and readers. Share your stories with the world.',
  metadataBase: new URL('https://inkwell.app'),
  keywords: ['blog', 'writing', 'publishing', 'stories', 'articles', 'platform'],
  authors: [{ name: 'Inkwell' }],
  openGraph: {
    title: 'Inkwell — A Modern Blogging Platform',
    description:
      'Share your stories with the world on a platform built for writers.',
    type: 'website',
    siteName: 'Inkwell',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkwell — A Modern Blogging Platform',
    description:
      'Share your stories with the world on a platform built for writers.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
