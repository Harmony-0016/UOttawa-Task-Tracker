import { BrightspaceCourse, BrightspaceSession, TaskItem } from '../types';

const BRIGHTSPACE_STORAGE_KEY = 'uottawa_brightspace_session_v1';

export const DEFAULT_UOTTAWA_COURSES: BrightspaceCourse[] = [
  {
    id: 'uottawa-csi2110',
    code: 'CSI 2110',
    name: 'Data Structures and Algorithms',
    instructor: 'Dr. Michael Adams',
    semester: 'Fall / Winter 2026',
    color: '#0284c7', // Sky 600
    unreadAnnouncements: 2,
    activeTasksCount: 3,
  },
  {
    id: 'uottawa-seg3103',
    code: 'SEG 3103',
    name: 'Software Quality Assurance',
    instructor: 'Dr. Stéphane Somé',
    semester: 'Fall / Winter 2026',
    color: '#8b5cf6', // Violet 500
    unreadAnnouncements: 1,
    activeTasksCount: 2,
  },
  {
    id: 'uottawa-mat1320',
    code: 'MAT 1320',
    name: 'Calculus I & Mathematical Modeling',
    instructor: 'Dr. Paul Desrosiers',
    semester: 'Fall / Winter 2026',
    color: '#ea580c', // Orange 600
    unreadAnnouncements: 0,
    activeTasksCount: 2,
  },
  {
    id: 'uottawa-ceg3185',
    code: 'CEG 3185',
    name: 'Introduction to Telecommunications',
    instructor: 'Dr. Carlisle Adams',
    semester: 'Fall / Winter 2026',
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

export const INITIAL_BRIGHTSPACE_TASKS: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'reminders'>[] = [
  {
    title: 'Lab 4: AVL Trees & Priority Queues Implementation',
    description: 'Submit Java implementation and test suite zip file to Brightspace dropbox before 11:59 PM.',
    courseCode: 'CSI 2110',
    courseName: 'Data Structures and Algorithms',
    dueDate: createIsoDate(0, 23, 59), // Due TODAY
    estimatedMinutes: 90,
    priority: 'high',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'lab',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/dropbox/user/folder_submit_files.d2l?ou=418902',
    brightspaceCourseId: 'uottawa-csi2110',
  },
  {
    title: 'Automated Test Suite Plan (JUnit 5 & Mockito)',
    description: 'Prepare test plan document detailing unit test coverage and boundary value analysis for Project Milestone 1.',
    courseCode: 'SEG 3103',
    courseName: 'Software Quality Assurance',
    dueDate: createIsoDate(1, 17, 0), // Due Tomorrow
    estimatedMinutes: 120,
    priority: 'high',
    status: 'in_progress',
    source: 'brightspace',
    brightspaceType: 'assignment',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/dropbox/user/folder_submit_files.d2l?ou=418903',
    brightspaceCourseId: 'uottawa-seg3103',
  },
  {
    title: 'Brightspace Quiz 3: Integration by Parts & Series',
    description: 'Complete the online 45-minute timed quiz. Permitted one double-sided formula sheet.',
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
    title: 'Wireshark Packet Capture Analysis Lab',
    description: 'Analyze TCP handshake and DNS resolution latencies from the campus network capture dump.',
    courseCode: 'CEG 3185',
    courseName: 'Introduction to Telecommunications',
    dueDate: createIsoDate(3, 23, 59),
    estimatedMinutes: 75,
    priority: 'medium',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'lab',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/lms/dropbox/user/folder_submit_files.d2l?ou=418905',
    brightspaceCourseId: 'uottawa-ceg3185',
  },
  {
    title: 'Chapter 5 Reading: Red-Black Trees & Multiway Search',
    description: 'Read Sections 5.1 through 5.4 in Goodrich & Tamassia before Thursday lecture.',
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
    title: 'Discussion Forum: Mutation Testing vs Equivalence Partitioning',
    description: 'Post your original response (min 250 words) and respond to at least one peer on the Brightspace board.',
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
    title: 'CSI 2110 Midterm Review & Problem Set 2',
    description: 'Practice problem set for asymptotic notation and tree balancing algorithms.',
    courseCode: 'CSI 2110',
    courseName: 'Data Structures and Algorithms',
    dueDate: createIsoDate(6, 20, 0),
    estimatedMinutes: 150,
    priority: 'high',
    status: 'pending',
    source: 'brightspace',
    brightspaceType: 'exam',
    brightspaceUrl: 'https://uottawa.brightspace.com/d2l/le/content/418902/Home',
    brightspaceCourseId: 'uottawa-csi2110',
  }
];

export class BrightspaceService {
  /**
   * Retrieves the current uOttawa Brightspace session.
   * By default, initializes with `isLoggedIn: true` per prompt requirements.
   */
  static getSession(): BrightspaceSession {
    try {
      const stored = localStorage.getItem(BRIGHTSPACE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore parsing error, return default
    }

    const defaultSession: BrightspaceSession = {
      isLoggedIn: true, // ASSUME LOGGED IN BY DEFAULT
      studentName: 'Gee-Gee Student',
      studentEmail: 'student@uottawa.ca',
      studentId: '300298144',
      institution: 'University of Ottawa / Université d\'Ottawa',
      lastSyncTimestamp: new Date().toISOString(),
      activeSemester: 'Winter 2026',
      availableCourses: DEFAULT_UOTTAWA_COURSES,
    };

    this.saveSession(defaultSession);
    return defaultSession;
  }

  static saveSession(session: BrightspaceSession): void {
    localStorage.setItem(BRIGHTSPACE_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Sets login state. Used to toggle or simulate being logged in vs logged out.
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
   * Explores the user's uOttawa Brightspace courses and returns discovered tasks.
   * If not logged in, throws the explicit error specified in requirements.
   */
  static async exploreBrightspaceCourses(): Promise<{ tasks: TaskItem[]; coursesCount: number; timestamp: string }> {
    const session = this.getSession();

    // STRICT REQUIREMENT CHECK:
    // "Assume that I will already be logged in. Otherwise, provide an error saying that I am not logged in"
    if (!session.isLoggedIn) {
      throw new Error('You are not logged in to uOttawa Brightspace. Please sign in to authenticate your uOttawa Brightspace session before exploring coursework.');
    }

    // Simulate exploratory network latency (exploration of LMS portal)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date().toISOString();
    const generatedTasks: TaskItem[] = INITIAL_BRIGHTSPACE_TASKS.map((item, idx) => ({
      ...item,
      id: `brightspace-${item.courseCode.toLowerCase().replace(/\s+/g, '-')}-${idx + 1}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'synced',
      reminders: [
        { id: `rem-${idx}-1`, minutesBefore: 60, triggered: false }, // 1 hour before
        { id: `rem-${idx}-2`, minutesBefore: 1440, triggered: false }, // 24 hours before
      ],
    }));

    session.lastSyncTimestamp = now;
    this.saveSession(session);

    return {
      tasks: generatedTasks,
      coursesCount: session.availableCourses.length,
      timestamp: now,
    };
  }
}
