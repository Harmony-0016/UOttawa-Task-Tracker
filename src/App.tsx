import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  CloudOff, 
  BookOpen, 
  Compass, 
  Download 
} from 'lucide-react';
import { 
  TaskItem, 
  BrightspaceSession, 
  DesktopNotification, 
  FilterOptions,
  CourseMaterial
} from './types';
import { OfflineStorageService } from './services/offlineStorage';
import { BrightspaceService } from './services/brightspaceService';
import { ReminderEngine } from './services/reminderEngine';
import { CalendarService } from './services/calendarService';
import { WindowsDesktopFrame } from './components/WindowsDesktopFrame';
import { TopOverviewBanner } from './components/TopOverviewBanner';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskCard } from './components/TaskCard';
import { TaskEditModal } from './components/TaskEditModal';
import { BrightspaceExplorerModal } from './components/BrightspaceExplorerModal';
import { CalendarTimelineView } from './components/CalendarTimelineView';
import { CoursesView } from './components/CoursesView';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ReminderToast } from './components/ReminderToast';
import { UrgentItemsModal } from './components/UrgentItemsModal';
import { isTaskUrgent, isTaskObscenelyOverdue } from './utils/taskUtils';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { FirestoreService } from './services/firestoreService';
import { LandingScreen } from './components/LandingScreen';

export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingScreen />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [session, setSession] = useState<BrightspaceSession>(() => BrightspaceService.getSession());
  const [isOnline, setIsOnline] = useState<boolean>(() => OfflineStorageService.isOnline());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'courses'>('tasks');

  // Modals state
  const [isBrightspaceModalOpen, setIsBrightspaceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Notification center & Live toast
  const [notifications, setNotifications] = useState<DesktopNotification[]>(() => 
    OfflineStorageService.getNotifications()
  );
  const [activeToast, setActiveToast] = useState<DesktopNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => ReminderEngine.isSoundEnabled());

  // Filter options
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    courseFilter: 'ALL',
    statusFilter: 'ALL',
    priorityFilter: 'ALL',
    sourceFilter: 'ALL',
    dateRange: 'ALL',
  });

  // Online / Offline listener setup
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Subscribe to Firestore tasks
    const unsubscribe = FirestoreService.subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Automated Reminders Engine setup
  useEffect(() => {
    // Subscribe to incoming reminder alerts
    const unsubscribe = ReminderEngine.subscribe((notif) => {
      setNotifications(OfflineStorageService.getNotifications());
      setActiveToast(notif);
    });

    // Start background evaluation loop
    ReminderEngine.start((updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => {
      unsubscribe();
      ReminderEngine.stop();
    };
  }, []);

  // Manual Sync trigger
  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      ReminderEngine.evaluateReminders();
      setIsSyncing(false);
    }, 600);
  };

  // Task Operations (Offline Supported via Firestore native cache)
  const handleSaveTask = (task: TaskItem) => {
    FirestoreService.saveTask(task);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    FirestoreService.deleteTask(taskId);
  };

  const handleToggleComplete = (task: TaskItem) => {
    const isNowCompleted = task.status !== 'completed';
    const updatedTask: TaskItem = {
      ...task,
      status: isNowCompleted ? 'completed' : 'pending',
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    };
    FirestoreService.saveTask(updatedTask);
  };

  // Import tasks discovered from Brightspace
  const handleImportBrightspaceTasks = (importedTasks: TaskItem[]) => {
    let current = [...tasks];
    importedTasks.forEach((imported) => {
      FirestoreService.saveTask(imported);
      
      const existingIdx = current.findIndex((t) => t.id === imported.id || (t.title === imported.title && t.courseCode === imported.courseCode));
      if (existingIdx >= 0) {
        current[existingIdx] = imported;
      } else {
        current = [imported, ...current];
      }
    });

    setTasks(current);

    // Dynamically update available courses based on what is found in Brightspace tasks
    let sessionChanged = false;
    let updatedCourses = [...session.availableCourses];
    const existingCodes = new Set(updatedCourses.map((c) => c.code));

    importedTasks.forEach((t) => {
      if (t.courseCode && t.courseCode !== 'uOttawa General' && !existingCodes.has(t.courseCode)) {
        existingCodes.add(t.courseCode);
        updatedCourses.push({
          id: `uottawa-${t.courseCode.toLowerCase().replace(/\s+/g, '')}`,
          code: t.courseCode,
          name: t.courseName || t.courseCode,
          instructor: 'Unknown Instructor',
          semester: session.activeSemester,
          color: '#64748b', // Slate 500 fallback color
          unreadAnnouncements: 0,
          activeTasksCount: 0,
        });
        sessionChanged = true;
      }
    });

    if (sessionChanged) {
      const updatedSession = { ...session, availableCourses: updatedCourses };
      BrightspaceService.saveSession(updatedSession);
      setSession(updatedSession);
    }
  };

  // Open task editor with preset course
  const handleCreateTaskForCourse = (courseCode: string, courseName: string) => {
    setEditingTask({
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      courseCode,
      courseName,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedMinutes: 60,
      priority: 'medium',
      status: 'pending',
      source: 'manual',
      reminders: [{ id: `rem-${Date.now()}`, minutesBefore: 60, triggered: false }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditModalOpen(true);
  };

  // Calendar exports
  const handleDownloadFullCalendar = () => {
    CalendarService.downloadIcsCalendar(tasks, 'uottawa-tasks-sync.ics');
  };

  const handleOpenGoogleCalendarSingle = (task: TaskItem) => {
    CalendarService.openInGoogleCalendar(task);
  };

  // Notifications
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    ReminderEngine.setSoundEnabled(next);
  };

  const handleClearNotifications = () => {
    OfflineStorageService.clearAllNotifications();
    setNotifications([]);
  };

  const handleTriggerTestReminder = () => {
    const testNotif = ReminderEngine.triggerTestNotification();
    setNotifications(OfflineStorageService.getNotifications());
    setActiveToast(testNotif);
  };

  const handleRequestDesktopPermission = async () => {
    await ReminderEngine.requestDesktopNotificationPermission();
  };

  // Visible tasks filter out obscenely overdue tasks so they do not appear anywhere in the UI
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => !isTaskObscenelyOverdue(t));
  }, [tasks]);

  // Filtered tasks calculation
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    return visibleTasks.filter((t) => {
      // Urgent filter
      if (filters.onlyUrgent && !isTaskUrgent(t)) {
        return false;
      }

      // Course filter
      if (filters.courseFilter !== 'ALL' && t.courseCode !== filters.courseFilter) {
        return false;
      }

      // Status filter
      if (filters.statusFilter === 'active' && t.status === 'completed') return false;
      if (filters.statusFilter === 'completed' && t.status !== 'completed') return false;

      // Priority filter
      if (filters.priorityFilter === 'urgent') {
        if (!isTaskUrgent(t)) return false;
      } else if (filters.priorityFilter !== 'ALL' && t.priority !== filters.priorityFilter) {
        return false;
      }

      // Date Range filter
      const hasDueDate = !!t.dueDate && !isNaN(new Date(t.dueDate).getTime());
      const dueTime = hasDueDate ? new Date(t.dueDate!).getTime() : NaN;
      if (filters.dateRange === 'today') {
        if (!hasDueDate || dueTime < todayStart || dueTime > todayEnd) return false;
      } else if (filters.dateRange === 'upcoming') {
        if (!hasDueDate || dueTime <= todayEnd) return false;
      } else if (filters.dateRange === 'overdue') {
        if (!hasDueDate || t.status === 'completed' || dueTime >= now.getTime()) return false;
      }

      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCourse = t.courseCode.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchDesc) return false;
      }

      return true;
    });
  }, [visibleTasks, filters]);

  const urgentTasksCount = useMemo(() => {
    return visibleTasks.filter((t) => isTaskUrgent(t)).length;
  }, [visibleTasks]);

  const offlineModifiedCount = 0; // Handled transparently by Firestore SDK

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <WindowsDesktopFrame
      isOnline={isOnline}
      isSyncing={isSyncing}
      unreadNotificationsCount={unreadNotificationsCount}
      session={session}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      onOpenBrightspaceModal={() => setIsBrightspaceModalOpen(true)}
      onManualSync={handleManualSync}
      onSignOut={handleSignOut}
    >
      {/* Top Metrics / Overview */}
      <TopOverviewBanner
        tasks={visibleTasks}
        session={session}
        isOnline={isOnline}
        onExploreBrightspace={() => setIsBrightspaceModalOpen(true)}
        onSyncGoogleCalendarAll={handleDownloadFullCalendar}
        onSelectUrgentItems={() => setIsUrgentModalOpen(true)}
      />

      {/* Main Tab Content */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <TaskFilterBar
            filters={filters}
            onFilterChange={setFilters}
            courses={session.availableCourses}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setIsEditModalOpen(true);
            }}
            onDownloadIcs={handleDownloadFullCalendar}
            offlineModifiedCount={offlineModifiedCount}
            urgentCount={urgentTasksCount}
            onOpenUrgentInspector={() => setIsUrgentModalOpen(true)}
          />

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-800">No matching daily tasks</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No tasks match your selected filter criteria. Create a new task or explore uOttawa Brightspace to load upcoming coursework.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#8f001a] text-white hover:bg-[#720014] transition-colors"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setIsBrightspaceModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  Explore Brightspace
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <CalendarTimelineView
          tasks={visibleTasks}
          onOpenGoogleCalendar={handleOpenGoogleCalendarSingle}
          onEditTask={(t) => {
            setEditingTask(t);
            setIsEditModalOpen(true);
          }}
        />
      )}

      {activeTab === 'courses' && (
        <CoursesView
          session={session}
          tasks={visibleTasks}
          onExploreBrightspace={() => setIsBrightspaceModalOpen(true)}
          onCreateTaskForCourse={handleCreateTaskForCourse}
        />
      )}

      {/* Task Creation / Offline Edit Modal */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
        isOnline={isOnline}
        availableCourses={session.availableCourses}
      />

      {/* Brightspace Exploration & Auth Modal */}
      <BrightspaceExplorerModal
        isOpen={isBrightspaceModalOpen}
        onClose={() => setIsBrightspaceModalOpen(false)}
        session={session}
        onSessionChange={setSession}
        onImportTasks={handleImportBrightspaceTasks}
      />

      {/* Urgent Items Selector & Inspector Modal */}
      <UrgentItemsModal
        isOpen={isUrgentModalOpen}
        onClose={() => setIsUrgentModalOpen(false)}
        tasks={visibleTasks}
        onToggleComplete={handleToggleComplete}
        onEditTask={(task) => {
          setEditingTask(task);
          setIsEditModalOpen(true);
        }}
        onFilterToUrgentInMainList={() => {
          setActiveTab('tasks');
          setFilters((prev) => ({
            ...prev,
            onlyUrgent: true,
            priorityFilter: 'ALL',
          }));
        }}
      />

      {/* Windows 11 Action Center Notification Drawer */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onClearNotifications={handleClearNotifications}
        onTriggerTestReminder={handleTriggerTestReminder}
        onRequestDesktopPermission={handleRequestDesktopPermission}
      />

      {/* Live Toast Alert for Approaching Deadlines */}
      <ReminderToast
        notification={activeToast}
        task={tasks.find((t) => t.id === activeToast?.taskId)}
        onDismiss={() => setActiveToast(null)}
        onMarkComplete={(taskId) => {
          const target = tasks.find((t) => t.id === taskId);
          if (target) {
            handleToggleComplete(target);
          }
          setActiveToast(null);
        }}
      />
    </WindowsDesktopFrame>
  );
}
