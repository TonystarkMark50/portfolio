import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  Mail,
  Archive,
  AlertTriangle,
  Trash2,
  Search,
  MessageSquare,
  User,
  Calendar,
  Reply,
  StickyNote,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  fetchMessages,
  fetchMessageById,
  markAsRead,
  markAsReplied,
  archiveMessage,
  markAsSpam,
  deleteMessage,
  addNote,
  getUnreadCount,
  type ContactMessage,
  type CrmResult,
  type FetchOptions,
} from './contactCRMService';

type Folder = 'inbox' | 'replied' | 'archived' | 'spam';

interface FolderDefinition {
  key: Folder;
  label: string;
  icon: typeof Inbox;
}

const FOLDERS: FolderDefinition[] = [
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'replied', label: 'Replied', icon: Reply },
  { key: 'archived', label: 'Archived', icon: Archive },
  { key: 'spam', label: 'Spam', icon: AlertTriangle },
];

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffMonth / 12)}y ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSnippet(message: string, maxLen = 100): string {
  if (message.length <= maxLen) return message.replace(/\n/g, ' ');
  return message.replace(/\n/g, ' ').slice(0, maxLen) + '...';
}

function ListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-start gap-3 p-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-3/5" />
            <div className="h-2.5 bg-gray-800 rounded w-4/5" />
            <div className="h-2 bg-gray-800 rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-5 bg-gray-800 rounded w-3/4" />
      <div className="h-3 bg-gray-800 rounded w-1/2" />
      <div className="space-y-2 pt-4">
        <div className="h-2.5 bg-gray-800 rounded w-full" />
        <div className="h-2.5 bg-gray-800 rounded w-full" />
        <div className="h-2.5 bg-gray-800 rounded w-5/6" />
        <div className="h-2.5 bg-gray-800 rounded w-4/6" />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: typeof Inbox;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <Icon className="w-12 h-12 text-gray-700 mb-3" />
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}

interface Props {
  onNavigate?: (tab: string) => void;
  onClose?: () => void;
}

export default function ContactInbox(_props: Props) {
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showMobileList, setShowMobileList] = useState(true);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const PER_PAGE = 25;
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    loadMessages();
  }, [activeFolder, debouncedSearch, page]);

  useEffect(() => {
    loadUnreadCount();
  }, [messages]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedMessage(null);
      return;
    }
    loadDetail(selectedId);
  }, [selectedId]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const options: FetchOptions = {
      status: activeFolder === 'inbox' ? undefined : activeFolder,
      page,
      limit: PER_PAGE,
    };
    if (debouncedSearch) {
      options.search = debouncedSearch;
    }

    const result: CrmResult<ContactMessage[]> = await fetchMessages(options);
    if (result.error) {
      setError(result.error);
    } else {
      setMessages(result.data ?? []);
      setTotalCount(result.count ?? 0);
    }
    setLoading(false);
  }, [activeFolder, debouncedSearch, page]);

  const loadUnreadCount = useCallback(async () => {
    const result = await getUnreadCount();
    if (!result.error && result.data != null) {
      setUnreadCount(result.data);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    const result = await fetchMessageById(id);
    if (!result.error && result.data) {
      setSelectedMessage(result.data);
    }
    setDetailLoading(false);
  }, []);

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedId(msg.id);
    setShowMobileList(false);
    if (!msg.is_read) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
      );
      await markAsRead(msg.id);
    }
  };

  const handleMarkRead = async () => {
    if (!selectedId) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === selectedId ? { ...m, is_read: true } : m)),
    );
    setSelectedMessage((prev) =>
      prev ? { ...prev, is_read: true } : null,
    );
    await markAsRead(selectedId);
  };

  const handleReply = async () => {
    if (!selectedId) return;
    const mailto = `mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`;
    await markAsReplied(selectedId);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedId ? { ...m, is_replied: true, is_read: true } : m,
      ),
    );
    setSelectedMessage((prev) =>
      prev ? { ...prev, is_replied: true, is_read: true } : null,
    );
    window.open(mailto, '_blank');
  };

  const handleArchive = async () => {
    if (!selectedId) return;
    await archiveMessage(selectedId);
    setMessages((prev) => prev.filter((m) => m.id !== selectedId));
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const handleSpam = async () => {
    if (!selectedId) return;
    await markAsSpam(selectedId);
    setMessages((prev) => prev.filter((m) => m.id !== selectedId));
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await deleteMessage(selectedId);
    setMessages((prev) => prev.filter((m) => m.id !== selectedId));
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const handleAddNote = async () => {
    if (!selectedId || !noteInput.trim()) return;
    setSavingNote(true);
    await addNote(selectedId, noteInput.trim());
    setNoteInput('');
    setSavingNote(false);
    if (selectedId) {
      await loadDetail(selectedId);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-800 shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-48 border-r border-gray-800 shrink-0 bg-gray-950/50">
          <nav className="flex-1 p-2 space-y-1">
            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.key;
              const showBadge = folder.key === 'inbox' && unreadCount > 0;
              return (
                <button
                  key={folder.key}
                  onClick={() => {
                    setActiveFolder(folder.key);
                    setSelectedId(null);
                    setSelectedMessage(null);
                    setPage(1);
                    setShowMobileList(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{folder.label}</span>
                  {showBadge && (
                    <span className="text-[10px] font-medium bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile folder tabs */}
        <div className="lg:hidden flex gap-1 px-4 py-2 border-b border-gray-800 overflow-x-auto shrink-0">
          {FOLDERS.map((folder) => {
            const Icon = folder.icon;
            const isActive = activeFolder === folder.key;
            const showBadge = folder.key === 'inbox' && unreadCount > 0;
            return (
              <button
                key={folder.key}
                onClick={() => {
                  setActiveFolder(folder.key);
                  setSelectedId(null);
                  setSelectedMessage(null);
                  setPage(1);
                  setShowMobileList(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {folder.label}
                {showBadge && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Message list */}
        <div
          className={`${
            showMobileList || !selectedId ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:max-w-md border-r border-gray-800 bg-gray-900/50`}
        >
          {loading ? (
            <ListSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-xs text-gray-400">Failed to load messages</p>
              <p className="text-[10px] text-gray-600 mt-1">{error}</p>
              <button
                onClick={loadMessages}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={FOLDERS.find((f) => f.key === activeFolder)?.icon ?? Inbox}
              title={
                debouncedSearch
                  ? 'No messages match your search'
                  : activeFolder === 'inbox'
                    ? 'Inbox is empty'
                    : activeFolder === 'replied'
                      ? 'No replied messages'
                      : activeFolder === 'archived'
                        ? 'No archived messages'
                        : 'No spam messages'
              }
              description={
                debouncedSearch
                  ? 'Try a different search term'
                  : 'New messages will appear here'
              }
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              {messages.map((msg) => (
                <motion.button
                  key={msg.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4 border-b border-gray-800/50 transition-colors hover:bg-gray-800/30 ${
                    selectedId === msg.id
                      ? 'bg-blue-500/5 border-l-2 border-l-blue-500'
                      : 'border-l-2 border-l-transparent'
                  } ${!msg.is_read ? 'bg-gray-800/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm truncate ${
                          !msg.is_read
                            ? 'font-semibold text-white'
                            : 'font-medium text-gray-300'
                        }`}
                      >
                        {msg.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap shrink-0">
                      {getRelativeTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate ml-4">
                    {msg.subject || '(no subject)'}
                  </p>
                  <p className="text-[11px] text-gray-600 truncate ml-4 mt-0.5">
                    {getSnippet(msg.message)}
                  </p>
                </motion.button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && messages.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 shrink-0">
              <span className="text-[11px] text-gray-500">
                {(page - 1) * PER_PAGE + 1}–
                {Math.min(page * PER_PAGE, totalCount)} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div
          className={`${
            !showMobileList && selectedId ? 'flex' : 'hidden'
          } lg:flex flex-col flex-1 bg-gray-900 min-w-0`}
        >
          {!selectedId ? (
            <EmptyState
              icon={MessageSquare}
              title="Select a message"
              description="Choose a message from the list to read it"
            />
          ) : detailLoading ? (
            <DetailSkeleton />
          ) : !selectedMessage ? (
            <EmptyState
              icon={AlertTriangle}
              title="Message not found"
              description="This message may have been deleted"
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Detail header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 ml-auto">
                  {!selectedMessage.is_read && (
                    <button
                      onClick={handleMarkRead}
                      className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Mark as read"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleReply}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleArchive}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-amber-400 transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSpam}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                    title="Mark as spam"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail content */}
              <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-lg font-bold text-white mb-1">
                  {selectedMessage.subject || '(no subject)'}
                </h2>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {selectedMessage.name}
                  </span>
                  <span className="text-gray-700">&lt;{selectedMessage.email}&gt;</span>
                  <span className="flex items-center gap-1.5 ml-auto text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedMessage.created_at)}
                  </span>
                </div>

                <div className="max-w-prose">
                  <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Notes section */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <StickyNote className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-300">Notes</h3>
                  </div>

                  {selectedMessage.notes ? (
                    <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.notes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 mb-4">No notes yet</p>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add a note..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteInput.trim() || savingNote}
                      className="px-3 py-2 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingNote ? 'Saving...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
