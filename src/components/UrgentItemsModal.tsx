import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Calendar, 
  Download, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Bell, 
  ArrowRight,
  BookOpen,
  Filter
} from 'lucide-react';
import { TaskItem } from '../types';
import { isTaskUrgent, getUrgencyInfo } from '../utils/taskUtils';
import { CalendarService } from '../services/calendarService';

interface UrgentItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  onToggleComplete: (task: TaskItem) => void;
  onEditTask: (task: TaskItem) => void;
  onFilterToUrgentInMainList: () => void;
}

export const UrgentItemsModal: React.FC<UrgentItemsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleComplete,
  onEditTask,
  onFilterToUrgentInMainList,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Filter urgent tasks using the shared urgency utility
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => isTaskUrgent(t))
      .sort((a, b) => {
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return timeA - timeB;
      });
  }, [tasks]);

  // Keep selected items synchronized with urgent items
  const allSelected = urgentTasks.length > 0 && selectedTaskIds.size === urgentTasks.length;

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(urgentTasks.map((t) => t.id)));
    }
  };

  const toggleSelectTask = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTaskIds(next);
  };

  const selectedTasksList = urgentTasks.filter((t) => selectedTaskIds.has(t.id));

  // Batch Export Selected to Calendar (.ics)
  const handleExportSelected = () => {
    const toExport = selectedTasksList.length > 0 ? selectedTasksList : urgentTasks;
    CalendarService.downloadIcsCalendar(toExport, 'uottawa-urgent-assignments.ics');
  };

  // Batch Mark Selected as Completed
  const handleBatchMarkCompleted = () => {
    selectedTasksList.forEach((task) => {
      onToggleComplete(task);
    });
    setSelectedTaskIds(new Set());
  };

  // Open Google Calendar for a specific task
  const handleOpenGoogleCalendar = (task: TaskItem) => {
    CalendarService.openInGoogleCalendar(task);
  };

  const totalEstimatedMinutes = urgentTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
  const totalEstimatedHours = (totalEstimatedMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div 
        id="urgent-items-inspector-modal"
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 to-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Urgent Coursework & Deadlines</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                  {urgentTasks.length} {urgentTasks.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Items requiring immediate attention based on deadlines and course weight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="px-6 py-3 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 text-zinc-700">
            <span className="font-semibold text-rose-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              Est. Study Time: {totalEstimatedHours} hours
            </span>
            <span className="text-zinc-400">|</span>
            <span>
              Selected: <strong className="text-zinc-900">{selectedTaskIds.size}</strong> of {urgentTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="select-all-urgent-btn"
              onClick={toggleSelectAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-rose-800 hover:bg-rose-100 transition-colors"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Select All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Body List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {urgentTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-800">All Caught Up!</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                There are currently no urgent assignments or imminent deadlines pending. Great job staying ahead of your coursework!
              </p>
            </div>
          ) : (
            urgentTasks.map((task) => {
              const isSelected = selectedTaskIds.has(task.id);
              const urgency = getUrgencyInfo(task);
              const hasDueDate = !!task.dueDate;
              const dueDate = hasDueDate ? new Date(task.dueDate!) : new Date();
              const formattedDate = hasDueDate ? dueDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Optional (No Deadline)';

              return (
                <div
                  key={task.id}
                  id={`urgent-item-${task.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-rose-300 bg-rose-50/40 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectTask(task.id)}
                      className="mt-0.5 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-900 text-white">
                            {task.courseCode}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium truncate max-w-[200px]">
                            {task.courseName}
                          </span>
                          {task.brightspaceType && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase font-semibold">
                              {task.brightspaceType}
                            </span>
                          )}
                        </div>

                        {/* Urgency Pill */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${urgency.badgeColor}`}>
                            {urgency.reason} • {urgency.timeLabel}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-zinc-900 mt-1">{task.title}</h4>
                      {task.description && (
                        <div className="text-xs text-zinc-600 mt-2 leading-relaxed bg-white/60 rounded-md p-2.5 border border-zinc-100/50 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {task.description}
                        </div>
                      )}

                      {/* Meta footer & quick action buttons */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-3 text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            Due: <strong className="text-zinc-700 font-medium">{formattedDate}</strong>
                          </span>
                          <span>•</span>
                          <span>Est: {task.estimatedMinutes}m</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.brightspaceUrl && (
                            <a
                              href={task.brightspaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8f001a] hover:underline"
                            >
                              <span>Open Dropbox</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenGoogleCalendar(task)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[11px] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            title="Open this assignment in Google Calendar"
                          >
                            <Calendar className="w-3 h-3 text-sky-600" />
                            <span>Calendar</span>
                          </button>

                          <button
                            onClick={() => {
                              onToggleComplete(task);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-2xs transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Batch Operations */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => {
              onFilterToUrgentInMainList();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 hover:underline"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Main List to Urgent Only</span>
          </button>

          <div className="flex items-center space-x-2">
            {selectedTaskIds.size > 0 && (
              <button
                onClick={handleBatchMarkCompleted}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-300 rounded-md transition-colors"
              >
                Mark Selected Completed ({selectedTaskIds.size})
              </button>
            )}

            <button
              id="export-urgent-ics-btn"
              onClick={handleExportSelected}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export {selectedTaskIds.size > 0 ? `${selectedTaskIds.size} Selected` : 'All'} (.ics)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-zinc-800 hover:bg-zinc-900 text-white shadow-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
