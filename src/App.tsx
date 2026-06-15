import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Navbar from './components/Navbar';
import { BackToTop, Footer } from './components/ScrollComponents';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './sections/Hero';
import About from './sections/About';
import Internship from './sections/Internship';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Certifications from './sections/Certifications';
import Journey from './sections/Journey';
import Education from './sections/Education';
import Contact from './sections/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminApp';

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
      <ErrorBoundary sectionName="Hero">
        <Hero />
      </ErrorBoundary>
      <ErrorBoundary sectionName="About">
        <About />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Internship">
        <Internship />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Projects">
        <Projects />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Skills">
        <Skills />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Education">
        <Education />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Certifications">
        <Certifications />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Journey">
        <Journey />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Contact">
        <Contact />
      </ErrorBoundary>
    </main>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
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
