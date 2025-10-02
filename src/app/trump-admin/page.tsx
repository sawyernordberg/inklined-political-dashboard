'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
// Metadata is handled by the layout.tsx file for client components
// import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface ImmigrationData {
  ice: Record<string, unknown>;
  cbp: Record<string, unknown>;
}

interface EconomicData {
  integrated: Record<string, unknown>;
  tariff: Record<string, unknown>;
  stock: Record<string, unknown>;
}

interface FederalEmployeesData {
  observations: {
    observations: Array<{
      date: string;
      value: string;
    }>;
  };
}

interface Promise {
  promise: string;
  source: string;
  exact_quote: string;
  status: 'kept' | 'broken' | 'stalled' | 'in_progress';
  evidence: string;
}

interface PromisesData {
  metadata: {
    report_date: string;
    assessment_period: string;
    methodology: string;
    sources: string[];
  };
  summary: {
    total_promises: number;
    kept: number;
    broken: number;
    stalled: number;
    in_progress: number;
  };
  promises: {
    [category: string]: Promise[];
  };
}


export default function TrumpAdminPage() {
  const [immigrationData, setImmigrationData] = useState<ImmigrationData | null>(null);
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [promisesData, setPromisesData] = useState<PromisesData | null>(null);
  const [federalEmployeesData, setFederalEmployeesData] = useState<FederalEmployeesData | null>(null);
  const [stockData, setStockData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [immigrationResponse, economicResponse, promisesResponse, federalEmployeesResponse, stockResponse] = await Promise.all([
          fetch('/api/immigration-data'),
          fetch('/api/economic-data'),
          fetch('/data/promises.json'),
          fetch('/data/federal_employees_data.json'),
          fetch('/data/presidential_sp500_comparison.json')
        ]);

        if (!immigrationResponse.ok || !economicResponse.ok || !promisesResponse.ok || !federalEmployeesResponse.ok || !stockResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [immigration, economic, promises, federalEmployees, stock] = await Promise.all([
          immigrationResponse.json(),
          economicResponse.json(),
          promisesResponse.json(),
          federalEmployeesResponse.json(),
          stockResponse.json()
        ]);

        setImmigrationData(immigration);
        setEconomicData(economic);
        setPromisesData(promises);
        setFederalEmployeesData(federalEmployees);
        setStockData(stock);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Fade in sections and scroll progress
  useEffect(() => {
    if (!immigrationData || !economicData || !promisesData || !federalEmployeesData) return;

    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));

    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      const progressBar = document.getElementById('scrollProgress');
      if (progressBar) {
        progressBar.style.width = `${scrolled}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      sections.forEach(section => observer.unobserve(section));
      window.removeEventListener('scroll', handleScroll);
    };
  }, [immigrationData, economicData, promisesData, federalEmployeesData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p>Loading Trump Administration Dashboard...</p>
        <style dangerouslySetInnerHTML={{
          __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
        }} />
      </div>
    );
  }

  if (error || !immigrationData || !economicData || !promisesData || !federalEmployeesData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', textAlign: 'center', color: '#dc2626' }}>
        <h2>Error Loading Data</h2>
        <p>{error || 'No data available'}</p>
      </div>
    );
  }

  // Helper functions (commented out as unused)
  // const formatDataDate = (timestamp: string) => {
  //   if (!timestamp) return 'Unknown date';
  //   try {
  //     const date = new Date(timestamp);
  //     return date.toLocaleDateString('en-US', { 
  //       month: 'long', 
  //       day: 'numeric', 
  //       year: 'numeric' 
  //     });
  //   } catch {
  //     return 'Unknown date';
  //   }
  // };

  // const getMostRecentDataDate = () => {
  //   const iceDate = immigrationData?.ice?.metadata?.scraped_at;
  //   const cbpDate = immigrationData?.cbp?.metadata?.scraped_at;
    
  //   if (iceDate && cbpDate) {
  //     const iceTime = new Date(iceDate).getTime();
  //     const cbpTime = new Date(cbpDate).getTime();
  //     return iceTime > cbpTime ? iceDate : cbpDate;
  //   }
  //   return iceDate || cbpDate || null;
  // };


  // Helper function to get most recent CBP data with actual date
  const getMostRecentCBPData = () => {
    if (!immigrationData?.cbp?.categories?.nationwide_total?.monthly_data) return null;
    
    const monthlyData = immigrationData.cbp.categories.nationwide_total.monthly_data;
    const months = Object.keys(monthlyData);
    
    // Sort months chronologically instead of alphabetically
    const sortedMonths = months.sort((a, b) => {
      // Convert month-year format to comparable dates
      const parseMonth = (monthStr: string) => {
        const [month, year] = monthStr.split('-');
        const monthMap: { [key: string]: number } = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        return new Date(parseInt(year), monthMap[month] || 0);
      };
      
      return parseMonth(a).getTime() - parseMonth(b).getTime();
    });
    
    const mostRecentMonth = sortedMonths[sortedMonths.length - 1];
    const mostRecentValue = monthlyData[mostRecentMonth];
    
    return {
      value: mostRecentValue,
      month: mostRecentMonth
    };
  };


  return (
    <div>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Trump Administration Dashboard",
            "description": "Comprehensive overview of the Trump administration's policies and performance. Track campaign promises, immigration enforcement, economic policy impacts, and federal spending cuts.",
            "url": "https://inklined.com/trump-admin",
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
                  "name": "Trump Administration",
                  "item": "https://inklined.com/trump-admin"
                }
              ]
            },
            "mainEntity": {
              "@type": "DataCatalog",
              "name": "Trump Administration Data",
              "description": "Comprehensive data on Trump administration policies, performance metrics, and policy implementation tracking"
            }
          })
        }}
      />

      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'Trump Administration' }
        ]
      }} />

      <Navigation currentPath="/trump-admin" />

      {/* Scroll Progress Indicator */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: '#f0f0f0',
        zIndex: 1000
      }}>
        <div id="scrollProgress" style={{
          height: '100%',
          background: '#333',
          width: '0%',
          transition: 'width 0.1s ease'
        }}></div>
      </div>

      {/* Main Content */}
      <main role="main">
        <div className="container" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <header className="header" style={{
            textAlign: 'center',
            marginBottom: '80px',
            padding: '60px 0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#1a1a1a',
              marginBottom: '20px',
              fontWeight: '400',
              letterSpacing: '-0.5px',
              fontFamily: 'Georgia, Times New Roman, serif'
            }}>
              Trump Administration Dashboard
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '800px',
              margin: '0 auto',
              fontStyle: 'italic'
            }}>
              Comprehensive overview of the Trump administration&apos;s policies and performance
            </p>
          </header>


          {/* Campaign Promises Snapshot */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div className="section-header" style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                color: '#1a1a1a',
                marginBottom: '15px',
                fontWeight: '300',
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Campaign Promises Tracker
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Real-time tracking of campaign commitments and implementation status
              </div>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '40px',
              border: '1px solid #e5e7eb',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '30px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#059669'
                  }}>
                    {promisesData.summary.kept}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Kept
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {((promisesData.summary.kept / promisesData.summary.total_promises) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#dc2626'
                  }}>
                    {promisesData.summary.broken}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Broken
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {((promisesData.summary.broken / promisesData.summary.total_promises) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#d97706'
                  }}>
                    {promisesData.summary.stalled}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Stalled
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {((promisesData.summary.stalled / promisesData.summary.total_promises) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#2563eb'
                  }}>
                    {promisesData.summary.in_progress}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    In Progress
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {((promisesData.summary.in_progress / promisesData.summary.total_promises) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                fontSize: '1.1rem',
                color: '#374151',
                fontWeight: '500',
                marginBottom: '20px'
              }}>
                Total Promises Tracked: <strong>{promisesData.summary.total_promises}</strong>
              </div>
              
              <div style={{
                textAlign: 'center'
              }}>
                <Link href="/trump-admin/promises-tracker" style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease'
                }}>
                  View Full Tracker
                </Link>
              </div>
            </div>
          </section>

          {/* Immigration Enforcement Snapshot */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div className="section-header" style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                color: '#1a1a1a',
                marginBottom: '15px',
                fontWeight: '300',
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Immigration Enforcement
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                ICE detention statistics and border enforcement data
              </div>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '40px',
              border: '1px solid #e5e7eb',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '30px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#333'
                  }}>
                    {immigrationData?.ice?.currentTotalDetainees ? 
                      Math.round(immigrationData.ice.currentTotalDetainees).toLocaleString() : 
                      'Loading...'
                    }
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    in Detention
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Current ICE detainees
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#059669'
                  }}>
                    70.4%
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    No Criminal Convictions
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Of detained individuals
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#333'
                  }}>
                    {immigrationData?.ice?.sheets?.['ATD FY25 YTD']?.data ? 
                      (() => {
                        let total = 0;
                        immigrationData.ice.sheets['ATD FY25 YTD'].data.forEach((row: Record<string, unknown>) => {
                          if (row.Count && typeof row.Count === 'number') {
                            total += row.Count;
                          }
                        });
                        return Math.round(total).toLocaleString();
                      })() : 
                      'Loading...'
                    }
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    ATD Participants
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Alternatives to Detention
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#dc2626'
                  }}>
                    {getMostRecentCBPData() ? 
                      getMostRecentCBPData()!.value.toLocaleString() :
                      'Loading...'
                    }
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Border Apprehensions
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {getMostRecentCBPData() ? 
                      getMostRecentCBPData()!.month :
                      'Loading...'
                    }
                  </div>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center'
              }}>
                <Link href="/trump-admin/immigration" style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease'
                }}>
                  View Full Immigration Data
                </Link>
              </div>
            </div>
          </section>

          {/* Economic Policy Snapshot */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div className="section-header" style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                color: '#1a1a1a',
                marginBottom: '15px',
                fontWeight: '300',
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Economic Policy Impact
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Stock market performance, tariff impacts, and economic indicators
              </div>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '40px',
              border: '1px solid #e5e7eb',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '30px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#059669'
                  }}>
                    {stockData?.presidential_data?.["Donald Trump (2nd Term)"]?.performance?.total_return_pct ? 
                      `${stockData.presidential_data["Donald Trump (2nd Term)"].performance.total_return_pct.toFixed(1)}%` :
                      'Loading...'
                    }
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    S&P 500 Return
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Since inauguration
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#dc2626'
                  }}>
                    {economicData?.integrated?.data_sections?.economic?.["Unemployment Rate"]?.current_value ? 
                      `${economicData.integrated.data_sections.economic["Unemployment Rate"].current_value}%` :
                      'Loading...'
                    }
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Unemployment Rate
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {economicData?.integrated?.data_sections?.economic?.["Unemployment Rate"]?.current_month_year || 'Loading...'}
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#333'
                  }}>
                    {economicData?.integrated?.data_sections?.consumer?.["Overall CPI"]?.trump_inflation ? 
                      `${economicData.integrated.data_sections.consumer["Overall CPI"].trump_inflation.toFixed(1)}%` :
                      'Loading...'
                    }
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Overall CPI
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    {economicData?.integrated?.data_sections?.consumer?.["Overall CPI"]?.as_of_trump || 'Loading...'}
                  </div>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center'
              }}>
                <Link href="/trump-admin/economic-policy" style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease'
                }}>
                  View Full Economic Analysis
                </Link>
              </div>
            </div>
          </section>

          {/* Spending Cuts Snapshot */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div className="section-header" style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                color: '#1a1a1a',
                marginBottom: '15px',
                fontWeight: '300',
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Federal Spending Cuts
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Major budget reductions and program eliminations
              </div>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '40px',
              border: '1px solid #e5e7eb',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '30px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#dc2626'
                  }}>
                    $1.02T
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Medicaid Cuts
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Over 10 years
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#dc2626'
                  }}>
                    $349B
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Student Loan Cuts
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Over 10 years
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#dc2626'
                  }}>
                    $2.8B
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    EPA Budget Cut
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Annual reduction
                  </div>
                </div>
                
              </div>
              
              <div style={{
                textAlign: 'center'
              }}>
                <Link href="/trump-admin/spending-cuts" style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease'
                }}>
                  View Full Spending Analysis
                </Link>
              </div>
            </div>
          </section>
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
          padding: '0 2rem',
          textAlign: 'center'
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
                color: '#cccccc',
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
            fontSize: '0.9rem',
            color: '#888888'
          }}>
            <p>&copy; 2025 Inklined. All rights reserved. | Political analysis and data transparency.</p>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: system-ui, 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
          color: #333;
          background: #fff;
          line-height: 1.6;
          min-height: 100vh;
        }
        
        h1, h2, h3, .section-header h2 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #111;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        
        .section {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.25s ease-out;
        }
        
        .section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }
        
        .error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        
        a:hover {
          color: #0d9488;
        }
        
        /* Dropdown hover effects */
        .dropdown-parent:hover .dropdown-menu {
          display: block !important;
        }
        
        /* Dropdown link hover effects */
        .dropdown-parent:hover .dropdown-menu a:hover {
          background: #f8f9fa;
          color: #0d9488;
          padding-left: 2rem;
        }
        
        /* Dropdown arrow effects */
        .dropdown-parent:hover .dropdown-menu a::before {
          content: "→";
          opacity: 1;
          margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 1024px) and (min-width: 769px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 25px !important;
          }
        }
      `}</style>
    </div>
  );
}
