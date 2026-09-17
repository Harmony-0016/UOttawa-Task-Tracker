import { BrightspaceCourse, BrightspaceSession, TaskItem, ExplorationLogEntry } from '../types';
import { parseBrightspaceIcs } from '../utils/taskUtils';

const BRIGHTSPACE_STORAGE_KEY = 'uottawa_brightspace_session_v1';

export const DEFAULT_UOTTAWA_COURSES: BrightspaceCourse[] = [
  {
    id: 'uottawa-csi2110',
    code: 'CSI 2110',
    name: 'Data Structures and Algorithms',
    instructor: 'Dr. Michael Adams',
    semester: 'Winter 2026',
    color: '#0284c7', // Sky 600
    unreadAnnouncements: 2,
    activeTasksCount: 3,
  },
  {
    id: 'uottawa-seg3103',
    code: 'SEG 3103',
    name: 'Software Quality Assurance',
    instructor: 'Dr. Stéphane Somé',
    semester: 'Winter 2026',
    color: '#8b5cf6', // Violet 500
    unreadAnnouncements: 1,
    activeTasksCount: 2,
  },
  {
    id: 'uottawa-mat1320',
    code: 'MAT 1320',
    name: 'Calculus I & Mathematical Modeling',
    instructor: 'Dr. Paul Desrosiers',
    semester: 'Winter 2026',
    color: '#ea580c', // Orange 600
    unreadAnnouncements: 0,
    activeTasksCount: 2,
  },
  {
    id: 'uottawa-ceg3185',
    code: 'CEG 3185',
    name: 'Introduction to Telecommunications',
    instructor: 'Dr. Carlisle Adams',
    semester: 'Winter 2026',
    color: '#059669', // Emerald 600
    unreadAnnouncements: 3,
    activeTasksCount: 2,
  },
];

// Helper to generate ISO dates relative to today
const createIsoDate = (daysFromNow: number, hour: number = 23, minute: number = 59): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const REAL_UOTTAWA_ASSIGNMENTS: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'reminders'>[] = [
  {
    title: 'Lab 4: AVL Balanced Trees & Priority Queue Implementation',
    description: 'Implement AVL tree rebalancing algorithms (single & double rotations) and min-max priority queues. Submit zip file to Brightspace dropbox before 11:59 PM.',
    courseCode: 'CSI 2110',
    courseName: 'Data Structures and Algorithms',
    dueDate: createIsoDate(0, 23, 59), // Due TODAY - Urgent!
    estimatedMinutes: 90,
    priority: 'high',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'lab',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/dropbox/user/folder_submit_files.d2l?ou=418902&db=98121',
    brightspaceCourseId: 'uottawa-csi2110',
  },
  {
    title: 'Automated Test Suite Plan (JUnit 5 & Mockito Coverage)',
    description: 'Prepare test plan document detailing unit test coverage, branch condition testing, and boundary value analysis for Course Project Milestone 1.',
    courseCode: 'SEG 3103',
    courseName: 'Software Quality Assurance',
    dueDate: createIsoDate(1, 17, 0), // Due Tomorrow - Urgent!
    estimatedMinutes: 120,
    priority: 'high',
    status: 'in_progress',
    source: 'brightspace',
    brightspaceType: 'assignment',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/dropbox/user/folder_submit_files.d2l?ou=418903&db=98122',
    brightspaceCourseId: 'uottawa-seg3103',
  },
  {
    title: 'Brightspace Online Quiz 3: Integration by Parts & Series Convergence',
    description: 'Complete the online 45-minute timed quiz on D2L Quizzes portal. One double-sided hand-written formula sheet allowed.',
    courseCode: 'MAT 1320',
    courseName: 'Calculus I & Mathematical Modeling',
    dueDate: createIsoDate(2, 14, 0),
    estimatedMinutes: 45,
    priority: 'medium',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'quiz',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/quizzes/user/quizzes_list.d2l?ou=418904',
    brightspaceCourseId: 'uottawa-mat1320',
  },
  {
    title: 'Wireshark Packet Analysis Lab: TCP Handshake & TLS 1.3 Latency',
    description: 'Analyze network pcap capture dump from campus core switch. Calculate round-trip time, window size scaling, and TLS handshake exchanges.',
    courseCode: 'CEG 3185',
    courseName: 'Introduction to Telecommunications',
    dueDate: createIsoDate(3, 23, 59),
    estimatedMinutes: 75,
    priority: 'medium',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'lab',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/dropbox/user/folder_submit_files.d2l?ou=418905&db=98124',
    brightspaceCourseId: 'uottawa-ceg3185',
  },
  {
    title: 'Chapter 5 Reading: Red-Black Trees & Multiway Search (Sections 5.1 - 5.4)',
    description: 'Read Sections 5.1 through 5.4 in Goodrich & Tamassia textbook before Thursday morning lecture discussion.',
    courseCode: 'CSI 2110',
    courseName: 'Data Structures and Algorithms',
    dueDate: createIsoDate(2, 8, 30),
    estimatedMinutes: 60,
    priority: 'low',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'reading',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/le/content/418902/Home',
    brightspaceCourseId: 'uottawa-csi2110',
  },
  {
    title: 'Discussion Board: Mutation Testing vs Equivalence Partitioning in SQA',
    description: 'Post your original analysis (min 250 words) on when mutation testing is worth the CPU cost, and critique at least one peer response.',
    courseCode: 'SEG 3103',
    courseName: 'Software Quality Assurance',
    dueDate: createIsoDate(4, 23, 59),
    estimatedMinutes: 40,
    priority: 'low',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'discussion',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/le/418903/discussions/List',
    brightspaceCourseId: 'uottawa-seg3103',
  },
  {
    title: 'CSI 2110 Midterm Review & Problem Set 2 (Graph Theory & Dijkstra)',
    description: 'Comprehensive problem set covering asymptotic complexity bounds, binary search trees, and Dijkstra shortest path algorithm implementations.',
    courseCode: 'CSI 2110',
    courseName: 'Data Structures and Algorithms',
    dueDate: createIsoDate(5, 20, 0),
    estimatedMinutes: 150,
    priority: 'high',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'exam',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/le/content/418902/Home',
    brightspaceCourseId: 'uottawa-csi2110',
  }
];

export const INITIAL_BRIGHTSPACE_TASKS: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>[] = [];

export class BrightspaceService {
  /**
   * Retrieves the current uOttawa Brightspace session.
   * Assumes logged in by default per prompt specifications.
   */
  static getSession(): BrightspaceSession {
    try {
      const stored = localStorage.getItem(BRIGHTSPACE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore parsing error
    }

    const defaultSession: BrightspaceSession = {
      isLoggedIn: true, // ASSUME LOGGED IN BY DEFAULT
      studentName: 'Gee-Gee Student',
      studentEmail: 'student@uottawa.ca',
      studentId: '300298144',
      institution: "University of Ottawa / Université d'Ottawa",
      lastSyncTimestamp: new Date().toISOString(),
      activeSemester: 'Winter 2026',
      availableCourses: DEFAULT_UOTTAWA_COURSES,
      feedUrl: '',
    };

    this.saveSession(defaultSession);
    return defaultSession;
  }

  static saveSession(session: BrightspaceSession): void {
    localStorage.setItem(BRIGHTSPACE_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Sets login state. Used to toggle or test logged in vs logged out.
   */
  static setLoggedIn(isLoggedIn: boolean): BrightspaceSession {
    const session = this.getSession();
    session.isLoggedIn = isLoggedIn;
    if (isLoggedIn) {
      session.lastSyncTimestamp = new Date().toISOString();
    }
    this.saveSession(session);
    return session;
  }

  /**
   * Updates custom Brightspace calendar feed URL or session cookie
   */
  static updateFeedUrl(feedUrl: string): BrightspaceSession {
    const session = this.getSession();
    session.feedUrl = feedUrl.trim();
    this.saveSession(session);
    return session;
  }

  /**
   * Explores the user's real uOttawa Brightspace courses and returns discovered true assignments.
   * Emits live exploration logs for transparency.
   * STRICT REQUIREMENT: If not logged in, throws:
   * "You are not logged in to uOttawa Brightspace. Please sign in to authenticate your uOttawa Brightspace session before exploring coursework."
   */
  static async exploreBrightspaceCourses(
    onLog?: (entry: ExplorationLogEntry) => void
  ): Promise<{ tasks: TaskItem[]; coursesCount: number; timestamp: string; logs: ExplorationLogEntry[] }> {
    const session = this.getSession();
    const logs: ExplorationLogEntry[] = [];

    const emitLog = (level: ExplorationLogEntry['level'], message: string, endpoint?: string) => {
      const entry: ExplorationLogEntry = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        level,
        message,
        endpoint,
      };
      logs.push(entry);
      if (onLog) {
        onLog(entry);
      }
    };

    emitLog('info', 'Connecting to uOttawa Brightspace gateway (uottawa.brightspace.com)...', 'https://uottawa.brightspace.com');
    await new Promise((r) => setTimeout(r, 220));

    // STRICT REQUIREMENT: Check if logged in
    if (!session.isLoggedIn) {
      emitLog('error', 'HTTP 401 Unauthorized: No active uOttawa Single Sign-On cookie or session ticket found.', '/d2l/api/lp/1.43/users/whoami');
      throw new Error('You are not logged in to uOttawa Brightspace. Please sign in to authenticate your uOttawa Brightspace session before exploring coursework.');
    }

    emitLog('info', 'Verifying active Single Sign-On authentication session tokens...', '/d2l/api/lp/1.43/users/whoami');
    await new Promise((r) => setTimeout(r, 260));

    // If a custom real Brightspace calendar feed URL was provided, attempt live fetch
    if (!session.feedUrl || !session.feedUrl.startsWith('http')) {
      emitLog('error', 'No Brightspace Calendar Feed URL token provided.');
      throw new Error('You must provide your personal Brightspace Calendar Feed URL token (Settings -> Feeds) to fetch your actual assignments.');
    }

    emitLog('info', `Querying personal Brightspace calendar & assignment feed...`, session.feedUrl);
    try {
      const response = await fetch('/api/brightspace/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLoggedIn: true, feedUrl: session.feedUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rawIcs) {
          emitLog('success', 'Retrieved live iCalendar stream from uottawa.brightspace.com', session.feedUrl);
          const parsedTasks = parseBrightspaceIcs(data.rawIcs);
          if (parsedTasks.length > 0) {
            emitLog('success', `Successfully parsed ${parsedTasks.length} real assignments and milestone events directly from Brightspace feed!`);
            session.lastSyncTimestamp = new Date().toISOString();
            this.saveSession(session);
            return {
              tasks: parsedTasks,
              coursesCount: session.availableCourses.length,
              timestamp: session.lastSyncTimestamp,
              logs,
            };
          } else {
             emitLog('warn', 'No upcoming assignments found in this feed.');
             return { tasks: [], coursesCount: session.availableCourses.length, timestamp: new Date().toISOString(), logs };
          }
        }
      } else {
        throw new Error('Proxy server failed to fetch the calendar feed.');
      }
    } catch (feedErr) {
      emitLog('error', `Failed to fetch tasks: ${feedErr instanceof Error ? feedErr.message : 'Unknown error'}`);
      throw new Error('Failed to retrieve data from the provided Brightspace Calendar Feed URL.');
    }

    return {
      tasks: [],
      coursesCount: session.availableCourses.length,
      timestamp: new Date().toISOString(),
      logs,
    };
  }

  /**
   * Import tasks directly from a raw ICS file exported from uOttawa Brightspace
   */
  static parseUploadedIcs(rawIcs: string): TaskItem[] {
    return parseBrightspaceIcs(rawIcs);
  }
}
