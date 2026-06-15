import { ReactNode, useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard, User, BookOpen, Code2, Briefcase, GraduationCap, Award,
  Map, Mail, Settings, LogOut, FileText, Image, Search,
  ChevronLeft, ChevronRight, Bell, BarChart3, ExternalLink,
  Clock, Zap, CheckCheck, Trash2, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CommandPalette from './CommandPalette';

export type AdminTab =
  | 'dashboard' | 'profile' | 'about' | 'skills' | 'projects'
  | 'internship' | 'education' | 'certifications' | 'journey'
  | 'contact' | 'resume' | 'media' | 'settings' | 'analytics';

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
  { id: 'resume', icon: FileText, label: 'Resume Studio' },
  { id: 'media', icon: Image, label: 'Media Library' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

function CurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-xs text-gray-400 tabular-nums flex items-center gap-1.5">
      <Clock className="w-3 h-3" />
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

function StatusDot({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-success-400 opacity-75" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-success-500" />
      </span>
      {label}
    </span>
  );
}

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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; icon: any; read: boolean }[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>();

  function showToast(message: string, type: 'error' | 'success' = 'error') {
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    const sub = supabase
      .channel('contact_submissions_notif')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_submissions' }, () => {
        loadNotifications();
      })
      .subscribe();
    return () => { clearInterval(interval); sub.unsubscribe(); };
  }, []);

  async function loadNotifications() {
    const [countRes, msgsRes] = await Promise.all([
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('contact_submissions').select('id, name, created_at, is_read').order('created_at', { ascending: false }).limit(10)
    ]);
    if (countRes.count !== null) setUnreadNotifs(countRes.count);
    if (msgsRes.data) {
      setNotifications(msgsRes.data.map(m => ({
        id: m.id,
        text: `New message from ${m.name}`,
        time: formatTimeAgo(m.created_at),
        icon: Mail,
        read: m.is_read,
      })));
    }
  }

  function formatTimeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  async function markAllRead() {
    const { error } = await supabase.from('contact_submissions').update({ is_read: true }).eq('is_read', false);
    if (error) { showToast('Failed to mark all as read'); return; }
    setUnreadNotifs(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function markAsRead(id: string) {
    const { error } = await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
    if (error) { showToast('Failed to mark notification as read'); return; }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadNotifs(prev => Math.max(0, prev - 1));
  }

  async function deleteNotification(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Delete this notification?')) return;
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) { showToast('Failed to delete notification'); return; }
    setNotifications(prev => prev.filter(n => n.id !== id));
    loadNotifications();
  }

  async function clearAll() {
    if (!confirm('Delete all notifications?')) return;
    const { error } = await supabase.from('contact_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) { showToast('Failed to clear notifications'); return; }
    setNotifications([]);
    setUnreadNotifs(0);
  }

  useEffect(() => {
    if (!showNotifs) return;
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
      if (e.key === 'Escape') { setCmdOpen(false); setShowNotifs(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <CommandPalette onNavigate={onTabChange} open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${collapsed ? 'w-[68px]' : 'w-60'} bg-gray-900 border-r border-gray-800 z-40 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-sm text-white truncate leading-tight">Portfolio CMS</h1>
                <p className="text-[9px] text-gray-500 truncate leading-tight">admin panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors shrink-0">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 font-medium shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-gray-800 space-y-0.5">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors">
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!collapsed && <span>View Website</span>}
          </a>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500">
            <div className="relative flex w-2 h-2 shrink-0">
              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-success-500" />
            </div>
            {!collapsed && <span>Deployed</span>}
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={`${collapsed ? 'ml-[68px]' : 'ml-60'} transition-all duration-300 min-h-screen flex flex-col`}>
        {/* Top Bar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors w-64">
              <Search className="w-3.5 h-3.5" />
              <span>Search anything...</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded border border-gray-700 text-[9px] bg-gray-800 text-gray-500">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <StatusDot label="Supabase" />
            <StatusDot label="Netlify" />
            <CurrentTime />

            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors">
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">{unreadNotifs}</span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-200">Notifications</p>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 className="w-3 h-3" /> Clear all
                        </button>
                      )}
                      {unreadNotifs > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-xs">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p>No notifications</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} onClick={() => { markAsRead(n.id); onTabChange('contact'); }} className={`group flex items-start gap-3 p-3 hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-800 last:border-0 ${n.read ? 'opacity-60' : ''}`}>
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <n.icon className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-200">{n.text}</p>
                          <p className="text-[10px] text-gray-500">{n.time}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1" />}
                          <button onClick={(e) => deleteNotification(e, n.id)} className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 pl-4 border-l border-gray-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-xs text-gray-300 hidden sm:block">{user?.email || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
