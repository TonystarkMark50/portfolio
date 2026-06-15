import { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { getInternships, upsertInternship, deleteInternship, Internship } from '../../lib/api';
import ContentEditor, { InlineField, InlineTags, InlineSelect, InlineBool, useAutoSave } from './ContentEditor';

const types = ['On-Site', 'Remote', 'Hybrid'];

export default function AdminInternship() {
  const [items, setItems] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getInternships();
    if (data) setItems(data);
    setLoading(false);
  }

  const { status } = useAutoSave(async () => {}, []);

  async function updateField(id: string, key: keyof Internship, val: any) {
    await upsertInternship({ id, [key]: val } as any);
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
  }

  async function addEntry() {
    await upsertInternship({ organization: 'Organization', role: 'Role', display_order: items.length } as any);
    load();
  }

  async function removeEntry(id: string) {
    if (!confirm('Delete this internship?')) return;
    await deleteInternship(id);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <ContentEditor title="Internships" subtitle="Your work experience — click to edit" status={status}
      actions={
        <button onClick={addEntry} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Internship
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No internships yet</p>
          <button onClick={addEntry} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add internship</button>
        </div>
      ) : items.map(item => (
        <div key={item.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <InlineField value={item.role} onSave={v => updateField(item.id, 'role', v)} placeholder="Role" className="text-sm font-medium" />
              <InlineField value={item.organization} onSave={v => updateField(item.id, 'organization', v)} placeholder="Organization" className="text-xs text-gray-400" />
            </div>
            <button onClick={() => removeEntry(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InlineField value={item.department || ''} onSave={v => updateField(item.id, 'department', v)} placeholder="Department" label="Department" />
            <InlineField value={item.duration || ''} onSave={v => updateField(item.id, 'duration', v)} placeholder="June 2025 - Aug 2025" label="Duration" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InlineField value={item.location || ''} onSave={v => updateField(item.id, 'location', v)} placeholder="Location" label="Location" />
            <InlineSelect value={item.type || 'On-Site'} options={types} onSave={v => updateField(item.id, 'type', v)} label="Type" />
          </div>
          <InlineTags tags={item.description || []} onSave={v => updateField(item.id, 'description', v)} label="Description" />
          <InlineTags tags={item.responsibilities || []} onSave={v => updateField(item.id, 'responsibilities', v)} label="Responsibilities" />
          <InlineTags tags={item.learnings || []} onSave={v => updateField(item.id, 'learnings', v)} label="Key Learnings" />
          <InlineTags tags={item.impact || []} onSave={v => updateField(item.id, 'impact', v)} label="Impact" />
          <InlineField value={item.certificate_url || ''} onSave={v => updateField(item.id, 'certificate_url', v)} type="url" placeholder="https://..." label="Certificate URL" />
          <InlineBool value={item.completed} onSave={v => updateField(item.id, 'completed', v)} label="Completed" />
        </div>
      ))}
    </ContentEditor>
  );
}
