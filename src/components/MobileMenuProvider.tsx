'use client';

import { useState, useEffect } from 'react';

interface MobileMenuProviderProps {
  children: (props: {
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
  }) => React.ReactNode;
}

/**
 * Client component that provides mobile menu state management
 * This allows server components to use mobile menu functionality
 */
export default function MobileMenuProvider({ children }: MobileMenuProviderProps) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, []);

  return <>{children({ isMobileMenuOpen, toggleMobileMenu })}</>;
}

