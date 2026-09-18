import { DesktopNotification, TaskItem } from '../types';
import { INITIAL_BRIGHTSPACE_TASKS } from './brightspaceService';
import { sanitizeTaskCourse } from '../utils/taskUtils';

const TASKS_STORAGE_KEY = 'uottawa_tasks_offline_cache_v2';
const NOTIFICATIONS_STORAGE_KEY = 'uottawa_desktop_notifications_v1';
const OFFLINE_QUEUE_KEY = 'uottawa_offline_sync_queue_v1';

export class OfflineStorageService {
  /**
   * Check if the device is currently online
   */
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Loads all tasks from local offline storage.
   * If empty on first boot, seeds initial uOttawa Brightspace tasks (since user is assumed logged in).
   */
  static getTasks(): TaskItem[] {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (raw) {
        let tasks = JSON.parse(raw) as TaskItem[];
        
        // One-time sanitization for "starts" / "available" events that were incorrectly marked with a dueDate
        let modified = false;
        tasks = tasks.map((t) => {
          let updated = sanitizeTaskCourse(t);
          const title = updated.title.toLowerCase();
          const desc = updated.description?.toLowerCase() || '';
          const isStartEvent = title.includes('starts ') || desc.includes('starts ') || title.includes('available');
          
          if (isStartEvent && updated.dueDate) {
            modified = true;
            return {
              ...updated,
              startDate: updated.startDate || updated.dueDate,
              dueDate: undefined,
              isOptional: true,
              priority: 'low'
            };
          }

          if (updated.courseCode !== t.courseCode || updated.courseName !== t.courseName) {
            modified = true;
          }

          return updated;
        });

        if (modified) {
          this.saveTasks(tasks);
        }

        return tasks;
      }
    } catch (err) {
      console.error('Failed to load tasks from localStorage', err);
    }

    // Default Seed
    const now = new Date().toISOString();
    const seeded: TaskItem[] = INITIAL_BRIGHTSPACE_TASKS.map((item, idx) => ({
      ...item,
      id: `task-${idx + 1}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'synced',
      reminders: [
        { id: `rem-${idx}-1`, minutesBefore: 60, triggered: false },
        { id: `rem-${idx}-2`, minutesBefore: 1440, triggered: false },
      ],
    }));

    this.saveTasks(seeded);
    return seeded;
  }

  /**
   * Persists all tasks to localStorage
   */
  static saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to write tasks to localStorage', err);
    }
  }

  /**
   * Saves or updates an individual task with offline tracking
   */
  static upsertTask(task: TaskItem): TaskItem[] {
    const tasks = this.getTasks();
    const online = this.isOnline();
    const now = new Date().toISOString();

    const existingIndex = tasks.findIndex((t) => t.id === task.id);

    const taskToSave: TaskItem = {
      ...task,
      updatedAt: now,
      isOfflineModified: !online,
      isOfflineCreated: existingIndex === -1 && !online ? true : task.isOfflineCreated,
      syncStatus: online ? 'synced' : 'pending_sync',
    };

    let updatedTasks: TaskItem[];
    if (existingIndex >= 0) {
      updatedTasks = [...tasks];
      updatedTasks[existingIndex] = taskToSave;
    } else {
      updatedTasks = [taskToSave, ...tasks];
    }

    this.saveTasks(updatedTasks);

    if (!online) {
      this.addToOfflineQueue({
        type: existingIndex >= 0 ? 'update' : 'create',
        taskId: taskToSave.id,
        timestamp: now,
      });
    }

    return updatedTasks;
  }

  /**
   * Deletes a task
   */
  static deleteTask(taskId: string): TaskItem[] {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    this.saveTasks(filtered);

    if (!this.isOnline()) {
      this.addToOfflineQueue({
        type: 'delete',
        taskId,
        timestamp: new Date().toISOString(),
      });
    }

    return filtered;
  }

  /**
   * Mark sync complete when connectivity returns
   */
  static syncOfflineChanges(): { syncedCount: number; updatedTasks: TaskItem[] } {
    const tasks = this.getTasks();
    let count = 0;

    const resolved = tasks.map((task) => {
      if (task.syncStatus === 'pending_sync' || task.isOfflineModified || task.isOfflineCreated) {
        count++;
        return {
          ...task,
          syncStatus: 'synced' as const,
          isOfflineModified: false,
          isOfflineCreated: false,
        };
      }
      return task;
    });

    if (count > 0) {
      this.saveTasks(resolved);
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }

    return { syncedCount: count, updatedTasks: resolved };
  }

  // --- Offline Queue Helpers ---
  private static addToOfflineQueue(item: { type: string; taskId: string; timestamp: string }): void {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(item);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error(e);
    }
  }

  // --- Desktop Notifications Storage ---
  static getNotifications(): DesktopNotification[] {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveNotifications(notifications: DesktopNotification[]): void {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }

  static addNotification(notif: DesktopNotification): DesktopNotification[] {
    const list = this.getNotifications();
    const updated = [notif, ...list.slice(0, 49)]; // keep latest 50
    this.saveNotifications(updated);
    return updated;
  }

  static markNotificationRead(id: string): DesktopNotification[] {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
    return updated;
  }

  static clearAllNotifications(): void {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  }
}
