import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ToastProvider } from '../context/ToastContext';
import AdminLayout from '../components/admin/AdminLayout';
import type { AdminTab } from '../components/admin/AdminLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProfile from '../components/admin/AdminProfile';
import AdminAbout from '../components/admin/AdminAbout';
import AdminSkills from '../components/admin/AdminSkills';
import AdminEducation from '../components/admin/AdminEducation';
import AdminInternship from '../components/admin/AdminInternship';
import AdminCertifications from '../components/admin/AdminCertifications';
import AdminProjects from '../components/admin/AdminProjects';
import AdminJourney from '../components/admin/AdminJourney';
import AdminContacts from '../components/admin/AdminContacts';
import AdminResume from '../components/admin/AdminResume';
import AdminMedia from '../components/admin/AdminMedia';
import AdminSettings from '../components/admin/AdminSettings';
import AnalyticsCenter from '../components/admin/AnalyticsCenter';

function AdminContent() {
  const { isAuthenticated, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

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

  const sections: { tab: AdminTab; component: React.ReactNode }[] = [
    { tab: 'dashboard', component: <AdminDashboard onNavigate={setActiveTab} /> },
    { tab: 'profile', component: <AdminProfile /> },
    { tab: 'about', component: <AdminAbout /> },
    { tab: 'skills', component: <AdminSkills /> },
    { tab: 'projects', component: <AdminProjects /> },
    { tab: 'internship', component: <AdminInternship /> },
    { tab: 'education', component: <AdminEducation /> },
    { tab: 'certifications', component: <AdminCertifications /> },
    { tab: 'journey', component: <AdminJourney /> },
    { tab: 'contact', component: <AdminContacts /> },
    { tab: 'resume', component: <AdminResume /> },
    { tab: 'media', component: <AdminMedia /> },
    { tab: 'analytics', component: <AnalyticsCenter /> },
    { tab: 'settings', component: <AdminSettings /> },
  ];

  const activeSection = sections.find(s => s.tab === activeTab);

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
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
        {activeSection?.component}
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
