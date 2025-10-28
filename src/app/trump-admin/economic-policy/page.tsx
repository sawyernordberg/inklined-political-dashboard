import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EconomicPolicyPageClient, { type EconomicData } from './EconomicPolicyPageClient';
import { fetchEconomicData } from '../../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'Economic Policy Dashboard - Trump Administration',
  description: 'Comprehensive analysis of economic indicators, tax policy, tariffs, and market performance during the second Trump administration. Track S&P 500 performance, tariff updates, and economic metrics.',
  openGraph: {
    title: 'Economic Policy Dashboard - Trump Administration',
    description: 'Comprehensive analysis of economic indicators, tax policy, tariffs, and market performance during the second Trump administration.',
    url: 'https://theinklined.com/trump-admin/economic-policy',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Economic Policy Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Economic Policy Dashboard - Trump Administration',
    description: 'Comprehensive analysis of economic indicators, tax policy, tariffs, and market performance.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/trump-admin/economic-policy',
  },
};

/**
 * Economic Policy Page - Server Component for SEO
 * Fetches economic data on the server for optimal SEO and performance
 */
export default async function EconomicPolicyPage() {
  const data = await fetchEconomicData() as EconomicData | null;

  if (!data) {
    notFound();
  }

  return <EconomicPolicyPageClient data={data} />;
}
