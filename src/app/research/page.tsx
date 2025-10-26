'use client';

import { useState } from 'react';
import Navigation from '../../components/Navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import ShareButton from '../../components/ShareButton';

export default function ResearchPage() {
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
  return (
    <div className="min-h-screen bg-white">
      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'Research' }
        ]
      }} onMobileMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />

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
        }

        h1, h2, h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1a1a;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .coming-soon-container {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 80px 60px;
          border: 1px solid #e5e7eb;
          text-align: center;
          margin-bottom: 60px;
        }

        .coming-soon-icon {
          font-size: 5rem;
          margin-bottom: 30px;
          display: block;
        }

        .coming-soon-badge {
          display: inline-flex;
          align-items: center;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 50px;
          padding: 12px 24px;
          margin-bottom: 30px;
        }

        .coming-soon-badge .pulse-dot {
          width: 12px;
          height: 12px;
          background: #f59e0b;
          border-radius: 50%;
          margin-right: 12px;
          animation: pulse 2s infinite;
        }

        .coming-soon-badge span {
          color: #92400e;
          font-weight: 600;
          font-size: 1.1rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .main-title {
          font-size: 3rem;
          color: #1a1a1a;
          margin-bottom: 20px;
          font-weight: 300;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 1.3rem;
          color: #666;
          max-width: 700px;
          margin: 0 auto 40px auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin: 40px 0;
        }

        .feature-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          text-align: left;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .feature-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
        }

        .feature-card p {
          color: #64748b;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .status-note {
          background: #e6f7f6;
          border: 1px solid #0d9488;
          border-radius: 8px;
          padding: 20px;
          margin: 40px 0;
          text-align: center;
        }

        .status-note p {
          color: #0d9488;
          font-weight: 500;
          margin: 0;
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
          .container {
            padding: 40px 15px;
          }
          
          .main-title {
            font-size: 2.2rem;
          }

          .coming-soon-container {
            padding: 60px 30px;
          }

          .feature-card {
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


      <Navigation currentPath="/research" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu}>
      <div className="container">
        {/* Coming Soon Section */}
        <div className="coming-soon-container">
          <div className="coming-soon-badge">
            <div className="pulse-dot"></div>
            <span>Coming Soon</span>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              zIndex: 10
            }}>
              <ShareButton
                title="Political Research"
                description="In-depth research articles and analyses covering political developments, policy implications, and comprehensive investigative reporting"
                url="https://theinklined.com/research"
              />
            </div>
            <h1 className="main-title">Political Research</h1>
            
            <p className="subtitle">
              In-depth research articles and analyses by our editors covering political developments, policy implications, and comprehensive investigative reporting. Our first analysis is coming soon.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div>
          <h2 style={{ 
            fontSize: '2rem', 
            color: '#1a1a1a', 
            marginBottom: '15px', 
            fontWeight: '300', 
            letterSpacing: '-0.3px',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            What This Page Will Do
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>Editorial Analysis</h3>
              <p>Comprehensive research articles and in-depth analysis by our editorial team covering political developments, policy implications, and investigative reporting.</p>
            </div>
            
            <div className="feature-card">
              <h3>Policy Deep Dives</h3>
              <p>Detailed examinations of policy proposals, legislative impacts, and their broader implications for American governance and society.</p>
            </div>
            
            <div className="feature-card">
              <h3>Investigative Reports</h3>
              <p>Original investigative journalism and research uncovering political developments, government actions, and their consequences for transparency and accountability.</p>
            </div>
          </div>
        </div>

        {/* Status Note */}
        <div className="status-note">
          <p>
            This section is currently under development. We&apos;re working to provide you with comprehensive political research and editorial analysis.
          </p>
        </div>

        {/* Support Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
          color: 'white',
          padding: '3rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          margin: '3rem 0'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            marginBottom: '1rem',
            fontFamily: 'Georgia, serif'
          }}>
            Help Us Build This Faster
          </h3>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            opacity: '0.95',
            maxWidth: '600px',
            margin: '0 auto 2rem auto',
            lineHeight: '1.6'
          }}>
            Your donation helps us get this site up and running faster. Support our mission to provide comprehensive political research and editorial analysis.
          </p>
          <Link href="/support" style={{
            display: 'inline-block',
            background: 'white',
            color: '#0d9488',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}>
            Support Us
          </Link>
        </div>
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
      </Navigation>
    </div>
  );
}
