import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DepartmentsPageClient, { type FederalEmployeeData, type FederalEmployeesResponse } from './DepartmentsPageClient';
import { fetchFederalEmployeesData } from '../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'Federal Departments & Agencies - The Inklined',
  description: 'Explore the 15 Cabinet departments of the U.S. federal government. Learn about department leadership, budgets, key agencies, and track federal workforce size over time.',
  openGraph: {
    title: 'Federal Departments & Agencies - The Inklined',
    description: 'Explore the 15 Cabinet departments of the U.S. federal government. Learn about department leadership, budgets, and key agencies.',
    url: 'https://theinklined.com/departments',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Federal Departments Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Federal Departments & Agencies - The Inklined',
    description: 'Explore the 15 Cabinet departments of the U.S. federal government.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/departments',
  },
};

/**
 * Departments Page - Server Component for SEO
 * Fetches federal employees data on the server for optimal SEO and performance
 */
export default async function DepartmentsPage() {
  const data = await fetchFederalEmployeesData() as FederalEmployeesResponse | null;

  if (!data || !data.observations?.observations) {
    notFound();
  }

  return <DepartmentsPageClient federalEmployeesData={data.observations.observations} />;
}
