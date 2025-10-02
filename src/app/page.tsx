'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Header from '../components/Header';
// Metadata is handled by the layout.tsx file for client components

// Type definitions for data structures
interface DataState {
  [key: string]: unknown;
}

export default function Home() {
  const [sp500Data, setSp500Data] = useState<DataState | null>(null);
  const [economicData, setEconomicData] = useState<DataState | null>(null);
  const [federalEmployeesData, setFederalEmployeesData] = useState<DataState | null>(null);
  const [promisesData, setPromisesData] = useState<DataState | null>(null);
  const [immigrationData, setImmigrationData] = useState<DataState | null>(null);
  const [congressData, setCongressData] = useState<DataState | null>(null);
  const [, setTariffData] = useState<DataState | null>(null);
  const [, setForeignAffairsData] = useState<DataState | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    // Prevent body scroll when sidebar is open
    if (newState) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  };


  useEffect(() => {
    async function loadData() {
      try {
        // Load all data in parallel using API routes like other pages
        const [immigrationResponse, economicResponse, promisesResponse, federalEmployeesResponse, stockResponse, congressResponse, tariffResponse, foreignAffairsResponse] = await Promise.all([
          fetch('/api/immigration-data'),
          fetch('/api/economic-data'),
          fetch('/data/promises.json'),
          fetch('/data/federal_employees_data.json'),
          fetch('/data/presidential_sp500_comparison.json'),
          fetch('/data/congressional_analysis.json'),
          fetch('/data/tariff_data_clean.json'),
          fetch('/data/foreign_affairs_data_condensed.json')
        ]);

        if (!immigrationResponse.ok || !economicResponse.ok || !promisesResponse.ok || !federalEmployeesResponse.ok || !stockResponse.ok || !congressResponse.ok || !tariffResponse.ok || !foreignAffairsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [immigration, economic, promises, federalEmployees, stock, congress, tariff, foreignAffairs] = await Promise.all([
          immigrationResponse.json(),
          economicResponse.json(),
          promisesResponse.json(),
          federalEmployeesResponse.json(),
          stockResponse.json(),
          congressResponse.json(),
          tariffResponse.json(),
          foreignAffairsResponse.json()
        ]);

        
        setImmigrationData(immigration);
        setEconomicData(economic);
        setPromisesData(promises);
        setFederalEmployeesData(federalEmployees);
        setSp500Data(stock);
        setCongressData(congress);
        setTariffData(tariff);
        setForeignAffairsData(foreignAffairs);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }

    loadData();
  }, []);


  return (
    <div>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Inklined",
            "description": "Comprehensive analysis and real-time tracking of political developments, policy changes, and government data.",
            "url": "https://inklined.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://inklined.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Inklined",
              "url": "https://inklined.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://inklined.com/favicon.svg"
              }
            }
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DataCatalog",
            "name": "Political Dashboard Data",
            "description": "Real-time political data including economic indicators, immigration enforcement, campaign promises, and government performance metrics.",
            "url": "https://inklined.com",
            "provider": {
              "@type": "Organization",
              "name": "Inklined",
              "url": "https://inklined.com"
            },
            "dataset": [
              {
                "@type": "Dataset",
                "name": "Economic Indicators",
                "description": "S&P 500 performance, unemployment rates, inflation data, and consumer confidence metrics"
              },
              {
                "@type": "Dataset", 
                "name": "Immigration Enforcement",
                "description": "ICE detention statistics, border apprehensions, and immigration policy data"
              },
              {
                "@type": "Dataset",
                "name": "Campaign Promises Tracker",
                "description": "Tracking of political campaign promises and their implementation status"
              }
            ]
          })
        }}
      />

      <Header showSubtitle={true} onMobileMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />

      <Navigation currentPath="/" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu} />

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Hero Section */}
        <section style={{
          marginBottom: '4rem',
          paddingBottom: '3rem',
          borderBottom: '2px solid #e5e5e5'
        }}>
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '3rem',
            alignItems: 'start'
          }}>
            <div>
          <h1 style={{
                fontSize: '3.5rem',
                fontWeight: '300',
            color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}>
                The State of the Union
          </h1>
          <p style={{
                fontSize: '1.3rem',
                color: '#444444',
                lineHeight: '1.6',
                marginBottom: '2rem',
                fontFamily: 'Georgia, serif'
              }}>
                Real-time analysis of America&apos;s political landscape, policy implementation, and government performance through comprehensive data and expert insights.
              </p>
            </div>
            
            {/* Key Stat Highlight */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              color: 'white',
              padding: '2.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                {(() => {
                  const presidentialData = sp500Data?.presidential_data as Record<string, unknown> | undefined;
                  const trumpData = presidentialData?.["Donald Trump (2nd Term)"] as Record<string, unknown> | undefined;
                  const performance = trumpData?.performance as Record<string, unknown> | undefined;
                  const returnPct = performance?.total_return_pct as number | undefined;
                  return returnPct ? `${returnPct > 0 ? '+' : ''}${returnPct.toFixed(1)}%` : 'Loading...';
                })()}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                S&P 500 Performance
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: '0.8'
              }}>
                Since Trump Inauguration
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Content Grid */}
        <section className="editorial-grid" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {/* Main Editorial Content */}
          <div>
            {/* Policy Analysis Section */}
            <article style={{
              marginBottom: '3rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <span style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Policy Analysis
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#666666'
                }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            <h2 style={{
                fontSize: '2rem',
              fontWeight: '600',
              color: '#1a1a1a',
                marginBottom: '1rem',
              fontFamily: 'Georgia, serif',
                lineHeight: '1.3'
            }}>
                Trade Policy Reshapes Global Economic Landscape
            </h2>
            <p style={{
                fontSize: '1.1rem',
                color: '#444444',
                lineHeight: '1.7',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                The Trump administration&apos;s comprehensive tariff strategy has disrupted international trade dynamics, with the 10% baseline tariff and reciprocal measures costing average US households an extra $1,300 in 2025. Recent data shows significant shifts in supply chains and trade patterns as businesses adapt to the new economic reality.
              </p>
          <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '1.5rem'
              }}>
                <div>
            <div style={{
                    fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0d9488',
                    fontFamily: 'Georgia, serif'
                  }}>
                    50%
                  </div>
              <div style={{
                fontSize: '0.9rem',
                    color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                    Highest Country-Specific Tariff
              </div>
              </div>
                <div>
            <div style={{
                    fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0d9488',
                    fontFamily: 'Georgia, serif'
                  }}>
                    10%
                  </div>
              <div style={{
                fontSize: '0.9rem',
                    color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                    Baseline Tariff Rate
              </div>
                </div>
              </div>
              <Link href="/trump-admin/economic-policy" style={{
                color: '#0d9488',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Read Full Analysis →
              </Link>
            </article>

            {/* Immigration Enforcement Section */}
            <article style={{
              marginBottom: '3rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <span style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px',
                fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Immigration
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#666666'
                }}>
                  Real-time data
                </span>
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.3'
              }}>
                Border Enforcement Reaches Historic Levels
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#444444',
                lineHeight: '1.7',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Immigration enforcement operations have intensified significantly, with border apprehensions and ICE detention numbers reflecting the administration&apos;s commitment to stricter border security measures. The data reveals both the scale of enforcement efforts and the ongoing challenges at the southern border.
              </p>
            <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.5rem',
                fontWeight: '700',
                    color: '#dc2626',
                    fontFamily: 'Georgia, serif'
              }}>
                {(() => {
                  const cbpData = immigrationData?.cbp as Record<string, unknown> | undefined;
                  const categories = cbpData?.categories as Record<string, unknown> | undefined;
                  const nationwideTotal = categories?.nationwide_total as Record<string, unknown> | undefined;
                  const monthlyData = nationwideTotal?.monthly_data as Record<string, unknown> | undefined;
                  const may25Data = monthlyData?.["May-25"] as number | undefined;
                  return may25Data ? Math.round(may25Data / 1000) + 'K' : 'Loading...';
                })()}
                  </div>
              <div style={{
                fontSize: '0.9rem',
                    color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                    Monthly Apprehensions
              </div>
                </div>
                <div>
              <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#dc2626',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {(() => {
                      const iceData = immigrationData?.ice as Record<string, unknown> | undefined;
                      const totalDetainees = iceData?.currentTotalDetainees as number | undefined;
                      return totalDetainees ? Math.round(totalDetainees).toLocaleString() : 'Loading...';
                    })()}
              </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    ICE Detainees
            </div>
                </div>
              </div>
              <Link href="/trump-admin/immigration" style={{
                color: '#dc2626',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                View Immigration Data →
              </Link>
            </article>
          </div>

          {/* Sidebar */}
          <div>
            {/* Key Metrics Sidebar */}
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Key Metrics
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Unemployment</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0d9488' }}>
                    {(() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const unemployment = economic?.["Unemployment Rate"] as Record<string, unknown> | undefined; 
                      const value = unemployment?.current_value as number | undefined;
                      return value ? `${value}%` : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: '#e5e5e5',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const unemployment = economic?.["Unemployment Rate"] as Record<string, unknown> | undefined; 
                      const value = unemployment?.current_value as number | undefined;
                      return value ? `${Math.min((value / 10) * 100, 100)}%` : '0%';
                    })(),
                    background: (() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const unemployment = economic?.["Unemployment Rate"] as Record<string, unknown> | undefined; 
                      const value = unemployment?.current_value as number | undefined;
                      return value && value > 5 ? '#dc2626' : '#0d9488';
                    })(),
                    borderRadius: '2px'
                  }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
                  vs. 10% benchmark
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Inflation CPI</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0d9488' }}>
                    {(() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const inflation = economic?.["Inflation (CPI)"] as Record<string, unknown> | undefined; 
                      const value = inflation?.change_pct as number | undefined;
                      return value ? `${value.toFixed(1)}%` : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: '#e5e5e5',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const inflation = economic?.["Inflation (CPI)"] as Record<string, unknown> | undefined; 
                      const value = inflation?.change_pct as number | undefined;
                      return value ? `${Math.min((value / 5) * 100, 100)}%` : '0%';
                    })(),
                    background: (() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const inflation = economic?.["Inflation (CPI)"] as Record<string, unknown> | undefined; 
                      const value = inflation?.change_pct as number | undefined;
                      return value && value > 3 ? '#dc2626' : '#0d9488';
                    })(),
                    borderRadius: '2px'
                  }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
                  vs. 5% benchmark
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Consumer Confidence</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0d9488' }}>
                    {(() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const confidence = economic?.["Consumer Confidence"] as Record<string, unknown> | undefined; 
                      const value = confidence?.current_value as number | undefined;
                      return value ? value.toFixed(1) : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: '#e5e5e5',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const confidence = economic?.["Consumer Confidence"] as Record<string, unknown> | undefined; 
                      const value = confidence?.current_value as number | undefined;
                      return value ? `${Math.min((value / 100) * 100, 100)}%` : '0%';
                    })(),
                    background: (() => { 
                      const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                      const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                      const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                      const confidence = economic?.["Consumer Confidence"] as Record<string, unknown> | undefined; 
                      const value = confidence?.current_value as number | undefined;
                      return value && value > 100 ? '#0d9488' : '#dc2626';
                    })(),
                    borderRadius: '2px'
                  }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
                  vs. 100 benchmark
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Bills Passed</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0d9488' }}>
                    {(() => {
                      const legislativeActivity = congressData?.legislative_activity as Record<string, unknown> | undefined;
                      const billsPassed = legislativeActivity?.bills_passed as number | undefined;
                      return billsPassed ? billsPassed.toLocaleString() : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: '#e5e5e5',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const legislativeActivity = congressData?.legislative_activity as Record<string, unknown> | undefined;
                      const billsPassed = legislativeActivity?.bills_passed as number | undefined;
                      const billsIntroduced = legislativeActivity?.bills_introduced as number | undefined;
                      return billsPassed && billsIntroduced ? 
                        `${Math.min((billsPassed / billsIntroduced) * 100, 100)}%` : 
                        '0%';
                    })(),
                    background: '#0d9488',
                    borderRadius: '2px'
                  }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
                  vs. {(() => {
                    const legislativeActivity = congressData?.legislative_activity as Record<string, unknown> | undefined;
                    const billsIntroduced = legislativeActivity?.bills_introduced as number | undefined;
                    return billsIntroduced ? billsIntroduced.toLocaleString() : 'Loading...';
                  })()} introduced
                </div>
              </div>
            </div>

            {/* Campaign Promises Tracker */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e5e5',
              padding: '2rem',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Campaign Promises
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Kept</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#16a34a' }}>
                    {(() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const kept = summary?.kept as number | undefined;
                      return kept ? `${kept}` : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const kept = summary?.kept as number | undefined;
                      const totalPromises = summary?.total_promises as number | undefined;
                      return kept && totalPromises ? `${(kept / totalPromises) * 100}%` : '0%';
                    })(),
                    background: '#16a34a',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>In Progress</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0d9488' }}>
                    {(() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const inProgress = summary?.in_progress as number | undefined;
                      return inProgress ? `${inProgress}` : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const inProgress = summary?.in_progress as number | undefined;
                      const totalPromises = summary?.total_promises as number | undefined;
                      return inProgress && totalPromises ? `${(inProgress / totalPromises) * 100}%` : '0%';
                    })(),
                    background: '#0d9488',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Stalled</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b' }}>
                    {(() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const stalled = summary?.stalled as number | undefined;
                      return stalled ? `${stalled}` : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const stalled = summary?.stalled as number | undefined;
                      const totalPromises = summary?.total_promises as number | undefined;
                      return stalled && totalPromises ? `${(stalled / totalPromises) * 100}%` : '0%';
                    })(),
                    background: '#f59e0b',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Broken</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#dc2626' }}>
                    {(() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const broken = summary?.broken as number | undefined;
                      return broken ? `${broken}` : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const summary = promisesData?.summary as Record<string, unknown> | undefined;
                      const broken = summary?.broken as number | undefined;
                      const totalPromises = summary?.total_promises as number | undefined;
                      return broken && totalPromises ? `${(broken / totalPromises) * 100}%` : '0%';
                    })(),
                    background: '#dc2626',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e5e5',
                textAlign: 'center'
              }}>
                <Link href="/trump-admin/promises-tracker" style={{
                  color: '#0d9488',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  View Full Tracker →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Analysis Section */}
        <section style={{
          background: '#f8f9fa',
          padding: '3rem 2rem',
          borderRadius: '8px',
          marginBottom: '4rem'
        }}>
          <div className="analysis-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif'
              }}>
                Congressional Activity
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#444444',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                The 119th Congress has been marked by partisan legislative activity, with strong party-line votes on key bills addressing economic policy, immigration reform, and trade relations.
              </p>
              <div style={{
                display: 'flex',
                gap: '2rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#0d9488',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {(() => {
                      const legislativeActivity = congressData?.legislative_activity as Record<string, unknown> | undefined;
                      const billsPassed = legislativeActivity?.bills_passed as number | undefined;
                      return billsPassed ? billsPassed.toLocaleString() : 'Loading...';
                    })()}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Bills Passed
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#0d9488',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {(() => {
                      const legislativeActivity = congressData?.legislative_activity as Record<string, unknown> | undefined;
                      const billsIntroduced = legislativeActivity?.bills_introduced as number | undefined;
                      return billsIntroduced ? billsIntroduced.toLocaleString() : 'Loading...';
                    })()}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Bills Introduced
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif'
              }}>
                Federal Workforce
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#444444',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                The federal workforce has experienced a significant overhaul under the current administration, with data showing both the current employment levels and the impact of recent policy decisions on government operations.
              </p>
              <div style={{
                display: 'flex',
                gap: '2rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#0d9488',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {(() => {
                      const observations = federalEmployeesData?.observations as Record<string, unknown> | undefined;
                      const observationsArray = observations?.observations as Array<Record<string, unknown>> | undefined;
                      if (observationsArray && observationsArray.length > 0) {
                        const lastObservation = observationsArray[observationsArray.length - 1];
                        const value = lastObservation?.value as string | undefined;
                        if (value) {
                          const currentValue = parseFloat(value);
                          return (currentValue / 1000).toFixed(2) + 'M';
                        }
                      }
                      return 'Loading...';
                    })()}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    As of August 1st, 2025
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#dc2626',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {(() => {
                      const observations = federalEmployeesData?.observations as Record<string, unknown> | undefined;
                      const observationsArray = observations?.observations as Array<Record<string, unknown>> | undefined;
                      if (observationsArray) {
                        const december2024 = observationsArray.find((obs: Record<string, unknown>) => obs.date === '2024-12-01');
                        const august2025 = observationsArray.find((obs: Record<string, unknown>) => obs.date === '2025-08-01');
                        if (december2024 && august2025) {
                          const dec2024Value = december2024.value as string;
                          const aug2025Value = august2025.value as string;
                          const loss = parseFloat(dec2024Value) - parseFloat(aug2025Value);
                          return `-${loss}K`;
                        }
                      }
                      return 'Loading...';
                    })()}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Since December 2024
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Data Insights Section */}
        <section style={{
          marginBottom: '4rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif'
            }}>
              Data Insights
            </h2>
            <div style={{
              fontSize: '0.9rem',
              color: '#666666'
            }}>
              Real-time analysis
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Congressional Composition */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Congressional Composition
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>House Republicans</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#dc2626' }}>
                    {(() => {
    const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
    const house = composition?.house as Record<string, unknown> | undefined;
    return house?.republican as number | undefined;
  })() || 'Loading...'}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
    const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
    const house = composition?.house as Record<string, unknown> | undefined;
    const republican = house?.republican as number | undefined;
    const democratic = house?.democratic as number | undefined;
    return republican && democratic;
  })() ? 
                      (() => {
                        const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
                        const house = composition?.house as Record<string, unknown> | undefined;
                        const republican = house?.republican as number | undefined;
                        const total = house?.total as number | undefined;
                        return republican && total ? `${(republican / total) * 100}%` : '0%';
                      })() : 
                      '0%',
                    background: '#dc2626',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>House Democrats</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2563eb' }}>
                    {(() => {
    const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
    const house = composition?.house as Record<string, unknown> | undefined;
    return house?.democratic as number | undefined;
  })() || 'Loading...'}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
    const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
    const house = composition?.house as Record<string, unknown> | undefined;
    const republican = house?.republican as number | undefined;
    const democratic = house?.democratic as number | undefined;
    return republican && democratic;
  })() ? 
                      (() => {
                        const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
                        const house = composition?.house as Record<string, unknown> | undefined;
                        const democratic = house?.democratic as number | undefined;
                        const total = house?.total as number | undefined;
                        return democratic && total ? `${(democratic / total) * 100}%` : '0%';
                      })() : 
                      '0%',
                    background: '#2563eb',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Senate Republicans</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#dc2626' }}>
                    {(() => {
    const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
    const senate = composition?.senate as Record<string, unknown> | undefined;
    return senate?.republican as number | undefined;
  })() || 'Loading...'}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
    const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
    const senate = composition?.senate as Record<string, unknown> | undefined;
    const republican = senate?.republican as number | undefined;
    const democratic = senate?.democratic as number | undefined;
    return republican && democratic;
  })() ? 
                      (() => {
                        const composition = congressData?.congressional_composition as Record<string, unknown> | undefined;
                        const senate = composition?.senate as Record<string, unknown> | undefined;
                        const republican = senate?.republican as number | undefined;
                        const total = senate?.total as number | undefined;
                        return republican && total ? `${(republican / total) * 100}%` : '0%';
                      })() : 
                      '0%',
                    background: '#dc2626',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Retail Sales */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Retail Sales Growth
              </h3>
              
              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  fontFamily: 'Georgia, serif',
                  marginBottom: '0.5rem'
                }}>
                  {(() => { 
                    const integrated = economicData?.integrated as Record<string, unknown> | undefined; 
                    const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; 
                    const economic = dataSections?.economic as Record<string, unknown> | undefined; 
                    const retail = economic?.["Retail Sales"] as Record<string, unknown> | undefined; 
                    const value = retail?.change_pct as number | undefined;
                    return value ? `+${value.toFixed(1)}%` : 'Loading...';
                  })()}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Year-over-Year
                </div>
              </div>

              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                {(() => { const integrated = economicData?.integrated as Record<string, unknown> | undefined; const dataSections = integrated?.data_sections as Record<string, unknown> | undefined; const economic = dataSections?.economic as Record<string, unknown> | undefined; const retail = economic?.["Retail Sales"] as Record<string, unknown> | undefined; return retail?.current_month_year as string | undefined; })() || 'Current month'}
              </div>
            </div>

            {/* Immigration Enforcement Summary */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif'
              }}>
                Border Security Metrics
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Monthly Apprehensions</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#dc2626' }}>
                    {(() => {
                      const cbpData = immigrationData?.cbp as Record<string, unknown> | undefined;
                      const categories = cbpData?.categories as Record<string, unknown> | undefined;
                      const nationwideTotal = categories?.nationwide_total as Record<string, unknown> | undefined;
                      const monthlyData = nationwideTotal?.monthly_data as Record<string, unknown> | undefined;
                      const may25Data = monthlyData?.["May-25"] as number | undefined;
                      return may25Data ? Math.round(may25Data / 1000) + 'K' : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const cbpData = immigrationData?.cbp as Record<string, unknown> | undefined;
                      const categories = cbpData?.categories as Record<string, unknown> | undefined;
                      const nationwideTotal = categories?.nationwide_total as Record<string, unknown> | undefined;
                      const monthlyData = nationwideTotal?.monthly_data as Record<string, unknown> | undefined;
                      const may25Data = monthlyData?.["May-25"] as number | undefined;
                      return may25Data ? `${Math.min((may25Data / 300000) * 100, 100)}%` : '0%';
                    })(),
                    background: '#dc2626',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>ICE Detainees</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#dc2626' }}>
                    {(() => {
                      const iceData = immigrationData?.ice as Record<string, unknown> | undefined;
                      const totalDetainees = iceData?.currentTotalDetainees as number | undefined;
                      return totalDetainees ? Math.round(totalDetainees).toLocaleString() : 'Loading...';
                    })()}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e5e5e5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (() => {
                      const iceData = immigrationData?.ice as Record<string, unknown> | undefined;
                      const totalDetainees = iceData?.currentTotalDetainees as number | undefined;
                      return totalDetainees ? `${Math.min((totalDetainees / 50000) * 100, 100)}%` : '0%';
                    })(),
                    background: '#dc2626',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Updated */}
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
          <div className="footer-content">
            <Link href="/" className="footer-logo">
              In<span style={{ color: '#0d9488', fontWeight: '900' }}>k</span>lined<span style={{ color: '#0d9488', fontWeight: '900' }}>.</span>
            </Link>
            <div className="footer-nav">
              <Link href="/transparency" className="footer-link">
                Transparency
              </Link>
              <Link href="/about" className="footer-link">
                About
              </Link>
              <Link href="/contact" className="footer-link">
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

      {/* Global Styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #ffffff;
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        h1, h2, h3, h4 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1a1a;
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        
        p {
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.7;
        }
        
        a {
          color: inherit;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        a:hover {
          opacity: 0.8;
        }
        
        nav a:hover {
          border-bottom-color: #0d9488 !important;
          color: #0d9488 !important;
        }
        
        /* Professional hover effects */
        article:hover {
          transform: translateY(-1px);
          transition: all 0.3s ease;
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
        
        /* Footer styles */
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .footer-logo {
          font-size: 2rem;
          font-weight: 800;
          text-decoration: none;
          color: #ffffff;
          letter-spacing: 0.08em;
          font-family: Georgia, Times New Roman, serif;
          text-transform: uppercase;
        }

        .footer-nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .footer-link {
          color: #cccccc;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
        }

        .footer-link:hover {
          color: #0d9488;
        }

        /* Responsive design improvements */
        @media (max-width: 1024px) {
          main {
            padding: 1.5rem 1rem !important;
          }
          
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .editorial-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .analysis-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }
          
          h2 {
            font-size: 1.5rem !important;
          }
          
          nav ul {
            flex-direction: column !important;
            gap: 0 !important;
          }
          
          nav li {
            border-bottom: 1px solid #e5e5e5;
          }
          
          .hero-section {
            padding: 2rem 0 !important;
          }
          
          .editorial-content {
            padding: 1.5rem 0 !important;
          }

          .footer-content {
            flex-direction: column !important;
            gap: 1.5rem !important;
            text-align: center !important;
          }

          .footer-nav {
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 1.5rem !important;
          }
        }
        
        /* Print styles */
        @media print {
          nav, footer {
            display: none !important;
          }
          
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}