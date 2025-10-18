'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [, ] = useState<Record<string, unknown> | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // You could fetch session details here if needed
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header breadcrumb={{
        items: [
          { label: 'Support Us', href: '/support' },
          { label: 'Success' }
        ]
      }} />

      {/* Success Content */}
      <main style={{
        maxWidth: '800px',
        margin: '4rem auto',
        padding: '0 1rem'
      }}>
        <div style={{
          background: '#fff',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#0d9488',
            borderRadius: '50%',
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#fff'
          }}>
            ✓
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1rem'
          }}>
            Thank You for Your Support!
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#666666',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Your donation helps us maintain independent political journalism and provide 
            transparent data analysis. We appreciate your commitment to keeping the public informed.
          </p>
          
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#666666',
              margin: '0'
            }}>
              You should receive a confirmation email shortly. If you have any questions 
              about your donation, please contact us at support@theinklined.com
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/" style={{
              background: '#0d9488',
              color: '#fff',
              padding: '1rem 2rem',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Return to Dashboard
            </Link>
            <Link href="/about" style={{
              background: 'transparent',
              color: '#0d9488',
              padding: '1rem 2rem',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '2px solid #0d9488'
            }}>
              Learn More About Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DonationSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DonationSuccessContent />
    </Suspense>
  );
}
