import { useState, useCallback, Suspense, lazy } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ToastProvider } from '../context/ToastContext';
import AdminLayout from '../components/admin/AdminLayout';
import type { AdminTab } from '../components/admin/AdminLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const TAB_STORAGE_KEY = 'admin-active-tab';

const VALID_TABS = [
  'dashboard','profile','about','skills','projects','internship','education',
  'certifications','journey','contact','resume','media','settings','analytics',
  'notifications','crm'
];

const LazyDashboard = lazy(() => import('../admin/AdminDashboard'));
const LazyProfile = lazy(() => import('../admin/AdminProfile'));
const LazyAbout = lazy(() => import('../admin/AdminAbout'));
const LazySkills = lazy(() => import('../admin/AdminSkills'));
const LazyEducation = lazy(() => import('../admin/AdminEducation'));
const LazyInternship = lazy(() => import('../admin/AdminInternship'));
const LazyCertifications = lazy(() => import('../admin/AdminCertifications'));
const LazyProjects = lazy(() => import('../admin/AdminProjects'));
const LazyJourney = lazy(() => import('../admin/AdminJourney'));
const LazyContacts = lazy(() => import('../admin/AdminContacts'));
const LazyResume = lazy(() => import('../admin/AdminResume'));
const LazySettings = lazy(() => import('../admin/AdminSettings'));
const LazyAnalytics = lazy(() => import('../admin/AnalyticsCenter'));
const LazyNotifications = lazy(() => import('../features/notifications/NotificationCenter'));
const LazyCRM = lazy(() => import('../features/contact-crm/ContactInbox'));
const LazyMedia = lazy(() => import('../features/media-library/MediaLibrary'));

function TabFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function AdminContent() {
  const { isAuthenticated, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY);
    if (saved && VALID_TABS.includes(saved)) {
      return saved as AdminTab;
    }
    return 'dashboard';
  });

  const handleTabChange = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-error-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You do not have permission to access this area.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <LazyDashboard onNavigate={setActiveTab} />;
      case 'profile': return <LazyProfile />;
      case 'about': return <LazyAbout />;
      case 'skills': return <LazySkills />;
      case 'projects': return <LazyProjects />;
      case 'internship': return <LazyInternship />;
      case 'education': return <LazyEducation />;
      case 'certifications': return <LazyCertifications />;
      case 'journey': return <LazyJourney />;
      case 'contact': return <LazyContacts />;
      case 'resume': return <LazyResume />;
      case 'media': return <LazyMedia onNavigate={(t) => setActiveTab(t as AdminTab)} />;
      case 'analytics': return <LazyAnalytics />;
      case 'notifications': return <LazyNotifications open onClose={() => setActiveTab('dashboard')} />;
      case 'crm': return <LazyCRM onNavigate={(t) => setActiveTab(t as AdminTab)} />;
      case 'settings': return <LazySettings />;
      default: return <LazyDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <ErrorBoundary
        sectionName={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        fallback={
          <div className="min-h-[300px] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-800 mb-4">
                <span className="text-2xl text-gray-500">⚠</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} temporarily unavailable
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                This section encountered an error. Try refreshing or contact support.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={<TabFallback />}>
          {renderTab()}
        </Suspense>
      </ErrorBoundary>
    </AdminLayout>
  );
}

export default function AdminPanel() {
  return (
    <ToastProvider>
      <AdminContent />
    </ToastProvider>
  );
}
