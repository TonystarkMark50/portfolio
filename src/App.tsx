import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Navbar from './components/Navbar';
import { BackToTop, Footer } from './components/ScrollComponents';
import ErrorBoundary from './components/ErrorBoundary';
import { trackPageView } from './lib/analytics';

const Hero = lazy(() => import('./features/profile/HeroSection'));
const About = lazy(() => import('./features/about/AboutSection'));
const Internship = lazy(() => import('./features/internships/InternshipSection'));
const Projects = lazy(() => import('./features/projects/ProjectsSection'));
const Skills = lazy(() => import('./features/skills/SkillsSection'));
const Certifications = lazy(() => import('./features/certifications/CertificationsSection'));
const Journey = lazy(() => import('./features/journey/JourneySection'));
const Education = lazy(() => import('./features/education/EducationSection'));
const Contact = lazy(() => import('./features/contact/ContactSection'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminApp'));

function SectionFallback() {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
    <main className="relative">
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
