import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  GraduationCap, 
  Calendar, 
  CloudOff, 
  RefreshCw 
} from 'lucide-react';
import { TaskItem, BrightspaceSession } from '../types';

interface TopOverviewBannerProps {
  tasks: TaskItem[];
  session: BrightspaceSession;
  isOnline: boolean;
  onExploreBrightspace: () => void;
  onSyncGoogleCalendarAll: () => void;
}

export const TopOverviewBanner: React.FC<TopOverviewBannerProps> = ({
  tasks,
  session,
  isOnline,
  onExploreBrightspace,
  onSyncGoogleCalendarAll,
}) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const tasksDueToday = activeTasks.filter((t) => {
    const dueTime = new Date(t.dueDate).getTime();
    return dueTime >= todayStart && dueTime <= todayEnd;
  });

  const highPriority = activeTasks.filter((t) => t.priority === 'high');
  const brightspaceCount = tasks.filter((t) => t.source === 'brightspace');
  const offlineModifiedCount = tasks.filter((t) => t.isOfflineModified || t.isOfflineCreated).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* Due Today */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">Due Today</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900">{tasksDueToday.length}</span>
          <span className="text-xs text-zinc-500">task(s)</span>
        </div>
      </div>

      {/* High Priority / Urgent */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">High Priority</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-700">{highPriority.length}</span>
          <span className="text-xs text-zinc-500">urgent item(s)</span>
        </div>
      </div>

      {/* Brightspace Exploration */}
      <div 
        onClick={onExploreBrightspace}
        className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs hover:border-[#8f001a]/40 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">Brightspace Tasks</span>
          <div className="w-7 h-7 rounded-lg bg-[#8f001a]/10 text-[#8f001a] flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900">{brightspaceCount.length}</span>
          <span className="text-xs text-[#8f001a] font-medium hover:underline">Explore & Sync →</span>
        </div>
      </div>

      {/* Google Calendar & Offline Status */}
      <div 
        onClick={onSyncGoogleCalendarAll}
        className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs hover:border-sky-300 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">Calendar Sync</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xs font-bold text-sky-700">Google Calendar</span>
          <span className="text-[11px] text-zinc-500">
            {offlineModifiedCount > 0 ? `${offlineModifiedCount} offline edits` : 'Ready to export'}
          </span>
        </div>
      </div>
    </div>
  );
};
