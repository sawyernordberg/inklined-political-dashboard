import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TrumpAdminPageClient from './TrumpAdminPageClient';
import {
  fetchImmigrationData,
  fetchEconomicData,
  fetchPromisesData,
  fetchFederalEmployeesData,
  fetchSp500Data,
} from '../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'Trump Administration Dashboard - Policy Tracking & Performance',
  description: 'Comprehensive overview of the Trump administration\'s policies and performance. Track campaign promises, immigration enforcement, economic policy impacts, and federal spending cuts.',
  openGraph: {
    title: 'Trump Administration Dashboard - Policy Tracking & Performance',
    description: 'Comprehensive overview of the Trump administration\'s policies and performance. Track campaign promises, immigration enforcement, economic policy impacts, and federal spending cuts.',
    url: 'https://theinklined.com/trump-admin',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trump Administration Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trump Administration Dashboard - Policy Tracking & Performance',
    description: 'Comprehensive overview of the Trump administration\'s policies and performance.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/trump-admin',
  },
};

/**
 * Trump Administration Dashboard - Server Component for SEO
 * Fetches all dashboard data on the server for optimal SEO and performance
 */
export default async function TrumpAdminPage() {
  // Fetch all data in parallel on the server
  const [
    immigrationData,
    economicData,
    promisesData,
    federalEmployeesData,
    stockData,
  ] = await Promise.all([
    fetchImmigrationData(),
    fetchEconomicData(),
    fetchPromisesData(),
    fetchFederalEmployeesData(),
    fetchSp500Data(),
  ]);

  if (!immigrationData || !economicData || !promisesData || !federalEmployeesData || !stockData) {
    notFound();
  }

  return (
    <TrumpAdminPageClient
      immigrationData={immigrationData}
      economicData={economicData}
      promisesData={promisesData}
      federalEmployeesData={federalEmployeesData}
      stockData={stockData}
    />
  );
}
