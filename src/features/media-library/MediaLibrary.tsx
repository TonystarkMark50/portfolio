import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Image,
  FileText,
  Upload,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  FolderOpen,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import {
  fetchAssets,
  uploadAsset,
  deleteAsset,
  type MediaAsset,
  type MediaResult,
  type MediaBucket,
} from './mediaService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { ConfirmAction } from '../../components/ConfirmationModal';

interface Props {
  onNavigate?: (tab: string) => void;
}

type BucketTab = 'all' | MediaBucket;

const TAB_LABELS: Record<BucketTab, string> = {
  all: 'All',
  'certification-logos': 'Certification Logos',
  'project-images': 'Project Images',
  'resume-assets': 'Resume Assets',
};

function formatSize(bytes?: number): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isImage(name: string): boolean {
  return /\.(png|jpg|jpeg|gif|webp|svg|avif|bmp)$/i.test(name);
}

function getMimeDisplay(type?: string, name?: string): string {
  if (type) return type;
  if (name) {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return ext.toUpperCase();
  }
  return 'Unknown';
}

function AssetSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="aspect-square rounded-xl bg-gray-800" />
      <div className="h-3 bg-gray-800 rounded w-3/4" />
      <div className="h-2.5 bg-gray-800 rounded w-1/2" />
    </div>
  );
}

export default function MediaLibrary(_props: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<BucketTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const { addToast } = useToast();

  const loadAssets = useCallback(async (bucket?: MediaBucket) => {
    setLoading(true);
    const res: MediaResult<MediaAsset[]> = await fetchAssets(bucket);
    if (res.error) {
      addToast('error', `Failed to load assets: ${res.error}`);
      setAssets([]);
    } else {
      setAssets(res.data ?? []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    loadAssets(activeTab === 'all' ? undefined : activeTab);
  }, [activeTab, loadAssets]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    const targetBucket = activeTab === 'all' ? 'certification-logos' as MediaBucket : activeTab as MediaBucket;
    setUploading(true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 85));
    }, 200);
    const res = await uploadAsset(targetBucket, file);
    clearInterval(progressInterval);
    if (res.error) {
      addToast('error', `Upload failed: ${res.error}`);
    } else {
      setUploadProgress(100);
      addToast('success', `${file.name} uploaded successfully`);
      setTimeout(() => {
        loadAssets(activeTab === 'all' ? undefined : activeTab);
        setUploadProgress(0);
      }, 500);
    }
    setUploading(false);
  };

  const handleDelete = async (asset: MediaAsset) => {
    const res = await deleteAsset(asset.bucket as MediaBucket, asset.id);
    if (res.error) {
      addToast('error', `Delete failed: ${res.error}`);
    } else {
      addToast('success', `"${asset.name}" deleted`);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      loadAssets(activeTab === 'all' ? undefined : activeTab);
    }
  };

  const copyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    addToast('success', 'URL copied to clipboard');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find((f) => f.size > 0);
    if (validFile) {
      handleUpload(validFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = '';
  };

  const filtered = assets.filter((asset) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return asset.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ConfirmationModal
        open={deleteTarget !== null}
        action={{
          title: 'Delete File',
          message: deleteTarget ? `Delete "${deleteTarget.name}"? This action cannot be undone.` : '',
          confirmLabel: 'Delete',
          variant: 'danger',
          icon: 'trash',
        } as ConfirmAction}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950/90 border-2 border-dashed border-blue-500/50 rounded-2xl pointer-events-none"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-200">Drop files to upload</p>
              <p className="text-sm text-gray-500 mt-1">Supported: images, PDFs, documents</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Media Library</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage uploaded images, logos, and documents</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileRef}
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bucket Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {(Object.keys(TAB_LABELS) as BucketTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-xs bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <AssetSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-400">
            {searchQuery
              ? 'No files match your search'
              : 'No files yet'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'Upload images, logos, or documents to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((asset) => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedAsset(asset)}
                className="group relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-800/50 flex items-center justify-center overflow-hidden">
                  {isImage(asset.name) ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-500" />
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1.5">
                  <p className="text-xs text-gray-300 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                      {TAB_LABELS[asset.bucket as BucketTab] || asset.bucket}
                    </span>
                    {asset.size && (
                      <span className="text-[10px] text-gray-600">{formatSize(asset.size)}</span>
                    )}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(asset); }}
                    className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(asset); }}
                    className="p-2 rounded-lg bg-white/90 text-red-500 hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedAsset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setSelectedAsset(null)}
            />

            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full sm:max-w-lg bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image className="w-5 h-5 text-gray-400 shrink-0" />
                    <h2 className="text-sm font-semibold text-white truncate">File Details</h2>
                  </div>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview */}
                <div className="p-4 shrink-0">
                  <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden border border-gray-800">
                    {isImage(selectedAsset.name) ? (
                      <img
                        src={selectedAsset.url}
                        alt={selectedAsset.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <FileText className="w-16 h-16" />
                        <span className="text-xs font-medium">{getMimeDisplay(selectedAsset.type, selectedAsset.name)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">File Name</label>
                    <p className="text-sm text-gray-200 mt-0.5 break-all">{selectedAsset.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Bucket</label>
                      <p className="text-sm text-gray-200 mt-0.5 capitalize">
                        {TAB_LABELS[selectedAsset.bucket as BucketTab] || selectedAsset.bucket}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Size</label>
                      <p className="text-sm text-gray-200 mt-0.5">{formatSize(selectedAsset.size)}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Type</label>
                      <p className="text-sm text-gray-200 mt-0.5">{getMimeDisplay(selectedAsset.type, selectedAsset.name)}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Created</label>
                      <p className="text-sm text-gray-200 mt-0.5">{formatDate(selectedAsset.created_at)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => copyUrl(selectedAsset)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      {copiedId === selectedAsset.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedId === selectedAsset.id ? 'Copied!' : 'Copy URL'}
                    </button>
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </a>
                    <button
                      onClick={() => setDeleteTarget(selectedAsset)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
