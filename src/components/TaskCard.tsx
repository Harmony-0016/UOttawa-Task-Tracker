import React from 'react';
import { 
  Calendar, 
  Clock, 
  Bell, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Circle, 
  CloudOff, 
  GraduationCap
} from 'lucide-react';
import { TaskItem, TaskPriority } from '../types';
import { CalendarService } from '../services/calendarService';

interface TaskCardProps {
  task: TaskItem;
  onToggleComplete: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'completed';
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isOverdue = !isCompleted && diffHours < 0;
  const isDueToday = !isCompleted && diffHours >= 0 && diffHours <= 24;

  const priorityColorMap: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    high: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    low: { bg: 'bg-zinc-50', text: 'text-zinc-600', border: 'border-zinc-200' },
  };

  const priorityStyle = priorityColorMap[task.priority] || priorityColorMap.medium;

  const handleOpenGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    CalendarService.openInGoogleCalendar(task);
  };

  const formatDueString = (): string => {
    if (isCompleted) {
      return `Completed on ${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'earlier'}`;
    }
    if (isOverdue) {
      return `Overdue by ${Math.abs(Math.round(diffHours))} hr(s)`;
    }
    if (isDueToday) {
      return `Due today at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return dueDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      id={`task-item-${task.id}`}
      className={`group relative rounded-xl border transition-all duration-150 p-4 bg-white ${
        isCompleted
          ? 'opacity-70 bg-zinc-50/70 border-zinc-200'
          : isOverdue
          ? 'border-rose-300 shadow-xs hover:border-rose-400'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Toggle */}
        <button
          onClick={() => onToggleComplete(task)}
          className="mt-0.5 text-zinc-400 hover:text-emerald-600 transition-colors shrink-0"
          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
          ) : (
            <Circle className="w-5 h-5 hover:stroke-emerald-500" />
          )}
        </button>

        {/* Center Details */}
        <div className="flex-1 min-w-0">
          {/* Header row: Course, Badges, Offline sync state */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              {task.courseCode}
            </span>

            {task.source === 'brightspace' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8f001a]/10 text-[#8f001a] border border-[#8f001a]/20 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Brightspace {task.brightspaceType ? `• ${task.brightspaceType}` : ''}
              </span>
            )}

            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
              {task.priority}
            </span>

            {/* Offline Badges */}
            {(task.isOfflineModified || task.isOfflineCreated) && (
              <span 
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"
                title="This task was modified or created while offline. Changes are saved locally."
              >
                <CloudOff className="w-3 h-3 text-amber-700" />
                Offline Edit
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-sm font-semibold leading-snug break-words ${
              isCompleted ? 'line-through text-zinc-400' : 'text-zinc-900'
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Footer: Due Date, Time Estimate, Reminders */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-3 flex-wrap">
            <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-rose-600' : isDueToday ? 'text-amber-700 font-semibold' : ''}`}>
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDueString()}</span>
            </div>

            {task.estimatedMinutes > 0 && (
              <div className="flex items-center gap-1 text-zinc-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{task.estimatedMinutes}m est.</span>
              </div>
            )}

            {task.reminders && task.reminders.length > 0 && (
              <div 
                className="flex items-center gap-1 text-sky-700 font-medium bg-sky-50 px-2 py-0.5 rounded border border-sky-100"
                title="Automated desktop & audio reminders configured"
              >
                <Bell className="w-3 h-3 text-sky-600 shrink-0" />
                <span>
                  {task.reminders.map((r) => `${r.minutesBefore >= 60 ? `${r.minutesBefore / 60}h` : `${r.minutesBefore}m`}`).join(', ')} before
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
          {/* 1-Click Sync with Google Calendar */}
          <button
            id={`sync-gcal-btn-${task.id}`}
            onClick={handleOpenGoogleCalendar}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-md transition-colors"
            title="Open and sync this event in Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden md:inline">Google Calendar</span>
            <ExternalLink className="w-3 h-3 text-sky-500" />
          </button>

          {/* Edit Task Button */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
            title="Edit task (supports offline editing)"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Task Button */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
