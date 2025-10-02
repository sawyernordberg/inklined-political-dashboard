'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
// Metadata is handled by the layout.tsx file for client components

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Inklined",
            "description": "Learn about Inklined's mission to provide comprehensive, data-driven analysis of American politics and governance. Discover our commitment to transparency, accuracy, and informed analysis.",
            "url": "https://inklined.com/about",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Inklined",
              "url": "https://inklined.com"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://inklined.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "About",
                  "item": "https://inklined.com/about"
                }
              ]
            },
            "mainEntity": {
              "@type": "Organization",
              "name": "Inklined",
              "description": "A comprehensive political dashboard dedicated to transparency, accuracy, and informed analysis of American governance.",
              "url": "https://inklined.com",
              "foundingDate": "2025",
              "mission": "To provide comprehensive, data-driven analysis of American politics and governance with transparency and accuracy",
              "values": [
                "Non-Partisan Analysis",
                "Public Service", 
                "Continuous Improvement",
                "Accountability"
              ]
            }
          })
        }}
      />

      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'About' }
        ]
      }} />


      {/* Breadcrumb */}
      <div style={{
        background: '#f8f9fa',
        borderBottom: '1px solid #e5e5e5',
        padding: '0.8rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#666666'
          }}>
            <Link href="/" style={{
              color: '#0d9488',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Home
            </Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>&gt;</span>
            <span style={{ color: '#333333', fontWeight: '500' }}>About</span>
          </div>
        </div>
      </div>

      <Navigation currentPath="/about" />
      {/* Main Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* Hero Section */}
        <section style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1.5rem',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.2'
          }}>
            About Inklined
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: '#666666',
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Georgia, serif'
          }}>
            A comprehensive political dashboard dedicated to transparency, accuracy, and informed analysis of American governance.
          </p>
        </section>

        {/* Mission Statement */}
        <section style={{
          marginBottom: '4rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '2rem',
            fontFamily: 'Georgia, serif',
            textAlign: 'center'
          }}>
            Our Mission
          </h2>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#555555',
              lineHeight: '1.8',
              marginBottom: '2rem'
            }}>
              In an era of information overload and political complexity, Inklined serves as a trusted source for comprehensive, data-driven analysis of American politics and governance. We believe that informed citizens are the foundation of a healthy democracy.
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: '#555555',
              lineHeight: '1.8',
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              Our authors are in<span style={{ textDecoration: 'underline' }}>k</span>lined to write, to educate, and to inform our readers.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section style={{
          marginBottom: '4rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '3rem',
            fontFamily: 'Georgia, serif',
            textAlign: 'center'
          }}>
            What We Do
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Data-Driven Analysis
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7'
              }}>
                We aggregate and analyze data from official government sources, providing real-time insights into policy implementation, economic indicators, and political developments across all branches of government.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Comprehensive Tracking
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7'
              }}>
                From campaign promises to legislative outcomes, from immigration enforcement to economic policy impacts, we track the full spectrum of political activity with precision and clarity.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Transparent Methodology
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7'
              }}>
                Every data point, every analysis, and every conclusion is backed by verifiable sources and clearly documented methodology. We believe transparency builds trust.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Accessible Insights
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7'
              }}>
                Complex political data is presented through intuitive visualizations and clear explanations, making government activity accessible to all citizens regardless of their background.
              </p>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section style={{
          marginBottom: '4rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '3rem',
            fontFamily: 'Georgia, serif',
            textAlign: 'center'
          }}>
            Our Approach
          </h2>
          
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '3rem',
              marginBottom: '3rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#0d9488',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.5rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Collect
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#555555',
                  lineHeight: '1.6'
                }}>
                  Gather data from official government sources and verified institutions
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#0d9488',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.5rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Analyze
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#555555',
                  lineHeight: '1.6'
                }}>
                  Process and analyze data using rigorous methodology and human oversight
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#0d9488',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.5rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Present
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#555555',
                  lineHeight: '1.6'
                }}>
                  Present findings through clear visualizations and accessible explanations
                </p>
              </div>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif'
              }}>
                Commitment to Accuracy
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7'
              }}>
                Every piece of information on our platform undergoes multiple verification steps, including AI-assisted research with human oversight, fact-checking against official sources, and regular updates to ensure accuracy and relevance.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '3rem',
            fontFamily: 'Georgia, serif',
            textAlign: 'center'
          }}>
            Our Values
          </h2>
          
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '3rem'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Non-Partisan Analysis
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  We present facts and data without political bias, allowing readers to form their own informed opinions based on verifiable information.
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Public Service
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  Our mission is to serve the public interest by making government activity transparent and accessible to all citizens.
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Continuous Improvement
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  We constantly refine our methodology, expand our data sources, and improve our presentation to better serve our readers.
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  Accountability
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  We hold ourselves to the highest standards of accuracy and transparency, and we welcome feedback and corrections from our readers.
                </p>
              </div>
            </div>
          </div>
        </section>
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
              textTransform: 'uppercase'
            }}>
              In<span style={{ color: '#0d9488', fontWeight: '900' }}>k</span>lined<span style={{ color: '#0d9488', fontWeight: '900' }}>.</span>
            </Link>
            <div style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <Link href="/transparency" style={{
                color: '#cccccc',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
              }}>
                Transparency
              </Link>
              <Link href="/about" style={{
                color: '#0d9488',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
              }}>
                About
              </Link>
              <Link href="/contact" style={{
                color: '#cccccc',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
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
    </div>
  );
}
