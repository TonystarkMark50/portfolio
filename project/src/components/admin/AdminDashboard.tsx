import { useEffect, useState } from 'react';
import { Eye, Mail, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projectViews: 0,
    contactSubmissions: 0,
    resumeDownloads: 0,
  });

  useEffect(() => {
    async function load() {
      const { count: pv } = await supabase.from('project_views').select('*', { count: 'exact', head: true });
      const { count: cs } = await supabase.from('contact_submissions').select('*', { count: 'exact', head: true });
      const { count: rd } = await supabase.from('resume_downloads').select('*', { count: 'exact', head: true });
      setStats({
        projectViews: pv || 0,
        contactSubmissions: cs || 0,
        resumeDownloads: rd || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { icon: Eye, label: 'Project Views', value: stats.projectViews, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-500' },
    { icon: Mail, label: 'Contact Messages', value: stats.contactSubmissions, color: 'bg-success-100 dark:bg-success-900/30 text-success-500' },
    { icon: FileText, label: 'Resume Downloads', value: stats.resumeDownloads, color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
