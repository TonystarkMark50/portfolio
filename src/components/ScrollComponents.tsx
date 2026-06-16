import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollProgress(progress);
      setIsVisible(scrollTop > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 w-12 h-12 rounded-full glass z-50 transition-[opacity,transform,box-shadow] duration-300 hover:scale-110 hover:shadow-lg active:scale-95 group flex items-center justify-center touch-action-manipulation ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      style={{ touchAction: 'manipulation' }}
      aria-label="Back to top"
    >
      {/* Scroll progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300/40 dark:text-slate-600/40"
        />
        {/* Progress */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <ArrowUp className="w-4 h-4 text-theme-secondary group-hover:text-primary-500 transition-colors relative z-10" />
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
            <a href="#home" className="text-theme-muted hover:text-primary-500 transition-colors min-h-[44px] flex items-center">
              Home
            </a>
            <a href="#projects" className="text-theme-muted hover:text-primary-500 transition-colors min-h-[44px] flex items-center">
              Projects
            </a>
            <a href="#contact" className="text-theme-muted hover:text-primary-500 transition-colors min-h-[44px] flex items-center">
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
