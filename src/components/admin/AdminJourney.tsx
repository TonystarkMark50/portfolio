import { useState, useEffect } from 'react';
import { Plus, Trash2, Map, Star, MapPin, Award, Heart, Target } from 'lucide-react';
import { getJourney, upsertJourneyEntry, deleteJourneyEntry, Journey } from '../../lib/api';
import ContentEditor, { InlineField, InlineSelect, useAutoSave } from './ContentEditor';

const iconOptions = [
  { value: 'Star', icon: Star },
  { value: 'MapPin', icon: MapPin },
  { value: 'Award', icon: Award },
  { value: 'Heart', icon: Heart },
  { value: 'Target', icon: Target },
];

const types = ['milestone', 'achievement', 'event'];

export default function AdminJourney() {
  const [items, setItems] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getJourney();
    if (data) setItems(data);
    setLoading(false);
  }

  const save = async () => {
    for (const item of items) {
      const { error } = await upsertJourneyEntry(item);
      if (error) throw error;
    }
  };

  const { status, triggerSave } = useAutoSave(save, [items]);

  async function updateField(id: string, key: keyof Journey, val: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
    triggerSave();
  }

  async function addEntry() {
    await upsertJourneyEntry({ title: 'New Milestone', type: 'milestone', icon: 'Star', display_order: items.length } as any);
    load();
  }

  async function removeEntry(id: string) {
    if (!confirm('Delete this entry?')) return;
    await deleteJourneyEntry(id);
    load();
  }

  function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <div className="flex gap-1.5">
        {iconOptions.map(opt => {
          const Icon = opt.icon;
          const isActive = value === opt.value;
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-gray-600'}`}>
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <ContentEditor section="journey" title="Journey" subtitle="Your career timeline milestones" status={status}
      actions={
        <button onClick={addEntry} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Milestone
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Map className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No journey entries yet</p>
          <button onClick={addEntry} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add milestone</button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-800" />
          <div className="space-y-4">
            {items.map((item, _idx) => {
              const Icon = iconOptions.find(o => o.value === item.icon)?.icon || Star;
              return (
                <div key={item.id} className="relative pl-10 group">
                  <div className="absolute left-0 top-1 w-[34px] h-[34px] rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center z-10">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <InlineField value={item.title} onSave={v => updateField(item.id, 'title', v)} placeholder="Title" className="text-sm font-medium" />
                        <InlineField value={item.subtitle || ''} onSave={v => updateField(item.id, 'subtitle', v)} placeholder="Subtitle" className="text-xs text-gray-400" />
                      </div>
                      <button onClick={() => removeEntry(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <InlineField value={item.date || ''} onSave={v => updateField(item.id, 'date', v)} placeholder="Date" className="text-xs" />
                      <InlineSelect value={item.type} options={types} onSave={v => updateField(item.id, 'type', v)} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Icon</p>
                      <IconPicker value={item.icon} onChange={v => updateField(item.id, 'icon', v)} />
                    </div>
                    <InlineField value={item.description || ''} onSave={v => updateField(item.id, 'description', v)} type="textarea" placeholder="Description" label="Description" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ContentEditor>
  );
}
