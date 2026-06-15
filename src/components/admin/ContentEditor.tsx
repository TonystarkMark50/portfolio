import { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, Check, Clock, AlertTriangle, Loader2, Save, Globe, ExternalLink } from 'lucide-react';
import Hero from '../../sections/Hero';
import About from '../../sections/About';
import Skills from '../../sections/Skills';
import Projects from '../../sections/Projects';
import Education from '../../sections/Education';
import Certifications from '../../sections/Certifications';
import Internship from '../../sections/Internship';
import Journey from '../../sections/Journey';
import Contact from '../../sections/Contact';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceConfig: Record<DeviceType, { width: number; label: string; screen: string }> = {
  desktop: { width: 1280, label: 'Desktop', screen: '100%' },
  tablet: { width: 768, label: 'Tablet', screen: '768px' },
  mobile: { width: 375, label: 'Mobile', screen: '375px' },
};

const SECTION_PREVIEW_MAP: Record<string, React.ComponentType> = {
  profile: Hero,
  about: About,
  skills: Skills,
  projects: Projects,
  education: Education,
  certifications: Certifications,
  internship: Internship,
  journey: Journey,
  contact: Contact,
};

const SECTION_LABELS: Record<string, string> = {
  profile: 'Profile Section',
  about: 'About Section',
  skills: 'Skills Section',
  projects: 'Projects Section',
  education: 'Education Section',
  certifications: 'Certifications Section',
  internship: 'Internship Section',
  journey: 'Journey Section',
  contact: 'Contact Section',
};

function SectionPreviewRenderer({ section }: { section: string }) {
  const Component = SECTION_PREVIEW_MAP[section];
  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500 text-sm">
        No preview available for this section
      </div>
    );
  }
  return <Component />;
}

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

export function AutoSaveBar({ status, onSave }: { status: SaveStatus; onSave?: () => void }) {
  const icons = {
    idle: null,
    unsaved: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    saving: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
    saved: <Check className="w-3.5 h-3.5 text-emerald-400" />,
    error: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  };
  const labels = {
    idle: '',
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Save failed',
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      {status !== 'idle' && (
        <span className={`flex items-center gap-1.5 ${
          status === 'unsaved' ? 'text-amber-400' :
          status === 'saving' ? 'text-blue-400' :
          status === 'saved' ? 'text-emerald-400' :
          'text-red-400'
        }`}>
          {icons[status]}
          {labels[status]}
        </span>
      )}
      {(status === 'unsaved' || status === 'error') && onSave && (
        <button onClick={onSave} className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-medium hover:bg-blue-600 transition-colors">
          Save Now
        </button>
      )}
      <span className="text-gray-600">·</span>
      <span className="text-gray-500 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Auto-save
      </span>
    </div>
  );
}

export function useAutoSave(saveFn: () => Promise<void>, deps: any[]) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);
  const saveRef = useRef(saveFn);
  saveRef.current = saveFn;

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const triggerSave = useCallback(() => {
    setStatus('unsaved');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await saveRef.current();
        if (mountedRef.current) setStatus('saved');
      } catch {
        if (mountedRef.current) setStatus('error');
      }
    }, 1500);
  }, []);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');
    try {
      await saveRef.current();
      if (mountedRef.current) setStatus('saved');
    } catch {
      if (mountedRef.current) setStatus('error');
    }
  }, []);

  return { status, triggerSave, saveNow };
}

export default function ContentEditor({
  title,
  subtitle,
  children,
  status,
  onSave,
  actions,
  section,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  status: SaveStatus;
  onSave?: () => void;
  actions?: ReactNode;
  section?: string;
}) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showFullWebsite, setShowFullWebsite] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const siteUrl = window.location.origin;
  const cfg = deviceConfig[device];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev !== 'saving' || status !== 'saved') return;
    const t = setTimeout(() => {
      setPreviewKey(k => k + 1);
      try {
        iframeRef.current?.contentWindow?.location.reload();
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveBar status={status} onSave={onSave} />
          {actions}
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Editor Panel */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          {children}
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/80 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              {section && !showFullWebsite ? (
                <span className="text-[10px] text-gray-400 ml-2">
                  Previewing: <span className="text-gray-200 font-medium">{SECTION_LABELS[section] || section}</span>
                </span>
              ) : (
                <span className="text-[10px] text-gray-500 ml-2">{siteUrl}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {section && (
                <button onClick={() => setShowFullWebsite(v => !v)} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                  <Globe className="w-3 h-3" />
                  {showFullWebsite ? 'Section Preview' : 'Full Website'}
                </button>
              )}
              <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-0.5">
                {(Object.entries(deviceConfig) as [DeviceType, typeof cfg][]).map(([key, d]) => (
                  <button key={key} onClick={() => setDevice(key)} className={`p-1.5 rounded-md transition-colors ${device === key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    {key === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : key === 'tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center bg-gray-950/50 p-4 overflow-x-auto">
            <div className="transition-all duration-300 overflow-hidden rounded-lg border border-gray-800 bg-white" style={{ width: cfg.width > 700 ? '100%' : cfg.width, maxWidth: '100%' }}>
              {section && !showFullWebsite ? (
                <div className="w-full overflow-y-auto" style={{ height: 450, maxHeight: '55vh' }}>
                  <SectionPreviewRenderer key={previewKey} section={section} />
                </div>
              ) : (
                <iframe ref={iframeRef} src={siteUrl} title="Live Preview" className="w-full bg-white" style={{ height: 450, maxHeight: '55vh' }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineField({
  value,
  onSave,
  type = 'text',
  placeholder = '',
  label,
  className = '',
}: {
  value: string;
  onSave: (val: string) => void;
  type?: 'text' | 'textarea' | 'url' | 'email' | 'number';
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      (inputRef.current as HTMLInputElement).select?.();
    }
  }, [editing]);

  function handleSave() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={className}>
        {type === 'textarea' ? (
          <textarea ref={inputRef as any} value={draft} onChange={e => setDraft(e.target.value)} onBlur={handleSave} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSave(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }} className="w-full px-2 py-1 rounded-lg bg-gray-800 border border-blue-500 text-white text-sm outline-none resize-none" rows={3} autoFocus />
        ) : (
          <input ref={inputRef as any} type={type} value={draft} onChange={e => setDraft(e.target.value)} onBlur={handleSave} onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }} className="w-full px-2 py-1 rounded-lg bg-gray-800 border border-blue-500 text-white text-sm outline-none" autoFocus />
        )}
      </div>
    );
  }

  return (
    <div className={`group cursor-pointer ${className}`} onClick={() => setEditing(true)}>
      {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>}
      <div className="flex items-center gap-2">
        {value ? (
          <span className={`${type === 'url' ? 'text-blue-400 underline underline-offset-2 decoration-blue-400/30' : 'text-white'}`}>
            {type === 'url' ? value.replace(/^https?:\/\//, '').replace(/\/$/, '') : value}
          </span>
        ) : (
          <span className="text-gray-500 italic">{placeholder || 'Click to set...'}</span>
        )}
        <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
      </div>
    </div>
  );
}

export function InlineTags({
  tags,
  onSave,
  label,
}: {
  tags: string[];
  onSave: (tags: string[]) => void;
  label?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tags.join('\n'));
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(tags.join('\n')); }, [tags]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (editing) {
    return (
      <div>
        {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>}
        <textarea ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => { onSave(draft.split('\n').map(s => s.trim()).filter(Boolean)); setEditing(false); }} onKeyDown={e => { if (e.key === 'Escape') { setDraft(tags.join('\n')); setEditing(false); } }} className="w-full px-2 py-1.5 rounded-lg bg-gray-800 border border-blue-500 text-white text-xs outline-none resize-none" rows={4} autoFocus />
        <p className="text-[9px] text-gray-600 mt-1">Enter one per line · Blur to save · Esc to cancel</p>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => setEditing(true)}>
      {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs text-gray-300 border border-gray-700">{t}</span>
        ))}
        {tags.length === 0 && <span className="text-xs text-gray-500 italic">Click to add...</span>}
      </div>
    </div>
  );
}

export function InlineSelect({
  value,
  options,
  onSave,
  label,
}: {
  value: string;
  options: string[];
  onSave: (val: string) => void;
  label?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div>
        {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>}
        <select value={value} onChange={e => { onSave(e.target.value); setEditing(false); }} onBlur={() => setEditing(false)} autoFocus className="w-full px-2 py-1.5 rounded-lg bg-gray-800 border border-blue-500 text-white text-sm outline-none">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => setEditing(true)}>
      {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>}
      <div className="flex items-center gap-2">
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">{value}</span>
        <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
      </div>
    </div>
  );
}

export function InlineBool({
  value,
  onSave,
  label,
}: {
  value: boolean;
  onSave: (val: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input type="checkbox" checked={value} onChange={e => onSave(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/30" />
      {label && <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{label}</span>}
    </label>
  );
}

export function InlineUrlButton({
  value,
  onSave,
  label,
}: {
  value: string;
  onSave: (val: string) => void;
  label?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSave() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>}
        <input ref={inputRef} type="url" value={draft} onChange={e => setDraft(e.target.value)} onBlur={handleSave} onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }} className="w-full px-2 py-1.5 rounded-lg bg-gray-800 border border-blue-500 text-white text-xs outline-none" autoFocus placeholder="https://..." />
      </div>
    );
  }

  return (
    <div>
      {label && <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>}
      {value ? (
        <div className="flex items-center gap-2">
          <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors border border-blue-500/20">
            <ExternalLink className="w-3 h-3" />
            View Certificate
          </a>
          <button onClick={() => { setEditing(true); setDraft(value); }} className="p-1 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors" title="Edit URL">
            ✎
          </button>
        </div>
      ) : (
        <div className="group cursor-pointer" onClick={() => setEditing(true)}>
          <span className="text-xs text-gray-500 italic">Click to set certificate link...</span>
          <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1">✎</span>
        </div>
      )}
    </div>
  );
}
