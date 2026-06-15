import { useState, useEffect, FormEvent, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Upload, Image as ImageIcon, ExternalLink, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';
import { getCertifications, upsertCertification, deleteCertification, Certification } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

const LOGO_BUCKET = 'certification-logos';

async function uploadLogo(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('Logo upload failed:', error); return null; }
  const { data: { publicUrl } } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(fileName);
  return publicUrl;
}

export default function AdminCertifications() {
  const [items, setItems] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Partial<Certification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getCertifications();
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.title || !editing.organization) { addToast('error', 'Title and Organization are required'); return; }
    setSaving(true);
    const { error } = await upsertCertification(editing);
    if (!error) addToast('success', editing.id ? 'Certification updated' : 'Certification added');
    else addToast('error', 'Save failed');
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certification?')) return;
    await deleteCertification(id);
    addToast('success', 'Certification deleted');
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

  const verifiedCount = items.filter(c => c.certificate_url).length;
  const missingLinkCount = items.filter(c => !c.certificate_url).length;

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-dark-700 rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certifications</h2>
          <p className="text-sm text-gray-500 mt-1">{items.length} total • {verifiedCount} verified • {missingLinkCount} need links</p>
        </div>
        <button onClick={() => setEditing({ title: '', organization: '', display_order: items.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(cert => (
          <div key={cert.id} className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-dark-600">
                {cert.logo_url ? (
                  <img src={cert.logo_url} alt="" className="w-full h-full object-contain p-1.5" />
                ) : (
                  <AwardIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{cert.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{cert.organization}{cert.platform ? ` · ${cert.platform}` : ''}</p>
                  </div>
                  {cert.certificate_url ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 text-[10px] font-medium shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 text-[10px] font-medium shrink-0">
                      <ShieldAlert className="w-3 h-3" /> No Link
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                  {cert.issue_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {cert.issue_date}</span>}
                  {cert.credential_id && <span>ID: {cert.credential_id.slice(0, 12)}...</span>}
                </div>
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cert.skills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-[10px] text-gray-500">{s}</span>)}
                    {cert.skills.length > 4 && <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-[10px] text-gray-400">+{cert.skills.length - 4}</span>}
                  </div>
                )}
                {cert.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{cert.description}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-dark-700">
              {cert.certificate_url && (
                <a href={cert.certificate_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-primary-500 transition-colors" title="View Certificate">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button onClick={() => setEditing(cert)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(cert.id)} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-gray-400 hover:text-error-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <AwardIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No certifications yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Certification" to showcase your credentials</p>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-800 shadow-2xl animate-slide-right overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id ? 'Edit Certification' : 'Add Certification'}</h3>
                <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                  <input type="text" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Organization</label>
                  <input type="text" value={editing.organization || ''} onChange={e => setEditing({ ...editing, organization: e.target.value })} className="w-full px-3 py-2 rounded-xl border" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Platform</label>
                  <input type="text" value={editing.platform || ''} onChange={e => setEditing({ ...editing, platform: e.target.value })} className="w-full px-3 py-2 rounded-xl border" placeholder="HackerRank, Coursera..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Issue Date</label>
                  <input type="text" value={editing.issue_date || ''} onChange={e => setEditing({ ...editing, issue_date: e.target.value })} className="w-full px-3 py-2 rounded-xl border" placeholder="2025" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Certificate URL <span className="text-error-500">*</span></label>
                <input type="url" value={editing.certificate_url || ''} onChange={e => setEditing({ ...editing, certificate_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border" required placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Credential ID</label>
                  <input type="text" value={editing.credential_id || ''} onChange={e => setEditing({ ...editing, credential_id: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                  <input type="text" value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border" placeholder="Programming" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Issuer Logo</label>
                <div className="flex items-center gap-3">
                  {editing.logo_url ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-700 border">
                      <img src={editing.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                      <button type="button" onClick={() => setEditing({ ...editing, logo_url: '' })} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-error-500 text-white flex items-center justify-center text-[10px]">×</button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-dark-700 border flex items-center justify-center text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 transition-colors">
                    <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Skills (one per line)</label>
                <textarea value={(editing.skills || []).join('\n')} onChange={e => setEditing({ ...editing, skills: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded-xl border" rows={4} />
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 pt-4 -mx-6 px-6 pb-0">
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 shadow-sm transition-colors">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
