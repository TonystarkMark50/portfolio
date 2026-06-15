import { useEffect, useRef, useCallback, useState } from 'react';
import { AlertTriangle, Download, Trash2, LogOut, X } from 'lucide-react';

export interface ConfirmAction {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'download' | 'default';
  icon?: 'download' | 'trash' | 'logout' | 'warning' | 'alert';
}

interface ConfirmationModalProps {
  open: boolean;
  action: ConfirmAction;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    confirmBtn: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/30',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/30',
  },
  download: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/30',
  },
  default: {
    iconBg: 'bg-gray-500/10',
    iconColor: 'text-gray-400',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/30',
  },
};

function ActionIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'download': return <Download className={className} />;
    case 'trash': return <Trash2 className={className} />;
    case 'logout': return <LogOut className={className} />;
    case 'warning': return <AlertTriangle className={className} />;
    case 'alert': return <AlertTriangle className={className} />;
    default: return <AlertTriangle className={className} />;
  }
}

export default function ConfirmationModal({ open, action, onConfirm, onCancel }: ConfirmationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const variant = action.variant || 'default';
  const styles = variantStyles[variant];

  const handleConfirm = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onCancel();
    }
  }, [onConfirm, onCancel, isProcessing]);

  const handleCancel = useCallback(() => {
    if (isProcessing) return;
    onCancel();
  }, [onCancel, isProcessing]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleCancel]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative w-full sm:max-w-md bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:scale-95 sm:fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 z-10"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-5`}>
            <ActionIcon icon={action.icon || 'warning'} className={`w-6 h-6 ${styles.iconColor}`} />
          </div>

          {/* Content */}
          <h2 id="confirm-modal-title" className="text-lg font-bold text-white mb-2">
            {action.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-2">
            {action.message}
          </p>

          {/* Additional info */}
          {(variant === 'download') && (
            <div className="mt-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Download className="w-3 h-3" />
                <span>File Type: PDF</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generated from latest portfolio data</span>
              </div>
            </div>
          )}

          {variant === 'danger' && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-xs text-red-400/80">This action cannot be undone.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 pt-0 sm:pt-0">
          <button
            ref={cancelBtnRef}
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500/30"
          >
            {action.cancelLabel || 'Cancel'}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 focus:outline-none focus:ring-2 ${styles.confirmBtn} ${
              isProcessing ? 'cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              action.confirmLabel || 'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
