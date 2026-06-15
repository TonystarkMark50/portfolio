import { useCallback, useRef, useState } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';

export function useAutoSave<T extends Record<string, unknown>>(
  saveFn: (data: T) => Promise<{ error?: unknown } | undefined>,
  delay = 1500
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const latestRef = useRef<T | null>(null);

  const schedule = useCallback((data: T) => {
    latestRef.current = data;
    setStatus('unsaved');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      const result = await saveFn(latestRef.current!);
      setStatus(result?.error ? 'error' : 'saved');
      setTimeout(() => setStatus('idle'), 2000);
    }, delay);
  }, [saveFn, delay]);

  const saveNow = useCallback(async (data: T) => {
    latestRef.current = data;
    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    const result = await saveFn(data);
    setStatus(result?.error ? 'error' : 'saved');
    setTimeout(() => setStatus('idle'), 2000);
  }, [saveFn]);

  return { status, schedule, saveNow };
}

export function SaveIndicator({ status }: { status: SaveStatus }) {
  const config = {
    idle: { color: 'text-gray-400', label: '' },
    saving: { color: 'text-primary-500', label: 'Saving...' },
    saved: { color: 'text-success-500', label: 'Saved' },
    error: { color: 'text-error-500', label: 'Save failed' },
    unsaved: { color: 'text-warning-500', label: 'Unsaved changes' },
  };
  const c = config[status];
  if (status === 'idle') return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${c.color} animate-fade-in`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'saving' ? 'animate-pulse bg-current' : 'bg-current'}`} />
      {c.label}
    </span>
  );
}
