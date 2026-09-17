import React from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  VolumeX, 
  Trash2, 
  CheckCircle2, 
  Play, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react';
import { DesktopNotification } from '../types';
import { ReminderEngine } from '../services/reminderEngine';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DesktopNotification[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearNotifications: () => void;
  onTriggerTestReminder: () => void;
  onRequestDesktopPermission: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  soundEnabled,
  onToggleSound,
  onClearNotifications,
  onTriggerTestReminder,
  onRequestDesktopPermission,
}) => {
  if (!isOpen) return null;

  const hasPermission = ReminderEngine.hasDesktopNotificationPermission();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-2xs">
      <div 
        id="windows-notification-center-drawer"
        className="w-full max-w-md h-full bg-white shadow-2xl border-l border-zinc-200 flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header (Windows 11 Action Center style) */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-semibold">Windows Reminders & Notifications</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls & Preferences */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">Audio Chime Sound:</span>
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                soundEnabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Chime Enabled' : 'Chime Muted'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">Desktop System Notifications:</span>
            {hasPermission ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Authorized
              </span>
            ) : (
              <button
                onClick={onRequestDesktopPermission}
                className="text-xs text-sky-700 hover:underline font-medium"
              >
                Enable Notifications
              </button>
            )}
          </div>

          {/* Test Chime button */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
            <button
              id="test-chime-button"
              onClick={onTriggerTestReminder}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 shadow-2xs transition-colors"
            >
              <Play className="w-3 h-3 text-sky-600 fill-sky-600" />
              <span>Test Chime & Reminder</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-xs text-zinc-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Bell className="w-10 h-10 mx-auto stroke-zinc-300 mb-2" />
              <p className="text-xs font-medium text-zinc-600">No active reminders</p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                Automated reminders will chime and show here as task deadlines approach.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800">
                      {notif.courseCode}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {notif.type === 'overdue' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      OVERDUE
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-zinc-900 mt-1.5">
                  {notif.title}
                </h4>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
