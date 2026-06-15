import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2, Save, X, Star, MapPin, Award, Heart, Target } from 'lucide-react';
import { getJourney, upsertJourneyEntry, deleteJourneyEntry, Journey } from '../../lib/api';

const iconOptions = [
  { value: 'Star', icon: Star },
  { value: 'MapPin', icon: MapPin },
  { value: 'Award', icon: Award },
  { value: 'Heart', icon: Heart },
  { value: 'Target', icon: Target },
];

export default function AdminJourney() {
  const [items, setItems] = useState<Journey[]>([]);
  const [editing, setEditing] = useState<Partial<Journey> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getJourney();
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { error } = await upsertJourneyEntry(editing);
    if (!error) { setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this journey entry?')) return;
    await deleteJourneyEntry(id);
    load();
  }

  function IconComponent({ name, className }: { name: string; className?: string }) {
    const found = iconOptions.find(o => o.value === name);
    const Icon = found?.icon || Star;
    return <Icon className={className || 'w-5 h-5'} />;
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Journey</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your career timeline milestones</p>
        </div>
        <button onClick={() => setEditing({ title: '', type: 'milestone', icon: 'Star', display_order: items.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                  <IconComponent name={item.icon} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                  {item.date && <p className="text-xs text-gray-400 mt-1">{item.date}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-dark-700 text-gray-500 capitalize">{item.type}</span>
                <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <p className="text-gray-500">No journey entries yet. Click "Add Milestone" to create one.</p>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing.id ? 'Edit Milestone' : 'Add Milestone'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="text" value={editing.date || ''} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={editing.type || 'milestone'} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border">
                    <option value="milestone">Milestone</option>
                    <option value="achievement">Achievement</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                <div className="flex gap-2">
                  {iconOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setEditing({ ...editing, icon: opt.value })} className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-colors ${editing.icon === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-400 hover:border-gray-300'}`}>
                      <opt.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border" rows={4} />
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
