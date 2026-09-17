import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  GraduationCap, 
  Calendar, 
  CloudOff, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { TaskItem, BrightspaceSession } from '../types';
import { isTaskUrgent } from '../utils/taskUtils';

interface TopOverviewBannerProps {
  tasks: TaskItem[];
  session: BrightspaceSession;
  isOnline: boolean;
  onExploreBrightspace: () => void;
  onSyncGoogleCalendarAll: () => void;
  onSelectUrgentItems: () => void;
}

export const TopOverviewBanner: React.FC<TopOverviewBannerProps> = ({
  tasks,
  session,
  isOnline,
  onExploreBrightspace,
  onSyncGoogleCalendarAll,
  onSelectUrgentItems,
}) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const tasksDueToday = activeTasks.filter((t) => {
    const dueTime = new Date(t.dueDate || '').getTime();
    return dueTime >= todayStart && dueTime <= todayEnd;
  });

  const urgentTasks = activeTasks.filter((t) => isTaskUrgent(t));
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

      {/* High Priority / Urgent Items - Clickable to Inspect */}
      <div 
        id="banner-urgent-items-card"
        onClick={onSelectUrgentItems}
        className="bg-white rounded-xl p-4 border border-rose-200 shadow-2xs hover:border-rose-400 hover:shadow-xs cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800 flex items-center gap-1">
            <span>Urgent Items</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{urgentTasks.length}</span>
            <span className="text-xs text-zinc-500">urgent</span>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 group-hover:underline flex items-center gap-0.5">
            <span>Inspect</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Brightspace Exploration */}
      <div 
        id="banner-brightspace-explore-card"
        onClick={onExploreBrightspace}
        className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs hover:border-[#8f001a]/40 hover:shadow-xs cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">Brightspace Tasks</span>
          <div className="w-7 h-7 rounded-lg bg-[#8f001a]/10 text-[#8f001a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">{brightspaceCount.length}</span>
            <span className="text-xs text-zinc-500">synced</span>
          </div>
          <span className="text-[11px] font-semibold text-[#8f001a] group-hover:underline flex items-center gap-0.5">
            <span>Explore</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Google Calendar & Offline Status */}
      <div 
        id="banner-calendar-sync-card"
        onClick={onSyncGoogleCalendarAll}
        className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs hover:border-sky-300 hover:shadow-xs cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">Calendar Export</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-sky-700">Sync (.ics)</span>
          </div>
          <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">
            {offlineModifiedCount > 0 ? `${offlineModifiedCount} offline edits` : 'Google Cal ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
