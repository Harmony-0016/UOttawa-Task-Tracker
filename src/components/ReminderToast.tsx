import React from 'react';
import { Bell, X, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { DesktopNotification, TaskItem } from '../types';
import { CalendarService } from '../services/calendarService';

interface ReminderToastProps {
  notification: DesktopNotification | null;
  task?: TaskItem;
  onDismiss: () => void;
  onMarkComplete: (taskId: string) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  notification,
  task,
  onDismiss,
  onMarkComplete,
}) => {
  if (!notification) return null;

  const handleOpenGoogleCalendar = () => {
    if (task) {
      CalendarService.openInGoogleCalendar(task);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-zinc-200 p-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#8f001a] text-white flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8f001a] uppercase tracking-wider">
              Automated Deadline Reminder
            </span>
            <div className="text-xs font-bold text-zinc-900">
              {notification.courseCode}
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2.5">
        <h4 className="text-xs font-semibold text-zinc-900">
          {notification.title}
        </h4>
        <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
          {notification.message}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
        {task && (
          <button
            onClick={handleOpenGoogleCalendar}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 hover:underline"
          >
            <Calendar className="w-3 h-3 text-sky-600" />
            <span>Open in Google Calendar</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5 ml-auto">
          <button
            onClick={() => onMarkComplete(notification.taskId)}
            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Mark Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
