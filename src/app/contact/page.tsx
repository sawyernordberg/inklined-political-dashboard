import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us - The Inklined',
  description: 'Get in touch with the Inklined team for questions, feedback, or collaboration opportunities. We welcome your input and are committed to improving our political dashboard.',
  openGraph: {
    title: 'Contact Us - The Inklined',
    description: 'Get in touch with the Inklined team for questions, feedback, or collaboration opportunities.',
    url: 'https://theinklined.com/contact',
    siteName: 'The Inklined',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact Inklined',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - The Inklined',
    description: 'Get in touch with the Inklined team for questions, feedback, or collaboration opportunities.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/contact',
  },
};

/**
 * Contact Page - Server Component for SEO
 * Static content page with contact form
 */
export default function ContactPage() {
  return <ContactPageClient />;
}
