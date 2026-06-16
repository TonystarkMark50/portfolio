import { useEffect, Suspense, lazy } from 'react'
import { initSentry } from './utils/sentry'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Navbar from './components/Navbar';
import { BackToTop, Footer } from './components/ScrollComponents';
import ErrorBoundary from './components/ErrorBoundary';
import { trackPageView } from './lib/analytics';

function SentryInit() {
  useEffect(() => {
    initSentry();
  }, []);
  return null;
}

const Hero = lazy(() => import('./components/sections/HeroSection'));
const About = lazy(() => import('./components/sections/AboutSection'));
const Internship = lazy(() => import('./components/sections/InternshipSection'));
const Projects = lazy(() => import('./components/sections/ProjectsSection'));
const Skills = lazy(() => import('./components/sections/SkillsSection'));
const Certifications = lazy(() => import('./components/sections/CertificationsSection'));
const Journey = lazy(() => import('./components/sections/JourneySection'));
const Education = lazy(() => import('./components/sections/EducationSection'));
const Contact = lazy(() => import('./components/sections/ContactSection'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminApp'));

function SectionFallback() {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-hidden="true">
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-xl bg-gray-200 dark:bg-slate-800 shimmer" />
        <div className="h-4 w-full rounded-lg bg-gray-200 dark:bg-slate-800 shimmer" />
        <div className="h-4 w-5/6 rounded-lg bg-gray-200 dark:bg-slate-800 shimmer" />
        <div className="h-4 w-4/6 rounded-lg bg-gray-200 dark:bg-slate-800 shimmer" />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-200 dark:bg-slate-800 shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function MainSite() {
  return (
    <main id="main-content" className="relative">
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Hero">
          <Hero />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="About">
          <About />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Internship">
          <Internship />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Projects">
          <Projects />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Skills">
          <Skills />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Education">
          <Education />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Certifications">
          <Certifications />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Journey">
          <Journey />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ErrorBoundary sectionName="Contact">
          <Contact />
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const pageName = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replace(/\//g, '_');
    trackPageView(pageName);
  }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <>
      <SentryInit />
      <ScrollToTop />
      <Routes>
      <Route path="/admin/login" element={<Suspense fallback={<SectionFallback />}><AdminLogin /></Suspense>} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<SectionFallback />}>
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          </Suspense>
        }
      />
      <Route
        path="/*"
        element={
          <>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
            >
              Skip to main content
            </a>
            <Navbar />
            <MainSite />
            <Footer />
            <BackToTop />
          </>
        }
      />
    </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
