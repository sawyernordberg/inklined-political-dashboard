import type { Metadata } from 'next';
import TransparencyPageClient, { type TariffData } from './TransparencyPageClient';
import { fetchEconomicData } from '../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'Data Transparency - Sources & Methodology | The Inklined',
  description: 'Our commitment to transparency in data sources, methodology, and analysis. Learn about how we collect, verify, and present political data with accuracy and integrity.',
  openGraph: {
    title: 'Data Transparency - Sources & Methodology | The Inklined',
    description: 'Our commitment to transparency in data sources, methodology, and analysis.',
    url: 'https://theinklined.com/transparency',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Data Transparency',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Transparency - Sources & Methodology | The Inklined',
    description: 'Our commitment to transparency in data sources, methodology, and analysis.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/transparency',
  },
};

/**
 * Transparency Page - Server Component for SEO
 * Fetches tariff data on the server for optimal SEO
 */
export default async function TransparencyPage() {
  const economicData = await fetchEconomicData();
  const tariffData = economicData?.tariff as TariffData | null;

  return <TransparencyPageClient tariffData={tariffData} />;
}
