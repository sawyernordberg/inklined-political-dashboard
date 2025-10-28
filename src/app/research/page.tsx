import type { Metadata } from 'next';
import ResearchPageClient from './ResearchPageClient';

export const metadata: Metadata = {
  title: 'Research & Analysis - Coming Soon | The Inklined',
  description: 'In-depth research and analysis articles on American politics, policy implementation, and governance trends. Expert insights and data-driven analysis.',
  openGraph: {
    title: 'Research & Analysis - Coming Soon | The Inklined',
    description: 'In-depth research and analysis articles on American politics, policy implementation, and governance trends.',
    url: 'https://theinklined.com/research',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Research & Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research & Analysis - Coming Soon | The Inklined',
    description: 'In-depth research and analysis articles on American politics, policy implementation, and governance trends.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/research',
  },
};

/**
 * Research Page - Server Component for SEO
 * Static content page (coming soon page)
 */
export default function ResearchPage() {
  return <ResearchPageClient />;
}
