import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  ShieldAlert, 
  Navigation, 
  Users, 
  Heart, 
  Volume2, 
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateToTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'EMERGENCY' | 'JOURNEY' | 'CIRCLE' | 'CHECKIN'>('ALL');
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'EMERGENCY':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'JOURNEY':
        return <Navigation className="w-4 h-4 text-blue-400" />;
      case 'CIRCLE':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'CHECKIN':
        return <Heart className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBorderColorForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'EMERGENCY':
        return 'border-rose-500/40 bg-rose-950/20';
      case 'JOURNEY':
        return 'border-blue-500/30 bg-blue-950/15';
      case 'CIRCLE':
        return 'border-indigo-500/30 bg-indigo-950/15';
      case 'CHECKIN':
        return 'border-emerald-500/30 bg-emerald-950/15';
      default:
        return 'border-slate-800 bg-slate-900/60';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
        title="View Safety Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          id="notification-dropdown-panel"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Safety Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title={isSoundMuted ? 'Unmute alert tones' : 'Mute alert tones'}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[10px] scrollbar-none">
            {(['ALL', 'EMERGENCY', 'JOURNEY', 'CIRCLE', 'CHECKIN'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2 py-0.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  filter === tab
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-800/40">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Bell className="w-6 h-6 mx-auto mb-1.5 text-slate-600 opacity-60" />
                <p>No notifications in this category.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${getBorderColorForType(notification.type)} ${
                    notification.isRead ? 'opacity-70 hover:opacity-100' : 'shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {getIconForType(notification.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-white truncate">
                            {notification.title}
                          </h5>
                          {!notification.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 bg-slate-950 text-center border-t border-slate-800/80 text-[10px] text-slate-500">
            Real-time community welfare events &amp; escalation log
          </div>
        </div>
      )}
    </div>
  );
};
