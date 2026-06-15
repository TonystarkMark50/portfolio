import { supabase } from './supabase';

const VISITOR_ID_KEY = 'portfolio_visitor_id';
const GEO_KEY = 'portfolio_geo_cache';

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getStoredGeo(): { country: string; city: string } | null {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > 86400000) {
      localStorage.removeItem(GEO_KEY);
      return null;
    }
    return { country: data.country, city: data.city };
  } catch {
    return null;
  }
};

async function fetchGeo(): Promise<{ country: string; city: string }> {
  const stored = getStoredGeo();
  if (stored) return stored;
  try {
    const res = await fetch('https://ip-api.com/json/?fields=country,city');
    const data = await res.json();
    const result = { country: data.country || 'Unknown', city: data.city || 'Unknown' };
    localStorage.setItem(GEO_KEY, JSON.stringify({ ...result, ts: Date.now() }));
    return result;
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

export function getDeviceType(): string {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk|android(?!.*mobi)/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

export async function trackPageView(pageName: string): Promise<void> {
  try {
    const visitorId = getVisitorId();
    const deviceType = getDeviceType();
    const geo = await fetchGeo();
    const referrer = document.referrer || 'direct';

    await supabase.from('page_views').insert({
      page_path: pageName,
      visitor_id: visitorId,
      user_ip: '',
      country: geo.country,
      city: geo.city,
      device_type: deviceType,
      referrer,
    });
  } catch (err) {
    console.error('trackPageView error:', err);
  }
}

export async function trackProjectView(projectId: string, projectTitle: string): Promise<void> {
  try {
    const deviceType = getDeviceType();
    const geo = await fetchGeo();

    await supabase.from('project_views').insert({
      project_id: projectId,
      project_title: projectTitle,
      user_ip: '',
      country: geo.country,
      city: geo.city,
      device_type: deviceType,
      referrer: document.referrer || 'direct',
    });
  } catch (err) {
    console.error('trackProjectView error:', err);
  }
}

export async function trackResumeDownload(): Promise<void> {
  try {
    const deviceType = getDeviceType();
    const geo = await fetchGeo();

    await supabase.from('resume_downloads').insert({
      user_ip: '',
      device_type: deviceType,
      country: geo.country,
      city: geo.city,
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct',
    });
  } catch (err) {
    console.error('trackResumeDownload error:', err);
  }
}
