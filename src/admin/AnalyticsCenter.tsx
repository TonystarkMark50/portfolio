import { useEffect, useState, useCallback } from 'react';
import {
  Eye, Download, MessageSquare, Monitor, Smartphone, Tablet, Globe,
  TrendingUp, TrendingDown, Minus, BarChart3, MousePointerClick,
  Users, ExternalLink, Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProjects } from '../lib/api';

interface StatCardData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: typeof Eye;
}

export default function AnalyticsCenter() {
  const [totalViews, setTotalViews] = useState(0);
  const [dailyViews, setDailyViews] = useState(0);
  const [weeklyViews, setWeeklyViews] = useState(0);
  const [monthlyViews, setMonthlyViews] = useState(0);

  const [totalDownloads, setTotalDownloads] = useState(0);
  const [downloadsToday, setDownloadsToday] = useState(0);
  const [downloadsWeek, setDownloadsWeek] = useState(0);
  const [downloadsMonth, setDownloadsMonth] = useState(0);

  const [contactCount, setContactCount] = useState(0);
  const [liveVisitors, setLiveVisitors] = useState(0);

  const [deviceStats, setDeviceStats] = useState<{ desktop: number; mobile: number; tablet: number }>({ desktop: 0, mobile: 0, tablet: 0 });
  const [topCountries, setTopCountries] = useState<{ country: string; visits: number }[]>([]);
  const [referrerStats, setReferrerStats] = useState<{ source: string; count: number }[]>([]);
  const [projectViewCounts, setProjectViewCounts] = useState<{ name: string; views: number; id: string }[]>([]);

  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 86400000).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();

    const [
      totalViewsRes,
      dailyViewsRes,
      weeklyViewsRes,
      monthlyViewsRes,
      totalDownloadsRes,
      downloadsTodayRes,
      downloadsWeekRes,
      downloadsMonthRes,
      contactRes,
      deviceRes,
      countriesRes,
      referrerRes,
      projectViewsRes,
      liveRes,
    ] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', startOfDay),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', startOfWeek),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', startOfMonth),
      supabase.from('resume_downloads').select('*', { count: 'exact', head: true }),
      supabase.from('resume_downloads').select('*', { count: 'exact', head: true }).gte('downloaded_at', startOfDay),
      supabase.from('resume_downloads').select('*', { count: 'exact', head: true }).gte('downloaded_at', startOfWeek),
      supabase.from('resume_downloads').select('*', { count: 'exact', head: true }).gte('downloaded_at', startOfMonth),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('device_type'),
      supabase.from('page_views').select('country').not('country', 'eq', 'Unknown').not('country', 'eq', '').order('viewed_at', { ascending: false }),
      supabase.from('page_views').select('referrer').not('referrer', 'eq', '').order('viewed_at', { ascending: false }),
      supabase.from('project_views').select('project_id, project_title'),
      supabase.from('page_views').select('visitor_id', { count: 'exact', head: true }).gte('viewed_at', fiveMinAgo).not('visitor_id', 'eq', ''),
    ]);

    setTotalViews(totalViewsRes.count || 0);
    setDailyViews(dailyViewsRes.count || 0);
    setWeeklyViews(weeklyViewsRes.count || 0);
    setMonthlyViews(monthlyViewsRes.count || 0);

    setTotalDownloads(totalDownloadsRes.count || 0);
    setDownloadsToday(downloadsTodayRes.count || 0);
    setDownloadsWeek(downloadsWeekRes.count || 0);
    setDownloadsMonth(downloadsMonthRes.count || 0);

    setContactCount(contactRes.count || 0);
    setLiveVisitors(liveRes.count || 0);

    if (deviceRes.data) {
      const counts = { desktop: 0, mobile: 0, tablet: 0 };
      deviceRes.data.forEach(r => {
        const dt = (r.device_type || 'desktop').toLowerCase();
        if (dt === 'mobile') counts.mobile++;
        else if (dt === 'tablet') counts.tablet++;
        else counts.desktop++;
      });
      setDeviceStats(counts);
    }

    if (countriesRes.data) {
      const map = new Map<string, number>();
      countriesRes.data.forEach(r => {
        const c = r.country || 'Unknown';
        map.set(c, (map.get(c) || 0) + 1);
      });
      setTopCountries(
        [...map.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([country, visits]) => ({ country, visits }))
      );
    }

    if (referrerRes.data) {
      const map = new Map<string, number>();
      referrerRes.data.forEach(r => {
        let source = 'Direct';
        const ref = (r.referrer || '').toLowerCase();
        if (ref.includes('google')) source = 'Google';
        else if (ref.includes('linkedin')) source = 'LinkedIn';
        else if (ref.includes('github')) source = 'GitHub';
        else if (ref && ref !== 'direct') source = 'Other';
        map.set(source, (map.get(source) || 0) + 1);
      });
      setReferrerStats(
        [...map.entries()].sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }))
      );
    }

    if (projectViewsRes.data) {
      const map = new Map<string, { title: string; count: number }>();
      projectViewsRes.data.forEach(r => {
        const key = r.project_id || 'unknown';
        const existing = map.get(key);
        if (existing) {
          existing.count++;
        } else {
          map.set(key, { title: r.project_title || 'Unknown', count: 1 });
        }
      });

      const { data: projectNames } = await getProjects();
      const nameMap = new Map((projectNames || []).map(p => [p.id, p.name]));

      setProjectViewCounts(
        [...map.entries()].map(([id, info]) => ({
          id,
          name: nameMap.get(id) || info.title,
          views: info.count,
        })).sort((a, b) => b.views - a.views)
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();

    const channel = supabase.channel('analytics_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_views' }, () => loadAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_views' }, () => loadAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'resume_downloads' }, () => loadAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_submissions' }, () => loadAll())
      .subscribe();

    const interval = setInterval(loadAll, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [loadAll]);

  const deviceTotal = deviceStats.desktop + deviceStats.mobile + deviceStats.tablet;
  const devicePct = (v: number) => deviceTotal > 0 ? Math.round((v / deviceTotal) * 100) : 0;

  const prevViews = totalViews > dailyViews ? totalViews - dailyViews : 0;
  const viewsChange = prevViews > 0 ? ((dailyViews - prevViews) / prevViews) * 100 : dailyViews > 0 ? 100 : 0;
  const viewsTrend: 'up' | 'down' | 'neutral' = viewsChange > 0 ? 'up' : viewsChange < 0 ? 'down' : 'neutral';

  const prevDls = totalDownloads > downloadsToday ? totalDownloads - downloadsToday : 0;
  const dlsChange = prevDls > 0 ? ((downloadsToday - prevDls) / prevDls) * 100 : downloadsToday > 0 ? 100 : 0;
  const dlsTrend: 'up' | 'down' | 'neutral' = dlsChange > 0 ? 'up' : dlsChange < 0 ? 'down' : 'neutral';

  const contactTrend: 'up' | 'down' | 'neutral' = contactCount > 0 ? 'up' : 'neutral';

  const stats: StatCardData[] = [
    { label: 'Portfolio Views', value: totalViews.toLocaleString(), change: `${viewsChange >= 0 ? '+' : ''}${viewsChange.toFixed(1)}%`, trend: viewsTrend, icon: Eye },
    { label: 'Resume Downloads', value: totalDownloads.toLocaleString(), change: `${dlsChange >= 0 ? '+' : ''}${dlsChange.toFixed(1)}%`, trend: dlsTrend, icon: Download },
    { label: 'Contact Messages', value: contactCount.toLocaleString(), change: contactCount > 0 ? '+1' : '0', trend: contactTrend, icon: MessageSquare },
    { label: 'Live Visitors', value: String(liveVisitors), change: liveVisitors > 0 ? 'Now' : 'None', trend: liveVisitors > 0 ? 'up' : 'neutral', icon: Users },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="bg-gray-800 rounded-xl h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl h-64" />
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl h-40" />
          <div className="bg-gray-800 rounded-xl h-40" />
        </div>
      </div>
    </div>
  );

  const noData = totalViews === 0 && totalDownloads === 0 && contactCount === 0;

  if (noData) return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Portfolio performance and visitor insights</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-300 mb-1">No analytics data yet</h3>
        <p className="text-sm text-gray-500">Data will appear here once visitors start interacting with your portfolio.</p>
      </div>
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

      {/* Time-based sub-cards for Portfolio Views */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{dailyViews.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Today</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{weeklyViews.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">This Week</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{monthlyViews.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">This Month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Views */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Project Views</h3>
            {projectViewCounts.length > 0 && (
              <span className="text-[10px] text-gray-500 ml-auto">{projectViewCounts.reduce((a, b) => a + b.views, 0)} total</span>
            )}
          </div>
          {projectViewCounts.length > 0 ? (
            <div className="space-y-3">
              {projectViewCounts.map((p, i) => {
                const maxViews = Math.max(...projectViewCounts.map(x => x.views), 1);
                const barWidth = (p.views / maxViews) * 100;
                return (
                  <div key={p.id || i} className="flex items-center gap-3">
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MousePointerClick className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-xs">No project views yet</p>
            </div>
          )}
        </div>

        {/* Device + Geography */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Monitor className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Devices</h3>
              {deviceTotal > 0 && <span className="text-[10px] text-gray-500 ml-auto">{deviceTotal} views</span>}
            </div>
            {deviceTotal > 0 ? (
              <div className="space-y-3">
                {[
                  { label: 'Desktop', value: devicePct(deviceStats.desktop), icon: Monitor, raw: deviceStats.desktop },
                  { label: 'Mobile', value: devicePct(deviceStats.mobile), icon: Smartphone, raw: deviceStats.mobile },
                  { label: 'Tablet', value: devicePct(deviceStats.tablet), icon: Tablet, raw: deviceStats.tablet },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <d.icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-300">{d.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {d.value > 0 || deviceTotal === 0 ? `${d.value}%` : '0%'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500/60 transition-all" style={{ width: `${d.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">No device data yet</div>
            )}
          </div>

          {/* Geography */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Geography</h3>
            </div>
            {topCountries.length > 0 ? (
              <div className="space-y-2.5">
                {topCountries.map(l => (
                  <div key={l.country} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{l.country}</span>
                    <span className="text-xs text-gray-500">{l.visits.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">No location data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Referrers + Downloads breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrers */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
          </div>
          {referrerStats.length > 0 ? (
            <div className="space-y-3">
              {referrerStats.map(r => {
                const totalRefs = referrerStats.reduce((a, b) => a + b.count, 0);
                const pct = totalRefs > 0 ? Math.round((r.count / totalRefs) * 100) : 0;
                return (
                  <div key={r.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300">{r.source}</span>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500/60 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-xs">No traffic source data yet</div>
          )}
        </div>

        {/* Downloads Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <Download className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Resume Downloads</h3>
          </div>
          {totalDownloads > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                <p className="text-xl font-bold text-white">{downloadsToday.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 mt-1">Today</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                <p className="text-xl font-bold text-white">{downloadsWeek.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 mt-1">This Week</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                <p className="text-xl font-bold text-white">{downloadsMonth.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 mt-1">This Month</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-xs">No downloads yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
