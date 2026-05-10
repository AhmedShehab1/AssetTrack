import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Clock, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/api/useNotifications';

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const { fetchNotifications, markRead, markAllRead } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = async () => {
    const data = await fetchNotifications({ size: 10 });
    if (data && data.content) {
      setNotifications(data.content);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    await markRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'WARRANTY_EXPIRY': return <AlertTriangle size={16} className="text-warning" />;
      case 'LOW_STOCK': return <AlertCircle size={16} className="text-danger" />;
      case 'ASSET_ALLOCATED': return <CheckCircle2 size={16} className="text-success" />;
      case 'ASSET_RETURNED': return <Info size={16} className="text-info" />;
      case 'CONDITION_REPORT_OPENED': return <AlertTriangle size={16} className="text-warning" />;
      case 'CONDITION_REPORT_RESOLVED': return <CheckCircle2 size={16} className="text-success" />;
      default: return <Bell size={16} className="text-text-body" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Fix 1: added aria-label="notifications" */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="notifications"
        className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
      >
        <Bell size={20} className="text-text-body" />
        {unreadCount > 0 && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Fix 2: added aria-label="notification-panel" */}
      {isOpen && (
        <div
          aria-label="notification-panel"
          className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-text-heading">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-text-body text-sm font-medium">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={20} className="opacity-20" />
                </div>
                No notifications yet.
              </div>
            ) : (
              <ul className="notifications-list">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-4 border-b border-outline-variant/50 flex gap-3 transition-colors ${!n.read ? 'bg-primary-light/30' : 'hover:bg-slate-50'}`}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                  >
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${!n.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug mb-1 ${!n.read ? 'font-bold text-text-heading' : 'text-text-body'}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-body opacity-60">
                        <Clock size={12} />
                        {formatRelativeTime(n.createdAt)}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="mt-2 w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 text-center border-t border-outline-variant">
              <button className="text-[11px] font-bold text-text-body hover:text-primary uppercase tracking-widest transition-colors">
                View all activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;