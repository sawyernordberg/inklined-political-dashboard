'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
interface HeaderProps {
  breadcrumb?: {
    items: Array<{
      label: string;
      href?: string;
    }>;
  };
  showSubtitle?: boolean;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({ breadcrumb, showSubtitle = false, onMobileMenuToggle, isMobileMenuOpen = false }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  return (
    <>
      {/* Top Bar */}
      <div style={{
        background: '#000',
        color: '#fff',
        padding: '0.5rem 0',
        fontSize: '0.8rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile Hamburger Button */}
            {onMobileMenuToggle && (
              <button
                className="mobile-menu-button"
                onClick={onMobileMenuToggle}
                style={{
                  display: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  width: '1.5rem',
                  height: '1.5rem'
                }}
                aria-label="Toggle mobile menu"
              >
                <span style={{
                  width: '100%',
                  height: '2px',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                  transform: isMobileMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
                }}></span>
                <span style={{
                  width: '100%',
                  height: '2px',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                  opacity: isMobileMenuOpen ? '0' : '1'
                }}></span>
                <span style={{
                  width: '100%',
                  height: '2px',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                  transform: isMobileMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
                }}></span>
              </button>
            )}
            <span style={{ fontWeight: '600' }}>LIVE DATA</span>
            <span className="top-bar-description">Real-time government and political statistics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="top-bar-date">{formatDate(currentTime)}</span>
            <span style={{ fontWeight: '600' }}>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{
        background: '#fff',
        borderBottom: '4px solid #1a1a1a',
        padding: '2rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Logo Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            width: '100%'
          }}>
            {/* Logo */}
            <div style={{ textAlign: 'center' }}>
              <Link href="/" style={{
                fontSize: '3rem',
                fontWeight: '800',
                textDecoration: 'none',
                color: '#1a1a1a',
                letterSpacing: '0.08em',
                fontFamily: 'Georgia, Times New Roman, serif',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '0.3rem'
              }}>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  textTransform: 'lowercase',
                  letterSpacing: '0.01em',
                  marginRight: '0.2rem'
                }}>the</span>
                In<span style={{ color: '#0d9488', fontWeight: '900' }}>k</span>lined<span style={{ color: '#0d9488', fontWeight: '900' }}>.</span>
              </Link>
              {showSubtitle && (
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666666',
                  marginTop: '1rem'
                }}>
                  Political Analysis & Data Transparency
                </div>
              )}
            </div>

          </div>

          {/* Breadcrumb */}
          {breadcrumb && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: '#666666',
              marginTop: '1rem'
            }}>
              {breadcrumb.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.href ? (
                    <Link href={item.href} style={{
                      color: '#0d9488',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {index < breadcrumb.items.length - 1 && <span>›</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
