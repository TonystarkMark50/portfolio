import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Search,
  Eye,
  Save,
  Image,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SEOData {
  site_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_image_alt: string;
  linkedin_url: string;
  author: string;
  canonical_url: string;
  keywords: string;
  robots: string;
  theme_color: string;
}

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

interface Props {
  onNavigate?: (tab: string) => void;
}

const META_DESC_MAX = 160;
const OG_DESC_MAX = 300;

function charCountColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio > 0.9) return 'text-red-400';
  if (ratio > 0.75) return 'text-amber-400';
  return 'text-gray-500';
}

export default function SEOManager(_props: Props) {
  const [seo, setSEO] = useState<SEOData>({
    site_title: 'Jagadeesh T | Biomedical Engineering Student',
    meta_description: 'Biomedical Engineering student passionate about healthcare technology, medical devices, IoT solutions, AI-powered healthcare systems, and innovative engineering projects. Explore my portfolio, internships, certifications, and technical achievements.',
    og_title: 'Jagadeesh T Portfolio | Biomedical Engineering & Healthcare Technology',
    og_description: 'Explore my Biomedical Engineering journey, healthcare technology projects, internships, certifications, technical skills, and innovative solutions in medical technology and IoT systems.',
    og_image_url: '',
    og_image_alt: 'Jagadeesh T - Biomedical Engineering Portfolio',
    linkedin_url: '',
    author: 'Jagadeesh T',
    canonical_url: 'https://portfolio-jagadeesh-t.netlify.app/',
    keywords: 'Biomedical Engineering, Healthcare Technology, Medical Devices, IoT Healthcare, Biomedical Student, Medical Technology, Engineering Portfolio, Healthcare Innovation, Biomedical Projects, Internet of Things, Clinical Engineering, Medical Equipment, Biomedical Intern, Healthcare Systems, Engineering Student, Portfolio Website',
    robots: 'index, follow',
    theme_color: '#2563EB',
  });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        rowIdRef.current = data.id;
        setSEO({
          site_title: data.site_title ?? 'Jagadeesh T | Biomedical Engineering Student',
          meta_description: data.meta_description ?? 'Biomedical Engineering student passionate about healthcare technology, medical devices, IoT solutions, AI-powered healthcare systems, and innovative engineering projects. Explore my portfolio, internships, certifications, and technical achievements.',
          og_title: data.og_title ?? 'Jagadeesh T Portfolio | Biomedical Engineering & Healthcare Technology',
          og_description: data.og_description ?? 'Explore my Biomedical Engineering journey, healthcare technology projects, internships, certifications, technical skills, and innovative solutions in medical technology and IoT systems.',
          og_image_url: data.og_image_url ?? '',
          og_image_alt: data.og_image_alt ?? 'Jagadeesh T - Biomedical Engineering Portfolio',
          linkedin_url: data.linkedin_url ?? '',
          author: data.author ?? 'Jagadeesh T',
          canonical_url: data.canonical_url ?? 'https://portfolio-jagadeesh-t.netlify.app/',
          keywords: data.keywords ?? 'Biomedical Engineering, Healthcare Technology, Medical Devices, IoT Healthcare, Biomedical Student, Medical Technology, Engineering Portfolio, Healthcare Innovation, Biomedical Projects, Internet of Things, Clinical Engineering, Medical Equipment, Biomedical Intern, Healthcare Systems, Engineering Student, Portfolio Website',
          robots: data.robots ?? 'index, follow',
          theme_color: data.theme_color ?? '#2563EB',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load SEO data';
      setSaveState({ status: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback(
    (field: keyof SEOData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setSEO((prev) => ({ ...prev, [field]: value }));

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          return;
        }

        setSaveState({ status: 'saving' });
        debounceRef.current = setTimeout(() => saveSEO({ ...seo, [field]: value }), 1000);
      },
    [seo],
  );

  const rowIdRef = useRef<string | null>(null);

  const saveSEO = async (data: SEOData) => {
    try {
      if (!rowIdRef.current) {
        const { data: existing } = await supabase
          .from('site_settings')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (existing?.id) {
          rowIdRef.current = existing.id;
        }
      }

      const dbFields = {
        site_title: data.site_title,
        seo_description: data.meta_description,
        seo_keywords: data.keywords,
        og_title: data.og_title,
        og_description: data.og_description,
        og_image_url: data.og_image_url,
        og_image_alt: data.og_image_alt,
        linkedin_url: data.linkedin_url,
        author: data.author,
        canonical_url: data.canonical_url,
        robots: data.robots,
        theme_color: data.theme_color,
        updated_at: new Date().toISOString(),
      };

      if (rowIdRef.current) {
        const { error } = await supabase
          .from('site_settings')
          .update(dbFields)
          .eq('id', rowIdRef.current);
        if (error) {
          const { error: retryErr } = await supabase
            .from('site_settings')
            .update({ site_title: dbFields.site_title, seo_description: dbFields.seo_description, seo_keywords: dbFields.seo_keywords, updated_at: dbFields.updated_at })
            .eq('id', rowIdRef.current);
          if (retryErr) throw retryErr;
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('site_settings')
          .insert(dbFields)
          .select('id')
          .single();
        if (error) {
          const { data: fallback, error: retryErr } = await supabase
            .from('site_settings')
            .insert({ site_title: dbFields.site_title, seo_description: dbFields.seo_description, seo_keywords: dbFields.seo_keywords, updated_at: dbFields.updated_at })
            .select('id')
            .single();
          if (retryErr) throw retryErr;
          if (fallback?.id) rowIdRef.current = fallback.id;
        } else {
          if (inserted?.id) rowIdRef.current = inserted.id;
        }
      }
      setSaveState({ status: 'saved', message: 'Auto-saved' });
      setTimeout(() => {
        setSaveState((prev) =>
          prev.status === 'saved' ? { status: 'idle' } : prev,
        );
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setSaveState({ status: 'error', message: msg });
    }
  };

  const googlePreviewUrl = seo.site_title
    ? seo.site_title.toLowerCase().replace(/\s+/g, '-') + '.com'
    : 'example.com';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-gray-400">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            SEO Manager
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Optimize your site for search engines and social sharing
          </p>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-xs">
          {saveState.status === 'saving' && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          )}
          {saveState.status === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveState.message}
            </span>
          )}
          {saveState.status === 'error' && (
            <span className="flex items-center gap-1.5 text-red-400">
              <XCircle className="w-3.5 h-3.5" />
              {saveState.message}
            </span>
          )}
          {saveState.status === 'idle' && (
            <span className="text-gray-600">
              <Save className="w-3.5 h-3.5 inline mr-1" />
              All changes saved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Site Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Globe className="w-4 h-4 text-gray-500" />
              Site Title
            </label>
            <input
              type="text"
              value={seo.site_title}
              onChange={handleChange('site_title')}
              placeholder="My Portfolio"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Search className="w-4 h-4 text-gray-500" />
              Meta Description
            </label>
            <textarea
              value={seo.meta_description}
              onChange={handleChange('meta_description')}
              placeholder="Brief description of your portfolio site..."
              rows={3}
              maxLength={META_DESC_MAX + 50}
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs font-medium ${charCountColor(
                  seo.meta_description.length,
                  META_DESC_MAX,
                )}`}
              >
                {seo.meta_description.length}/{META_DESC_MAX}
              </span>
            </div>
          </div>

          {/* OG Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Eye className="w-4 h-4 text-gray-500" />
              OG Title
            </label>
            <input
              type="text"
              value={seo.og_title}
              onChange={handleChange('og_title')}
              placeholder="Title for social sharing"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* OG Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Eye className="w-4 h-4 text-gray-500" />
              OG Description
            </label>
            <textarea
              value={seo.og_description}
              onChange={handleChange('og_description')}
              placeholder="Description for social sharing..."
              rows={3}
              maxLength={OG_DESC_MAX + 50}
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs font-medium ${charCountColor(
                  seo.og_description.length,
                  OG_DESC_MAX,
                )}`}
              >
                {seo.og_description.length}/{OG_DESC_MAX}
              </span>
            </div>
          </div>

          {/* OG Image URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Image className="w-4 h-4 text-gray-500" />
              OG Image URL
            </label>
            <input
              type="url"
              value={seo.og_image_url}
              onChange={handleChange('og_image_url')}
              placeholder="https://example.com/og-image.png"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
            {seo.og_image_url && (
              <div className="mt-2 w-full max-w-xs aspect-[1.91/1] rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                <img
                  src={seo.og_image_url}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={seo.linkedin_url}
              onChange={handleChange('linkedin_url')}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4" />
              Google Search Preview
            </h3>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 shadow-lg"
            >
              {/* URL */}
              <p className="text-[14px] text-green-700 leading-tight truncate">
                {googlePreviewUrl}
              </p>

              {/* Title */}
              <p className="text-[18px] text-blue-800 leading-tight font-normal mt-0.5 cursor-pointer hover:underline truncate">
                {seo.site_title || 'Site Title'}
              </p>

              {/* Description */}
              <p className="text-[14px] text-gray-600 leading-5 mt-0.5 line-clamp-2">
                {seo.meta_description ||
                  'Your meta description will appear here...'}
              </p>
            </motion.div>

            {/* Social Preview Hint */}
            <div className="mt-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                Social Share Preview
              </h4>
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                {seo.og_image_url ? (
                  <div className="aspect-[1.91/1] bg-gray-700">
                    <img
                      src={seo.og_image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] bg-gray-700 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <p className="text-[11px] text-gray-500 uppercase truncate">
                    {googlePreviewUrl}
                  </p>
                  <p className="text-[13px] font-medium text-gray-200 leading-tight truncate">
                    {seo.og_title || seo.site_title || 'Your Site Title'}
                  </p>
                  <p className="text-[12px] text-gray-400 leading-4 line-clamp-2">
                    {seo.og_description ||
                      seo.meta_description ||
                      'Your OG description will appear here...'}
                  </p>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              Author
            </label>
            <input
              type="text"
              value={seo.author}
              onChange={handleChange('author')}
              placeholder="Author name"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              Canonical URL
            </label>
            <input
              type="url"
              value={seo.canonical_url}
              onChange={handleChange('canonical_url')}
              placeholder="https://your-domain.netlify.app"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* OG Image Alt */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              OG Image Alt Text
            </label>
            <input
              type="text"
              value={seo.og_image_alt}
              onChange={handleChange('og_image_alt')}
              placeholder="Alt text for OG image"
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              Keywords
            </label>
            <textarea
              value={seo.keywords}
              onChange={handleChange('keywords')}
              placeholder="keyword1, keyword2, keyword3"
              rows={3}
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
            />
          </div>

          {/* Robots */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              Robots
            </label>
            <select
              value={seo.robots}
              onChange={handleChange('robots')}
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            >
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>

          {/* Theme Color */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={seo.theme_color}
                onChange={handleChange('theme_color')}
                className="w-10 h-10 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={seo.theme_color}
                onChange={handleChange('theme_color')}
                placeholder="#2563EB"
                className="flex-1 px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
