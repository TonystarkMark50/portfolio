import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { getAbout, upsertAbout, deleteAbout, About } from '../../lib/api';
import ContentEditor, { InlineField, InlineTags, useAutoSave } from './ContentEditor';

export default function AdminAbout() {
  const [items, setItems] = useState<About[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getAbout();
    if (data) setItems(data);
    setLoading(false);
  }

  const save = async () => {};
  const { status } = useAutoSave(save, []);

  async function updateField(id: string, key: keyof About, val: any) {
    await upsertAbout({ id, [key]: val } as any);
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
  }

  async function addEntry() {
    const { data } = await upsertAbout({ title: 'New Section', paragraphs: [], display_order: items.length } as any);
    if (data) load();
  }

  async function removeEntry(id: string) {
    if (!confirm('Delete this section?')) return;
    await deleteAbout(id);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <ContentEditor section="about" title="About" subtitle="Sections about you — click to edit inline" status={status}
      actions={
        <button onClick={addEntry} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Section
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No about sections yet</p>
          <button onClick={addEntry} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Create one</button>
        </div>
      ) : items.map(item => (
        <div key={item.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <InlineField value={item.title} onSave={v => updateField(item.id, 'title', v)} placeholder="Section title" label="Title" />
            </div>
            <button onClick={() => removeEntry(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <InlineField value={item.subtitle || ''} onSave={v => updateField(item.id, 'subtitle', v)} placeholder="Optional subtitle" label="Subtitle" />
          <InlineTags tags={item.paragraphs || []} onSave={v => updateField(item.id, 'paragraphs', v)} label="Paragraphs" />
        </div>
      ))}
    </ContentEditor>
  );
}
