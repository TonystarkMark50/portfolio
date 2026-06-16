import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface CountryStat {
  country: string;
  visits: number;
}

export interface TrafficSource {
  source: string;
  count: number;
}

export interface PageViewsByPath {
  path: string;
  views: number;
}

export interface AnalyticsData {
  totalViews: number;
  dailyViews: number;
  weeklyViews: number;
  monthlyViews: number;
  deviceStats: DeviceStats;
  topCountries: CountryStat[];
  referrerStats: TrafficSource[];
  recentPages: PageViewsByPath[];
  fetchedAt: string;
}

function getStartOfDay(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function getStartOfWeek(): string {
  return new Date(Date.now() - 7 * 86_400_000).toISOString();
}

function getStartOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function classifyReferrer(referrer: string): string {
  const ref = referrer.toLowerCase();
  if (!ref || ref === 'direct' || ref === '') return 'Direct';
  if (ref.includes('google')) return 'Google';
  if (ref.includes('linkedin')) return 'LinkedIn';
  if (ref.includes('github')) return 'GitHub';
  if (ref.includes('twitter') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('facebook') || ref.includes('fb.com')) return 'Facebook';
  if (ref.includes('instagram')) return 'Instagram';
  return 'Other';
}

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const now = new Date();
  const startOfDay = getStartOfDay();
  const startOfWeek = getStartOfWeek();
  const startOfMonth = getStartOfMonth();

  const [
    totalViewsRes,
    dailyViewsRes,
    weeklyViewsRes,
    monthlyViewsRes,
    deviceRes,
    countriesRes,
    referrerRes,
    recentPagesRes,
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', startOfDay),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', startOfWeek),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', startOfMonth),
    supabase.from('page_views').select('device_type'),
    supabase.from('page_views').select('country').not('country', 'eq', 'Unknown').not('country', 'eq', ''),
    supabase.from('page_views').select('referrer').not('referrer', 'eq', ''),
    supabase.from('page_views').select('page_path').order('viewed_at', { ascending: false }).limit(1000),
  ]);

  const totalViews = totalViewsRes.count ?? 0;
  const dailyViews = dailyViewsRes.count ?? 0;
  const weeklyViews = weeklyViewsRes.count ?? 0;
  const monthlyViews = monthlyViewsRes.count ?? 0;

  const deviceStats: DeviceStats = { desktop: 0, mobile: 0, tablet: 0 };
  if (deviceRes.data) {
    for (const row of deviceRes.data) {
      const dt = (row.device_type as string ?? 'desktop').toLowerCase();
      if (dt === 'mobile') deviceStats.mobile++;
      else if (dt === 'tablet') deviceStats.tablet++;
      else deviceStats.desktop++;
    }
  }

  const countryMap = new Map<string, number>();
  if (countriesRes.data) {
    for (const row of countriesRes.data) {
      const c = row.country as string ?? 'Unknown';
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1);
    }
  }
  const topCountries: CountryStat[] = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, visits]) => ({ country, visits }));

  const referrerMap = new Map<string, number>();
  if (referrerRes.data) {
    for (const row of referrerRes.data) {
      const source = classifyReferrer(row.referrer as string ?? '');
      referrerMap.set(source, (referrerMap.get(source) ?? 0) + 1);
    }
  }
  const referrerStats: TrafficSource[] = [...referrerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));

  const pageMap = new Map<string, number>();
  if (recentPagesRes.data) {
    for (const row of recentPagesRes.data) {
      const path = row.page_path as string ?? '/';
      pageMap.set(path, (pageMap.get(path) ?? 0) + 1);
    }
  }
  const recentPages: PageViewsByPath[] = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([path, views]) => ({ path, views }));

  return {
    totalViews,
    dailyViews,
    weeklyViews,
    monthlyViews,
    deviceStats,
    topCountries,
    referrerStats,
    recentPages,
    fetchedAt: now.toISOString(),
  };
}

export async function recordPageView(path: string): Promise<void> {
  try {
    const visitorId = crypto.randomUUID();
    const deviceType = detectDeviceType();

    await supabase.from('page_views').insert({
      page_path: path,
      visitor_id: visitorId,
      user_ip: '',
      device_type: deviceType,
      referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
    });
  } catch (err) {
    logger.error('recordPageView error:', err);
  }
}

function detectDeviceType(): string {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk|android(?!.*mobi)/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'mobile';
  return 'desktop';
}
