import { useState, useEffect } from 'react';
import { Mail, Search, Inbox, Archive, ExternalLink, MessageSquare, Trash2, Filter, Check, X, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string; name: string; email: string; subject: string; message: string;
  status: string; created_at: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (data) setContacts(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('contact_messages').update({ status }).eq('id', id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    if (selected === id) setSelected(null);
    load();
  }

  const filtered = contacts.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.subject.toLowerCase().includes(q) && !c.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const unreadCount = contacts.filter(c => c.status === 'new').length;
  const totalCount = contacts.length;

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-dark-700 rounded-2xl" />;

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* List */}
      <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Inbox</h2>
              <p className="text-xs text-gray-500">{unreadCount} unread of {totalCount} total</p>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'}`}>
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          {showFilters && (
            <div className="flex gap-2 mt-3">
              {['all', 'new', 'read', 'replied', 'archived'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-700">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No messages found</p>
            </div>
          ) : filtered.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors ${
              selected === c.id ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-2 border-primary-500' : ''
            } ${c.status === 'new' ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <span className={`text-sm font-medium ${c.status === 'new' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === 'new' && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                  <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate">{c.subject}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{c.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
        {selected ? (
          (() => {
            const c = contacts.find(ct => ct.id === selected);
            if (!c) return <div className="p-8 text-center text-gray-500">Message not found</div>;
            return (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{c.subject}</h3>
                      <p className="text-sm text-gray-500 mt-1">{c.name} &lt;{c.email}&gt;</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${c.email}?subject=Re: ${c.subject}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-primary-500 transition-colors" title="Reply">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {['new', 'read', 'replied', 'archived'].map(s => (
                      <button key={s} onClick={() => updateStatus(c.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        c.status === s ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                      }`}>
                        {s === 'new' && <><MessageSquare className="w-3 h-3 inline mr-1" />New</>}
                        {s === 'read' && <><Check className="w-3 h-3 inline mr-1" />Read</>}
                        {s === 'replied' && <><Mail className="w-3 h-3 inline mr-1" />Replied</>}
                        {s === 'archived' && <><Archive className="w-3 h-3 inline mr-1" />Archive</>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-prose">
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{c.message}</div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-700">
                      <p className="text-xs text-gray-400">Received {new Date(c.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-600" />
              <p className="font-medium">Select a message</p>
              <p className="text-sm text-gray-400 mt-1">Choose a message from the left to read it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
