import { useState, useEffect, useCallback } from 'react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', keywords: ['home', 'overview', 'stats'] },
  { id: 'profile', label: 'Profile', keywords: ['name', 'bio', 'photo', 'contact'] },
  { id: 'about', label: 'About', keywords: ['bio', 'description', 'paragraph'] },
  { id: 'skills', label: 'Skills', keywords: ['technologies', 'tools', 'expertise'] },
  { id: 'projects', label: 'Projects', keywords: ['work', 'portfolio', 'cases'] },
  { id: 'internship', label: 'Internship', keywords: ['experience', 'work', 'job'] },
  { id: 'education', label: 'Education', keywords: ['degree', 'school', 'college', 'university'] },
  { id: 'certifications', label: 'Certifications', keywords: ['certs', 'badges', 'courses'] },
  { id: 'journey', label: 'Journey', keywords: ['timeline', 'milestones', 'history'] },
  { id: 'contact', label: 'Contact', keywords: ['messages', 'inbox', 'mail'] },
  { id: 'resume', label: 'Resume', keywords: ['cv', 'download', 'ats'] },
  { id: 'media', label: 'Media Library', keywords: ['images', 'files', 'uploads', 'assets'] },
  { id: 'settings', label: 'Settings', keywords: ['config', 'theme', 'preferences'] },
];

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ onNavigate, open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = query.trim()
    ? tabs.filter(t =>
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : tabs;

  const handleSelect = useCallback((id: string) => {
    onNavigate(id);
    setQuery('');
    onClose();
  }, [onNavigate, onClose]);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[selectedIdx]) { handleSelect(results[selectedIdx].id); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIdx, handleSelect]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden animate-slide-down" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-dark-700">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, settings, and sections..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded border border-gray-300 dark:border-dark-600 text-[10px] text-gray-400 bg-gray-50 dark:bg-dark-700">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No results for "{query}"</div>
          ) : results.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                idx === selectedIdx
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <span className="capitalize">{item.label}</span>
              <span className="ml-auto text-xs text-gray-400">{item.keywords.slice(0, 2).join(', ')}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-200 dark:border-dark-700 text-[10px] text-gray-400">
          <span><kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">↵</kbd> Open</span>
          <span><kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
