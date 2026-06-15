import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { getInternships, upsertInternship, deleteInternship, Internship } from '../../lib/api';

export default function AdminInternship() {
  const [items, setItems] = useState<Internship[]>([]);
  const [editing, setEditing] = useState<Partial<Internship> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getInternships();
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { error } = await upsertInternship(editing);
    if (!error) { setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this internship?')) return;
    await deleteInternship(id);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Internships</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your internship experience</p>
        </div>
        <button onClick={() => setEditing({ organization: '', role: '', display_order: items.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Internship
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.role}</h3>
                <p className="text-sm text-gray-500">{item.organization}{item.duration ? ` — ${item.duration}` : ''}</p>
                {item.description && item.description.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.description[0]}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <p className="text-gray-500">No internships yet. Click "Add Internship" to create one.</p>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing.id ? 'Edit Internship' : 'Add Internship'}
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                  <input type="text" value={editing.organization || ''} onChange={(e) => setEditing({ ...editing, organization: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input type="text" value={editing.department || ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <input type="text" value={editing.role || ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <input type="text" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="June 2025 - Aug 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input type="text" value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={editing.type || 'On-Site'} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border">
                    <option value="On-Site">On-Site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (one per line)</label>
                <textarea value={(editing.description || []).join('\n')} onChange={(e) => setEditing({ ...editing, description: e.target.value.split('\n').filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities (one per line)</label>
                <textarea value={(editing.responsibilities || []).join('\n')} onChange={(e) => setEditing({ ...editing, responsibilities: e.target.value.split('\n').filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learnings (one per line)</label>
                <textarea value={(editing.learnings || []).join('\n')} onChange={(e) => setEditing({ ...editing, learnings: e.target.value.split('\n').filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Impact (one per line)</label>
                <textarea value={(editing.impact || []).join('\n')} onChange={(e) => setEditing({ ...editing, impact: e.target.value.split('\n').filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate URL</label>
                <input type="url" value={editing.certificate_url || ''} onChange={(e) => setEditing({ ...editing, certificate_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="completed" checked={editing.completed ?? true} onChange={(e) => setEditing({ ...editing, completed: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
                <label htmlFor="completed" className="text-sm text-gray-700 dark:text-gray-300">Completed</label>
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
