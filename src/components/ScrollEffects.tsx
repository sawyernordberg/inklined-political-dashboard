'use client';

import { useEffect } from 'react';

/**
 * Client component that adds scroll progress indicator and fade-in animations
 * Can be reused across all SSR pages
 */
export default function ScrollEffects() {
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

    // Fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => observer.observe(section));

    window.addEventListener('scroll', updateScrollProgress);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  return (
    <div className="scroll-indicator">
      <div className="scroll-progress"></div>
    </div>
  );
}

