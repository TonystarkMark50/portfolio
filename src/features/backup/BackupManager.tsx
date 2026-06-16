import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  RotateCcw,
  Clock,
  FileJson,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { ConfirmAction } from '../../components/ConfirmationModal';

interface BackupSnapshot {
  id: string;
  date: string;
  label: string;
  data: Record<string, unknown>;
}

interface ImportPreview {
  tables: string[];
  totalRecords: number;
  preview: Record<string, number>;
}

interface Props {
  onNavigate?: (tab: string) => void;
}

type LoadState = 'idle' | 'loading' | 'exporting' | 'importing';

type TableName =
  | 'profile'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'internships'
  | 'contact_info'
  | 'site_settings';

const ALL_TABLES: TableName[] = [
  'profile',
  'projects',
  'skills',
  'education',
  'certifications',
  'internships',
  'contact_info',
  'site_settings',
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}_${h}-${min}`;
}

function formatLabelDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export default function BackupManager(_props: Props) {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Record<string, unknown[]> | null>(null);

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [restoreTarget, setRestoreTarget] = useState<BackupSnapshot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BackupSnapshot | null>(null);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusType(type);
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadSnapshots = () => {
    try {
      const raw = localStorage.getItem('backup-snapshots');
      if (raw) {
        const parsed: BackupSnapshot[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSnapshots(parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      }
    } catch {
      setSnapshots([]);
    }
  };

  const saveSnapshots = (updated: BackupSnapshot[]) => {
    localStorage.setItem('backup-snapshots', JSON.stringify(updated));
    setSnapshots(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleExport = async () => {
    setLoadState('exporting');
    setStatusMessage(null);

    try {
      const backup: Record<string, unknown[]> = {};

      for (const table of ALL_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
        backup[table] = (data as unknown[]) ?? [];
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });

      const dateStr = formatDate(new Date());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const snapshot: BackupSnapshot = {
        id: generateId(),
        date: new Date().toISOString(),
        label: `Backup ${formatDate(new Date())}`,
        data: backup as unknown as Record<string, unknown>,
      };
      saveSnapshots([snapshot, ...snapshots]);

      showStatus('success', 'Backup exported successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      showStatus('error', msg);
    } finally {
      setLoadState('idle');
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as Record<string, unknown[]>;

        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid backup format');
        }

        const tables = Object.keys(parsed);
        const totalRecords = Object.values(parsed).reduce(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0,
        );

        const preview: Record<string, number> = {};
        for (const [table, records] of Object.entries(parsed)) {
          preview[table] = Array.isArray(records) ? records.length : 0;
        }

        setImportData(parsed as Record<string, unknown[]>);
        setImportPreview({ tables, totalRecords, preview });
        showStatus('info', `Parsed backup file with ${totalRecords} records across ${tables.length} tables`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to parse file';
        showStatus('error', msg);
        setImportPreview(null);
        setImportData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) return;
    setLoadState('importing');
    setStatusMessage(null);

    try {
      for (const table of ALL_TABLES) {
        const records = importData[table];
        if (!records || !Array.isArray(records) || records.length === 0) continue;

        const { error } = await supabase.from(table).upsert(records, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

        if (error) throw new Error(`Failed to restore ${table}: ${error.message}`);
      }

      showStatus('success', 'Data restored successfully');
      setImportPreview(null);
      setImportData(null);
      setImportFile(null);

      const fileInput = document.getElementById('backup-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      showStatus('error', msg);
    } finally {
      setLoadState('idle');
    }
  };

  const handleRestoreSnapshot = useCallback(
    async (snapshot: BackupSnapshot) => {
      setLoadState('importing');
      setRestoreTarget(null);

      try {
        const data = snapshot.data as Record<string, unknown[]>;

        for (const table of ALL_TABLES) {
          const records = data[table];
          if (!records || !Array.isArray(records) || records.length === 0) continue;

          const { error } = await supabase.from(table).upsert(records, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

          if (error) throw new Error(`Failed to restore ${table}: ${error.message}`);
        }

        showStatus('success', `Snapshot "${snapshot.label}" restored`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Restore failed';
        showStatus('error', msg);
      } finally {
        setLoadState('idle');
      }
    },
    [],
  );

  const handleDeleteSnapshot = useCallback(
    (snapshot: BackupSnapshot) => {
      const updated = snapshots.filter((s) => s.id !== snapshot.id);
      saveSnapshots(updated);
      setDeleteTarget(null);
      showStatus('info', 'Snapshot deleted');
    },
    [snapshots],
  );

  const clearImport = () => {
    setImportPreview(null);
    setImportData(null);
    setImportFile(null);
    const fileInput = document.getElementById('backup-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Modals */}
      <ConfirmationModal
        open={restoreTarget !== null}
        action={
          {
            title: 'Restore Snapshot',
            message: restoreTarget
              ? `Restore "${restoreTarget.label}"? This will overwrite current data in all tables.`
              : '',
            confirmLabel: 'Restore',
            variant: 'warning',
            icon: 'warning',
          } as ConfirmAction
        }
        onConfirm={() => {
          if (restoreTarget) {
            handleRestoreSnapshot(restoreTarget);
          }
        }}
        onCancel={() => setRestoreTarget(null)}
      />

      <ConfirmationModal
        open={deleteTarget !== null}
        action={
          {
            title: 'Delete Snapshot',
            message: deleteTarget
              ? `Delete "${deleteTarget.label}"? This action cannot be undone.`
              : '',
            confirmLabel: 'Delete',
            variant: 'danger',
            icon: 'trash',
          } as ConfirmAction
        }
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteSnapshot(deleteTarget);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-blue-400" />
          Backup Manager
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Export, import, and restore your portfolio data
        </p>
      </div>

      {/* Status Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm ${
              statusType === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : statusType === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {statusType === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
            {statusType === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {statusType === 'info' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-blue-400" />
              Export Data
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Download all CMS data as a JSON backup file
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={loadState === 'exporting'}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadState === 'exporting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4" />
                  Export All Data
                </>
              )}
            </motion.button>

            <div className="mt-4 flex flex-wrap gap-2">
              {ALL_TABLES.map((table) => (
                <span
                  key={table}
                  className="text-[10px] font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md"
                >
                  {table}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-green-400" />
              Import Data
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Restore data from a previously exported backup file
            </p>

            <label className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border-2 border-dashed border-gray-700 text-sm text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {importFile ? importFile.name : 'Choose backup file (.json)'}
              <input
                id="backup-file-input"
                type="file"
                accept=".json"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>

            {/* Import Preview */}
            <AnimatePresence>
              {importPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <h4 className="text-xs font-semibold text-gray-300 mb-3">
                      Import Preview
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      {importPreview.totalRecords} records across{' '}
                      {importPreview.tables.length} tables
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(importPreview.preview).map(
                        ([table, count]) => (
                          <div
                            key={table}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-400">{table}</span>
                            <span className="text-gray-300 font-medium">
                              {count} records
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImport}
                      disabled={loadState === 'importing'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadState === 'importing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Restore Data
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={clearImport}
                      disabled={loadState === 'importing'}
                      className="px-4 py-2.5 rounded-xl border border-gray-700 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Restore Snapshots */}
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-400" />
          Restore Snapshots
        </h3>

        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-900 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-400">No snapshots yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Export your data to create your first backup snapshot
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {snapshots.map((snapshot) => (
                <motion.div
                  key={snapshot.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {snapshot.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatLabelDate(snapshot.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setRestoreTarget(snapshot)}
                      disabled={loadState === 'importing'}
                      className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-gray-800 transition-colors disabled:opacity-40"
                      title="Restore this snapshot"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(snapshot)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
