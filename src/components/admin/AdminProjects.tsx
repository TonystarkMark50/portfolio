import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  category: string;
  technologies: string[];
  github_url: string | null;
  demo_url: string | null;
  featured: boolean;
  display_order: number;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('admin_projects').select('*').order('display_order');
    if (data) setProjects(data);
    setLoading(false);
  }

  async function toggleFeatured(project: Project) {
    await supabase.from('admin_projects').update({ featured: !project.featured }).eq('id', project.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('admin_projects').delete().eq('id', id);
    load();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      ...editing,
      slug: editing.slug || editing.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
    };
    if (editing.id) {
      await supabase.from('admin_projects').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('admin_projects').insert(payload);
    }
    setEditing(null);
    load();
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
        <button onClick={() => setEditing({ title: '', description: '', category: 'Academic', technologies: [], featured: false, display_order: projects.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{p.title}</p>
                      <p className="text-sm text-gray-500">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{p.category}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleFeatured(p)} className={`p-1 rounded ${p.featured ? 'text-warning-500' : 'text-gray-400'}`}>
                    {p.featured ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing(p)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold">{editing.id ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                  <input type="text" value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg border" placeholder="auto-generated" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border" rows={2} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Long Description</label>
                <textarea value={editing.long_description || ''} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} className="w-full px-3 py-2 rounded-lg border" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input type="url" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={editing.category || 'Academic'} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border">
                    {['Biomedical', 'Academic', 'HealthTech', 'AI/ML', 'Web Apps', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                <input type="text" value={(editing.technologies || []).join(', ')} onChange={(e) => setEditing({ ...editing, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded-lg border" placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL</label>
                  <input type="url" value={editing.github_url || ''} onChange={(e) => setEditing({ ...editing, github_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Demo URL</label>
                  <input type="url" value={editing.demo_url || ''} onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={editing.featured || false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
                <label htmlFor="featured" className="text-sm">Featured</label>
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
