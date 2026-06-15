import { useState, useEffect } from 'react';
import { Mail, MapPin, Link as LinkIcon, Github, Linkedin } from 'lucide-react';
import { getProfile, upsertProfile, Profile } from '../../lib/api';
import ContentEditor, { InlineField, useAutoSave } from './ContentEditor';

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(({ data }) => { if (data) setProfile(data); setLoading(false); });
  }, []);

  const save = async () => {
    if (!profile) return;
    const { error } = await upsertProfile(profile);
    if (error) throw error;
  };

  const { status, triggerSave } = useAutoSave(save);

  function update(key: keyof Profile, val: string) {
    if (!profile) return;
    setProfile({ ...profile, [key]: val });
    triggerSave();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;
  if (!profile) return <div className="text-gray-400">No profile data found</div>;

  return (
    <ContentEditor section="profile" title="Profile" subtitle="Your personal information — click any field to edit" status={status}>
      {/* Profile Card */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="px-5 pb-5 -mt-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-gray-900 overflow-hidden mb-3">
            {profile.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (profile.name?.[0]?.toUpperCase() || '?')}
          </div>
          <div className="space-y-3">
            <InlineField value={profile.name || ''} onSave={v => update('name', v)} placeholder="Your name" label="Name" />
            <InlineField value={profile.title || ''} onSave={v => update('title', v)} placeholder="Your title" label="Title" />
            <InlineField value={profile.subtitle || ''} onSave={v => update('subtitle', v)} placeholder="Short tagline" label="Subtitle" />
            <div className="h-px bg-gray-800 my-2" />
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Mail className="w-3.5 h-3.5" />
              <InlineField value={profile.email || ''} onSave={v => update('email', v)} type="email" placeholder="email@example.com" className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <InlineField value={profile.location || ''} onSave={v => update('location', v)} placeholder="City, Country" className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Github className="w-3.5 h-3.5" />
              <InlineField value={profile.github || ''} onSave={v => update('github', v)} type="url" placeholder="https://github.com/..." className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Linkedin className="w-3.5 h-3.5" />
              <InlineField value={profile.linkedin || ''} onSave={v => update('linkedin', v)} type="url" placeholder="https://linkedin.com/in/..." className="flex-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <LinkIcon className="w-3.5 h-3.5" />
              <InlineField value={profile.portfolio_url || ''} onSave={v => update('portfolio_url', v)} type="url" placeholder="https://..." className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </ContentEditor>
  );
}
