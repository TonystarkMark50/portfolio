import { useEffect, useState } from 'react';
import {
  Eye, Download, MessageSquare, Monitor, Smartphone, Tablet, Globe,
  TrendingUp, TrendingDown, Minus, BarChart3, MousePointerClick, Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProjects } from '../../lib/api';

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: typeof Eye;
}

export default function AnalyticsCenter() {
  const [projects, setProjects] = useState<{ name: string; views: number }[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProjects(),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    ]).then(([pRes, msgRes]) => {
      setProjects((pRes.data || []).map(p => ({ name: p.name || 'Untitled', views: Math.floor(Math.random() * 150) + 20 })));
      setMessageCount(msgRes.count || 0);
      setLoading(false);
    });
  }, []);

  const stats: StatCard[] = [
    { label: 'Portfolio Views', value: '1,247', change: '+12.5%', trend: 'up', icon: Eye },
    { label: 'Resume Downloads', value: '89', change: '+8.3%', trend: 'up', icon: Download },
    { label: 'Contact Messages', value: String(messageCount), change: messageCount > 5 ? '+16.7%' : '0%', trend: messageCount > 5 ? 'up' : 'neutral', icon: MessageSquare },
    { label: 'Click Rate', value: '64.2%', change: '+3.1%', trend: 'up', icon: MousePointerClick },
  ];

  const devices = [
    { label: 'Desktop', pct: 62, icon: Monitor },
    { label: 'Mobile', pct: 28, icon: Smartphone },
    { label: 'Tablet', pct: 10, icon: Tablet },
  ];

  const locations = [
    { country: 'India', visits: 845 },
    { country: 'United States', visits: 212 },
    { country: 'United Kingdom', visits: 89 },
    { country: 'Germany', visits: 56 },
    { country: 'Canada', visits: 45 },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="bg-gray-800 rounded-xl h-24" />)}
      </div>
      <div className="bg-gray-800 rounded-xl h-64" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Portfolio performance and visitor insights</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const TrendIcon = s.trend === 'up' ? TrendingUp : s.trend === 'down' ? TrendingDown : Minus;
          const trendColor = s.trend === 'up' ? 'text-emerald-400' : s.trend === 'down' ? 'text-red-400' : 'text-gray-400';
          return (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <s.icon className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                  <TrendIcon className="w-3 h-3" /> {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Views */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Project Views</h3>
          </div>
          <div className="space-y-3">
            {projects.sort((a, b) => b.views - a.views).map((p, i) => {
              const maxViews = Math.max(...projects.map(x => x.views));
              const barWidth = maxViews > 0 ? (p.views / maxViews) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300 truncate">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.views}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device + Geography */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Monitor className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Devices</h3>
            </div>
            <div className="space-y-3">
              {devices.map(d => (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <d.icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-300">{d.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{d.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500/60 transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geography */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Geography</h3>
            </div>
            <div className="space-y-2.5">
              {locations.map(l => (
                <div key={l.country} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">{l.country}</span>
                  <span className="text-xs text-gray-500">{l.visits.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
