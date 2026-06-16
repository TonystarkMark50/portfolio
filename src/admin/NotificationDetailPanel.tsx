import { useState, useEffect } from 'react';
import { X, ExternalLink, Mail, Calendar, CheckCircle, MessageSquare, Download, Bell, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { markNotificationRead } from '../lib/api';
import type { Notification } from '../lib/api';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
  onMarkRead?: (id: string) => void;
}

export default function NotificationDetailPanel({ notification, open, onClose, onMarkRead }: Props) {
  const [contactSubmission, setContactSubmission] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notification) return;

    if (notification.type === 'contact') {
      const contactId = (notification.metadata as Record<string, unknown> | null)?.contact_submission_id as string | undefined;
      if (contactId) {
        setLoading(true);
        supabase.from('contact_submissions').select('*').eq('id', contactId).maybeSingle().then(({ data }) => {
          if (data) setContactSubmission(data as ContactSubmission);
          setLoading(false);
        });
      }
    }

    if (!notification.is_read) {
      markNotificationRead(notification.id);
      onMarkRead?.(notification.id);
    }
  }, [notification?.id]);

  if (!open || !notification) return null;

  const meta = notification.metadata as Record<string, unknown> | null;

  function getIcon() {
    switch (notification!.type) {
      case 'contact': return MessageSquare;
      case 'download': return Download;
      default: return Bell;
    }
  }

  function getIconBg() {
    switch (notification!.type) {
      case 'contact': return 'bg-blue-500/10 text-blue-400';
      case 'download': return 'bg-emerald-500/10 text-emerald-400';
      default: return 'bg-amber-500/10 text-amber-400';
    }
  }

  const Icon = getIcon();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 lg:bg-black/40" onClick={onClose} />

      {/* Panel - mobile: full screen, desktop: slide from right */}
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="w-full lg:max-w-xl bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors lg:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getIconBg()}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{notification.title}</h3>
                <p className="text-[10px] text-gray-500">
                  {new Date(notification.created_at).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Notification message */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <p className="text-sm text-gray-200">{notification.message}</p>
            </div>

            {/* Contact details (if contact notification) */}
            {notification.type === 'contact' && (
              <>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                    <div className="h-4 bg-gray-800 rounded w-2/3" />
                    <div className="h-20 bg-gray-800 rounded" />
                  </div>
                ) : contactSubmission ? (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Name</p>
                        <p className="text-sm font-medium text-white">{contactSubmission.name}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-sm font-medium text-blue-400">{contactSubmission.email}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Subject</p>
                        <p className="text-sm font-medium text-white">{contactSubmission.subject}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Message</p>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{contactSubmission.message}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 p-3 rounded-lg bg-gray-900 border border-gray-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Received {new Date(contactSubmission.created_at).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Read</span>
                      </div>
                    </div>

                    {/* Reply button */}
                    <a
                      href={`mailto:${contactSubmission.email}?subject=Re: ${contactSubmission.subject}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Reply via Email
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-center">
                    <p className="text-xs text-gray-500">Contact details not available</p>
                  </div>
                )}
              </>
            )}

            {/* Download details (if download notification) */}
            {notification.type === 'download' && meta && (
              <div className="grid gap-3">
                {!!meta.country && (
                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-medium text-white">{meta.city as string}, {meta.country as string}</p>
                  </div>
                )}
                {!!meta.device_type && (
                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Device</p>
                    <p className="text-sm font-medium text-white capitalize">{meta.device_type as string}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
