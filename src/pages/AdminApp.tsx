import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/admin/AdminLayout';
import type { AdminTab } from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProfile from '../components/admin/AdminProfile';
import AdminSkills from '../components/admin/AdminSkills';
import AdminEducation from '../components/admin/AdminEducation';
import AdminCertifications from '../components/admin/AdminCertifications';
import AdminProjects from '../components/admin/AdminProjects';
import AdminContacts from '../components/admin/AdminContacts';

export default function AdminPanel() {
  const { isAuthenticated, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to access this area.</p>
          <a href="/" className="inline-block mt-4 px-6 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboard />}
      {activeTab === 'profile' && <AdminProfile />}
      {activeTab === 'skills' && <AdminSkills />}
      {activeTab === 'education' && <AdminEducation />}
      {activeTab === 'certifications' && <AdminCertifications />}
      {activeTab === 'projects' && <AdminProjects />}
      {activeTab === 'contact' && <AdminContacts />}
      {activeTab === 'about' && (
        <div className="text-center py-20 text-gray-500">
          <p>About management module coming soon.</p>
        </div>
      )}
      {activeTab === 'internship' && (
        <div className="text-center py-20 text-gray-500">
          <p>Internship management module coming soon.</p>
        </div>
      )}
      {activeTab === 'journey' && (
        <div className="text-center py-20 text-gray-500">
          <p>Journey management module coming soon.</p>
        </div>
      )}
      {activeTab === 'resume' && (
        <div className="text-center py-20 text-gray-500">
          <p>Resume preview and settings coming soon.</p>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="text-center py-20 text-gray-500">
          <p>Site settings coming soon.</p>
        </div>
      )}
    </AdminLayout>
  );
}
