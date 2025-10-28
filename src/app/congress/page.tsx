import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CongressPageClient, { type CongressData } from './CongressPageClient';
import { fetchCongressData } from '../../lib/data-fetching';

export const metadata: Metadata = {
  title: '119th Congress Analysis - Congressional Breakdown',
  description: 'Comprehensive analysis of congressional composition, legislative productivity, and historical performance during the 2025-2026 session. Real-time tracking of bills, partisan dynamics, and session productivity.',
  openGraph: {
    title: '119th Congress Analysis - Congressional Breakdown',
    description: 'Comprehensive analysis of congressional composition, legislative productivity, and historical performance during the 2025-2026 session.',
    url: 'https://theinklined.com/congress',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '119th Congress Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '119th Congress Analysis - Congressional Breakdown',
    description: 'Comprehensive analysis of congressional composition, legislative productivity, and historical performance during the 2025-2026 session.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/congress',
  },
};

/**
 * Congress Page - Server Component for SEO
 * Fetches congressional data on the server for optimal SEO and performance
 */
export default async function CongressPage() {
  const data = await fetchCongressData() as CongressData | null;

  if (!data) {
    notFound();
  }

  return <CongressPageClient data={data} />;
}
