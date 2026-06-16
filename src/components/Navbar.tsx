import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Menu, X, Github, Linkedin, Mail, Download } from 'lucide-react';
import { useActiveSection } from '../hooks/useScroll';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadProfile, loadContactInfo } from '../lib/loaders';
import ThemeToggle from './ThemeToggle';
import ConfirmationModal from './ConfirmationModal';

const NAVBAR_HEIGHT = 80;

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'internship', label: 'Internship' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sectionIds = useMemo(() => navItems.map(item => item.id), []);
  const activeSection = useActiveSection(sectionIds);
  const { data: profile } = useSupabaseData(loadProfile);
  const { data: contactInfo } = useSupabaseData(loadContactInfo);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (window.scrollY > 10) {
        setHasInteracted(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const drawer = mobileDrawerRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    first?.focus();
    return () => {
      document.removeEventListener('keydown', handleTab);
      hamburgerRef.current?.focus();
    };
  }, [isMobileMenuOpen]);

  const handleResumeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setShowDownloadModal(true);
  };

  const confirmResumeDownload = async () => {
    setShowDownloadModal(false);
    try {
      const { generateAndDownloadResume } = await import('../utils/generateResume');
      await generateAndDownloadResume();
    } catch {
      // fallback handled silently
    }
  };

  const scrollToSection = (id: string) => {
    setHasInteracted(true);
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <ConfirmationModal
        open={showDownloadModal}
        action={{
          title: 'Download Resume',
          message: 'Would you like to download the latest version of my resume?',
          confirmLabel: 'Download Resume',
          variant: 'download',
          icon: 'download',
        }}
        onConfirm={confirmResumeDownload}
        onCancel={() => setShowDownloadModal(false)}
      />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-[padding,background,border-color,box-shadow] duration-500 ${
          isScrolled
            ? 'py-3 bg-white/70 dark:bg-dark-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-black/5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="relative group"
          >
            <span className="text-2xl font-bold gradient-text">Jagadeesh T</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 transition-[width] duration-300 group-hover:w-full" />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-[color,background] duration-200 ${
                  hasInteracted && activeSection === item.id
                    ? 'text-primary-500 bg-primary-500/10'
                    : 'text-theme-secondary hover:text-primary-500 hover:bg-gray-100/50 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden lg:block">
              <button
                onClick={handleResumeClick}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg hover:shadow-glow transition-[transform,box-shadow] duration-200 hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Resume
              </button>
            </div>
            <a
              href={profile?.github || 'https://github.com'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/5 border border-transparent hover:border-gray-200/50 dark:hover:border-white/10 transition-[background,border-color] duration-200 flex items-center justify-center"
            >
              <Github className="w-5 h-5 text-theme-secondary" />
            </a>
            <a
              href={profile?.linkedin || 'https://linkedin.com'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/5 border border-transparent hover:border-gray-200/50 dark:hover:border-white/10 transition-[background,border-color] duration-200 flex items-center justify-center"
            >
              <Linkedin className="w-5 h-5 text-theme-secondary" />
            </a>

            <ThemeToggle />

            <button
              ref={hamburgerRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/5 border border-transparent hover:border-gray-200/50 dark:hover:border-white/10 transition-[background,border-color] duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              style={{ touchAction: 'manipulation' }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-theme-secondary" />
              ) : (
                <Menu className="w-6 h-6 text-theme-secondary" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 lg:hidden transition-[opacity] duration-250 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          ref={mobileDrawerRef}
          id="mobile-nav"
          className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-white/90 dark:bg-dark-950/90 backdrop-blur-2xl shadow-2xl transform transition-[transform] duration-250 border-l border-gray-200/50 dark:border-gray-800/50 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="p-6 pt-20 flex flex-col gap-2">
            {navItems.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`px-4 py-3.5 rounded-xl text-lg font-medium transition-[background,color,border-color] duration-200 ${
                  hasInteracted && activeSection === item.id
                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-500 border-l-2 border-primary-500'
                    : 'text-theme-secondary hover:bg-gray-100/50 dark:hover:bg-white/5'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 space-y-1">
              <button
                onClick={handleResumeClick}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-theme-secondary hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-accent-500/10 hover:text-primary-500 transition-[background,color] duration-200 w-full text-left group"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Download Resume</span>
              </button>
              <a
                href={`mailto:${contactInfo?.email || profile?.email || ''}`}
                aria-label="Send Email"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-theme-secondary hover:bg-gray-100/50 dark:hover:bg-white/5 transition-[background] duration-200 group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Email Me</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
