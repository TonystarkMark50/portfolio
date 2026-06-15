import { useEffect, useState } from 'react';
import { Briefcase, Award, Code2, FileText, Mail, Eye, Clock, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProjects, getSkills, getCertifications, getEducation, getInternships } from '../../lib/api';

interface Stats {
  projects: number;
  certifications: number;
  skills: number;
  education: number;
  internships: number;
  contactMessages: number;
  lastUpdate: string;
}

interface ActivityEntry {
  id: string;
  action: string;
  email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0, certifications: 0, skills: 0, education: 0,
    internships: 0, contactMessages: 0, lastUpdate: '',
  });
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, c, s, e, i, cm, audit] = await Promise.all([
        getProjects(), getCertifications(), getSkills(),
        getEducation(), getInternships(),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      setStats({
        projects: p.data?.length || 0,
        certifications: c.data?.length || 0,
        skills: s.data?.length || 0,
        education: e.data?.length || 0,
        internships: i.data?.length || 0,
        contactMessages: cm.count || 0,
        lastUpdate: new Date().toLocaleString(),
      });
      if (audit.data) setActivities(audit.data);
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { icon: Briefcase, label: 'Projects', value: stats.projects, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' },
    { icon: Award, label: 'Certifications', value: stats.certifications, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' },
    { icon: Code2, label: 'Skills', value: stats.skills, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' },
    { icon: TrendingUp, label: 'Education', value: stats.education, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' },
    { icon: Briefcase, label: 'Internships', value: stats.internships, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' },
    { icon: Mail, label: 'Messages', value: stats.contactMessages, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500' },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-dark-700 mb-3" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-dark-700 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-dark-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Overview of your portfolio CMS</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {stats.lastUpdate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <div className="mt-3 w-full h-1.5 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-500`} style={{ width: `${Math.min(100, card.value * 20)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
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
                {idx < activities.length - 1 && (
                  <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-dark-600" />
                )}
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{entry.action.replace(/_/g, ' ')}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{entry.email}</span>
                    <span className="text-xs text-gray-400">•</span>
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
            <p className="text-sm text-gray-400 mt-1">Actions will appear here as you manage your portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
}
