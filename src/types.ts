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
  isOptional?: boolean;
  startDate?: string;
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  dueDate?: string; // ISO string or empty/undefined for Optional
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

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'slideshow' | 'link';
  url: string; // ObjectURL or actual link
  createdAt: string;
}

export interface ExplorationLogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  endpoint?: string;
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
  feedUrl?: string; // Optional real personal calendar feed url
  sessionCookie?: string; // Optional real d2lSessionVal cookie
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
  priorityFilter: 'ALL' | TaskPriority | 'urgent';
  sourceFilter: 'ALL' | TaskSource;
  dateRange: 'ALL' | 'today' | 'upcoming' | 'overdue';
  onlyUrgent?: boolean;
}
