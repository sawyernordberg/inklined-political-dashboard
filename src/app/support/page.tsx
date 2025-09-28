'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SupportPage() {
  const [, setCurrentTime] = useState(new Date());
  const [donationAmount, setDonationAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [15, 25, 50, 100, 250, 500];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // const formatTime = (date: Date) => {
  //   return date.toLocaleTimeString('en-US', { 
  //     hour: 'numeric', 
  //     minute: '2-digit',
  //     hour12: true 
  //   });
  // };

  // const formatDate = (date: Date) => {
  //   return date.toLocaleDateString('en-US', { 
  //     weekday: 'long',
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  const handleDonation = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const amount = customAmount ? parseFloat(customAmount) : donationAmount;
      
      if (amount < 5) {
        alert('Minimum donation amount is $5');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          isMonthly,
          donorName: donorName || 'Anonymous',
          donorEmail,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        alert(error);
        setIsProcessing(false);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        alert('Payment system unavailable');
        setIsProcessing(false);
        return;
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        alert(stripeError.message);
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'Support Us' }
        ]
      }} />

      {/* Support Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '3rem auto',
        padding: '0 1rem'
      }}>
        <div style={{
          background: '#fff',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Support Independent Journalism
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#666666',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Help us maintain transparent political analysis and data-driven journalism. 
              Your support enables us to provide unbiased reporting and comprehensive policy tracking.
            </p>
          </div>


          {/* Donation Form */}
          <div style={{
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '2rem'
            }}>
              Make a Donation
            </h2>

            {/* Donation Frequency Toggle */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#333333',
                marginBottom: '1rem'
              }}>
                Donation Frequency
              </label>
              <div style={{
                display: 'flex',
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '4px',
                width: 'fit-content'
              }}>
                <button
                  onClick={() => setIsMonthly(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: !isMonthly ? '#0d9488' : 'transparent',
                    color: !isMonthly ? '#fff' : '#666666',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setIsMonthly(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: isMonthly ? '#0d9488' : 'transparent',
                    color: isMonthly ? '#fff' : '#666666',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#333333',
                marginBottom: '1rem'
              }}>
                Select Amount
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDonationAmount(amount);
                      setCustomAmount('');
                    }}
                    style={{
                      padding: '1rem',
                      border: donationAmount === amount ? '2px solid #0d9488' : '2px solid #e5e5e5',
                      borderRadius: '6px',
                      background: donationAmount === amount ? '#f0fdfa' : '#fff',
                      color: donationAmount === amount ? '#0d9488' : '#333333',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#666666' }}>Or enter custom amount:</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) {
                      setDonationAmount(0);
                    }
                  }}
                  placeholder="Enter amount"
                  min="5"
                  step="0.01"
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    width: '120px'
                  }}
                />
              </div>
            </div>


            {/* Donor Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#333333',
                  marginBottom: '0.5rem'
                }}>
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    width: '100%',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#333333',
                  marginBottom: '0.5rem'
                }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    width: '100%',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Non-Profit Disclaimer */}
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#856404',
                margin: '0',
                fontWeight: '500'
              }}>
                ⚠️ <strong>Please note:</strong> We are not a registered nonprofit organization; therefore, donations are not tax-deductible.
              </p>
            </div>

            {/* Donate Button */}
            <button
              onClick={handleDonation}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: isProcessing ? '#94a3b8' : '#0d9488',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessing ? 'Processing...' : `${isMonthly ? 'Subscribe' : 'Donate'} $${customAmount || donationAmount}${isMonthly ? '/month' : ''}`}
            </button>

            <p style={{
              fontSize: '0.8rem',
              color: '#666666',
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              Secure payment processing by Stripe. Your information is encrypted and secure.
            </p>
          </div>

          {/* Additional Information */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1rem'
            }}>
              Why Support Inklined?
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#666666',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              Inklined is committed to providing unbiased, data-driven political analysis without corporate influence. 
              We believe in transparency, accountability, and the public&apos;s right to access comprehensive information 
              about government policies and their impacts.
            </p>
            <p style={{
              fontSize: '1rem',
              color: '#666666',
              lineHeight: '1.6'
            }}>
              Your support helps us maintain our independence and continue providing high-quality journalism 
              and analysis that holds power to account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
