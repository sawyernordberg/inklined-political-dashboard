'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
// Metadata is handled by the layout.tsx file for client components

interface EconomicCooperation {
  trade_volume_estimate: string;
  key_trade_sectors: string[];
  investment_flows: string;
  trade_agreements: string[];
}

interface SecurityCooperation {
  defense_agreements: string[];
  joint_exercises: string[];
  intelligence_sharing: string;
  regional_security_role: string;
}

interface DiplomaticEngagement {
  recent_high_level_visits: string[];
  institutional_frameworks: string[];
  multilateral_cooperation: string[];
  embassy_relations: string;
}

interface ChallengesAndOpportunities {
  current_challenges: string[];
  cooperation_opportunities: string[];
}

interface BilateralRelation {
  country_name: string;
  relationship_strength: string;
  relationship_score: number;
  economic_ties: string;
  military_cooperation: string;
  diplomatic_status: string;
  key_issues: string[];
  detailed_relationship_summary: string;
  economic_cooperation: EconomicCooperation;
  security_cooperation: SecurityCooperation;
  diplomatic_engagement: DiplomaticEngagement;
  challenges_and_opportunities: ChallengesAndOpportunities;
  enhancement_status: string;
  enhanced_analysis_date: string;
  last_selective_update: string;
}

interface ForeignAffairsData {
  metadata: {
    last_updated: string;
    version: string;
    research_tools: string[];
    source_file: string;
    source_timestamp: string;
    original_version: string;
    diplomatic_feeds_used: boolean;
    trustworthy_sources_only: boolean;
    future_outlook_removed: boolean;
    last_overview_update: string;
    overview_update_note: string;
  };
  bilateral_relations: {
    [key: string]: BilateralRelation;
  };
}

export default function ForeignAffairsPage() {
  const [data, setData] = useState<ForeignAffairsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real data from the JSON file
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch the real JSON data
        const response = await fetch('/data/foreign_affairs_data_condensed.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const realData: ForeignAffairsData = await response.json();
        setData(realData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading foreign affairs data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    // Scroll progress indicator
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      const progressBar = document.querySelector('.scroll-progress') as HTMLElement;
      if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
      }
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading foreign affairs analysis data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: '#ef4444'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <Navigation currentPath="/foreign-affairs">
        <Header breadcrumb={{
          items: [
            { label: 'Home', href: '/' },
            { label: 'Foreign Affairs' }
          ]
        }} />

      <style jsx global>{`
        .section {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.25s ease-out;
        }
        
        .section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .scroll-indicator {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #f0f0f0;
          z-index: 1000;
        }

        .scroll-progress {
          height: 100%;
          background: #333;
          width: 0%;
          transition: width 0.1s ease;
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .bilateral-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px 10px;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .country-card {
            padding: 20px;
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

      {/* Scroll Progress Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-progress"></div>
      </div>


      <Navigation currentPath="/foreign-affairs" />
      <main role="main">
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          {/* Header Content */}
          <header style={{
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
              US Foreign Affairs Analysis
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '800px',
              margin: '0 auto',
              fontStyle: 'italic'
            }}>
              Comprehensive analysis of US bilateral relations, security cooperation, economic partnerships, and regional foreign policy dynamics
            </p>
            <div style={{
              marginTop: '30px',
              fontSize: '0.9rem',
              color: '#888'
            }}>
              Bilateral Relations Database
            </div>
          </header>

          {/* Regional Strategic Overview */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
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
                Regional Strategic Overview
              </h2>
              <div style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                US strategic priorities and engagement across major regions
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px',
              marginBottom: '40px'
            }}>
              <div className="section" style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    Indo-Pacific
                  </h3>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#fee2e2',
                    color: '#dc2626'
                  }}>
                    Critical
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Key Partners
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Japan, South Korea, India, Australia
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Strategic Focus
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      China Containment, Maritime Security
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Trade Volume
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      $1.2T+ Annually
                    </span>
                  </div>
                </div>
                <div style={{
                  marginTop: '15px'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Key Challenges
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      China&apos;s Rise
                    </span>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      North Korea
                    </span>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Maritime Disputes
                    </span>
                  </div>
                </div>
              </div>

              <div className="section" style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    Europe
                  </h3>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#fef3c7',
                    color: '#d97706'
                  }}>
                    High
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Key Partners
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      UK, Germany, France, NATO Allies
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Strategic Focus
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      NATO, Ukraine, Energy Security
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Trade Volume
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      $800B+ Annually
                    </span>
                  </div>
                </div>
                <div style={{
                  marginTop: '15px'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Key Challenges
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Russia
                    </span>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Energy Security
                    </span>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Defense Spending
                    </span>
                  </div>
                </div>
              </div>

              <div className="section" style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    Middle East
                  </h3>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#fee2e2',
                    color: '#dc2626'
                  }}>
                    Critical
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Key Partners
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Israel, Saudi Arabia, UAE
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Strategic Focus
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Energy Security, Counter-terrorism
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Trade Volume
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      $200B+ Annually
                    </span>
                  </div>
                </div>
                <div style={{
                  marginTop: '15px'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Key Challenges
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Iran
                    </span>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Terrorism
                    </span>
                    <span style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Regional Conflicts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Defense Partnerships */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
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
                Security & Defense Partnerships
              </h2>
              <div style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Military alliances, defense cooperation, and regional security initiatives
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px',
              marginBottom: '40px'
            }}>
              <div className="section" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  bottom: '0',
                  width: '4px',
                  background: '#2563eb'
                }}></div>
                <div style={{
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '8px',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    NATO Alliance
                  </h3>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    32 Member Countries
                  </div>
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#374151'
                }}>
                  Enhanced collective defense with increased burden-sharing and modernized deterrence capabilities across European and North American partners.
                </div>
              </div>

              <div className="section" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  bottom: '0',
                  width: '4px',
                  background: '#059669'
                }}></div>
                <div style={{
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '8px',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    AUKUS Partnership
                  </h3>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    US, Australia, UK
                  </div>
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#374151'
                }}>
                  Advanced defense technology sharing focused on submarines, artificial intelligence, and quantum computing for Indo-Pacific security.
                </div>
              </div>

              <div className="section" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  bottom: '0',
                  width: '4px',
                  background: '#7c3aed'
                }}></div>
                <div style={{
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '8px',
                    fontFamily: 'Georgia, Times New Roman, serif'
                  }}>
                    QUAD Initiative
                  </h3>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    US, India, Japan, Australia
                  </div>
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#374151'
                }}>
                  Indo-Pacific partnership focused on maritime security, technology cooperation, and regional stability initiatives.
                </div>
              </div>
            </div>
          </section>

          {/* Bilateral Relations Overview */}
          <section className="section" style={{
            marginBottom: '70px',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
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
                Key Bilateral Relations
              </h2>
              <div style={{
                fontSize: '1rem',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Detailed analysis of US relationships with major international partners
              </div>
            </div>

            <div className="bilateral-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {Object.entries(data.bilateral_relations).map(([code, country]) => (
                <div key={code} className="country-card section" style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '30px',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px',
                      fontFamily: 'Georgia, Times New Roman, serif'
                    }}>
                      {country.country_name}
                    </h3>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Economic Ties
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {country.economic_ties}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Military Cooperation
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {country.military_cooperation}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    marginBottom: '15px'
                  }}>
                    {country.diplomatic_status}
                  </div>

                  <div style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}>
                    {country.detailed_relationship_summary.length > 200 
                      ? country.detailed_relationship_summary.substring(0, 200) + '...'
                      : country.detailed_relationship_summary}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    {country.key_issues.map((issue, index) => (
                      <span key={index} style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        color: '#0d9488',
                        background: '#e6f7f6',
                        border: '1px solid #0d9488'
                      }}>
                        {issue}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '15px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '8px'
                      }}>
                        Trade Volume
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {country.economic_cooperation.trade_volume_estimate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Source */}
          <div style={{
            marginTop: '80px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <strong>Data Source:</strong> Enhanced Foreign Affairs Database with AI-powered analysis | 
            <strong>Last Updated:</strong> {new Date(data.metadata.last_overview_update).toLocaleDateString()} | 
            <strong>Analysis Tools:</strong> {data.metadata.research_tools.join(', ')}
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
      </Navigation>
    </>
  );
}
