import { useState, useEffect, useRef } from 'react';
import { Mail, MapPin, Link as LinkIcon, Github, Linkedin, Camera } from 'lucide-react';
import { getProfile, upsertProfile, Profile } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ContentEditor, { InlineField, useAutoSave } from './ContentEditor';

const PROFILE_BUCKET = 'profile-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed: JPG, JPEG, PNG, WEBP`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large. Maximum size: ${MAX_SIZE_MB}MB`;
  }
  return null;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

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

  async function handlePhotoUpload(file: File) {
    if (!profile) return;

    const validationError = validateImage(file);
    if (validationError) {
      addToast('error', validationError);
      return;
    }

    setUploading(true);
    console.log('Uploading image...', { name: file.name, size: file.size, type: file.type });

    try {
      const ext = file.name.split('.').pop();
      const fileName = `avatar.${ext}`;

      console.log('Upload config:', { bucket: PROFILE_BUCKET, fileName });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(PROFILE_BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload result:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from(PROFILE_BUCKET)
        .getPublicUrl(fileName);

      const cacheBustUrl = `${publicUrl}?t=${Date.now()}`;
      console.log('Public URL:', cacheBustUrl);

      const { error: dbError } = await upsertProfile({
        ...profile,
        avatar_url: cacheBustUrl,
      });

      if (dbError) {
        console.error('Database save error:', dbError);
        throw dbError;
      }

      console.log('Profile saved with avatar_url:', cacheBustUrl);

      setProfile({ ...profile, avatar_url: cacheBustUrl });
      addToast('success', 'Profile photo updated successfully');
    } catch (err) {
      console.error('Photo upload failed:', err);
      addToast('error', 'Failed to upload profile photo');
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;
  if (!profile) return <div className="text-gray-400">No profile data found</div>;

  return (
    <ContentEditor section="profile" title="Profile" subtitle="Your personal information — click any field to edit" status={status}>
      {/* Profile Card */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="px-5 pb-5 -mt-10">
          {/* Photo Upload */}
          <div className="relative w-20 h-20 mb-3 group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-gray-900 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (profile.name?.[0]?.toUpperCase() || '?')}
            </div>
            <input
              type="file"
              ref={fileRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs text-white font-medium disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  Upload
                </>
              )}
            </button>
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
