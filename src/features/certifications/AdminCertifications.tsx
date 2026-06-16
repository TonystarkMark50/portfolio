import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Award, ShieldCheck, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { getCertifications, upsertCertification, deleteCertification, Certification } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ContentEditor, { InlineField, InlineTags, InlineUrlButton, useAutoSave } from '../../components/admin/ContentEditor';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { ConfirmAction } from '../../components/ConfirmationModal';

const LOGO_BUCKET = 'certification-logos';

export default function AdminCertifications() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { addToast } = useToast();
  const [confirm, setConfirm] = useState<{ open: boolean; action: ConfirmAction; onConfirm: () => void }>({ open: false, action: { title: '', message: '' }, onConfirm: () => {} });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getCertifications();
    if (data) setItems(data);
    setLoading(false);
  }

  const save = async () => {
    for (const item of items) {
      const { error } = await upsertCertification(item);
      if (error) throw error;
    }
  };

  const { status, triggerSave } = useAutoSave(save);

  async function updateField(id: string, key: keyof Certification, val: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
    triggerSave();
  }

  async function addCert() {
    await upsertCertification({ title: 'New Certification', organization: 'Organization', display_order: items.length } as any);
    load();
  }

  function removeCert(id: string) {
    const item = items.find(i => i.id === id);
    setConfirm({
      open: true,
      action: {
        title: 'Delete Certification',
        message: `Delete "${item?.title || 'this certification'}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'danger',
        icon: 'trash',
      },
      onConfirm: async () => {
        await deleteCertification(id);
        load();
      },
    });
  }

  async function handleLogoUpload(id: string, file: File) {
    setUploadingId(id);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(LOGO_BUCKET).upload(fileName, file);
    if (error) { addToast('error', 'Upload failed'); setUploadingId(null); return; }
    const { data: { publicUrl } } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(fileName);
    await updateField(id, 'logo_url', publicUrl);
    setUploadingId(null);
    addToast('success', 'Logo uploaded');
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <>
    <ConfirmationModal open={confirm.open} action={confirm.action} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(prev => ({ ...prev, open: false }))} />
    <ContentEditor section="certifications" title="Certifications" subtitle="Your certifications and credentials" status={status}
      actions={
        <button onClick={addCert} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Certification
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No certifications yet</p>
          <button onClick={addCert} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add certification</button>
        </div>
      ) : items.map(item => (
        <div key={item.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3 group">
          <div className="flex items-start justify-between gap-3">
            {/* Logo */}
            <div className="relative w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-700">
              {item.logo_url ? (
                <img src={item.logo_url} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <ImageIcon className="w-5 h-5 text-gray-500" />
              )}
              <input type="file" ref={el => fileRefs.current[item.id] = el} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(item.id, f); }} />
              <button onClick={() => fileRefs.current[item.id]?.click()} disabled={uploadingId === item.id} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-white">
                {uploadingId === item.id ? '...' : 'Upload'}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <InlineField value={item.title} onSave={v => updateField(item.id, 'title', v)} placeholder="Certification title" className="text-sm font-medium" />
              <InlineField value={item.organization} onSave={v => updateField(item.id, 'organization', v)} placeholder="Issuing organization" className="text-xs text-gray-400" />
            </div>
            <div className="flex items-center gap-1">
              {item.certificate_url ? (
                <span className="text-emerald-400" title="Verified"><ShieldCheck className="w-4 h-4" /></span>
              ) : (
                <span className="text-amber-400" title="No link"><ShieldAlert className="w-4 h-4" /></span>
              )}
              <button onClick={() => removeCert(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InlineField value={item.platform || ''} onSave={v => updateField(item.id, 'platform', v)} placeholder="Platform" label="Platform" />
            <InlineField value={item.issue_date || ''} onSave={v => updateField(item.id, 'issue_date', v)} placeholder="2025" label="Issue Date" />
          </div>
          <InlineUrlButton value={item.certificate_url || ''} onSave={v => updateField(item.id, 'certificate_url', v)} label="Certificate Link" />
          <InlineField value={item.credential_id || ''} onSave={v => updateField(item.id, 'credential_id', v)} placeholder="Credential ID" label="Credential ID" />
          <InlineTags tags={item.skills || []} onSave={v => updateField(item.id, 'skills', v)} label="Skills" />
        </div>
      ))}
    </ContentEditor>
    </>
  );
}
