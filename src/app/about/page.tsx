import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Inklined - Political Dashboard & Analysis',
  description: 'Learn about Inklined\'s mission to provide comprehensive, data-driven analysis of American politics and governance. Discover our commitment to transparency, accuracy, and informed analysis.',
  openGraph: {
    title: 'About Inklined - Political Dashboard & Analysis',
    description: 'Learn about Inklined\'s mission to provide comprehensive, data-driven analysis of American politics and governance.',
    url: 'https://theinklined.com/about',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About Inklined',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Inklined - Political Dashboard & Analysis',
    description: 'Learn about Inklined\'s mission to provide comprehensive, data-driven analysis.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/about',
  },
};

/**
 * About Page - Server Component for SEO
 * Static content page with no data fetching
 */
export default function AboutPage() {
  return <AboutPageClient />;
}
