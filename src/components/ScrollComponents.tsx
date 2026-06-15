import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-4 rounded-full glass z-50 transition-all duration-500 hover:scale-110 hover:shadow-glow group ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5 text-theme-secondary group-hover:text-primary-500 transition-colors" />
    </button>
  );
}

export function Footer() {
  return (
    <footer className="relative py-12 bg-gray-100 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo */}
          <div>
            <span className="text-2xl font-bold gradient-text">Jagadeesh T</span>
            <p className="text-sm text-theme-muted mt-2">
              Biomedical Engineering Student.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-8">
            <a href="#home" className="text-theme-muted hover:text-primary-500 transition-colors">
              Home
            </a>
            <a href="#projects" className="text-theme-muted hover:text-primary-500 transition-colors">
              Projects
            </a>
            <a href="#contact" className="text-theme-muted hover:text-primary-500 transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-theme-muted">
              Built with care and attention to detail
            </p>
            <p className="text-xs text-theme-muted mt-1">
              {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
