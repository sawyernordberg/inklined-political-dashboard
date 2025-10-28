import type { Metadata } from 'next';
import SpendingCutsPageClient from './SpendingCutsPageClient';

export const metadata: Metadata = {
  title: 'Trump Administration Spending Cuts - Federal Budget Reductions',
  description: 'Comprehensive analysis of federal spending cuts and budget reductions implemented by the Trump administration. Track cuts to healthcare, education, foreign aid, and federal workforce.',
  openGraph: {
    title: 'Trump Administration Spending Cuts - Federal Budget Reductions',
    description: 'Comprehensive analysis of federal spending cuts and budget reductions implemented by the Trump administration.',
    url: 'https://theinklined.com/trump-admin/spending-cuts',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spending Cuts Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trump Administration Spending Cuts - Federal Budget Reductions',
    description: 'Comprehensive analysis of federal spending cuts and budget reductions.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/trump-admin/spending-cuts',
  },
};

/**
 * Spending Cuts Page - Server Component for SEO
 * This page uses static hardcoded data defined in the client component
 */
export default function SpendingCutsPage() {
  return <SpendingCutsPageClient />;
}
