import { useState, useEffect, FormEvent } from 'react';
import { Save, User } from 'lucide-react';
import { getProfile, upsertProfile, Profile } from '../../lib/api';

export default function AdminProfile() {
  const [form, setForm] = useState<Partial<Profile>>({
    name: '', title: '', subtitle: '', location: '', email: '', linkedin: '', github: '', portfolio_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then(({ data }) => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await upsertProfile(form);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  const fields: { label: string; key: keyof typeof form; placeholder: string }[] = [
    { label: 'Name', key: 'name', placeholder: 'Jagadeesh T' },
    { label: 'Title', key: 'title', placeholder: 'Biomedical Engineering Student' },
    { label: 'Subtitle', key: 'subtitle', placeholder: 'Short tagline' },
    { label: 'Location', key: 'location', placeholder: 'Chennai, Tamil Nadu, India' },
    { label: 'Email', key: 'email', placeholder: 'email@example.com' },
    { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
    { label: 'GitHub URL', key: 'github', placeholder: 'https://github.com/...' },
    { label: 'Portfolio URL', key: 'portfolio_url', placeholder: 'https://...' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-dark-700">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{form.name || 'Your Name'}</p>
            <p className="text-sm text-gray-500">{form.title || 'Your Title'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
              <input
                type="text"
                value={String(form[field.key] ?? '')}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder={field.placeholder}
                autoComplete="off"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
