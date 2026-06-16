import { getSingle, upsert } from './helpers';
import type { ApiResult } from './helpers';

export interface SiteSettings {
  id: string;
  site_title: string;
  favicon_url: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  theme: string;
}

export async function getSiteSettings(): Promise<ApiResult<SiteSettings>> {
  return getSingle<SiteSettings>('site_settings');
}

export async function upsertSiteSettings(settings: Partial<SiteSettings>): Promise<ApiResult<SiteSettings>> {
  return upsert<SiteSettings>('site_settings', settings);
}
