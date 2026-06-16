import { useState, useEffect, useRef } from 'react';
import { Upload, Image, FileText, Trash2, Copy, Check, ExternalLink, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import logger from '../../utils/logger';
import ConfirmationModal from '../ConfirmationModal';
import type { ConfirmAction } from '../ConfirmationModal';
import { validateImageFile, generateSafeFileName } from '../../utils/fileValidation';

interface MediaItem {
  name: string;
  url: string;
  updated_at: string;
  size?: number;
}

const BUCKETS = ['certification-logos', 'project-images', 'resume-assets'];

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [activeBucket, setActiveBucket] = useState('certification-logos');
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [confirm, setConfirm] = useState<{ open: boolean; action: ConfirmAction; onConfirm: () => void }>({ open: false, action: { title: '', message: '' }, onConfirm: () => {} });

  useEffect(() => { loadBucket(activeBucket); }, [activeBucket]);

  async function loadBucket(bucket: string) {
    setLoading(true);
    const { data, error } = await supabase.storage.from(bucket).list();
    if (error) { logger.error('Failed to list:', error); setItems([]); }
    else {
      const mapped = (data || []).map(f => {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(f.name);
        return { name: f.name, url: publicUrl, updated_at: f.updated_at || '', size: f.metadata?.size };
      });
      setItems(mapped);
    }
    setLoading(false);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const validation = validateImageFile(file);
    if (!validation.valid) { addToast('error', validation.error!); setUploading(false); return; }
    const fileName = generateSafeFileName(file.name);
    const { error } = await supabase.storage.from(activeBucket).upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) { addToast('error', `Upload failed: ${error.message}`); }
    else { addToast('success', `${file.name} uploaded`); loadBucket(activeBucket); }
    setUploading(false);
  }

  function handleDelete(name: string) {
    setConfirm({
      open: true,
      action: {
        title: 'Delete File',
        message: `Delete "${name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'danger',
        icon: 'trash',
      },
      onConfirm: async () => {
        const { error } = await supabase.storage.from(activeBucket).remove([name]);
        if (error) { addToast('error', 'Delete failed'); }
        else { addToast('success', 'File deleted'); loadBucket(activeBucket); }
      },
    });
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(url);
    addToast('success', 'URL copied to clipboard');
    setTimeout(() => setCopiedId(''), 2000);
  }

  const filtered = search ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <>
    <ConfirmationModal open={confirm.open} action={confirm.action} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(prev => ({ ...prev, open: false }))} />
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h2>
          <p className="text-sm text-gray-500 mt-1">Manage uploaded images, logos, and documents</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileRef} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Bucket Tabs */}
      <div className="flex gap-2 mb-6">
        {BUCKETS.map(b => (
          <button key={b} onClick={() => setActiveBucket(b)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeBucket === b
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700'
          }`}>
            {b.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-dark-700 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No files in {activeBucket}</p>
          <p className="text-sm text-gray-400 mt-1">Upload images, logos, or documents to get started</p>
          <button onClick={() => fileRef.current?.click()} className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors">
            Upload File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(item => {
            const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(item.name);
            return (
              <div key={item.name} className="group relative bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square bg-gray-100 dark:bg-dark-700 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300 truncate" title={item.name}>{item.name}</p>
                  {item.size && <p className="text-[10px] text-gray-400">{(item.size / 1024).toFixed(1)} KB</p>}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(item.url)} className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors" title="Copy URL">
                    {copiedId === item.url ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(item.name)} className="p-2 rounded-lg bg-white/90 text-error-500 hover:bg-white transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a href={item.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors" title="Open">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
