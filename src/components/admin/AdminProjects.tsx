import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Save, X, ExternalLink, Github, Calendar, Tag, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface Project {
  id: string; title: string; slug: string; description: string; long_description: string | null;
  image_url: string | null; category: string; technologies: string[];
  github_url: string | null; demo_url: string | null; featured: boolean; display_order: number;
}

const categories = ['Biomedical', 'Academic', 'HealthTech', 'AI/ML', 'Web Apps', 'Other'];

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('display_order');
    if (data) setProjects(data);
    setLoading(false);
  }

  async function toggleFeatured(p: Project) {
    await supabase.from('projects').update({ featured: !p.featured }).eq('id', p.id);
    addToast('success', p.featured ? 'Unfeatured project' : 'Project featured');
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    addToast('success', 'Project deleted');
    load();
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const payload = {
      ...editing,
      slug: editing.slug || editing.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
    };
    if (editing.id) {
      await supabase.from('projects').update(payload).eq('id', editing.id);
      addToast('success', 'Project updated');
    } else {
      await supabase.from('projects').insert(payload);
      addToast('success', 'Project created');
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-dark-700 rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} • {projects.filter(p => p.featured).length} featured</p>
        </div>
        <button onClick={() => setEditing({ title: '', description: '', category: 'Academic', technologies: [], featured: false, display_order: projects.length })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <div key={p.id} className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all">
            <div className="aspect-video bg-gray-100 dark:bg-dark-700 relative overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image className="w-10 h-10" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button onClick={() => toggleFeatured(p)} className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${p.featured ? 'bg-amber-500/90 text-white' : 'bg-white/80 text-gray-500 hover:bg-white'}`}>
                  {p.featured ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              {p.featured && <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-medium backdrop-blur-sm">Featured</div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</h3>
                  <span className="text-[11px] text-gray-400">{p.category}</span>
                </div>
              </div>
              {p.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.technologies.slice(0, 4).map(t => <span key={t} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-[10px] text-gray-600 dark:text-gray-400">{t}</span>)}
                  {p.technologies.length > 4 && <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-[10px] text-gray-400">+{p.technologies.length - 4}</span>}
                </div>
              )}
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="GitHub"><Github className="w-3.5 h-3.5" /></a>}
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Live Demo"><ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-gray-400 hover:text-error-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <BriefcaseIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Project" to showcase your work</p>
          </div>
        )}
      </div>

      {/* Slide-in Panel Editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-800 shadow-2xl animate-slide-right overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editing.id ? 'Edit Project' : 'New Project'}
                </h3>
                <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                  <input type="text" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                  <select value={editing.category || 'Academic'} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug</label>
                <input type="text" value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="auto-generated" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Long Description</label>
                <textarea value={editing.long_description || ''} onChange={e => setEditing({ ...editing, long_description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" rows={4} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Technologies (comma-separated)</label>
                <input type="text" value={(editing.technologies || []).join(', ')} onChange={e => setEditing({ ...editing, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="React, TypeScript, Node.js" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Thumbnail URL</label>
                <input type="url" value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">GitHub URL</label>
                  <input type="url" value={editing.github_url || ''} onChange={e => setEditing({ ...editing, github_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Demo URL</label>
                  <input type="url" value={editing.demo_url || ''} onChange={e => setEditing({ ...editing, demo_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/30" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50 cursor-pointer">
                <input type="checkbox" checked={editing.featured || false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Feature this project</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 p-6">
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-sm">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
