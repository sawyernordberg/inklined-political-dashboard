import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Inklined - Political Dashboard Hub",
    template: "%s | The Inklined"
  },
  description: "The Inklined provides comprehensive US government data analysis, Trump administration tracking, immigration enforcement statistics, economic indicators, and campaign promises monitoring. Your source for federal government transparency and political accountability.",
  keywords: [
    "inklined",
    "US government",
    "United States government",
    "Trump administration",
    "Donald Trump",
    "government statistics",
    "federal government data",
    "government transparency",
    "political dashboard",
    "government accountability",
    "immigration enforcement",
    "ICE detention",
    "border apprehensions",
    "CBP data",
    "economic indicators",
    "S&P 500 presidential comparison",
    "campaign promises tracker",
    "Trump promises",
    "government spending",
    "federal employees data",
    "congressional analysis",
    "foreign affairs data",
    "tariff data",
    "trade policy",
    "political analysis",
    "government data analysis",
    "policy tracking",
    "political research",
    "government insights",
    "federal statistics",
    "political trends",
    "government performance",
    "public policy analysis",
    "political transparency",
    "government oversight"
  ],
  authors: [{ name: "Inklined" }],
  creator: "Inklined",
  publisher: "Inklined",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://theinklined.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "The Inklined - Political Dashboard Hub",
    description: "The Inklined provides comprehensive US government data analysis, Trump administration tracking, immigration enforcement statistics, economic indicators, and campaign promises monitoring.",
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
    title: "The Inklined - Political Dashboard Hub",
    description: "The Inklined provides comprehensive US government data analysis, Trump administration tracking, immigration enforcement statistics, economic indicators, and campaign promises monitoring.",
    images: ['/og-image.png'],
    creator: '@inklined',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/image.png', sizes: '32x32', type: 'image/png' },
      { url: '/image.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: [
      { url: '/image.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/image.png', sizes: '180x180', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Performance and SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="color-scheme" content="light" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Explicit favicon links */}
        <link rel="icon" type="image/png" sizes="32x32" href="/image.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/image.png?v=3" />
        <link rel="shortcut icon" href="/image.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/image.png?v=3" />
        
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "The Inklined - Political Dashboard Hub",
              "alternateName": "The Inklined",
              "url": "https://theinklined.com",
              "description": "The Inklined provides comprehensive US government data analysis, Trump administration tracking, immigration enforcement statistics, economic indicators, and campaign promises monitoring. Your source for federal government transparency and political accountability.",
              "creator": {
                "@type": "Organization",
                "name": "The Inklined",
                "url": "https://theinklined.com"
              },
              "publisher": {
                "@type": "Organization",
                "name": "The Inklined",
                "url": "https://theinklined.com"
              },
              "license": "https://creativecommons.org/licenses/by/4.0/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://theinklined.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "mainEntity": {
                "@type": "DataCatalog",
                "name": "Political Data Dashboard",
                "description": "Government data, policy analysis, and political tracking",
                "keywords": ["US government", "Trump administration", "government statistics", "immigration enforcement", "ICE detention", "border apprehensions", "economic indicators", "campaign promises", "federal government data", "government transparency"],
                "creator": {
                  "@type": "Organization",
                  "name": "The Inklined",
                  "url": "https://theinklined.com"
                },
                "license": "https://creativecommons.org/licenses/by/4.0/"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
