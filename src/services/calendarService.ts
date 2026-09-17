import { TaskItem } from '../types';

/**
 * Service to synchronize and export tasks to Google Calendar without requiring third-party OAuth.
 * Provides direct Google Calendar web event creation links, bulk .ics exports,
 * and calendar event payloads.
 */
export class CalendarService {
  /**
   * Generates a direct Google Calendar Web URL to create an event with one click.
   * Format: https://calendar.google.com/calendar/render?action=TEMPLATE&text=...
   */
  static getGoogleCalendarEventUrl(task: TaskItem): string {
    const due = new Date(task.dueDate);
    const start = new Date(due.getTime() - (task.estimatedMinutes || 60) * 60 * 1000);

    const formatGoogleDate = (d: Date): string => {
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const dates = `${formatGoogleDate(start)}/${formatGoogleDate(due)}`;
    const title = `[${task.courseCode}] ${task.title}`;
    const details = `${task.description}\n\nCourse: ${task.courseName} (${task.courseCode})\nPriority: ${task.priority.toUpperCase()}\nEstimated: ${task.estimatedMinutes} mins\nSource: ${task.source === 'brightspace' ? 'uOttawa Brightspace' : 'Manual Task'}${task.brightspaceUrl ? `\nLink: ${task.brightspaceUrl}` : ''}`;
    const location = 'uOttawa Brightspace / Ottawa Campus';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: dates,
      details: details,
      location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Opens Google Calendar directly in a new tab with the task event prefilled.
   */
  static openInGoogleCalendar(task: TaskItem): void {
    const url = this.getGoogleCalendarEventUrl(task);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Generates standard iCalendar (.ics) format for synchronization with Google Calendar,
   * Windows Calendar, or Outlook.
   */
  static generateIcsContent(tasks: TaskItem[]): string {
    const formatIcsDate = (d: Date): string => {
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//uOttawa//Task & Calendar Synchronizer//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:uOttawa Tasks & Brightspace',
      'X-WR-TIMEZONE:America/Toronto',
    ];

    tasks.forEach((task) => {
      const due = new Date(task.dueDate);
      const start = new Date(due.getTime() - (task.estimatedMinutes || 60) * 60 * 1000);
      const now = new Date();

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:uottawa-task-${task.id}@uottawa.brightspace`);
      lines.push(`DTSTAMP:${formatIcsDate(now)}`);
      lines.push(`DTSTART:${formatIcsDate(start)}`);
      lines.push(`DTEND:${formatIcsDate(due)}`);
      lines.push(`SUMMARY:[${task.courseCode}] ${task.title.replace(/,/g, '\\,')}`);
      lines.push(`DESCRIPTION:${task.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`);
      lines.push(`CATEGORIES:${task.courseCode},uOttawa,${task.priority.toUpperCase()}`);
      lines.push('STATUS:CONFIRMED');

      // Add alarms for reminders
      task.reminders.forEach((r) => {
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:Reminder: ${task.title}`);
        lines.push(`TRIGGER:-PT${r.minutesBefore}M`);
        lines.push('END:VALARM');
      });

      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Triggers download of the .ics calendar file for instant import into Google Calendar.
   */
  static downloadIcsCalendar(tasks: TaskItem[], filename: string = 'uottawa-tasks-sync.ics'): void {
    const content = this.generateIcsContent(tasks);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}
