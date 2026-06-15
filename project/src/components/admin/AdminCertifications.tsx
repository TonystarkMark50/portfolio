import { useState, useEffect, FormEvent, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { getCertifications, upsertCertification, deleteCertification, Certification } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const LOGO_BUCKET = 'certification-logos';

async function uploadLogo(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) { console.error('Logo upload failed:', error); return null; }
  const { data: { publicUrl } } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(fileName);
  return publicUrl;
}

export default function AdminCertifications() {
  const [items, setItems] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Partial<Certification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getCertifications();
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.title || !editing.organization) {
      alert('Title and Organization are required.');
      return;
    }
    if (!editing.certificate_url) {
      alert('Certificate URL is required. A real certification must have a verifiable certificate link.');
      return;
    }
    await upsertCertification(editing);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certification?')) return;
    await deleteCertification(id);
    load();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const url = await uploadLogo(file);
    if (url) setEditing({ ...editing, logo_url: url });
    setUploading(false);
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certifications</h2>
        <button onClick={() => setEditing({ title: '', organization: '', display_order: items.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      <div className="space-y-4">
        {items.map((cert) => (
          <div key={cert.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {cert.logo_url && (
                  <img src={cert.logo_url} alt="" className="w-10 h-10 rounded-lg object-contain bg-gray-100 dark:bg-dark-700 p-1" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cert.title}</h3>
                  <p className="text-sm text-gray-500">{cert.organization}{cert.platform ? ` — ${cert.platform}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(cert)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cert.id)} className="p-2 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold">{editing.id ? 'Edit Certification' : 'Add Certification'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                  <input type="text" value={editing.organization || ''} onChange={(e) => setEditing({ ...editing, organization: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                  <input type="text" value={editing.platform || ''} onChange={(e) => setEditing({ ...editing, platform: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="HackerRank, Coursera..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                  <input type="text" value={editing.issue_date || ''} onChange={(e) => setEditing({ ...editing, issue_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="2025" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credential ID</label>
                  <input type="text" value={editing.credential_id || ''} onChange={(e) => setEditing({ ...editing, credential_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate URL <span className="text-red-500">*</span></label>
                  <input type="url" value={editing.certificate_url || ''} onChange={(e) => setEditing({ ...editing, certificate_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border" required placeholder="https://..." />
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issuer Logo</label>
                <div className="flex items-center gap-3">
                  {editing.logo_url ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-700 border">
                      <img src={editing.logo_url} alt="Logo preview" className="w-full h-full object-contain p-1" />
                      <button type="button" onClick={() => setEditing({ ...editing, logo_url: '' })} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error-500 text-white flex items-center justify-center text-xs">×</button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-dark-700 border flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 text-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input type="text" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="Programming, Database Management..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (one per line)</label>
                <textarea value={(editing.skills || []).join('\n')} onChange={(e) => setEditing({ ...editing, skills: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" rows={4} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white"><Save className="w-4 h-4" /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
