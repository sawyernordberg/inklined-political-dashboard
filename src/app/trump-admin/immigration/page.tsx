'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Header from '../../../components/Header';
import ShareButton from '../../../components/ShareButton';
import { Line, Pie, Bar } from 'react-chartjs-2';
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

export default function ImmigrationPage() {
  const [data, setData] = useState<ImmigrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const response = await fetch('/api/immigration-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();
        setData(fetchedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load immigration data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Fade in sections and scroll progress
  useEffect(() => {
    if (!data) return;

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
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p>Loading Immigration Dashboard...</p>
        <style dangerouslySetInnerHTML={{
          __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
        }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', textAlign: 'center', color: '#dc2626' }}>
        <h2>Error Loading Data</h2>
        <p>{error || 'No data available'}</p>
      </div>
    );
  }

  // Helper functions for data processing
  const formatDataDate = (timestamp: string) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getMostRecentDataDate = () => {
    // Try to get the ICE data release date from the filename first
    const iceFilename = data?.ice?.metadata?.file_name;
    if (iceFilename) {
      // Extract date from filename like "FY25_detentionStats08292025.xlsx"
      const dateMatch = iceFilename.match(/(\d{2})(\d{2})(\d{4})/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        return new Date(year, month, day).toISOString();
      }
    }
    
    // Fallback to scraped date if filename parsing fails
    const iceDate = data?.ice?.metadata?.scraped_at;
    const cbpDate = data?.cbp?.metadata?.scraped_at;
    
    if (iceDate && cbpDate) {
      const iceTime = new Date(iceDate).getTime();
      const cbpTime = new Date(cbpDate).getTime();
      return iceTime > cbpTime ? iceDate : cbpDate;
    }
    return iceDate || cbpDate || null;
  };

  const getRegion = (city: string) => {
    const westCoast = ['San Francisco', 'Los Angeles', 'San Diego', 'Seattle', 'Phoenix', 'Salt Lake City'];
    const midwest = ['Chicago', 'Detroit', 'St Paul', 'Buffalo'];
    const southeast = ['Miami', 'Atlanta', 'New Orleans', 'Harlingen', 'El Paso', 'San Antonio', 'Houston'];
    const northeast = ['New York', 'Boston', 'Baltimore', 'Philadelphia', 'Newark', 'Washington DC'];
    
    if (westCoast.includes(city)) return 'West Coast';
    if (midwest.includes(city)) return 'Midwest';
    if (southeast.includes(city)) return 'Southeast';
    if (northeast.includes(city)) return 'Northeast';
    return 'Other';
  };

  const getFullStateName = (stateAbbr: string) => {
    const stateMap: { [key: string]: string } = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    return stateMap[stateAbbr] || stateAbbr;
  };

  const calculateATDTotal = (atdData: Record<string, unknown>) => {
    let total = 0;
    if (atdData?.data) {
      atdData.data.forEach((row: Record<string, unknown>) => {
        if (row.Count && typeof row.Count === 'number') {
          total += row.Count;
        }
      });
    }
    return total;
  };

  const calculateNoCriminalConvictionRate = (detentionData: Record<string, unknown>) => {
    const convictedCriminal = detentionData?.data?.find((row: Record<string, unknown>) => row.Processing_Disposition === 'Convicted Criminal');
    const pendingCharges = detentionData?.data?.find((row: Record<string, unknown>) => row.Processing_Disposition === 'Pending Criminal Charges');
    const otherImmigration = detentionData?.data?.find((row: Record<string, unknown>) => row.Processing_Disposition === 'Other Immigration Violator');

    if (!convictedCriminal || !pendingCharges || !otherImmigration) return '70.4';

    const convictedTotal = parseInt(convictedCriminal.Col_6) || 17558;
    const pendingTotal = parseInt(pendingCharges.Col_6) || 14875;
    const otherTotal = parseInt(otherImmigration.Col_6) || 26947;
    
    const noCriminalConvictions = otherTotal + pendingTotal;
    const totalAll = convictedTotal + pendingTotal + otherTotal;
    
    if (totalAll === 0) return '70.4';
    
    return ((noCriminalConvictions / totalAll) * 100).toFixed(1);
  };

  const renderKeyStatistics = () => {
    if (!data?.ice?.sheets) return <div className="loading">Loading statistics...</div>;

    const detentionData = data.ice.sheets['Detention FY25'];
    const atdData = data.ice.sheets['ATD FY25 YTD'];
    
    // Use fallback data if we can't find the exact row (due to limited data loading)
    const totalRow = detentionData?.data?.find((row: Record<string, unknown>) => 
      row.Processing_Disposition === 'Total'
    ) || detentionData?.data?.find((row: Record<string, unknown>) => 
      row.Total && parseInt(row.Total) > 50000
    );
    
    const totalDetained = totalRow ? parseInt(totalRow.Total) : 0;
    const atdTotal = calculateATDTotal(atdData);
    const noCriminalConvictionPct = calculateNoCriminalConvictionRate(detentionData);

    const stats = [
      {
        number: totalDetained.toLocaleString(),
        label: 'in Detention',
        description: `Total individuals currently in ICE detention facilities as of ${getMostRecentDataDate() ? formatDataDate(getMostRecentDataDate()) : 'recent date'}`,
        cardClass: 'neutral'
      },
      {
        number: `${noCriminalConvictionPct}%`,
        label: 'have no criminal convictions',
        description: `Over 70% of individuals held in ICE detention have no criminal conviction`,
        cardClass: 'positive'
      },
      {
        number: data?.ice?.sheets?.['Detention FY25']?.data ? 
          (() => {
            const totalRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
              row.Processing_Disposition === 'Total' && 
              row.Adult_Fear && 
              row.Adult_Fear > 1000 && 
              row.Adult_Fear < 100000
            );
            if (totalRow && totalRow.Col_19) {
              return totalRow.Col_19.toLocaleString();
            }
            return '0';
          })() : 
          '0',
        label: `booked into ICE detention during ${data?.ice?.sheets?.['Detention FY25']?.data ? 
          (() => {
            const totalRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
              row.Processing_Disposition === 'Total' && 
              row.Adult_Fear && 
              row.Adult_Fear > 1000 && 
              row.Adult_Fear < 100000
            );
            if (totalRow && totalRow.Col_19) {
              // Map the column to month name
              const monthMap = {
                'Adult_Fear': 'October 2024',
                'Total_Fear': 'November 2024', 
                'Col_12': 'December 2024',
                'Col_13': 'January 2025',
                'Detention_Facility_Type': 'February 2025',
                'Col_15': 'March 2025',
                'Total_Detained': 'April 2025',
                'Col_17': 'May 2025',
                'Col_18': 'June 2025',
                'Col_19': 'July 2025',
                'Col_20': 'August 2025'
              };
              return monthMap['Col_19'] || 'recent month';
            }
            return 'recent month';
          })() : 
          'recent month'}`,
        description: 'Monthly intake continues at elevated levels under current enforcement policies',
        cardClass: 'neutral'
      },
      {
        number: atdTotal.toLocaleString(),
        label: 'monitored through ICE\'s ATD programs',
        description: `Individuals in Alternatives to Detention programs as of ${getMostRecentDataDate() ? formatDataDate(getMostRecentDataDate()) : 'recent date'}`,
        cardClass: 'neutral'
      }
    ];

    return (
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '50px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.cardClass}`} style={{
            background: '#fafafa',
            padding: '20px',
            borderLeft: `4px solid ${stat.cardClass === 'positive' ? '#059669' : stat.cardClass === 'negative' ? '#dc2626' : '#6b7280'}`,
            textAlign: 'left'
          }}>
            <div className="stat-number" style={{
              fontSize: '1.6rem',
              fontWeight: '600',
              marginBottom: '8px',
              display: 'block',
              color: '#333'
            }}>
              {stat.number}
            </div>
            <div className="stat-label" style={{
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#333',
              marginBottom: '5px'
            }}>
              {stat.label}
            </div>
            <div className="stat-description" style={{
              fontSize: '0.8rem',
              color: '#666',
              marginBottom: '8px',
              lineHeight: '1.3'
            }}>
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Header breadcrumb={{
        items: [
          { label: 'Trump Administration', href: '/trump-admin' },
          { label: 'Immigration' }
        ]
      }} onMobileMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />


      <Navigation currentPath="/trump-admin/immigration" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu}>
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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <header className="header" style={{
            textAlign: 'center',
            marginBottom: '80px',
            padding: '60px 0',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 10
            }}>
              <ShareButton
                title="ICE Detention Statistics Dashboard"
                description="Comprehensive analysis of Immigration and Customs Enforcement detention data"
                url="https://theinklined.com/trump-admin/immigration"
                metric="ICE Detainees"
                value={(() => {
                  const totalDetainees = data?.ice?.currentTotalDetainees as number | undefined;
                  return totalDetainees ? Math.round(totalDetainees).toLocaleString() : 'Loading...';
                })()}
              />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#1a1a1a',
              marginBottom: '20px',
              fontWeight: '400',
              letterSpacing: '-0.5px',
              fontFamily: 'Georgia, Times New Roman, serif'
            }}>
              ICE Detention Statistics Dashboard
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '800px',
              margin: '0 auto',
              fontStyle: 'italic'
            }}>
              Comprehensive analysis of Immigration and Customs Enforcement detention data, population trends, and alternatives to detention programs
            </p>

          </header>

                      <div style={{
              background: '#f8f9fa',
              borderLeft: '4px solid #0d9488',
              padding: '20px',
              margin: '30px 0',
              borderRadius: '0 8px 8px 0'
            }}>
              <strong style={{ color: '#0d9488' }}>Data Source:</strong> U.S. Immigration and Customs Enforcement - FY25 Detention Statistics
              <br />
              <small>Based on official ICE data from: {data?.ice?.metadata?.source_url || 'ICE official website'} (last updated: {data?.ice?.metadata?.scraped_at ? formatDataDate(data.ice.metadata.scraped_at) : 'recent date'})</small>
            </div>

          {/* Key Statistics */}
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
                Key Detention Statistics
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Current detention populations and enforcement metrics
              </div>
            </div>
            {renderKeyStatistics()}
          </section>

          {/* State Detainment Distribution */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              zIndex: 10
            }}>
              <ShareButton
                title="ICE Detention Geographic Distribution"
                description="State-by-state breakdown of ICE detention populations"
                url="https://theinklined.com/trump-admin/immigration"
                screenshotElement=".geographic-distribution-chart"
                isVisualization={true}
              />
            </div>
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
                Geographic Distribution
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Top states with ICE detention facilities
              </div>
            </div>
            <div style={{
              background: '#fafafa',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '40px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      background: '#f5f5f5',
                      color: '#222',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      State
                    </th>
                    <th style={{
                      background: '#f5f5f5',
                      color: '#222',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      Detainees
                    </th>
                    <th style={{
                      background: '#f5f5f5',
                      color: '#222',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.ice?.stateDetainment ? 
                    (() => {
                      // Use the current total detainee population from ICE data, not facility totals
                      const totalDetainees = data.ice.currentTotalDetainees || data.ice.stateDetainment.reduce((sum: number, state: Record<string, unknown>) => sum + state.detainees, 0);
                      
                      // Show top 10 states but calculate percentages from current total
                      return data.ice.stateDetainment.slice(0, 10).map((state: Record<string, unknown>, index: number) => {
                        const percentage = totalDetainees > 0 ? ((state.detainees / totalDetainees) * 100).toFixed(1) : '0.0';
                        
                        return (
                          <tr key={index} style={{
                            borderBottom: '1px solid #e5e5e5'
                          }}>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '0.9rem',
                              fontWeight: '600'
                            }}>
                              <strong>{getFullStateName(state.state)}</strong>
                            </td>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '0.9rem'
                            }}>
                              {Math.round(state.detainees).toLocaleString()}
                            </td>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '0.9rem'
                            }}>
                              {percentage}%
                            </td>
                          </tr>
                        );
                      });
                    })() : 
                    <tr>
                      <td colSpan={3} style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        Loading state detainment data...
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              <div style={{
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: '#666',
                padding: '0 15px 15px 15px'
              }}>
                {data?.ice?.stateDetainment && data.ice.stateDetainment.length > 0 ? 
                  `ICE relied on detention facilities in ${getFullStateName(data.ice.stateDetainment[0].state)} to house the most people during FY 2025.` :
                  'State detainment data is being loaded...'
                }
              </div>
            </div>
            
            {/* Full-width population trend chart */}
            <div style={{
              background: '#fafafa',
              borderRadius: '8px',
              padding: '30px',
              marginBottom: '40px'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '400',
                color: '#1a1a1a',
                marginBottom: '20px',
                fontFamily: 'Georgia, Times New Roman, serif',
                textAlign: 'center'
              }}>
                FY2025 Average Daily Detainee Population
              </h3>
              <div style={{ height: '400px' }}>
                <Line
                  data={{
                    labels: ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025'],
                    datasets: [{
                      label: 'Average Daily Detainee Population',
                      data: [38710, 38988, 39131, 40197, 43107, 47666, 49497, 50316, 57390, 58333, 59663],
                      borderColor: '#333',
                      backgroundColor: 'rgba(51, 51, 51, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#333',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 35000,
                        ticks: {
                          callback: function(value) {
                            return value.toLocaleString();
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.parsed.y.toLocaleString()} detained`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Criminality Analysis */}
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
                Detention Population Analysis
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Breakdown by criminal conviction status and monthly trends
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '30px',
              marginBottom: '50px'
            }}>
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '40px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '400',
                  color: '#1a1a1a',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}>
                  Criminality Breakdown
                </h3>
                <div style={{ height: '400px' }}>
                  <Pie
                    data={{
                      labels: ['Immigration Violation', 'Convicted Criminal', 'Pending Charges'],
                      datasets: [{
                        data: data?.ice?.sheets?.['Detention FY25']?.data ? 
                          (() => {
                            const convictedRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
                              row.Processing_Disposition === 'Convicted Criminal' && row.Col_6 && row.Col_6 > 1000
                            );
                            const pendingRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
                              row.Processing_Disposition === 'Pending Criminal Charges' && row.Col_6 && row.Col_6 > 1000
                            );
                            const otherRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
                              row.Processing_Disposition === 'Other Immigration Violator' && row.Col_6 && row.Col_6 > 1000
                            );
                            
                            if (convictedRow && pendingRow && otherRow) {
                              return [
                                Math.round(otherRow.Col_6),
                                Math.round(convictedRow.Col_6),
                                Math.round(pendingRow.Col_6)
                              ];
                            }
                            return [];
                          })() : 
                          [],
                        backgroundColor: ['#0d9488', '#dc2626', '#d97706'],
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '40px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '400',
                  color: '#1a1a1a',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}>
                  Monthly Book-ins Trend
                </h3>
                <div style={{ height: '400px' }}>
                  <Line
                    data={{
                      labels: data?.ice?.sheets?.['Detention FY25']?.data ? 
                        (() => {
                          const totalRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
                            row.Processing_Disposition === 'Total' && 
                            row.Adult_Fear && 
                            row.Adult_Fear > 1000 && 
                            row.Adult_Fear < 100000
                          );
                          if (totalRow) {
                            const monthlyData = [
                              totalRow.Adult_Fear,
                              totalRow.Total_Fear,
                              totalRow.Col_12,
                              totalRow.Col_13,
                              totalRow.Detention_Facility_Type,
                              totalRow.Col_15,
                              totalRow.Total_Detained,
                              totalRow.Col_17,
                              totalRow.Col_18,
                              totalRow.Col_19,
                              totalRow.Col_20
                            ].filter(value => value != null && value > 0);
                            
                            // Generate labels based on available data
                            const monthNames = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025'];
                            
                            // Get current month to determine if we should exclude the last month
                            const now = new Date();
                            const currentMonth = now.getMonth(); // 0-11 (Jan=0, Dec=11)
                            const currentYear = now.getFullYear();
                            
                            // Map month names to month numbers for comparison
                            const monthToNumber: { [key: string]: number } = {
                              'Oct 2024': 9, 'Nov 2024': 10, 'Dec 2024': 11,
                              'Jan 2025': 0, 'Feb 2025': 1, 'Mar 2025': 2, 'Apr 2025': 3,
                              'May 2025': 4, 'Jun 2025': 5, 'Jul 2025': 6, 'Aug 2025': 7
                            };
                            
                            // If we're in the current month and it's the last month in our data, exclude it
                            const lastMonthInData = monthNames[monthlyData.length - 1];
                            if (lastMonthInData && monthToNumber[lastMonthInData] === currentMonth && currentYear === 2025) {
                              // We're in the current month, so exclude it from the chart
                              return monthNames.slice(0, monthlyData.length - 1);
                            }
                            
                            // Otherwise show all available months
                            return monthNames.slice(0, monthlyData.length);
                          }
                          return [];
                        })() : 
                        [],
                      datasets: [{
                        label: 'Monthly Book-ins',
                        data: data?.ice?.sheets?.['Detention FY25']?.data ? 
                          (() => {
                            const totalRow = data.ice.sheets['Detention FY25'].data.find((row: Record<string, unknown>) => 
                              row.Processing_Disposition === 'Total' && 
                              row.Adult_Fear && 
                              row.Adult_Fear > 1000 && 
                              row.Adult_Fear < 100000
                            );
                            if (totalRow) {
                              const monthlyData = [
                                totalRow.Adult_Fear,
                                totalRow.Total_Fear,
                                totalRow.Col_12,
                                totalRow.Col_13,
                                totalRow.Detention_Facility_Type,
                                totalRow.Col_15,
                                totalRow.Total_Detained,
                                totalRow.Col_17,
                                totalRow.Col_18,
                                totalRow.Col_19,
                                totalRow.Col_20
                              ].filter(value => value != null && value > 0);
                              
                              // Get current month to determine if we should exclude the last month
                              const now = new Date();
                              const currentMonth = now.getMonth(); // 0-11 (Jan=0, Dec=11)
                              const currentYear = now.getFullYear();
                              
                              // Map month names to month numbers for comparison
                              const monthToNumber: { [key: string]: number } = {
                                'Oct 2024': 9, 'Nov 2024': 10, 'Dec 2024': 11,
                                'Jan 2025': 0, 'Feb 2025': 1, 'Mar 2025': 2, 'Apr 2025': 3,
                                'May 2025': 4, 'Jun 2025': 5, 'Jul 2025': 6, 'Aug 2025': 7
                              };
                              
                              // If we're in the current month and it's the last month in our data, exclude it
                              const monthNames = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025'];
                              const lastMonthInData = monthNames[monthlyData.length - 1];
                              if (lastMonthInData && monthToNumber[lastMonthInData] === currentMonth && currentYear === 2025) {
                                // We're in the current month, so exclude it from the chart
                                return monthlyData.slice(0, monthlyData.length - 1);
                              }
                              
                              // Otherwise show all available months
                              return monthlyData;
                            }
                            return [];
                          })() : 
                          [],
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#0d9488',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.parsed.y.toLocaleString()} book-ins`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            

          </section>



          {/* CBP Border Apprehensions Section */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              zIndex: 10
            }}>
              <ShareButton
                title="U.S. Border Patrol Apprehensions Data"
                description="Monthly border apprehension statistics and trends"
                url="https://theinklined.com/trump-admin/immigration"
                screenshotElement=".border-apprehensions-chart"
                isVisualization={true}
              />
            </div>
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
                U.S. Border Patrol Apprehensions
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Nationwide encounters and border enforcement statistics
              </div>
            </div>
            <div style={{
              background: '#f8f9fa',
              borderLeft: '4px solid #0d9488',
              padding: '20px',
              margin: '30px 0',
              borderRadius: '0 8px 8px 0'
            }}>
              <strong style={{ color: '#0d9488' }}>Data Source:</strong> U.S. Customs and Border Protection - Nationwide Encounters
              <br />
              <small>Based on official CBP data from: <Link href={data?.cbp?.metadata?.url || "https://www.cbp.gov/newsroom/stats/nationwide-encounters"} target="_blank" style={{ color: '#0d9488' }}>CBP Nationwide Encounters</Link> (last updated: {data?.cbp?.metadata?.scraped_at ? formatDataDate(data.cbp.metadata.scraped_at) : 'recent date'})</small>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '30px',
              marginBottom: '50px'
            }}>
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '40px'
              }}>
                                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '400',
                    color: '#1a1a1a',
                    marginBottom: '20px',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    Border Apprehensions by Location (Most Recent Month)
                  </h3>
                <div style={{ height: '400px' }}>
                  <Pie
                    data={{
                      labels: ['Southwest Border', 'Northern Border'],
                      datasets: [{
                        data: data?.cbp?.categories?.southwest_total?.monthly_data && data?.cbp?.categories?.northern_total?.monthly_data ? 
                          (() => {
                            // Get the most recent month with data
                            const southwestData = data.cbp.categories.southwest_total.monthly_data;
                            const northernData = data.cbp.categories.northern_total.monthly_data;
                            
                            // Find the most recent month that has data for both
                            const months = Object.keys(southwestData).sort().reverse();
                            let recentMonth = null;
                            
                            for (const month of months) {
                              if (southwestData[month] && northernData[month]) {
                                recentMonth = month;
                                break;
                              }
                            }
                            
                            if (recentMonth) {
                              return [southwestData[recentMonth], northernData[recentMonth]];
                            }
                            return [];
                          })() : 
                          [],
                        backgroundColor: ['#dc2626', '#3b82f6'],
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '40px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '400',
                  color: '#1a1a1a',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}>
                  Monthly Apprehensions Trend
                </h3>
                <div style={{ height: '400px' }}>
                  <Line
                    data={{
                      labels: ['Oct 23', 'Nov 23', 'Dec 23', 'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25'],
                      datasets: [
                        {
                          label: 'Nationwide Total',
                          data: data?.cbp?.categories?.nationwide_total?.monthly_data ? 
                            Object.values(data.cbp.categories.nationwide_total.monthly_data) : 
                            [],
                          borderColor: '#333',
                          backgroundColor: 'rgba(51, 51, 51, 0.1)',
                          fill: false,
                          tension: 0.4,
                          pointBackgroundColor: '#333',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 4
                        },
                        {
                          label: 'Southwest Border',
                          data: data?.cbp?.categories?.southwest_total?.monthly_data ? 
                            Object.values(data.cbp.categories.southwest_total.monthly_data) : 
                            [],
                          borderColor: '#dc2626',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          fill: false,
                          tension: 0.4,
                          pointBackgroundColor: '#dc2626',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 4
                        },
                        {
                          label: 'Northern Border',
                          data: data?.cbp?.categories?.northern_total?.monthly_data ? 
                            Object.values(data.cbp.categories.northern_total.monthly_data) : 
                            [],
                          borderColor: '#0d9488',
                          backgroundColor: 'rgba(13, 148, 136, 0.1)',
                          fill: false,
                          tension: 0.4,
                          pointBackgroundColor: '#0d9488',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          }
                        },
                        x: {
                          ticks: {
                            maxRotation: 45
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} apprehensions`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ATD Programs */}
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
                Alternatives to Detention (ATD)
              </h2>
              <div className="section-description" style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Electronic monitoring and supervision programs
              </div>
            </div>
            <div style={{
              background: '#fafafa',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '40px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      background: '#f5f5f5',
                      color: '#222',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      Area Office
                    </th>
                    <th style={{
                      background: '#f5f5f5',
                      color: '#222',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      Monitored
                    </th>
                    <th style={{
                      background: '#f5f5f5',
                      color: '#222',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      Region
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.ice?.sheets?.['ATD FY25 YTD']?.data ? 
                    (() => {
                      const areaOffices = data.ice.sheets['ATD FY25 YTD'].data.filter((row: Record<string, unknown>) => 
                        row.Technology && 
                        row.Count && 
                        row.Count > 1000 && 
                        row.Count < 100000 &&
                        !row.Technology.includes('Total') &&
                        !row.Technology.includes('AOR') &&
                        !row.Technology.includes('FAMU') &&
                        !row.Technology.includes('Single Adult') &&
                        !row.Technology.includes('SmartLINK') &&
                        !row.Technology.includes('Ankle Monitor') &&
                        !row.Technology.includes('Wristworn') &&
                        !row.Technology.includes('VoiceID')
                      );
                      
                      if (areaOffices.length > 0) {
                        return areaOffices.slice(0, 5).map((row: Record<string, unknown>) => ({
                          aor: row.Technology,
                          monitored: Math.round(row.Count),
                          region: getRegion(row.Technology)
                        }));
                      }
                      return [];
                    })() : 
                    []
                  ).map((city: Record<string, unknown>, index: number) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid #e5e5e5'
                    }}>
                      <td style={{
                        padding: '12px 15px',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {city.aor}
                      </td>
                      <td style={{
                        padding: '12px 15px',
                        fontSize: '0.9rem'
                      }}>
                        {city.monitored.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '12px 15px',
                        fontSize: '0.9rem'
                      }}>
                        {city.region}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: '#666',
                padding: '0 15px 15px 15px'
              }}>
                <strong>San Francisco&apos;s</strong> area office has the highest number in ICE&apos;s Alternatives to Detention (ATD) monitoring programs.
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '30px',
              marginBottom: '50px'
            }}>
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '40px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '400',
                  color: '#1a1a1a',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}>
                  ATD Technology Usage
                </h3>
                <div style={{ height: '400px' }}>
                  <Bar
                    data={{
                      labels: data?.ice?.sheets?.['ATD FY25 YTD']?.data ? 
                        (() => {
                          const techData = data.ice.sheets['ATD FY25 YTD'].data.filter((row: Record<string, unknown>) => 
                            row.Technology && 
                            row.Count && 
                            row.Count > 1000 && 
                            row.Count < 200000 &&
                            !row.Technology.includes('Total') &&
                            !row.Technology.includes('AOR') &&
                            !row.Technology.includes('FAMU') &&
                            !row.Technology.includes('Single Adult')
                          );
                          
                          if (techData.length > 0) {
                            return techData.slice(0, 5).map((row: Record<string, unknown>) => row.Technology);
                          }
                          return [];
                        })() : 
                        [],
                      datasets: [{
                        label: 'Participants',
                        data: data?.ice?.sheets?.['ATD FY25 YTD']?.data ? 
                          (() => {
                            const techData = data.ice.sheets['ATD FY25 YTD'].data.filter((row: Record<string, unknown>) => 
                              row.Technology && 
                              row.Count && 
                              row.Count > 1000 && 
                              row.Count < 200000 &&
                              !row.Technology.includes('Total') &&
                              !row.Technology.includes('AOR') &&
                              !row.Technology.includes('FAMU') &&
                              !row.Technology.includes('Single Adult')
                            );
                            
                            if (techData.length > 0) {
                              return techData.slice(0, 5).map((row: Record<string, unknown>) => Math.round(row.Count));
                            }
                            return [];
                          })() : 
                          [],
                        backgroundColor: '#0d9488',
                        borderColor: '#0d9488',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      scales: {
                        x: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '40px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '400',
                  color: '#1a1a1a',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}>
                  Court Appearance Rates
                </h3>
                <div style={{ height: '400px' }}>
                  <Pie
                    data={{
                      labels: data?.ice?.sheets?.['ATD FY25 YTD']?.data ? 
                        (() => {
                          const attendedRow = data.ice.sheets['ATD FY25 YTD'].data.find((row: Record<string, unknown>) => 
                            row.Metric === 'Attended' && row.Count_2 && row.Count_2 > 1000
                          );
                          const failedRow = data.ice.sheets['ATD FY25 YTD'].data.find((row: Record<string, unknown>) => 
                            row.Metric === 'Failed to Attend' && row.Count_2
                          );
                          
                          if (attendedRow && failedRow) {
                            const attended = attendedRow.Count_2;
                            const failed = failedRow.Count_2;
                            const total = attended + failed;
                            const attendedPct = ((attended / total) * 100).toFixed(1);
                            const failedPct = ((failed / total) * 100).toFixed(1);
                            
                            return [
                              `Attended (${attendedPct}%)`,
                              `Failed to Attend (${failedPct}%)`
                            ];
                          }
                          return [];
                        })() : 
                        [],
                      datasets: [{
                        data: data?.ice?.sheets?.['ATD FY25 YTD']?.data ? 
                          (() => {
                            const attendedRow = data.ice.sheets['ATD FY25 YTD'].data.find((row: Record<string, unknown>) => 
                              row.Metric === 'Attended' && row.Count_2 && row.Count_2 > 1000
                            );
                            const failedRow = data.ice.sheets['ATD FY25 YTD'].data.find((row: Record<string, unknown>) => 
                              row.Metric === 'Failed to Attend' && row.Count_2
                            );
                            
                            if (attendedRow && failedRow) {
                              return [attendedRow.Count_2, failedRow.Count_2];
                            }
                            return [];
                          })() : 
                          [],
                        backgroundColor: ['#059669', '#dc2626'],
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
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
        li[style*="position: relative"]:hover > div[style*="display: none"] {
          display: block !important;
        }
        
        /* Dropdown link hover effects */
        li[style*="position: relative"]:hover > div[style*="display: none"] a:hover {
          background: #f8f9fa;
          color: #0d9488;
          padding-left: 2rem;
        }
        
        /* Dropdown arrow effects */
        li[style*="position: relative"]:hover > div[style*="display: none"] a::before {
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
      `}</style>
      </Navigation>
    </div>
  );
}
