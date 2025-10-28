import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ForeignAffairsPageClient, { type ForeignAffairsData } from './ForeignAffairsPageClient';
import { fetchForeignAffairsData } from '../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'US Foreign Affairs & International Relations - The Inklined',
  description: 'Comprehensive analysis of US bilateral relations, regional partnerships, and diplomatic engagement across the globe. Track economic cooperation, security alliances, and diplomatic strategies.',
  openGraph: {
    title: 'US Foreign Affairs & International Relations - The Inklined',
    description: 'Comprehensive analysis of US bilateral relations, regional partnerships, and diplomatic engagement across the globe.',
    url: 'https://theinklined.com/foreign-affairs',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'US Foreign Affairs Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Foreign Affairs & International Relations - The Inklined',
    description: 'Comprehensive analysis of US bilateral relations, regional partnerships, and diplomatic engagement across the globe.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/foreign-affairs',
  },
};

/**
 * Foreign Affairs Page - Server Component for SEO
 * Fetches foreign affairs data on the server for optimal SEO and performance
 */
export default async function ForeignAffairsPage() {
  const data = await fetchForeignAffairsData() as ForeignAffairsData | null;

  if (!data) {
    notFound();
  }

  return <ForeignAffairsPageClient data={data} />;
}
