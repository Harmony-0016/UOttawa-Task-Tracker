export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskSource = 'brightspace' | 'manual';
export type BrightspaceItemType = 'assignment' | 'quiz' | 'discussion' | 'exam' | 'lab' | 'reading';

export interface TaskReminder {
  id: string;
  minutesBefore: number; // e.g. 15, 60, 1440 (24h)
  triggered: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  dueDate: string; // ISO string
  estimatedMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  source: TaskSource;
  brightspaceType?: BrightspaceItemType;
  brightspaceUrl?: string;
  brightspaceCourseId?: string;
  reminders: TaskReminder[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isOfflineCreated?: boolean;
  isOfflineModified?: boolean;
  syncStatus?: 'synced' | 'pending_sync' | 'conflict';
}

export interface BrightspaceCourse {
  id: string;
  code: string;
  name: string;
  instructor: string;
  semester: string;
  color: string;
  unreadAnnouncements: number;
  activeTasksCount: number;
}

export interface BrightspaceSession {
  isLoggedIn: boolean;
  studentName: string;
  studentEmail: string;
  studentId: string;
  institution: string; // "University of Ottawa / Université d'Ottawa"
  lastSyncTimestamp: string | null;
  activeSemester: string;
  availableCourses: BrightspaceCourse[];
}

export interface DesktopNotification {
  id: string;
  taskId: string;
  title: string;
  courseCode: string;
  message: string;
  dueDate: string;
  timestamp: string;
  read: boolean;
  type: 'due_soon' | 'overdue' | 'brightspace_import' | 'offline_sync';
}

export interface FilterOptions {
  searchQuery: string;
  courseFilter: string; // 'ALL' or specific course code
  statusFilter: 'ALL' | 'active' | 'completed';
  priorityFilter: 'ALL' | TaskPriority;
  sourceFilter: 'ALL' | TaskSource;
  dateRange: 'ALL' | 'today' | 'upcoming' | 'overdue';
}
