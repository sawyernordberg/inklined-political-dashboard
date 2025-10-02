'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Header from '../../../components/Header';

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

export default function PromisesTrackerPage() {
  const [data, setData] = useState<PromisesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedPromises, setExpandedPromises] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch real data from the JSON file
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch the real JSON data
        const response = await fetch('/data/promises.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const realData: PromisesData = await response.json();
        setData(realData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading promises data:', err);
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

  const toggleExpanded = (promiseId: string) => {
    const newExpanded = new Set(expandedPromises);
    if (newExpanded.has(promiseId)) {
      newExpanded.delete(promiseId);
    } else {
      newExpanded.add(promiseId);
    }
    setExpandedPromises(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'kept': return '#059669';
      case 'broken': return '#dc2626';
      case 'stalled': return '#d97706';
      case 'in_progress': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'kept': return 'Kept';
      case 'broken': return 'Broken';
      case 'stalled': return 'Stalled';
      case 'in_progress': return 'In Progress';
      default: return status;
    }
  };

  const getCategoryName = (categoryKey: string) => {
    const categoryNames: { [key: string]: string } = {
      'government_transparency': 'Government Transparency',
      'immigration': 'Immigration',
      'economy': 'Economy & Taxes',
      'foreign_policy': 'Foreign Policy',
      'government_operations': 'Government Operations',
      'social_issues': 'Social Issues',
      'technology': 'Technology',
      'healthcare': 'Healthcare',
      'election_integrity': 'Election Integrity',
      'veterans_affairs': 'Veterans Affairs',
      'unusual_specific_promises': 'Specific Proposals'
    };
    return categoryNames[categoryKey] || categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Flatten all promises into a single array for unified display
  const allPromises = data ? Object.entries(data.promises).flatMap(([category, promises]) =>
    promises.map(promise => ({ ...promise, category, categoryName: getCategoryName(category) }))
  ) : [];

  // Filter promises based on search and filters
  const filteredPromises = allPromises.filter(promise => {
    const matchesSearch = promise.promise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promise.evidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (promise.exact_quote && promise.exact_quote.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         promise.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promise.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || promise.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
        Loading campaign promises data...
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
      <Header breadcrumb={{
        items: [
          { label: 'Trump Administration', href: '/trump-admin' },
          { label: 'Promises Tracker' }
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

        .header-content {
          text-align: center;
          margin-bottom: 80px;
          padding: 60px 0;
        }

        .header-content h1 {
          font-size: 2.5rem;
          color: #1a1a1a;
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        .header-content p {
          font-size: 1.1rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
          font-style: italic;
        }

        .header-content .metadata {
          margin-top: 30px;
          font-size: 0.9rem;
          color: #888;
        }

        .section {
          margin-bottom: 70px;
          padding-bottom: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        /* Summary Dashboard Styles */
        .summary-dashboard {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 40px;
          border: 1px solid #e5e7eb;
          margin-bottom: 50px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .dashboard-title {
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 15px;
          font-weight: 300;
          letterSpacing: -0.3px;
        }

        .dashboard-subtitle {
          font-size: 1rem;
          color: #888;
          font-style: italic;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          margin-bottom: 40px;
        }

        .summary-stat {
          background: white;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .summary-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .stat-number.kept {
          color: #059669;
        }

        .stat-number.broken {
          color: #dc2626;
        }

        .stat-number.stalled {
          color: #d97706;
        }

        .stat-number.in-progress {
          color: #2563eb;
        }

        .stat-label {
          font-size: 1rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-percentage {
          font-size: 0.9rem;
          color: #9ca3af;
        }

        /* Filters Section */
        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
          margin-bottom: 40px;
        }

        .filters-header {
          margin-bottom: 25px;
        }

        .filters-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .filters-subtitle {
          font-size: 0.9rem;
          color: #64748b;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 25px;
          align-items: end;
        }

        .search-group {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
          font-family: inherit;
        }

        .search-input:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          color: #666666;
          pointer-events: none;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #333333;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 16px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          transition: all 0.2s ease;
          border-radius: 4px;
          white-space: nowrap;
          font-family: inherit;
        }

        .filter-btn.active {
          background: #333;
          color: white;
          border-color: #333;
        }

        .filter-btn:hover:not(.active) {
          border-color: #333;
          background: #f0f0f0;
        }

        .category-select {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
          cursor: pointer;
          font-family: inherit;
        }

        .category-select:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        /* Promises Tracking Section */
        .promises-container {
          background: #fafafa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 70px;
          padding-bottom: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .promises-header {
          background: white;
          padding: 30px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .promises-title {
          font-size: 1.5rem;
          font-weight: 400;
          color: #1a1a1a;
        }

        .promises-list {
          max-height: 600px;
          overflow-y: auto;
          background: white;
        }

        .promise-item {
          padding: 20px 30px;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .promise-item:hover {
          background: #f8f9fa;
          border-left: 4px solid #0d9488;
          padding-left: 26px;
        }

        .promise-item:last-child {
          border-bottom: none;
        }

        .promise-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .promise-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .promise-content {
          flex: 1;
        }

        .promise-text {
          font-size: 1rem;
          color: #333;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .promise-meta {
          font-size: 0.85rem;
          color: #666;
        }

        .promise-expand-icon {
          margin-left: auto;
          font-size: 1.2rem;
          color: #666;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .promise-item.expanded .promise-expand-icon {
          transform: rotate(180deg);
        }

        .promise-details {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          background: #fafafa;
          margin-top: 0;
          border-radius: 8px;
        }

        .promise-details.expanded {
          max-height: 1000px;
          padding: 25px;
          margin-top: 20px;
        }

        .detail-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
          padding: 20px;
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }

        .detail-meta-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .detail-meta-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-meta-value {
          font-size: 0.95rem;
          color: #333333;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: white;
        }

        .status-badge.kept {
          background: #059669;
        }

        .status-badge.broken {
          background: #dc2626;
        }

        .status-badge.stalled {
          background: #d97706;
        }

        .status-badge.in-progress {
          background: #2563eb;
        }

        .promise-description {
          background: white;
          padding: 20px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .promise-status-section {
          background: white;
          padding: 20px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }

        .promise-status-title {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        .promise-status-text {
          line-height: 1.6;
          color: #555;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .summary-stats {
            grid-template-columns: 1fr;
          }
          
          .container {
            padding: 20px 10px;
          }
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
      `}</style>

      {/* Scroll Progress Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-progress"></div>
      </div>


      <Navigation currentPath="/trump-admin/promises-tracker" />
      <div className="container">
        <div className="header-content">
          <h1>Trump Campaign Promises Tracker</h1>
          <p>Comprehensive analysis of Donald Trump&apos;s 2024 campaign promises with detailed status updates and evidence</p>
          <div className="metadata">
            <span>Campaign Promise Tracking Database</span>
          </div>
        </div>

        {/* Summary Dashboard */}
        <section className="summary-dashboard section">
          <div className="dashboard-header">
            <h2 className="dashboard-title">Campaign Promise Analysis</h2>
            <p className="dashboard-subtitle">Real-time tracking of campaign commitments and implementation status</p>
          </div>
          
          <div className="summary-stats">
            <div className="summary-stat">
              <div className={`stat-number kept`}>{data.summary.kept}</div>
              <div className="stat-label">Kept</div>
              <div className="stat-percentage">{((data.summary.kept / data.summary.total_promises) * 100).toFixed(1)}%</div>
            </div>
            
            <div className="summary-stat">
              <div className={`stat-number broken`}>{data.summary.broken}</div>
              <div className="stat-label">Broken</div>
              <div className="stat-percentage">{((data.summary.broken / data.summary.total_promises) * 100).toFixed(1)}%</div>
            </div>
            
            <div className="summary-stat">
              <div className={`stat-number stalled`}>{data.summary.stalled}</div>
              <div className="stat-label">Stalled</div>
              <div className="stat-percentage">{((data.summary.stalled / data.summary.total_promises) * 100).toFixed(1)}%</div>
            </div>
            
            <div className="summary-stat">
              <div className={`stat-number in-progress`}>{data.summary.in_progress}</div>
              <div className="stat-label">In Progress</div>
              <div className="stat-percentage">{((data.summary.in_progress / data.summary.total_promises) * 100).toFixed(1)}%</div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#374151',
            fontWeight: '500'
          }}>
            Total Promises Tracked: <strong>{data.summary.total_promises}</strong>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section section">
          <div className="filters-header">
            <h3 className="filters-title">Filter & Search Promises</h3>
            <p className="filters-subtitle">Find specific promises by status, category, or search terms</p>
          </div>
          
          <div className="filters-grid">
            <div className="search-group">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search promises, evidence, or quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <div className="filter-label">Status</div>
              <div className="status-filters">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'kept' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('kept')}
                >
                  Kept
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'broken' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('broken')}
                >
                  Broken
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'stalled' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('stalled')}
                >
                  Stalled
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('in_progress')}
                >
                  In Progress
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <div className="filter-label">Category</div>
              <select
                className="category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.keys(data.promises).map(category => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            Showing {filteredPromises.length} of {allPromises.length} promises
          </div>
        </section>

        {/* Promises Tracking Section */}
        <section className="promises-container section">
          <div className="promises-header">
            <h3 className="promises-title">Campaign Promise Tracking</h3>
          </div>
          
          <div className="promises-list">
            {filteredPromises.map((promise, index) => {
              const promiseId = `${promise.category}-${index}`;
              const isExpanded = expandedPromises.has(promiseId);
              
              return (
                <div key={promiseId} className={`promise-item ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleExpanded(promiseId)}>
                  <div className="promise-header">
                    <div className="promise-status" style={{ background: getStatusColor(promise.status) }}></div>
                    <div className="promise-content">
                      <div className="promise-text">{promise.promise}</div>
                      <div className="promise-meta">
                        <span>Status: {getStatusText(promise.status)}</span>
                      </div>
                    </div>
                    <div className="promise-expand-icon">▼</div>
                  </div>
                  
                  <div className={`promise-details ${isExpanded ? 'expanded' : ''}`}>
                    <div className="detail-meta-grid">
                      <div className="detail-meta-item">
                        <div className="detail-meta-label">Status</div>
                        <div className="detail-meta-value">
                          <span className={`status-badge ${promise.status}`}>{getStatusText(promise.status).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="detail-meta-item">
                        <div className="detail-meta-label">Category</div>
                        <div className="detail-meta-value">{promise.categoryName}</div>
                      </div>
                    </div>

                    {promise.exact_quote && (
                      <div className="promise-description">
                        <strong>Campaign Quote:</strong><br />
                        &quot;{promise.exact_quote}&quot;<br />
                        <em>Source: {promise.source}</em>
                      </div>
                    )}

                    <div className="promise-status-section">
                      <div className="promise-status-title">Current Status & Evidence</div>
                      <div className="promise-status-text">{promise.evidence}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPromises.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
              fontSize: '1.1rem'
            }}>
              No promises match your current filters. Try adjusting your search criteria.
            </div>
          )}
        </section>

        {/* Data Source */}
      </div>

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
