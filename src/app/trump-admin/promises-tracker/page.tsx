import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PromisesTrackerPageClient, { type PromisesData } from './PromisesTrackerPageClient';
import { fetchPromisesData } from '../../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'Campaign Promises Tracker - Trump Administration',
  description: 'Real-time tracking of campaign commitments and implementation status. Monitor which promises have been kept, broken, stalled, or are in progress during the Trump administration.',
  openGraph: {
    title: 'Campaign Promises Tracker - Trump Administration',
    description: 'Real-time tracking of campaign commitments and implementation status during the Trump administration.',
    url: 'https://theinklined.com/trump-admin/promises-tracker',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Campaign Promises Tracker',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campaign Promises Tracker - Trump Administration',
    description: 'Real-time tracking of campaign commitments and implementation status.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/trump-admin/promises-tracker',
  },
};

/**
 * Promises Tracker Page - Server Component for SEO
 * Fetches promises data on the server for optimal SEO and performance
 */
export default async function PromisesTrackerPage() {
  const data = await fetchPromisesData() as PromisesData | null;

  if (!data) {
    notFound();
  }

  return <PromisesTrackerPageClient data={data} />;
}
