'use client';

import { useState } from 'react';
import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
import MobileMenuProvider from '../../components/MobileMenuProvider';
import Link from 'next/link';

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // For now, we'll just show success message
      // In a real implementation, you'd send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileMenuProvider>
      {({ isMobileMenuOpen, toggleMobileMenu }) => (
        <Navigation currentPath="/contact" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu}>
          <div style={{
            minHeight: '100vh',
            background: '#fafafa'
          }}>
            <Header 
              breadcrumb={{
                items: [
                  { label: 'Home', href: '/' },
                  { label: 'Contact Us' }
                ]
              }}
              onMobileMenuToggle={toggleMobileMenu}
              isMobileMenuOpen={isMobileMenuOpen}
            />

        {/* Main Content */}
        <main style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '3rem 2rem',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          marginTop: '2rem',
          marginBottom: '4rem'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '1rem',
              fontFamily: 'Georgia, serif'
            }}>
              Contact Us
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666666',
              lineHeight: '1.6'
            }}>
              Get in touch with our team for questions, feedback, or collaboration opportunities.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginBottom: '2rem'
          }}>
            {/* Contact Information */}
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Get in Touch
              </h2>
              
              <div style={{
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#0d9488',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '0.25rem'
                    }}>
                      Email
                    </div>
                    <a href="mailto:contact-us@theinklined.com" style={{
                      color: '#0d9488',
                      textDecoration: 'none',
                      fontSize: '0.95rem'
                    }}>
                      contact-us@theinklined.com
                    </a>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#0d9488',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '0.25rem'
                    }}>
                      Response Time
                    </div>
                    <div style={{
                      color: '#666666',
                      fontSize: '0.95rem'
                    }}>
                      We typically respond within 24-48 hours
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#0d9488',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0 0h6a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-6m0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '0.25rem'
                    }}>
                      Support
                    </div>
                    <div style={{
                      color: '#666666',
                      fontSize: '0.95rem'
                    }}>
                      Technical support and general inquiries
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '6px',
                border: '1px solid #e5e5e5'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '1rem'
                }}>
                  What We Can Help With
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0'
                }}>
                  <li style={{
                    padding: '0.5rem 0',
                    color: '#666666',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#0d9488',
                      marginRight: '0.5rem',
                      fontWeight: '600'
                    }}>•</span>
                    Data accuracy and corrections
                  </li>
                  <li style={{
                    padding: '0.5rem 0',
                    color: '#666666',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#0d9488',
                      marginRight: '0.5rem',
                      fontWeight: '600'
                    }}>•</span>
                    Feature requests and suggestions
                  </li>
                  <li style={{
                    padding: '0.5rem 0',
                    color: '#666666',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#0d9488',
                      marginRight: '0.5rem',
                      fontWeight: '600'
                    }}>•</span>
                    Media and collaboration inquiries
                  </li>
                  <li style={{
                    padding: '0.5rem 0',
                    color: '#666666',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#0d9488',
                      marginRight: '0.5rem',
                      fontWeight: '600'
                    }}>•</span>
                    Technical support
                  </li>
                  <li style={{
                    padding: '0.5rem 0',
                    color: '#666666',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#0d9488',
                      marginRight: '0.5rem',
                      fontWeight: '600'
                    }}>•</span>
                    General feedback
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Send us a Message
              </h2>

              {submitStatus === 'success' && (
                <div style={{
                  background: '#d1fae5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  color: '#991b1b',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  There was an error sending your message. Please try again or email us directly.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="name" style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: '#ffffff',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: '#ffffff',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="subject" style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem'
                  }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: '#ffffff',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label htmlFor="message" style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem'
                  }}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: '#ffffff',
                      resize: 'vertical',
                      minHeight: '120px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: isSubmitting ? '#9ca3af' : '#0d9488',
                    color: '#ffffff',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#1a1a1a',
          color: '#ffffff',
          padding: '3rem 0 2rem 0',
          marginTop: '4rem'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <Link href="/" style={{
                fontSize: '2rem',
                fontWeight: '800',
                textDecoration: 'none',
                color: '#ffffff',
                letterSpacing: '0.08em',
                fontFamily: 'Georgia, Times New Roman, serif',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.2rem'
              }}>
                In<span style={{ color: '#0d9488', fontWeight: '900' }}>k</span>lined<span style={{ color: '#0d9488', fontWeight: '900' }}>.</span>
              </Link>
              <div style={{
                display: 'flex',
                gap: '2rem'
              }}>
                <Link href="/transparency" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease'
                }}>
                  Transparency
                </Link>
                <Link href="/about" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease'
                }}>
                  About
                </Link>
                <Link href="/contact" style={{
                  color: '#0d9488',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease'
                }}>
                  Contact
                </Link>
              </div>
            </div>
            <div style={{
              borderTop: '1px solid #333333',
              paddingTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#888888'
            }}>
              <p>&copy; 2025 Inklined. All rights reserved. | Political analysis and data transparency.</p>
            </div>
          </div>
        </footer>

        {/* Responsive Styles */}
        <style jsx>{`
          @media (max-width: 768px) {
            main {
              margin: 1rem !important;
              padding: 2rem 1rem !important;
            }
            
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
            
            .footer-links {
              flex-direction: column !important;
              gap: 1rem !important;
            }
          }
        `}</style>
          </div>
        </Navigation>
      )}
    </MobileMenuProvider>
  );
}
