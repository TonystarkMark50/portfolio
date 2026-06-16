import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Search,
  MessageSquare,
  Download,
  UserPlus,
  AlertCircle,
  Info,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToNotifications,
  type AppNotification,
  type NotificationResult,
} from './notificationService';

type Tab = 'all' | 'unread';

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

function getNotificationIcon(type: string) {
  switch (type) {
    case 'contact':
      return MessageSquare;
    case 'download':
      return Download;
    case 'user':
      return UserPlus;
    case 'error':
      return AlertCircle;
    case 'success':
      return CheckCircle2;
    default:
      return Info;
  }
}

function getIconStyles(type: string) {
  switch (type) {
    case 'contact':
      return 'bg-blue-500/10 text-blue-400';
    case 'download':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'user':
      return 'bg-purple-500/10 text-purple-400';
    case 'error':
      return 'bg-red-500/10 text-red-400';
    case 'success':
      return 'bg-green-500/10 text-green-400';
    default:
      return 'bg-amber-500/10 text-amber-400';
  }
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-3/4" />
            <div className="h-2.5 bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ open, onClose }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [notifRes, countRes]: [NotificationResult<AppNotification[]>, NotificationResult<number>] =
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    if (notifRes.error) {
      setError(notifRes.error);
    } else {
      setNotifications(notifRes.data ?? []);
    }
    if (!countRes.error) {
      setUnreadCount(countRes.data ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  useEffect(() => {
    if (!open) return;
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    });
    return unsubscribe;
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleMarkRead = async (id: string) => {
    const prev = notifications;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    const res = await markAsRead(id);
    if (res.error) {
      setNotifications(prev);
    }
  };

  const handleMarkAllRead = async () => {
    const prev = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    const res = await markAllAsRead();
    if (res.error) {
      setNotifications(prev);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = notifications;
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    const res = await deleteNotification(id);
    if (res.error) {
      setNotifications(prev);
    }
  };

  const handleDeleteAll = async () => {
    const prev = notifications;
    setNotifications([]);
    setUnreadCount(0);
    const res = await deleteAllNotifications();
    if (res.error) {
      setNotifications(prev);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread' && n.is_read) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              ref={panelRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full sm:max-w-md bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-300" />
                  <h2 className="text-sm font-semibold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-medium bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-4 pt-3 pb-1 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs + bulk actions */}
              <div className="flex items-center justify-between px-4 py-2 shrink-0">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeTab === 'all'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'unread'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete all notifications"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <NotificationSkeleton />
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-xs text-gray-400">Failed to load notifications</p>
                    <p className="text-[10px] text-gray-600 mt-1">{error}</p>
                    <button
                      onClick={loadData}
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <Inbox className="w-10 h-10 text-gray-700 mb-3" />
                    <p className="text-sm font-medium text-gray-400">
                      {searchQuery
                        ? 'No notifications match your search'
                        : activeTab === 'unread'
                          ? 'No unread notifications'
                          : 'No notifications yet'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {searchQuery
                        ? 'Try a different search term'
                        : activeTab === 'unread'
                          ? 'You are all caught up'
                          : 'New notifications will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    <AnimatePresence initial={false}>
                      {filtered.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-900/50 transition-colors group ${
                              !notification.is_read ? 'bg-gray-900/30' : ''
                            }`}
                          >
                            {/* Unread dot */}
                            <div className="pt-1.5 shrink-0">
                              {!notification.is_read ? (
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                              ) : (
                                <div className="w-2 h-2" />
                              )}
                            </div>

                            {/* Icon */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getIconStyles(notification.type)}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-xs truncate ${
                                    !notification.is_read
                                      ? 'font-semibold text-white'
                                      : 'font-medium text-gray-300'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0 mt-0.5">
                                  {getRelativeTime(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-1">
                              {notification.is_read ? null : (
                                <button
                                  onClick={() => handleMarkRead(notification.id)}
                                  className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-blue-400 transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
