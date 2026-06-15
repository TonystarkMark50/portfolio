import { ReactNode } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard, User, BookOpen, Code2, Briefcase, GraduationCap, Award, Map, Mail, Settings, ArrowLeft, LogOut, FileText
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'profile'
  | 'about'
  | 'skills'
  | 'projects'
  | 'internship'
  | 'education'
  | 'certifications'
  | 'journey'
  | 'contact'
  | 'resume'
  | 'settings';

const navItems: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'about', icon: BookOpen, label: 'About' },
  { id: 'skills', icon: Code2, label: 'Skills' },
  { id: 'projects', icon: Briefcase, label: 'Projects' },
  { id: 'internship', icon: Briefcase, label: 'Internship' },
  { id: 'education', icon: GraduationCap, label: 'Education' },
  { id: 'certifications', icon: Award, label: 'Certifications' },
  { id: 'journey', icon: Map, label: 'Journey' },
  { id: 'contact', icon: Mail, label: 'Contact' },
  { id: 'resume', icon: FileText, label: 'Resume' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  const { user, logout } = useAdmin();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 shadow-lg z-40 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Portfolio CMS</h1>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700 space-y-2">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </a>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
