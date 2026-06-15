import { useState, useEffect, FormEvent } from 'react';
import { Save, Globe, Search, Palette, Link as LinkIcon, Mail } from 'lucide-react';
import { getSiteSettings, upsertSiteSettings, SiteSettings } from '../../lib/api';
import { getContactInfo, upsertContactInfo, ContactInfo } from '../../lib/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    site_title: '', seo_description: '', seo_keywords: '', theme: 'light', favicon_url: '',
  });
  const [contact, setContact] = useState<Partial<ContactInfo>>({
    email: '', github: '', linkedin: '', location: '', portfolio_url: '', phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    async function load() {
      const [sRes, cRes] = await Promise.all([getSiteSettings(), getContactInfo()]);
      if (sRes.data) setSettings(sRes.data);
      if (cRes.data) setContact(cRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await upsertSiteSettings(settings);
    if (!error) { setSaveMsg('Settings saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    setSaving(false);
  }

  async function handleSaveContact(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await upsertContactInfo(contact);
    if (!error) { setSaveMsg('Contact saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    setSaving(false);
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Site Settings */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-dark-700">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Site Settings</h3>
              <p className="text-sm text-gray-500">Website title, SEO, and theme</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Globe className="w-4 h-4" /> Site Title
              </label>
              <input type="text" value={settings.site_title || ''} onChange={(e) => setSettings({ ...settings, site_title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Search className="w-4 h-4" /> SEO Description
              </label>
              <textarea value={settings.seo_description || ''} onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })} className="w-full px-3 py-2 rounded-lg border" rows={2} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Search className="w-4 h-4" /> SEO Keywords
              </label>
              <input type="text" value={settings.seo_keywords || ''} onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="biomedical, portfolio, resume" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Palette className="w-4 h-4" /> Theme
              </label>
              <select value={settings.theme || 'light'} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="w-full px-3 py-2 rounded-lg border">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Favicon URL
              </label>
              <input type="url" value={settings.favicon_url || ''} onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="https://..." />
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-700">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : saveMsg || 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-dark-700">
            <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-500">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Settings</h3>
              <p className="text-sm text-gray-500">Social links and contact details</p>
            </div>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input type="email" value={contact.email || ''} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <LinkIcon className="w-4 h-4" /> GitHub URL
              </label>
              <input type="url" value={contact.github || ''} onChange={(e) => setContact({ ...contact, github: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <LinkIcon className="w-4 h-4" /> LinkedIn URL
              </label>
              <input type="url" value={contact.linkedin || ''} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input type="text" value={contact.location || ''} onChange={(e) => setContact({ ...contact, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input type="text" value={contact.phone || ''} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-700">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : saveMsg || 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
