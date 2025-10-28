import type { Metadata } from 'next';
import HomePageClient from '../components/HomePageClient';
import {
  fetchImmigrationData,
  fetchEconomicData,
  fetchPromisesData,
  fetchFederalEmployeesData,
  fetchSp500Data,
  fetchCongressData,
} from '../lib/data-fetching';

export const metadata: Metadata = {
  title: 'The State of the Union - Political Dashboard',
  description: 'Real-time analysis of America\'s political landscape, policy implementation, and government performance through comprehensive data and expert insights.',
  openGraph: {
    title: 'The State of the Union - Political Dashboard',
    description: 'Real-time analysis of America\'s political landscape, policy implementation, and government performance through comprehensive data and expert insights.',
    url: 'https://theinklined.com',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inklined Political Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The State of the Union - Political Dashboard',
    description: 'Real-time analysis of America\'s political landscape, policy implementation, and government performance through comprehensive data and expert insights.',
    images: ['/og-image.png'],
  },
};

/**
 * Homepage - Server Component for SEO
 * All data is fetched on the server and passed to the client component
 * This ensures search engines can crawl all content
 */
export default async function Home() {
  // Fetch all data in parallel on the server
  const [
    immigrationData,
    economicData,
    promisesData,
    federalEmployeesData,
    sp500Data,
    congressData,
  ] = await Promise.all([
    fetchImmigrationData(),
    fetchEconomicData(),
    fetchPromisesData(),
    fetchFederalEmployeesData(),
    fetchSp500Data(),
    fetchCongressData(),
  ]);

  return (
    <HomePageClient
      sp500Data={sp500Data}
      economicData={economicData}
      federalEmployeesData={federalEmployeesData}
      promisesData={promisesData}
      immigrationData={immigrationData}
      congressData={congressData}
    />
  );
}
