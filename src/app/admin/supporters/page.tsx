'use client';

import { useState, useEffect } from 'react';
import Header from '../../../components/Header';

interface Supporter {
  id: string;
  email: string;
  name: string;
  amount: number;
  currency: string;
  created_at: string;
  email_sent: boolean;
  email_sent_at?: string;
}

export default function SupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    try {
      const response = await fetch('/api/admin/supporters');
      if (!response.ok) {
        throw new Error('Failed to fetch supporters');
      }
      const data = await response.json();
      setSupporters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = supporters.reduce((sum, supporter) => sum + supporter.amount, 0);
  const totalSupporters = supporters.length;
  const emailsSent = supporters.filter(s => s.email_sent).length;

  if (loading) {
    return (
      <div>
        <Header breadcrumb={{
          items: [
            { label: 'Admin' },
            { label: 'Supporters' }
          ]
        }} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading supporters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header breadcrumb={{
          items: [
            { label: 'Admin' },
            { label: 'Supporters' }
          ]
        }} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header breadcrumb={{
        items: [
          { label: 'Admin' },
          { label: 'Supporters' }
        ]
      }} />
      
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Supporter Management</h1>
        
        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#f0fdfa',
            border: '1px solid #0d9488',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0d9488' }}>Total Supporters</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalSupporters}</p>
          </div>
          
          <div style={{
            background: '#f0fdfa',
            border: '1px solid #0d9488',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0d9488' }}>Total Raised</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>${totalAmount.toFixed(2)}</p>
          </div>
          
          <div style={{
            background: '#f0fdfa',
            border: '1px solid #0d9488',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0d9488' }}>Emails Sent</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{emailsSent}</p>
          </div>
        </div>

        {/* Supporters Table */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead style={{
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email Sent</th>
              </tr>
            </thead>
            <tbody>
              {supporters.map((supporter) => (
                <tr key={supporter.id} style={{
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <td style={{ padding: '1rem' }}>{supporter.name}</td>
                  <td style={{ padding: '1rem' }}>{supporter.email}</td>
                  <td style={{ padding: '1rem' }}>${supporter.amount.toFixed(2)} {supporter.currency}</td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(supporter.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: supporter.email_sent ? '#dcfce7' : '#fef3c7',
                      color: supporter.email_sent ? '#166534' : '#92400e'
                    }}>
                      {supporter.email_sent ? '✓ Sent' : 'Pending'}
                    </span>
                    {supporter.email_sent_at && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {new Date(supporter.email_sent_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {supporters.length === 0 && (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>No supporters found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
