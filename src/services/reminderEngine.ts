import { DesktopNotification, TaskItem } from '../types';
import { playWindowsNotificationChime } from '../utils/audioChime';
import { OfflineStorageService } from './offlineStorage';

export type ReminderListener = (notification: DesktopNotification) => void;

export class ReminderEngine {
  private static intervalId: number | null = null;
  private static listeners: Set<ReminderListener> = new Set();
  private static soundEnabled: boolean = true;
  private static desktopNotificationsEnabled: boolean = true;

  static subscribe(listener: ReminderListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  static setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  static isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  static async requestDesktopNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  static hasDesktopNotificationPermission(): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  /**
   * Starts background reminder evaluation
   */
  static start(onTasksUpdated?: (tasks: TaskItem[]) => void): void {
    if (this.intervalId !== null) return;

    // Run immediate check
    this.evaluateReminders(onTasksUpdated);

    // Run every 20 seconds
    this.intervalId = window.setInterval(() => {
      this.evaluateReminders(onTasksUpdated);
    }, 20000);
  }

  static stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Evaluates all tasks and fires any due reminders
   */
  static evaluateReminders(onTasksUpdated?: (tasks: TaskItem[]) => void): void {
    const tasks = OfflineStorageService.getTasks();
    const now = Date.now();
    let tasksModified = false;

    tasks.forEach((task) => {
      if (task.status === 'completed') return;

      const dueTime = new Date(task.dueDate).getTime();
      const diffMinutes = Math.floor((dueTime - now) / (60 * 1000));

      task.reminders.forEach((reminder) => {
        // Trigger if we are within reminder window (e.g. <= minutesBefore) and dueTime hasn't passed more than 2 hours ago
        if (!reminder.triggered && diffMinutes <= reminder.minutesBefore && diffMinutes > -120) {
          reminder.triggered = true;
          tasksModified = true;

          const isOverdue = diffMinutes <= 0;
          const dueInText = isOverdue
            ? 'Task deadline has arrived!'
            : diffMinutes >= 60
            ? `Due in ${Math.round(diffMinutes / 60)} hour(s)`
            : `Due in ${diffMinutes} minute(s)`;

          const notification: DesktopNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            taskId: task.id,
            title: `Reminder: [${task.courseCode}] ${task.title}`,
            courseCode: task.courseCode,
            message: `${dueInText}. ${task.description.slice(0, 100)}`,
            dueDate: task.dueDate,
            timestamp: new Date().toISOString(),
            read: false,
            type: isOverdue ? 'overdue' : 'due_soon',
          };

          // 1. Play sound
          if (this.soundEnabled) {
            playWindowsNotificationChime();
          }

          // 2. Browser native desktop notification if allowed
          if (this.desktopNotificationsEnabled && this.hasDesktopNotificationPermission()) {
            try {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: task.id,
              });
            } catch {
              // fallback
            }
          }

          // 3. Save to in-app notification center
          OfflineStorageService.addNotification(notification);

          // 4. Notify app listeners
          this.listeners.forEach((listener) => listener(notification));
        }
      });
    });

    if (tasksModified) {
      OfflineStorageService.saveTasks(tasks);
      if (onTasksUpdated) {
        onTasksUpdated(tasks);
      }
    }
  }

  /**
   * Triggers a manual test chime and notification for testing
   */
  static triggerTestNotification(): DesktopNotification {
    playWindowsNotificationChime();

    const notif: DesktopNotification = {
      id: `test-${Date.now()}`,
      taskId: 'test-task',
      title: 'Automated Reminder Test',
      courseCode: 'CSI 2110',
      message: 'Windows audio chime and reminder engine are functioning normally.',
      dueDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'due_soon',
    };

    OfflineStorageService.addNotification(notif);
    this.listeners.forEach((l) => l(notif));
    return notif;
  }
}
