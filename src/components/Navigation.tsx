'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentPath?: string;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  children?: React.ReactNode;
  showHeader?: boolean;
}

export default function Navigation({ currentPath = '', isMobileMenuOpen = false, onMobileMenuToggle, children, showHeader = true }: NavigationProps) {
  const closeMobileMenu = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  // Cleanup effect to remove body class when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Desktop Sidebar Styles */
        @media (min-width: 1025px) {
          .desktop-sidebar {
            display: block !important;
          }
          
          .main-content-wrapper {
            margin-left: 280px !important;
          }
          
          /* Hide the original header completely on desktop since sidebar has its own */
          .main-content-wrapper > div:first-child {
            display: none !important;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 1024px) {
          .desktop-sidebar {
            display: none !important;
          }
          
          .main-content-wrapper {
            margin-left: 0 !important;
          }
          
          .mobile-menu-button {
            display: flex !important;
          }
        }
        
        /* Sidebar link hover effects */
        .desktop-sidebar a:hover {
          background: #f8f9fa;
          color: #0d9488;
          padding-left: 2.5rem;
        }
        
        /* Prevent body scroll when sidebar is open on mobile */
        body.sidebar-open {
          overflow: hidden;
        }
      `}</style>
      
      {/* Desktop Sidebar Navigation */}
      <div className="desktop-sidebar" style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '280px',
        height: '100vh',
        background: 'white',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: '1000',
        overflowY: 'auto',
        display: 'none' // Hidden by default, will be shown via CSS
      }}>
        {/* Top Bar Overlay */}
        <div style={{
          background: '#000',
          color: '#fff',
          padding: '0.5rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontWeight: '600' }}>LIVE DATA</span>
        </div>
        
        {/* Header Overlay */}
        <div style={{
          background: '#fff',
          borderBottom: '4px solid #1a1a1a',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Link href="/" style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            textDecoration: 'none',
            color: '#1a1a1a',
            letterSpacing: '0.08em',
            fontFamily: 'Georgia, Times New Roman, serif',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.2rem'
          }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'lowercase',
              letterSpacing: '0.01em',
              marginRight: '0.1rem'
            }}>the</span>
            In<span style={{ color: '#0d9488', fontWeight: '900' }}>k</span>lined<span style={{ color: '#0d9488', fontWeight: '900' }}>.</span>
          </Link>
        </div>

        {/* Navigation Content */}
        <div style={{
          padding: '2rem 0 1rem 0',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{
            padding: '0 2rem',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Navigation
          </div>
        </div>
        
        <ul style={{
          listStyle: 'none',
          margin: '0',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <li>
            <Link href="/trump-admin" style={{
              display: 'block',
              padding: '1rem 2rem',
              textDecoration: 'none',
              color: isActive('/trump-admin') ? '#0d9488' : '#333333',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderBottom: '1px solid #f0f0f0',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}>
              Trump Administration
            </Link>
            <div style={{
              paddingLeft: '2rem',
              background: '#f8f9fa'
            }}>
              <Link href="/trump-admin/promises-tracker" style={{
                display: 'block',
                padding: '0.8rem 1rem',
                textDecoration: 'none',
                color: '#666666',
                fontSize: '0.85rem',
                fontWeight: '400',
                transition: 'all 0.2s ease'
              }}>
                Campaign Promises Tracker
              </Link>
              <Link href="/trump-admin/immigration" style={{
                display: 'block',
                padding: '0.8rem 1rem',
                textDecoration: 'none',
                color: '#666666',
                fontSize: '0.85rem',
                fontWeight: '400',
                transition: 'all 0.2s ease'
              }}>
                Immigration Enforcement
              </Link>
              <Link href="/trump-admin/spending-cuts" style={{
                display: 'block',
                padding: '0.8rem 1rem',
                textDecoration: 'none',
                color: '#666666',
                fontSize: '0.85rem',
                fontWeight: '400',
                transition: 'all 0.2s ease'
              }}>
                Spending Cuts
              </Link>
              <Link href="/trump-admin/economic-policy" style={{
                display: 'block',
                padding: '0.8rem 1rem',
                textDecoration: 'none',
                color: '#666666',
                fontSize: '0.85rem',
                fontWeight: '400',
                transition: 'all 0.2s ease'
              }}>
                Economic Policy Impact
              </Link>
            </div>
          </li>
          <li>
            <Link href="/congress" style={{
              display: 'block',
              padding: '1rem 2rem',
              textDecoration: 'none',
              color: isActive('/congress') ? '#0d9488' : '#333333',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderBottom: '1px solid #f0f0f0',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}>
              Congressional Breakdown
            </Link>
          </li>
          <li>
            <Link href="/departments" style={{
              display: 'block',
              padding: '1rem 2rem',
              textDecoration: 'none',
              color: isActive('/departments') ? '#0d9488' : '#333333',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderBottom: '1px solid #f0f0f0',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}>
              US Departments
            </Link>
          </li>
          <li>
            <Link href="/research" style={{
              display: 'block',
              padding: '1rem 2rem',
              textDecoration: 'none',
              color: isActive('/research') ? '#0d9488' : '#333333',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderBottom: '1px solid #f0f0f0',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}>
              Political Research
            </Link>
          </li>
          <li>
            <Link href="/foreign-affairs" style={{
              display: 'block',
              padding: '1rem 2rem',
              textDecoration: 'none',
              color: isActive('/foreign-affairs') ? '#0d9488' : '#333333',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderBottom: '1px solid #f0f0f0',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}>
              Foreign Affairs
            </Link>
          </li>
          <li>
            <Link href="/courts" style={{
              display: 'block',
              padding: '1rem 2rem',
              textDecoration: 'none',
              color: isActive('/courts') ? '#0d9488' : '#333333',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderBottom: '1px solid #f0f0f0',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}>
              The Courts
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content Wrapper - This will wrap all page content */}
      <div className="main-content-wrapper" style={{
        marginLeft: '0', // Will be adjusted via CSS
        transition: 'margin-left 0.3s ease'
      }}>
        {children}
      </div>

      {/* Mobile Sidebar Navigation */}
      <div className="mobile-sidebar" style={{
        position: 'fixed',
        top: '0',
        left: isMobileMenuOpen ? '0' : '-280px',
        width: '280px',
        height: '100vh',
        background: 'white',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        transition: 'left 0.3s ease',
        overflowY: 'auto'
      }}>
          <div style={{
            padding: '2rem 0 1rem 0',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <div style={{
              padding: '0 2rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Navigation
            </div>
          </div>
          <ul style={{
            listStyle: 'none',
            margin: '0',
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <li>
              <Link href="/trump-admin" onClick={closeMobileMenu} style={{
                display: 'block',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('/trump-admin') ? '#0d9488' : '#333333',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderBottom: '1px solid #f0f0f0',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease'
              }}>
                Trump Administration
              </Link>
              <div style={{
                paddingLeft: '2rem',
                background: '#f8f9fa'
              }}>
                <Link href="/trump-admin/promises-tracker" onClick={closeMobileMenu} style={{
                  display: 'block',
                  padding: '0.8rem 1rem',
                  textDecoration: 'none',
                  color: '#666666',
                  fontSize: '0.85rem',
                  fontWeight: '400',
                  transition: 'all 0.2s ease'
                }}>
                  Campaign Promises Tracker
                </Link>
                <Link href="/trump-admin/immigration" onClick={closeMobileMenu} style={{
                  display: 'block',
                  padding: '0.8rem 1rem',
                  textDecoration: 'none',
                  color: '#666666',
                  fontSize: '0.85rem',
                  fontWeight: '400',
                  transition: 'all 0.2s ease'
                }}>
                  Immigration Enforcement
                </Link>
                <Link href="/trump-admin/spending-cuts" onClick={closeMobileMenu} style={{
                  display: 'block',
                  padding: '0.8rem 1rem',
                  textDecoration: 'none',
                  color: '#666666',
                  fontSize: '0.85rem',
                  fontWeight: '400',
                  transition: 'all 0.2s ease'
                }}>
                  Spending Cuts
                </Link>
                <Link href="/trump-admin/economic-policy" onClick={closeMobileMenu} style={{
                  display: 'block',
                  padding: '0.8rem 1rem',
                  textDecoration: 'none',
                  color: '#666666',
                  fontSize: '0.85rem',
                  fontWeight: '400',
                  transition: 'all 0.2s ease'
                }}>
                  Economic Policy Impact
                </Link>
              </div>
            </li>
            <li>
              <Link href="/congress" onClick={closeMobileMenu} style={{
                display: 'block',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('/congress') ? '#0d9488' : '#333333',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderBottom: '1px solid #f0f0f0',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease'
              }}>
                Congressional Breakdown
              </Link>
            </li>
            <li>
              <Link href="/departments" onClick={closeMobileMenu} style={{
                display: 'block',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('/departments') ? '#0d9488' : '#333333',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderBottom: '1px solid #f0f0f0',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease'
              }}>
                US Departments
              </Link>
            </li>
            <li>
              <Link href="/research" onClick={closeMobileMenu} style={{
                display: 'block',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('/research') ? '#0d9488' : '#333333',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderBottom: '1px solid #f0f0f0',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease'
              }}>
                Political Research
              </Link>
            </li>
            <li>
              <Link href="/foreign-affairs" onClick={closeMobileMenu} style={{
                display: 'block',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('/foreign-affairs') ? '#0d9488' : '#333333',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderBottom: '1px solid #f0f0f0',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease'
              }}>
                Foreign Affairs
              </Link>
            </li>
            <li>
              <Link href="/courts" onClick={closeMobileMenu} style={{
                display: 'block',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('/courts') ? '#0d9488' : '#333333',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderBottom: '1px solid #f0f0f0',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease'
              }}>
                The Courts
              </Link>
            </li>
          </ul>
        </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: '0',
            left: '280px',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '9998'
          }}
        />
      )}
    </>
  );
}
