import { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase, Image } from 'lucide-react';
import { getProjects, upsertProject, deleteProject, Project } from '../lib/api';
import ContentEditor, { InlineField, InlineTags, InlineSelect, InlineBool, useAutoSave } from '../components/admin/ContentEditor';
import ConfirmationModal from '../components/ConfirmationModal';
import type { ConfirmAction } from '../components/ConfirmationModal';

const categories = ['Academic', 'Biomedical', 'HealthTech', 'AI/ML', 'Web Apps', 'Other'];

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ open: boolean; action: ConfirmAction; onConfirm: () => void }>({ open: false, action: { title: '', message: '' }, onConfirm: () => {} });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await getProjects();
    if (data) setItems(data);
    setLoading(false);
  }

  const save = async () => {
    for (const item of items) {
      const { error } = await upsertProject(item);
      if (error) throw error;
    }
  };

  const { status, triggerSave } = useAutoSave(save);

  async function updateField(id: string, key: keyof Project, val: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
    triggerSave();
  }

  async function addProject() {
    await upsertProject({ name: 'New Project', description: '', type: 'Academic', status: 'Completed', technologies: [], featured: false, display_order: items.length } as any);
    load();
  }

  function removeProject(id: string) {
    const item = items.find(i => i.id === id);
    setConfirm({
      open: true,
      action: {
        title: 'Delete Project',
        message: `Delete "${item?.name || 'this project'}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'danger',
        icon: 'trash',
      },
      onConfirm: async () => {
        await deleteProject(id);
        load();
      },
    });
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  return (
    <>
      <ConfirmationModal open={confirm.open} action={confirm.action} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(prev => ({ ...prev, open: false }))} />
      <ContentEditor section="projects" title="Projects" subtitle="Your portfolio projects — click any field to edit" status={status}
        actions={
          <button onClick={addProject} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        }
      >
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">No projects yet</p>
            <button onClick={addProject} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add project</button>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden group">
            <div className="aspect-video bg-gray-800 relative overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Image className="w-8 h-8" />
                </div>
              )}
              {item.featured && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-500/90 text-[9px] text-white font-medium">Featured</div>}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <InlineField value={item.name} onSave={v => updateField(item.id, 'name', v)} placeholder="Project name" className="text-sm font-medium" />
                  <InlineSelect value={item.type} options={categories} onSave={v => updateField(item.id, 'type', v)} label="Type" />
                </div>
                <button onClick={() => removeProject(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <InlineField value={item.description || ''} onSave={v => updateField(item.id, 'description', v)} type="textarea" placeholder="Short description" label="Description" />
              <InlineTags tags={item.technologies} onSave={v => updateField(item.id, 'technologies', v)} label="Technologies" />
              <div className="grid grid-cols-2 gap-3">
                <InlineField value={item.github_url || ''} onSave={v => updateField(item.id, 'github_url', v)} type="url" placeholder="GitHub URL" label="GitHub" />
                <InlineField value={item.demo_url || ''} onSave={v => updateField(item.id, 'demo_url', v)} type="url" placeholder="Demo URL" label="Demo" />
              </div>
              <InlineField value={item.image_url || ''} onSave={v => updateField(item.id, 'image_url', v)} type="url" placeholder="https://..." label="Thumbnail URL" />
              <InlineBool value={item.featured} onSave={v => updateField(item.id, 'featured', v)} label="Feature this project" />
            </div>
          </div>
        ))}
      </ContentEditor>
    </>
  );
}
