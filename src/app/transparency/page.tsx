'use client';

import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
import { useState, useEffect } from 'react';

import Link from 'next/link';
export default function TransparencyPage() {
  const [tariffData, setTariffData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTariffSources, setShowTariffSources] = useState(false);

  useEffect(() => {
    async function loadTariffData() {
      try {
        const response = await fetch('/api/economic-data');
        if (response.ok) {
          const data = await response.json();
          setTariffData(data.tariff);
        }
      } catch (error) {
        console.error('Error loading tariff data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTariffData();
  }, []);

  return (
    <div>
      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'Transparency' }
        ]
      }} />


      <Navigation currentPath="/transparency" />
      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Page Header */}
        <section style={{
          textAlign: 'center',
          marginBottom: '4rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1rem',
            fontFamily: 'Georgia, serif'
          }}>
            Data Transparency
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#555555',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.7'
          }}>
            Our commitment to transparency in data sources, methodology, and analysis
          </p>
        </section>

        {/* Data Sources Section */}
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
            Data Sources & Methodology
          </h2>
          
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            lineHeight: '1.8'
          }}>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#555555' }}>
                Inklined is committed to providing accurate, transparent political data and analysis. Our information is sourced from official government agencies, established news organizations, and verified research institutions. All data undergoes rigorous verification processes to ensure accuracy and reliability.
              </p>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Immigration & Border Enforcement
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Immigration detention data is sourced directly from <Link href="https://www.ice.gov/detain/detention-management" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>ICE Detention Management</Link> official reports, updated weekly and cross-referenced with ICE press releases. Border apprehension statistics come from the <Link href="https://www.cbp.gov/newsroom/stats/southwest-land-border-encounters" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>CBP Nationwide Encounters database</Link>, updated monthly and verified against official CBP statements.
              </p>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem',
                marginTop: '2.5rem'
              }}>
                Economic & Financial Data
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Stock market performance data is sourced from <Link href="https://finance.yahoo.com/quote/%5EGSPC" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Yahoo Finance</Link> and cross-verified with <Link href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Federal Reserve Economic Data</Link>. Employment statistics are obtained from the <Link href="https://www.bls.gov/ces" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Bureau of Labor Statistics</Link> Current Employment Statistics survey, updated monthly and verified against BLS press releases.
              </p>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem',
                marginTop: '2.5rem'
              }}>
                Congressional Activity & Legislation
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Legislative tracking utilizes the <Link href="https://legiscan.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>LegiScan API</Link> for comprehensive bill monitoring across the 119th Congress (2025-2027), updated daily and cross-referenced with <Link href="https://www.congress.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Congress.gov</Link>. Voting records are sourced from the official Congressional Record via Congress.gov API, providing real-time updates verified against official government records.
              </p>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem',
                marginTop: '2.5rem'
              }}>
                Campaign Promises & Policy Tracking
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Campaign promise tracking is based on official campaign rally transcripts, interview transcripts from major news networks (CNN, NBC, Fox News), official campaign policy documents, and <Link href="https://www.whitehouse.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>White House</Link> press releases. Verification is conducted through <Link href="https://www.politifact.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>PolitiFact</Link>, <Link href="https://www.ap.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Associated Press</Link> fact-checking, and official government reports from the <Link href="https://www.justice.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Department of Justice</Link> and <Link href="https://www.supremecourt.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Supreme Court</Link>.
              </p>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem',
                marginTop: '2.5rem'
              }}>
                Trade Policy & Tariff Information
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Tariff data is sourced from <Link href="https://worldscorecard.com/world-facts-and-figures/us-tariffs-and-the-world/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>World Scorecard</Link> for country-specific tariff rates and exemptions, supplemented by official statements from <Link href="https://www.whitehouse.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>The White House</Link> and <Link href="https://ustr.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>U.S. Trade Representative</Link> reports. Research analysis is provided by <Link href="https://www.csis.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>CSIS</Link>, <Link href="https://www.pwc.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>PwC</Link>, and the <Link href="https://taxfoundation.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Tax Foundation</Link>.
              </p>

              {loading ? (
                <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>Loading tariff update sources...</p>
              ) : tariffData?.sources && tariffData.sources.length > 0 ? (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                    Tariff policy updates are sourced from {tariffData.sources.length} verified news organizations and research institutions. 
                    <span style={{ 
                      cursor: 'pointer',
                      color: '#0d9488',
                      textDecoration: 'underline',
                      marginLeft: '0.5rem'
                    }} onClick={() => setShowTariffSources(!showTariffSources)}>
                      {showTariffSources ? 'Hide sources' : 'View complete source list'}
                    </span>
                  </p>
                  {showTariffSources && (
                    <div style={{ 
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #e5e5e5',
                      fontSize: '0.95rem'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '0.5rem'
                      }}>
                        {tariffData.sources.map((source: string, index: number) => (
                          <p key={index} style={{ marginBottom: '0.3rem' }}>• {source}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>No tariff update sources available</p>
              )}

              {!loading && tariffData && (
                <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#666666' }}>
                  Current dataset includes {tariffData.country_tariffs?.length || 0} countries with tariff data, {tariffData.updates?.length || 0} policy updates, and {tariffData.exemptions?.length || 0} tariff exemptions. Last updated: {tariffData.last_updated || 'Unknown'}.
                </p>
              )}

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem',
                marginTop: '2.5rem'
              }}>
                Polling & Public Opinion
              </h3>
              
              <p style={{ marginBottom: '2rem' }}>
                Public opinion data is collected through legal web scraping with proper attribution, including sample sizes and margins of error for all polling data displayed on the platform.
              </p>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem',
                marginTop: '2.5rem'
              }}>
                Data Verification & Quality Assurance
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Every data point on our platform undergoes rigorous verification: primary source verification against official government databases, cross-referencing with multiple independent sources, timestamp verification for data currency, methodology review for statistical accuracy, regular audits of data collection processes, and a public correction process for any identified errors.
              </p>
          </div>
        </section>

        {/* Methodology Section */}
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
            Methodology & Analysis Framework
          </h2>
          
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#333333' }}>
              Our data collection and analysis methodology combines automated processing with rigorous human oversight to ensure accuracy and reliability across all political data categories.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #0d9488',
              paddingBottom: '0.5rem'
            }}>
              Immigration Data Processing
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Immigration data collection utilizes automated scraping of ICE.gov detention reports and direct API calls to the CBP Nationwide Encounters database. Excel file parsing processes detention statistics while CSV data processing handles border encounters. Quality control includes cross-verification with ICE press releases, data validation against previous reporting periods, and anomaly detection for unusual data points. Update frequency: Weekly for ICE data, Monthly for CBP data.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #0d9488',
              paddingBottom: '0.5rem',
              marginTop: '2.5rem'
            }}>
              Economic Data Analysis
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Financial data integration includes Yahoo Finance for S&P 500 tracking with real-time price updates during market hours and historical data backfill for trend analysis. Cross-verification is performed with Federal Reserve Economic Data (FRED). Employment metrics utilize BLS Current Employment Statistics (CES) survey data with seasonally adjusted figures and federal employment data from CES establishment surveys. Update frequency: Real-time for financial data, Monthly for employment data.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #0d9488',
              paddingBottom: '0.5rem',
              marginTop: '2.5rem'
            }}>
              Campaign Promises & Policy Tracking
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Our AI-assisted research process includes automated monitoring of official campaign channels, AI analysis of rally transcripts and interviews, pattern recognition for promise identification, and status tracking through policy implementation monitoring. Human verification involves editorial review of AI-identified promises, fact-checking against PolitiFact and AP sources, and cross-referencing with DOJ reports and court decisions. Update frequency: Bi-weekly with comprehensive human fact-checking.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #0d9488',
              paddingBottom: '0.5rem',
              marginTop: '2.5rem'
            }}>
              Congressional Data Processing
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Legislative tracking utilizes LegiScan integration for bill status monitoring and Congress.gov integration for voting records and amendments. Automated classification identifies partisan vs. bipartisan bills while committee assignment and hearing tracking provides comprehensive legislative coverage. Analysis framework includes vote pattern analysis for the 119th Congress, legislative outcome tracking and success rates, and cross-referencing with Congressional Budget Office estimates. Update frequency: Daily from Congressional databases.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #0d9488',
              paddingBottom: '0.5rem',
              marginTop: '2.5rem'
            }}>
              Trade Policy Research
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              AI-enhanced research processes include Google Search integration for comprehensive source discovery, automated monitoring of USTR, White House, and international trade sources, AI analysis of trade policy documents and tariff announcements, and pattern recognition for policy changes and implementation timelines. Multi-source verification involves cross-referencing with Tax Foundation, CSIS, and PwC analysis, verification against Department of Finance Canada and international sources, human editorial oversight and fact-checking, and trade law firm analysis with shipping industry impact assessments. Update frequency: Monthly with AI-assisted research and comprehensive human verification.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #0d9488',
              paddingBottom: '0.5rem',
              marginTop: '2.5rem'
            }}>
              Quality Assurance & Error Prevention
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Automated validation includes data type validation and range checking, timestamp verification for data freshness, cross-source consistency validation, and anomaly detection algorithms. Human oversight involves editorial review of all AI-generated content, source credibility assessment, context verification and fact-checking, and regular methodology audits. This dual approach ensures both systematic accuracy and contextual understanding across all data categories.
            </p>
          </div>
        </section>

        {/* Attribution Guidelines */}
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
            Attribution & Usage
          </h2>
          
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              marginBottom: '3rem'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Our Approach to Data Attribution
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                We prioritize transparency while respecting intellectual property rights and avoiding potential legal issues. Our attribution strategy focuses on:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Official Government Sources
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Direct attribution to federal agencies and departments
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Public Domain Data
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Clear identification of publicly available datasets
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Research Institutions
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Attribution to established polling and research organizations
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Human-AI Collaboration
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Content updates are AI-assisted with human editing and verification
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #0d9488',
                paddingBottom: '0.5rem'
              }}>
                Content Creation Process
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#555555',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                Our content creation process combines automated data processing with human oversight:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    AI-Assisted Data Processing
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    AI-assisted collection and initial analysis of government data, particularly for promises tracking and tariff updates
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Human Review
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Editorial oversight and fact-checking of all content
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Quality Assurance
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Multi-stage verification process for accuracy
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    AI-Assisted Updates
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#555555',
                    lineHeight: '1.6'
                  }}>
                    Scheduled AI-assisted content updates for promises and tariff data with human editing and verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Quality & Limitations */}
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
            Data Quality & Limitations
          </h2>
          
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
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
                  Data Accuracy
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  All data is sourced from official government agencies and verified through multiple channels. We maintain strict quality control standards and regularly audit our data collection processes.
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
                  Update Frequency
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  Data update schedules vary by source. Government data is typically updated weekly or monthly, while financial data is updated daily. All timestamps are clearly displayed on our dashboards.
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
                  Limitations
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#555555',
                  lineHeight: '1.7'
                }}>
                  Data availability depends on government reporting schedules. Some metrics may have reporting delays or methodological changes that affect historical comparisons.
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
                color: '#0d9488',
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #ffffff;
        }
        
        h1, h2, h3, h4 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #111;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        
        a:hover {
          opacity: 0.8;
        }
        
        nav a:hover {
          border-bottom-color: #0d9488 !important;
          color: #0d9488 !important;
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
        
        @media (max-width: 1024px) {
          .data-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .data-grid {
            grid-template-columns: 1fr !important;
          }
          
          nav ul {
            flex-direction: column !important;
            gap: 0 !important;
          }
          
          nav li {
            border-bottom: 1px solid #e5e5e5;
          }
        }
      `}</style>
    </div>
  );
}
