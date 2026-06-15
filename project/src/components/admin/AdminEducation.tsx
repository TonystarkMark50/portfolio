import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { getEducation, upsertEducation, deleteEducation, Education } from '../../lib/api';

export default function AdminEducation() {
  const [items, setItems] = useState<Education[]>([]);
  const [editing, setEditing] = useState<Partial<Education> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getEducation();
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await upsertEducation(editing);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this education entry?')) return;
    await deleteEducation(id);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Education</h2>
        <button onClick={() => setEditing({ degree: '', institution: '', display_order: items.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.degree}</h3>
                <p className="text-sm text-gray-500">{item.institution}{item.gpa ? ` — GPA: ${item.gpa}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(item)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold">{editing.id ? 'Edit Education' : 'Add Education'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {(['degree', 'field', 'institution', 'period', 'location', 'gpa', 'status', 'description'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field.replace('_', ' ')}</label>
                  {field === 'description' ? (
                    <textarea
                      value={String(editing[field] ?? '')}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(editing[field] ?? '')}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      autoComplete="off"
                    />
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="current" checked={editing.current || false} onChange={(e) => setEditing({ ...editing, current: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
                <label htmlFor="current" className="text-sm text-gray-700 dark:text-gray-300">Currently enrolled</label>
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
