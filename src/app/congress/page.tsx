'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
// Metadata is handled by the layout.tsx file for client components

interface BillDetail {
  bill_id: number;
  bill_number: string;
  title: string;
  partisanship: string;
  parties: string;
  sponsor_count: number;
  classification: string;
}

interface LegislativeActivity {
  bills_introduced: number;
  bills_passed: number;
  bipartisan_bills: number;
  partisan_bills: number;
  unknown_partisanship_bills: number;
  days_in_session: number;
  committee_hearings: string;
  spending_authorized: string;
  calendar_days_active: number;
  last_updated: string;
  data_source: string;
  passed_bill_details: BillDetail[];
}

interface CongressionalComposition {
  house: {
    republican: number;
    democratic: number;
    independent: number;
    total: number;
  };
  senate: {
    republican: number;
    democratic: number;
    independent: number;
    total: number;
  };
  last_updated: string;
}

interface HistoricalProductivityComparison {
  "119": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
    bipartisan_bills?: number;
    partisan_bills?: number;
    unknown_partisanship_bills?: number;
  };
  "118": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "117": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "116": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "115": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "114": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "113": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "112": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  "111": {
    congress_number: number;
    years: string;
    target_calendar_days: number;
    start_date: string;
    bills_passed_in_timeframe: number;
    is_current: boolean;
    data_source: string;
  };
  summary: {
    total_congresses_analyzed: number;
    current_congress_rank: number;
    best_performer: number[];
    worst_performer: number[];
    comparison_timeframe_days: number;
    note: string;
  };
}

interface CongressData {
  metadata: {
    generated_at: string;
    congress_session: number;
    data_sources: string[];
    api_status: string;
    api_key_source: string;
    analysis_type: string;
    partisanship_analysis: string;
  };
  congressional_composition: CongressionalComposition;
  legislative_activity: LegislativeActivity;
  historical_productivity_comparison: HistoricalProductivityComparison;
}

export default function CongressPage() {
  const [data, setData] = useState<CongressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real data from the JSON file
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch the real JSON data
        const response = await fetch('/data/congressional_analysis.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const realData: CongressData = await response.json();
        setData(realData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading congressional data:', err);
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
        Loading congressional analysis data...
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

  // Calculate majorities (independents count as minority)
  const house = data.congressional_composition.house;
  const senate = data.congressional_composition.senate;
  const houseMajority = house.republican > (house.democratic + house.independent) ? 'Republican' : 'Democratic';
  const houseMargin = Math.abs(house.republican - (house.democratic + house.independent));
  const senateMajority = senate.republican > (senate.democratic + senate.independent) ? 'Republican' : 'Democratic';
  const senateMargin = Math.abs(senate.republican - (senate.democratic + senate.independent));

  // Calculate passage rate
  const passageRate = data.legislative_activity.bills_introduced > 0 ? 
    ((data.legislative_activity.bills_passed / data.legislative_activity.bills_introduced) * 100).toFixed(1) : '0.0';

  // Calculate partisan breakdown of passed bills
  const totalPassed = data.legislative_activity.bills_passed || 0;
  const bipartisanPassed = data.legislative_activity.bipartisan_bills || 0;
  const partisanPassed = data.legislative_activity.partisan_bills || 0;
  // const _unknownPassed = data.legislative_activity.unknown_partisanship_bills || 0;
  
  // Calculate percentages for the split bar (of passed bills)
  const bipartisanPercent = totalPassed > 0 ? ((bipartisanPassed / totalPassed) * 100) : 0;
  const partisanPercent = totalPassed > 0 ? ((partisanPassed / totalPassed) * 100) : 0;

  return (
    <>
      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'Congressional Breakdown' }
        ]
      }} />

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Fade-in Animation Styles */
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

        /* Typography */
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

        /* Layout & Spacing */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 80px;
          padding: 60px 0;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: #1a1a1a;
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        .page-header p {
          font-size: 1.1rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
          font-style: italic;
        }

        .page-header .metadata {
          margin-top: 30px;
          font-size: 0.9rem;
          color: #888;
        }

        .section {
          margin-bottom: 70px;
          padding-bottom: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: none;
          padding-bottom: 0;
        }

        .section-header h2 {
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 15px;
          font-weight: 300;
          letter-spacing: -0.3px;
        }

        .section-header .section-description {
          font-size: 1rem;
          color: #888;
          font-style: italic;
        }

        /* Congressional Composition Styles */
        .composition-overview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .chamber-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }

        .chamber-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .chamber-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .chamber-total {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        .party-breakdown {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .party-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid transparent;
        }

        .party-item.republican {
          border-left-color: #dc2626;
        }

        .party-item.democratic {
          border-left-color: #3b82f6;
        }

        .party-item.independent {
          border-left-color: #6b7280;
        }

        .party-name {
          font-weight: 600;
          color: #1e293b;
        }

        .party-count {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
        }

        .majority-indicator {
          text-align: center;
          margin-top: 20px;
          padding: 12px;
          background: #e6f7f6;
          border-radius: 8px;
          border: 1px solid #0d9488;
        }

        .majority-text {
          font-weight: 600;
          color: #0d9488;
          font-size: 0.95rem;
        }

        /* Legislative Activity Styles */
        .activity-dashboard {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 40px;
        }

        .activity-metric {
          background: white;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          text-align: center;
        }

        .metric-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0d9488;
          margin-bottom: 10px;
        }

        .metric-label {
          font-size: 1rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .metric-detail {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        /* Progress Tracking Styles */
        .progress-tracking {
          background: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          border: 1px solid #e2e8f0;
        }

        .progress-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .progress-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 20px;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .progress-label {
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          min-width: 120px;
        }

        .progress-bar-container {
          flex: 1;
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          border-radius: 10px;
          transition: width 0.8s ease;
          min-width: 16px;
        }

        .progress-bar.bills-passed {
          background: #0d9488;
        }

        .progress-percentage {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
          min-width: 60px;
          text-align: right;
        }

        .split-bar {
          display: flex;
          background: #e5e7eb;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
        }

        .split-bar .progress-bar {
          min-width: 16px;
          border-radius: 0;
          height: 100%;
        }

        .split-bar .progress-bar:first-child {
          border-radius: 10px 0 0 10px;
        }

        .split-bar .progress-bar:last-child {
          border-radius: 0 10px 10px 0;
        }

        .split-bar .progress-bar.bipartisan-split {
          background: #059669;
        }

        .split-bar .progress-bar.partisan-split {
          background: #dc2626;
        }

        /* Historical Ranking Styles */
        .ranking-container {
          background: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e2e8f0;
        }

        .ranking-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .ranking-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .ranking-subtitle {
          font-size: 1rem;
          color: #64748b;
        }

        .ranking-list {
          background: white;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .ranking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 10px;
          background: white;
        }

        .ranking-item.current {
          background: #e6f7f6;
          border: 2px solid #0d9488;
          font-weight: 600;
        }

        .ranking-position {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .ranking-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }

        .ranking-number.gold {
          background: #fbbf24;
        }

        .ranking-number.silver {
          background: #9ca3af;
        }

        .ranking-number.bronze {
          background: #d97706;
        }

        .ranking-number.other {
          background: #e5e7eb;
          color: #6b7280;
        }

        .ranking-congress {
          font-size: 1rem;
          color: #1e293b;
        }

        .ranking-current {
          font-size: 0.8rem;
          color: #0d9488;
          font-weight: 600;
        }

        .ranking-bills {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .composition-overview {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          
          .activity-dashboard {
            grid-template-columns: 1fr 1fr;
            gap: 25px;
          }
        }

        @media (max-width: 768px) {
          .activity-dashboard {
            grid-template-columns: 1fr;
          }
          
          .container {
            padding: 20px 10px;
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


      <Navigation currentPath="/congress" />
      <main role="main">
        <div className="container">
          {/* Header Content */}
          <header className="page-header">
            <h1>119th Congress Analysis</h1>
            <p>Comprehensive analysis of congressional composition, legislative productivity, and historical performance during the 2025-2026 session</p>
            <div className="metadata">
              <span>Comprehensive legislative tracking</span>
            </div>
          </header>

          {/* Congressional Composition */}
          <section className="section" aria-labelledby="composition-heading">
            <div className="section-header">
              <h2 id="composition-heading">Congressional Composition</h2>
              <div className="section-description">Current party breakdown and control dynamics</div>
            </div>
            <div className="composition-overview">
              <div className="chamber-section">
                <div className="chamber-header">
                  <div className="chamber-title">House of Representatives</div>
                  <div className="chamber-total">Total Members: {house.total}</div>
                </div>
                <div className="party-breakdown">
                  <div className="party-item republican">
                    <span className="party-name">Republican</span>
                    <span className="party-count">{house.republican}</span>
                  </div>
                  <div className="party-item democratic">
                    <span className="party-name">Democratic</span>
                    <span className="party-count">{house.democratic}</span>
                  </div>
                  <div className="party-item independent">
                    <span className="party-name">Independent</span>
                    <span className="party-count">{house.independent}</span>
                  </div>
                </div>
                <div className="majority-indicator">
                  <div className="majority-text">{houseMajority} Majority (+{houseMargin})</div>
                </div>
              </div>

              <div className="chamber-section">
                <div className="chamber-header">
                  <div className="chamber-title">U.S. Senate</div>
                  <div className="chamber-total">Total Members: {senate.total}</div>
                </div>
                <div className="party-breakdown">
                  <div className="party-item republican">
                    <span className="party-name">Republican</span>
                    <span className="party-count">{senate.republican}</span>
                  </div>
                  <div className="party-item democratic">
                    <span className="party-name">Democratic</span>
                    <span className="party-count">{senate.democratic}</span>
                  </div>
                  <div className="party-item independent">
                    <span className="party-name">Independent</span>
                    <span className="party-count">{senate.independent}</span>
                  </div>
                </div>
                <div className="majority-indicator">
                  <div className="majority-text">{senateMajority} Majority (+{senateMargin})</div>
                </div>
              </div>
            </div>
          </section>

          {/* Legislative Activity */}
          <section className="section" aria-labelledby="activity-heading">
            <div className="section-header">
              <h2 id="activity-heading">Legislative Activity Dashboard</h2>
              <div className="section-description">Real-time tracking of bills, partisan dynamics, and session productivity</div>
            </div>
            
            <div className="activity-dashboard">
              <div className="activity-metric">
                <div className="metric-number">{data.legislative_activity.bills_introduced.toLocaleString()}</div>
                <div className="metric-label">Bills Introduced</div>
                <div className="metric-detail">Total introduced this session</div>
              </div>
              
              <div className="activity-metric">
                <div className="metric-number">{data.legislative_activity.bills_passed}</div>
                <div className="metric-label">Bills Passed</div>
                <div className="metric-detail">Passage Rate: {passageRate}%</div>
              </div>
              
              <div className="activity-metric">
                <div className="metric-number">{data.legislative_activity.calendar_days_active}</div>
                <div className="metric-label">Days Active</div>
                <div className="metric-detail">Since session start</div>
              </div>
            </div>

            <div className="progress-tracking">
              <div className="progress-header">
                <div className="progress-title">Legislative Progress Tracking</div>
              </div>
              <div className="progress-bars">
                <div className="progress-item">
                  <div className="progress-label">Bills Passed</div>
                  <div className="progress-bar-container">
                    <div className="progress-bar bills-passed" style={{ width: `${passageRate}%` }}></div>
                  </div>
                  <div className="progress-percentage">{passageRate}%</div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-label">Partisan Breakdown</div>
                  <div className="split-bar">
                    <div className="progress-bar bipartisan-split" style={{ width: `${bipartisanPercent}%` }}></div>
                    <div className="progress-bar partisan-split" style={{ width: `${partisanPercent}%` }}></div>
                  </div>
                  <div className="progress-percentage">{bipartisanPassed} bipartisan, {partisanPassed} partisan</div>
                </div>
              </div>
            </div>
          </section>

          {/* Historical Productivity Comparison */}
          <section className="section" aria-labelledby="historical-heading">
            <div className="section-header">
              <h2 id="historical-heading">Historical Productivity Ranking</h2>
              <div className="section-description">How the 119th Congress compares to previous sessions in legislative output</div>
            </div>
            
            <div className="ranking-container">
              <div className="ranking-header">
                <div className="ranking-title">Congressional Productivity Leaderboard</div>
                <div className="ranking-subtitle">Based on bills passed in the first {data.historical_productivity_comparison.summary.comparison_timeframe_days} calendar days</div>
              </div>
              
              <div className="ranking-list">
                {Object.entries(data.historical_productivity_comparison)
                  .filter(([key]) => key !== 'summary')
                  .sort(([,a], [,b]) => b.bills_passed_in_timeframe - a.bills_passed_in_timeframe)
                  .map(([congress, congressData], index) => (
                    <div key={congress} className={`ranking-item ${congress === '119' ? 'current' : ''}`}>
                      <div className="ranking-position">
                        <div className={`ranking-number ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="ranking-congress">{congress}th Congress</div>
                          {congress === '119' && <div className="ranking-current">(Current)</div>}
                        </div>
                      </div>
                      <div className="ranking-bills">{congressData.bills_passed_in_timeframe} bills</div>
                    </div>
                  ))}
              </div>
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
            <strong>Data Source:</strong> {data.metadata.data_sources.join(', ')} | 
            <strong>Last Updated:</strong> {new Date(data.metadata.generated_at).toLocaleDateString()} | 
            <strong>Analysis Type:</strong> {data.metadata.analysis_type}
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
    </>
  );
}
