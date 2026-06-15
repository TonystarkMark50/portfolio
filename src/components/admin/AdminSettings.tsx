import { useState, useEffect } from 'react';
import { Globe, Search, Palette, Link as LinkIcon, Mail, Github, Linkedin, Save } from 'lucide-react';
import { getSiteSettings, upsertSiteSettings, getContactInfo, upsertContactInfo } from '../../lib/api';
import ContentEditor, { InlineField, InlineSelect, useAutoSave } from './ContentEditor';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({ site_title: '', seo_description: '', seo_keywords: '', theme: 'dark', favicon_url: '' });
  const [contact, setContact] = useState<any>({ email: '', github: '', linkedin: '', location: '', portfolio_url: '', phone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sRes, cRes] = await Promise.all([getSiteSettings(), getContactInfo()]);
      if (sRes.data) setSettings(sRes.data);
      if (cRes.data) setContact(cRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings() {
    await upsertSiteSettings(settings);
  }

  async function saveContact() {
    await upsertContactInfo(contact);
  }

  const { status: settingsStatus, triggerSave: triggerSettingsSave } = useAutoSave(saveSettings, [settings]);
  const { status: contactStatus, triggerSave: triggerContactSave } = useAutoSave(saveContact, [contact]);

  function updateSetting(key: string, val: string) {
    setSettings((prev: any) => ({ ...prev, [key]: val }));
    triggerSettingsSave();
  }

  function updateContact(key: string, val: string) {
    setContact((prev: any) => ({ ...prev, [key]: val }));
    triggerContactSave();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <ContentEditor section="settings" title="Settings" subtitle="Website configuration and social links" status={settingsStatus === 'idle' ? contactStatus : settingsStatus}>
      <div className="space-y-6">
        {/* Site Settings */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Site Settings</h3>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3">
            <InlineField value={settings.site_title || ''} onSave={v => updateSetting('site_title', v)} placeholder="Portfolio Title" label="Site Title" />
            <InlineField value={settings.seo_description || ''} onSave={v => updateSetting('seo_description', v)} type="textarea" placeholder="Meta description for SEO" label="SEO Description" />
            <InlineField value={settings.seo_keywords || ''} onSave={v => updateSetting('seo_keywords', v)} placeholder="keyword1, keyword2" label="SEO Keywords" />
            <InlineField value={settings.favicon_url || ''} onSave={v => updateSetting('favicon_url', v)} type="url" placeholder="https://..." label="Favicon URL" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Theme</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800 border border-gray-700">
                <Palette className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-300">Dark Mode Active</span>
                <span className="text-[10px] text-gray-500 ml-auto">Premium dark experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Mail className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Social Links</h3>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Mail className="w-3.5 h-3.5" />
              <InlineField value={contact.email || ''} onSave={v => updateContact('email', v)} type="email" placeholder="email@example.com" className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Github className="w-3.5 h-3.5" />
              <InlineField value={contact.github || ''} onSave={v => updateContact('github', v)} type="url" placeholder="https://github.com/..." className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Linkedin className="w-3.5 h-3.5" />
              <InlineField value={contact.linkedin || ''} onSave={v => updateContact('linkedin', v)} type="url" placeholder="https://linkedin.com/in/..." className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <LinkIcon className="w-3.5 h-3.5" />
              <InlineField value={contact.portfolio_url || ''} onSave={v => updateContact('portfolio_url', v)} type="url" placeholder="https://..." className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>📍</span>
              <InlineField value={contact.location || ''} onSave={v => updateContact('location', v)} placeholder="City, Country" className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>📞</span>
              <InlineField value={contact.phone || ''} onSave={v => updateContact('phone', v)} placeholder="Phone number" className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </ContentEditor>
  );
}
