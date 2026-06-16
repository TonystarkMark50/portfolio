import { useState, useEffect } from 'react';
import { Plus, Trash2, Code2 } from 'lucide-react';
import { getSkills, upsertSkill, deleteSkill, Skill } from '../lib/api';
import ContentEditor, { InlineTags, InlineSelect, useAutoSave } from '../components/admin/ContentEditor';

const categories = ['Programming', 'Database', 'Biomedical Engineering', 'Professional Skills'];
const gradients = ['from-blue-400', 'from-purple-400', 'from-emerald-400', 'from-amber-400'];

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getSkills();
    if (data) setItems(data);
    setLoading(false);
  }

  const save = async () => {
    for (const item of items) {
      const { error } = await upsertSkill(item);
      if (error) throw error;
    }
  };

  const { status, triggerSave } = useAutoSave(save);

  async function updateField(id: string, key: keyof Skill, val: string | number | boolean | string[]) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
    triggerSave();
  }

  async function addCategory() {
    await upsertSkill({ category: categories[0], skills: [], gradient: gradients[0], display_order: items.length } as Partial<Skill>);
    load();
  }

  async function removeCategory(id: string) {
    if (!confirm('Delete this skill category?')) return;
    await deleteSkill(id);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <ContentEditor section="skills" title="Skills" subtitle="Technical skills organized by category" status={status}
      actions={
        <button onClick={addCategory} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Code2 className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No skills defined yet</p>
          <button onClick={addCategory} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add category</button>
        </div>
      ) : items.map(item => (
        <div key={item.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <InlineSelect value={item.category} options={categories} onSave={v => updateField(item.id, 'category', v)} label="Category" />
            </div>
            <button onClick={() => removeCategory(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <InlineTags tags={item.skills} onSave={v => updateField(item.id, 'skills', v)} label="Skills" />
          {item.skills.length > 0 && (
            <p className="text-[10px] text-gray-600">{item.skills.length} skill{item.skills.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      ))}
    </ContentEditor>
  );
}
