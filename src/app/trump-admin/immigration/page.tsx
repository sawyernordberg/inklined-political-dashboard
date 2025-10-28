import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ImmigrationPageClient, { type ImmigrationData } from './ImmigrationPageClient';
import { fetchImmigrationData } from '../../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'ICE Detention Statistics - Immigration Enforcement Dashboard',
  description: 'Comprehensive analysis of Immigration and Customs Enforcement detention data, population trends, and alternatives to detention programs. Track ICE detainee statistics and enforcement metrics.',
  openGraph: {
    title: 'ICE Detention Statistics - Immigration Enforcement Dashboard',
    description: 'Comprehensive analysis of Immigration and Customs Enforcement detention data, population trends, and alternatives to detention programs.',
    url: 'https://theinklined.com/trump-admin/immigration',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ICE Detention Statistics Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ICE Detention Statistics - Immigration Enforcement Dashboard',
    description: 'Comprehensive analysis of Immigration and Customs Enforcement detention data and population trends.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/trump-admin/immigration',
  },
};

/**
 * Immigration Page - Server Component for SEO
 * Fetches immigration data on the server for optimal SEO and performance
 */
export default async function ImmigrationPage() {
  const data = await fetchImmigrationData() as ImmigrationData | null;

  if (!data) {
    notFound();
  }

  return <ImmigrationPageClient data={data} />;
}
