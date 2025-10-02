'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentPath?: string;
}

export default function Navigation({ currentPath = '' }: NavigationProps) {
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.classList.remove('sidebar-open');
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
      {/* Navigation */}
      <nav style={{
        background: '#fafafa',
        borderBottom: '1px solid #e5e5e5',
        padding: '0',
        position: 'sticky',
        top: '0',
        zIndex: '100',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(250, 250, 250, 0.98)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{
            display: 'flex',
            justifyContent: 'center',
            flex: '1'
          }}>
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              margin: '0',
              padding: '0',
              gap: '2.5rem',
              justifyContent: 'center',
              width: '100%'
            }}>
              <li className="dropdown-parent" style={{ position: 'relative' }}>
                <Link href="/trump-admin" style={{
                  display: 'block',
                  padding: '1.3rem 0',
                  textDecoration: 'none',
                  color: isActive('/trump-admin') ? '#0d9488' : '#333333',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  borderBottom: isActive('/trump-admin') ? '2px solid #0d9488' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em'
                }}>
                  Trump Administration
                </Link>
                <div className="dropdown-menu" style={{
                  display: 'none',
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'white',
                  minWidth: '280px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  zIndex: '1000',
                  padding: '1rem 0',
                  marginTop: '2px'
                }}>
                  <Link href="/trump-admin/promises-tracker" style={{
                    display: 'block',
                    padding: '0.8rem 1.5rem',
                    textDecoration: 'none',
                    color: '#333333',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}>
                    Campaign Promises Tracker
                  </Link>
                  <Link href="/trump-admin/immigration" style={{
                    display: 'block',
                    padding: '0.8rem 1.5rem',
                    textDecoration: 'none',
                    color: '#333333',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}>
                    Immigration Enforcement
                  </Link>
                  <Link href="/trump-admin/spending-cuts" style={{
                    display: 'block',
                    padding: '0.8rem 1.5rem',
                    textDecoration: 'none',
                    color: '#333333',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}>
                    Spending Cuts
                  </Link>
                  <Link href="/trump-admin/economic-policy" style={{
                    display: 'block',
                    padding: '0.8rem 1.5rem',
                    textDecoration: 'none',
                    color: '#333333',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}>
                    Economic Policy Impact
                  </Link>
                </div>
              </li>
              <li>
                <Link href="/congress" style={{
                  display: 'block',
                  padding: '1.3rem 0',
                  textDecoration: 'none',
                  color: isActive('/congress') ? '#0d9488' : '#333333',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  borderBottom: isActive('/congress') ? '2px solid #0d9488' : '2px solid transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em'
                }}>
                  Congressional Breakdown
                </Link>
              </li>
              <li>
                <Link href="/departments" style={{
                  display: 'block',
                  padding: '1.3rem 0',
                  textDecoration: 'none',
                  color: isActive('/departments') ? '#0d9488' : '#333333',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  borderBottom: isActive('/departments') ? '2px solid #0d9488' : '2px solid transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em'
                }}>
                  US Departments
                </Link>
              </li>
              <li>
                <Link href="/research" style={{
                  display: 'block',
                  padding: '1.3rem 0',
                  textDecoration: 'none',
                  color: isActive('/research') ? '#0d9488' : '#333333',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  borderBottom: isActive('/research') ? '2px solid #0d9488' : '2px solid transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em'
                }}>
                  Political Research
                </Link>
              </li>
              <li>
                <Link href="/foreign-affairs" style={{
                  display: 'block',
                  padding: '1.3rem 0',
                  textDecoration: 'none',
                  color: isActive('/foreign-affairs') ? '#0d9488' : '#333333',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  borderBottom: isActive('/foreign-affairs') ? '2px solid #0d9488' : '2px solid transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em'
                }}>
                  Foreign Affairs
                </Link>
              </li>
              <li>
                <Link href="/courts" style={{
                  display: 'block',
                  padding: '1.3rem 0',
                  textDecoration: 'none',
                  color: isActive('/courts') ? '#0d9488' : '#333333',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  borderBottom: isActive('/courts') ? '2px solid #0d9488' : '2px solid transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em'
                }}>
                  The Courts
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              flexDirection: 'column',
              justifyContent: 'space-around',
              width: '2rem',
              height: '2rem'
            }}
            aria-label="Toggle mobile menu"
          >
            <span style={{
              width: '100%',
              height: '2px',
              background: '#333',
              transition: 'all 0.3s ease',
              transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></span>
            <span style={{
              width: '100%',
              height: '2px',
              background: '#333',
              transition: 'all 0.3s ease',
              opacity: isMobileMenuOpen ? '0' : '1'
            }}></span>
            <span style={{
              width: '100%',
              height: '2px',
              background: '#333',
              transition: 'all 0.3s ease',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }}></span>
          </button>
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
      </nav>

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
