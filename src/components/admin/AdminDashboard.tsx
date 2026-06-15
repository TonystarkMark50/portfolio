import { useEffect, useState } from 'react';
import { Briefcase, Award, Code2, FileText, Mail, GraduationCap, Clock, CheckCircle, AlertTriangle, Activity, Database, Globe, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProjects, getSkills, getCertifications, getEducation, getInternships } from '../../lib/api';

interface Stats {
  projects: number; certifications: number; skills: number;
  education: number; internships: number; contactMessages: number;
}

interface ActivityEntry {
  id: string; action: string; email: string; created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ projects: 0, certifications: 0, skills: 0, education: 0, internships: 0, contactMessages: 0 });
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<'healthy' | 'degraded' | 'checking'>('checking');

  const completionScore = (() => {
    let score = 0;
    if (stats.projects > 0) score += 15;
    if (stats.certifications > 0) score += 15;
    if (stats.skills > 0) score += 15;
    if (stats.education > 0) score += 15;
    if (stats.internships > 0) score += 15;
    if (stats.contactMessages > 0) score += 5;
    if (stats.projects >= 3) score += 10;
    if (stats.certifications >= 3) score += 10;
    return score;
  })();

  const missingItems: string[] = [];
  if (stats.projects === 0) missingItems.push('Add your first project');
  if (stats.certifications === 0) missingItems.push('Add certifications');
  if (stats.skills === 0) missingItems.push('Add skills categories');
  if (stats.education === 0) missingItems.push('Add education');
  if (stats.internships === 0) missingItems.push('Add internship experience');

  useEffect(() => {
    async function load() {
      const [p, c, s, e, i, cm, audit] = await Promise.all([
        getProjects(), getCertifications(), getSkills(),
        getEducation(), getInternships(),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(8),
      ]);
      setStats({
        projects: p.data?.length || 0, certifications: c.data?.length || 0, skills: s.data?.length || 0,
        education: e.data?.length || 0, internships: i.data?.length || 0, contactMessages: cm.count || 0,
      });
      if (audit.data) setActivities(audit.data);

      const { error } = await supabase.from('site_settings').select('id').limit(1);
      setSupabaseStatus(error ? 'degraded' : 'healthy');
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { icon: Briefcase, label: 'Projects', value: stats.projects, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
    { icon: Award, label: 'Certifications', value: stats.certifications, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500' },
    { icon: Code2, label: 'Skills', value: stats.skills, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
    { icon: GraduationCap, label: 'Education', value: stats.education, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
    { icon: Briefcase, label: 'Internships', value: stats.internships, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' },
    { icon: Mail, label: 'Messages', value: stats.contactMessages, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500' },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <div key={i} className="bg-white dark:bg-dark-800 rounded-2xl p-6 h-32" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Portfolio operating system overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${supabaseStatus === 'healthy' ? 'bg-success-500' : supabaseStatus === 'degraded' ? 'bg-warning-500' : 'bg-gray-400'}`} />
            <span className="text-gray-500">Supabase {supabaseStatus}</span>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Portfolio Completion + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Completion Score */}
        <div className="lg:col-span-1 bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Portfolio Completion</h3>
            <CheckCircle className={`w-5 h-5 ${completionScore >= 80 ? 'text-success-500' : 'text-warning-500'}`} />
          </div>
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-dark-600" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${completionScore}, 100`} className="text-primary-500 transition-all duration-1000 stroke-linecap-round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white">{completionScore}%</span>
          </div>
          {missingItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Missing:</p>
              {missingItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <AlertTriangle className="w-3 h-3 text-warning-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</span>
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className="mt-3 w-full h-1.5 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-700`} style={{ width: `${Math.min(100, card.value * 25)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg ${supabaseStatus === 'healthy' ? 'bg-success-50 dark:bg-success-900/20 text-success-500' : 'bg-warning-50 dark:bg-warning-900/20 text-warning-500'} flex items-center justify-center`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
              <p className="text-[11px] text-gray-500 capitalize">{supabaseStatus}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Website</p>
              <p className="text-[11px] text-gray-500">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Content</p>
              <p className="text-[11px] text-gray-500">{stats.projects + stats.certifications + stats.skills} items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>
            <p className="text-sm text-gray-500">Recent admin actions</p>
          </div>
        </div>
        {activities.length > 0 ? (
          <div className="space-y-0">
            {activities.map((entry, idx) => (
              <div key={entry.id} className="flex gap-4 pb-4 relative">
                {idx < activities.length - 1 && <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-gray-100 dark:bg-dark-700" />}
                <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{entry.action.replace(/_/g, ' ')}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{entry.email}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-dark-600" />
            <p>No activity recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Actions appear here as you manage your portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
}
