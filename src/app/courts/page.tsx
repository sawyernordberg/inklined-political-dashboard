import type { Metadata } from 'next';
import CourtsPageClient from './CourtsPageClient';

export const metadata: Metadata = {
  title: 'Federal Courts Dashboard - Coming Soon | The Inklined',
  description: 'Comprehensive analysis of federal court decisions, judicial appointments, and Supreme Court activity. Track judicial trends and court impact on American governance.',
  openGraph: {
    title: 'Federal Courts Dashboard - Coming Soon | The Inklined',
    description: 'Comprehensive analysis of federal court decisions, judicial appointments, and Supreme Court activity.',
    url: 'https://theinklined.com/courts',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Federal Courts Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Federal Courts Dashboard - Coming Soon | The Inklined',
    description: 'Comprehensive analysis of federal court decisions, judicial appointments, and Supreme Court activity.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/courts',
  },
};

/**
 * Courts Page - Server Component for SEO
 * Static content page (coming soon page)
 */
export default function CourtsPage() {
  return <CourtsPageClient />;
}
