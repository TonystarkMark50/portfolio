import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ToastProvider } from '../context/ToastContext';
import AdminLayout from '../components/admin/AdminLayout';
import type { AdminTab } from '../components/admin/AdminLayout';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-error-50 dark:bg-error-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You do not have permission to access this area.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
      {activeTab === 'profile' && <AdminProfile />}
      {activeTab === 'about' && <AdminAbout />}
      {activeTab === 'skills' && <AdminSkills />}
      {activeTab === 'projects' && <AdminProjects />}
      {activeTab === 'internship' && <AdminInternship />}
      {activeTab === 'education' && <AdminEducation />}
      {activeTab === 'certifications' && <AdminCertifications />}
      {activeTab === 'journey' && <AdminJourney />}
      {activeTab === 'contact' && <AdminContacts />}
      {activeTab === 'resume' && <AdminResume />}
      {activeTab === 'media' && <AdminMedia />}
      {activeTab === 'analytics' && <AnalyticsCenter />}
      {activeTab === 'settings' && <AdminSettings />}
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
