import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { getSkills, upsertSkill, deleteSkill, Skill } from '../../lib/api';

const presetCategories = ['Programming', 'Database', 'Biomedical Engineering', 'Professional Skills'];
const presetGradients = [
  'from-sky-500/20 to-blue-500/20',
  'from-violet-500/20 to-purple-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-amber-500/20 to-orange-500/20',
];

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Partial<Skill> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await getSkills();
    if (data) setSkills(data);
    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await upsertSkill(editing);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this skill category?')) return;
    await deleteSkill(id);
    load();
  }

  function handleAdd() {
    setEditing({ category: presetCategories[0], skills: [], gradient: presetGradients[0], display_order: skills.length });
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h2>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{skill.category}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skill.skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-lg text-xs bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(skill)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(skill.id)} className="p-2 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing.id ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={editing.category || ''}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  {presetCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills (one per line)
                </label>
                <textarea
                  value={(editing.skills || []).join('\n')}
                  onChange={(e) => setEditing({ ...editing, skills: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gradient</label>
                <select
                  value={editing.gradient || presetGradients[0]}
                  onChange={(e) => setEditing({ ...editing, gradient: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  {presetGradients.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
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
