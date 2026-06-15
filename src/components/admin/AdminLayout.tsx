import { ReactNode, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard, User, BookOpen, Code2, Briefcase, GraduationCap, Award, Map, Mail, Settings, ArrowLeft, LogOut, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';

export type AdminTab =
  | 'dashboard' | 'profile' | 'about' | 'skills' | 'projects'
  | 'internship' | 'education' | 'certifications' | 'journey'
  | 'contact' | 'resume' | 'settings';

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 shadow-sm z-40 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between gap-3">
            {!collapsed && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">Portfolio CMS</h1>
                  <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-full flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 transition-colors shrink-0"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-dark-700 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Back to Site</span>}
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${collapsed ? 'ml-20' : 'ml-64'} p-6 lg:p-8 transition-all duration-300 min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
