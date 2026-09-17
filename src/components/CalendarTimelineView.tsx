import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  GraduationCap
} from 'lucide-react';
import { TaskItem } from '../types';
import { CalendarService } from '../services/calendarService';

interface CalendarTimelineViewProps {
  tasks: TaskItem[];
  onOpenGoogleCalendar: (task: TaskItem) => void;
  onEditTask: (task: TaskItem) => void;
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  tasks,
  onOpenGoogleCalendar,
  onEditTask,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Filter tasks due on the selected date
  const tasksForDay = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return isSameDay(due, selectedDate);
  });

  // Export full calendar to .ics file
  const handleDownloadFullCalendar = () => {
    CalendarService.downloadIcsCalendar(tasks, 'uottawa-brightspace-tasks.ics');
  };

  // Open Google Calendar Import Page in new tab
  const handleOpenGoogleCalendarSettings = () => {
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Calendar Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Day Navigator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-800 hover:bg-white rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextDay}
              className="p-1 rounded hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-base font-bold text-zinc-900">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h2>
            <p className="text-xs text-zinc-500">
              {tasksForDay.length} task(s) scheduled for this date
            </p>
          </div>
        </div>

        {/* Right: Google Calendar Synchronization Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap">
          <button
            id="download-ics-calendar-btn"
            onClick={handleDownloadFullCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 shadow-2xs transition-colors"
            title="Download .ics file for Google Calendar, Outlook, or Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Export .ICS Calendar</span>
          </button>

          <button
            id="open-gcal-import-btn"
            onClick={handleOpenGoogleCalendarSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors"
            title="Open Google Calendar Import in Browser"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Open Google Calendar</span>
            <ExternalLink className="w-3 h-3 text-sky-200" />
          </button>
        </div>
      </div>

      {/* Timeline Day View Grid */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Hourly Schedule & Deadlines
          </span>
          <span className="text-xs text-zinc-500">
            Timezone: America/Toronto (Ottawa, Canada)
          </span>
        </div>

        {tasksForDay.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-800">No tasks scheduled for this day</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Check other days in the timeline or explore Brightspace to synchronize upcoming coursework.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 p-4 space-y-3">
            {tasksForDay.map((task) => {
              const due = new Date(task.dueDate);
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-zinc-50/60 border-zinc-200 opacity-60'
                      : 'bg-white hover:border-zinc-300 hover:shadow-xs border-zinc-200'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 shrink-0 mt-0.5 border border-sky-100">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 px-2 py-0.5 rounded bg-zinc-100">
                          {task.courseCode}
                        </span>
                        <span className="text-xs font-semibold text-sky-800">
                          Due at {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {task.source === 'brightspace' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8f001a]/10 text-[#8f001a] font-medium flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            uOttawa Brightspace
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-semibold mt-1 ${isCompleted ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Sync to Google Calendar direct link */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenGoogleCalendar(task);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Sync to Google Calendar</span>
                      <ExternalLink className="w-3 h-3 text-sky-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Synchronization Instructions & Tips */}
      <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 flex items-start space-x-3 text-xs text-sky-900">
        <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Seamless Google Calendar Synchronization</p>
          <p className="text-sky-800 leading-relaxed">
            Click <strong>Sync to Google Calendar</strong> on any task to instantly populate an event in Google Calendar with exact start time, duration, and course details. You can also click <strong>Export .ICS Calendar</strong> to import your entire uOttawa Brightspace agenda into Google Calendar, Windows Calendar, or your mobile device.
          </p>
        </div>
      </div>
    </div>
  );
};
