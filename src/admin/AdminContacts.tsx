import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Mail, Search, Inbox, Archive, ExternalLink, MessageSquare, Trash2, Filter, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logAuditAction } from '../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';
import type { ConfirmAction } from '../components/ConfirmationModal';

const PAGE_SIZE = 20;

interface Contact {
  id: string; name: string; email: string; subject: string; message: string;
  status: string; is_read: boolean; created_at: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const [confirm, setConfirm] = useState<{ open: boolean; action: ConfirmAction; onConfirm: () => void }>({ open: false, action: { title: '', message: '' }, onConfirm: () => {} });

  useEffect(() => {
    load();
    const sub = supabase
      .channel('contact_submissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_submissions' }, () => {
        load();
      })
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  async function load() {
    const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (data) setContacts(data);
    setLoading(false);
    setPage(0);
  }

  async function updateStatus(id: string, status: string) {
    const is_read = status !== 'new';
    const { error } = await supabase.from('contact_submissions').update({ status, is_read }).eq('id', id);
    if (error) console.error('Failed to update status:', error);
    logAuditAction(`contact_submission ${status}: ${id}`);
    load();
  }

  async function markAsRead(id: string) {
    const { error } = await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
    if (error) console.error('Failed to mark as read:', error);
    logAuditAction(`contact_submission read: ${id}`);
    load();
  }

  function handleReply(c: Contact) {
    supabase.from('contact_submissions').update({ replied_at: new Date().toISOString(), status: 'replied', is_read: true }).eq('id', c.id).then(() => {
      logAuditAction(`contact_submission reply: ${c.id}`);
      load();
    });
  }

  function handleDelete(id: string) {
    const msg = contacts.find(c => c.id === id);
    setConfirm({
      open: true,
      action: {
        title: 'Delete Message',
        message: `Delete message from "${msg?.name || 'this contact'}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'danger',
        icon: 'trash',
      },
      onConfirm: async () => {
        const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
        if (error) console.error('Failed to delete message:', error);
        logAuditAction(`contact_submission delete: ${id} (${msg?.name || 'unknown'})`);
        if (selected === id) setSelected(null);
        load();
      },
    });
  }

  const filtered = contacts.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.subject.toLowerCase().includes(q) && !c.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const unreadCount = contacts.filter(c => !c.is_read).length;
  const totalCount = contacts.length;

  if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-xl" />;

  return (
    <>
    <ConfirmationModal open={confirm.open} action={confirm.action} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(prev => ({ ...prev, open: false }))} />
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Contact Messages</h1>
          <p className="text-sm text-gray-400 mt-0.5">{unreadCount} unread · {totalCount} total</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-16rem)]">
        {/* List */}
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}>
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors" />
            </div>
            {showFilters && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {['all', 'new', 'read', 'replied', 'archived'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-px p-2">
            {paginated.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No messages found</p>
              </div>
              ) : paginated.map(c => (
              <button key={c.id} onClick={() => { setSelected(c.id); if (!c.is_read) markAsRead(c.id); }} className={`w-full text-left p-3 rounded-lg transition-colors ${
                selected === c.id ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-gray-800 border border-transparent'
              } ${!c.is_read ? 'bg-blue-500/5' : ''}`}>
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm font-medium ${!c.is_read ? 'text-white' : 'text-gray-300'}`}>{c.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {!c.is_read && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                    <span className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.subject || '(no subject)'}</p>
                <p className="text-[11px] text-gray-600 truncate mt-0.5">{c.message}</p>
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <span className="text-[11px] text-gray-500">
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {selected ? (
            (() => {
              const c = contacts.find(ct => ct.id === selected);
              if (!c) return <div className="p-8 text-center text-gray-500">Message not found</div>;
              return (
                <div className="h-full flex flex-col">
                  <div className="p-5 border-b border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{c.subject || '(no subject)'}</h3>
                        <p className="text-sm text-gray-400 mt-1">{c.name} &lt;{c.email}&gt;</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`mailto:${c.email}?subject=Re: ${c.subject}`} onClick={() => handleReply(c)} className="p-2 rounded-lg hover:bg-gray-800 text-blue-400 transition-colors" title="Reply">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['new', 'read', 'replied', 'archived'].map(s => (
                        <button key={s} onClick={() => updateStatus(c.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          c.status === s ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}>
                          {s === 'new' && <><MessageSquare className="w-3 h-3 inline mr-1" />New</>}
                          {s === 'read' && <><Check className="w-3 h-3 inline mr-1" />Read</>}
                          {s === 'replied' && <><Mail className="w-3 h-3 inline mr-1" />Replied</>}
                          {s === 'archived' && <><Archive className="w-3 h-3 inline mr-1" />Archive</>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-5 overflow-y-auto">
                    <div className="max-w-prose">
                      <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{c.message}</div>
                      <div className="mt-6 pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500">Received {new Date(c.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="font-medium text-gray-400">Select a message</p>
                <p className="text-sm text-gray-600 mt-1">Choose a message from the left to read it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
