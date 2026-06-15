import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2, Save, X, GripVertical } from 'lucide-react';
import { getAbout, upsertAbout, deleteAbout, About } from '../../lib/api';

export default function AdminAbout() {
  const [items, setItems] = useState<About[]>([]);
  const [editing, setEditing] = useState<Partial<About> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getAbout();
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { error } = await upsertAbout(editing);
    if (!error) { setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this about entry?')) return;
    await deleteAbout(id);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the about section paragraphs</p>
        </div>
        <button onClick={() => setEditing({ title: 'About Me', paragraphs: [], display_order: items.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                  {item.paragraphs && item.paragraphs.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.paragraphs[0]}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <p className="text-gray-500">No about entries yet. Click "Add Entry" to create one.</p>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing.id ? 'Edit Entry' : 'New Entry'}
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                  <input type="text" value={editing.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paragraphs (one per line)</label>
                <textarea value={(editing.paragraphs || []).join('\n')} onChange={(e) => setEditing({ ...editing, paragraphs: e.target.value.split('\n').filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" rows={6} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : saveMsg || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
