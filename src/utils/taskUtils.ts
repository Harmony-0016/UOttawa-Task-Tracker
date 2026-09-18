import { TaskItem, TaskPriority, BrightspaceItemType } from '../types';

/**
 * Determines whether a task is obscenely overdue (more than a week/168 hours).
 */
export function isTaskObscenelyOverdue(task: TaskItem): boolean {
  const now = Date.now();

  // 1. Check Due Date (Overdue by > 1 week)
  if (task.dueDate) {
    const dueTime = new Date(task.dueDate).getTime();
    if (!isNaN(dueTime)) {
      const hoursOverdue = (now - dueTime) / (1000 * 60 * 60);
      return hoursOverdue > 168; // More than 7 days overdue
    }
  } else if (task.startDate) {
    // 2. Check Start Date ONLY if there is no Due Date (Started > 1 week ago)
    const startTime = new Date(task.startDate).getTime();
    if (!isNaN(startTime)) {
      const hoursSinceStart = (now - startTime) / (1000 * 60 * 60);
      if (hoursSinceStart > 168) return true; // Started more than 7 days ago
    }
  }

  // 3. Fallback: Filter out extremely old tasks (e.g. from years ago)
  if (task.createdAt) {
    const createdTime = new Date(task.createdAt).getTime();
    if (!isNaN(createdTime)) {
      const daysSinceCreation = (now - createdTime) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 180) return true; // older than ~6 months
    }
  }

  return false;
}

/**
 * Determines whether a task is urgent.
 * An item is urgent if:
 * 1. It is not completed, AND
 * 2. It has 'high' priority OR is due within 1 week OR is overdue (but not obscenely).
 */
export function isTaskUrgent(task: TaskItem): boolean {
  if (task.status === 'completed') return false;
  if (task.priority === 'low') return false; // Low priority (optional/non-mandatory) tasks are never urgent
  if (isTaskObscenelyOverdue(task)) return false; // Ignore obscenely overdue tasks
  if (task.priority === 'high') return true;

  const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : NaN;
  if (isNaN(dueTime)) return false;

  const now = Date.now();
  const hoursUntilDue = (dueTime - now) / (1000 * 60 * 60);

  // Due within next week (168 hours) or already overdue
  return hoursUntilDue <= 168;
}

export interface UrgencyInfo {
  isUrgent: boolean;
  reason: string;
  badgeColor: string;
  hoursRemaining: number;
  timeLabel: string;
}

export function getUrgencyInfo(task: TaskItem): UrgencyInfo {
  const hasDueDate = !!task.dueDate;
  const dueTime = hasDueDate ? new Date(task.dueDate!).getTime() : NaN;
  const now = Date.now();
  const hoursRemaining = hasDueDate ? (dueTime - now) / (1000 * 60 * 60) : Infinity;
  const isOverdue = hasDueDate && dueTime < now && task.status !== 'completed';

  if (task.status === 'completed') {
    return {
      isUrgent: false,
      reason: 'Completed',
      badgeColor: 'bg-zinc-100 text-zinc-600',
      hoursRemaining,
      timeLabel: 'Done',
    };
  }

  if (task.priority === 'low') {
    return {
      isUrgent: false,
      reason: 'Optional / Not Mandatory',
      badgeColor: 'bg-zinc-100 text-zinc-500',
      hoursRemaining,
      timeLabel: hasDueDate ? (isOverdue ? 'Past suggested time' : 'No strict deadline') : 'Optional',
    };
  }

  if (!hasDueDate) {
    return {
      isUrgent: task.priority === 'high',
      reason: task.priority === 'high' ? 'High Priority' : 'Optional',
      badgeColor: task.priority === 'high' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-zinc-100 text-zinc-500',
      hoursRemaining: Infinity,
      timeLabel: 'Optional',
    };
  }

  let reason = '';
  let badgeColor = 'bg-zinc-100 text-zinc-700';

  if (isOverdue) {
    reason = 'Overdue Submission';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (hoursRemaining <= 6) {
    reason = 'Due within 6 hours';
    badgeColor = 'bg-rose-600 text-white animate-pulse';
  } else if (hoursRemaining <= 24) {
    reason = 'Due today / < 24h';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (hoursRemaining <= 168) {
    reason = 'Due this week';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (task.priority === 'high') {
    reason = 'High Priority Coursework';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  } else {
    reason = 'Normal timeline';
  }

  let timeLabel = '';
  if (isOverdue) {
    const hoursAgo = Math.abs(Math.round(hoursRemaining));
    timeLabel = hoursAgo > 24 ? `${Math.round(hoursAgo / 24)}d overdue` : `${hoursAgo}h overdue`;
  } else if (hoursRemaining < 1) {
    const mins = Math.max(1, Math.round(hoursRemaining * 60));
    timeLabel = `${mins}m left`;
  } else if (hoursRemaining < 24) {
    timeLabel = `${Math.round(hoursRemaining)}h left`;
  } else {
    timeLabel = `${Math.round(hoursRemaining / 24)}d left`;
  }

  return {
    isUrgent: isTaskUrgent(task),
    reason,
    badgeColor,
    hoursRemaining,
    timeLabel,
  };
}

/**
 * Extracts a course code from a Brightspace title or summary.
 * e.g. "CSI 2110: Assignment 3" -> "CSI 2110"
 */
export const KNOWN_UOTTAWA_COURSES: Record<string, { code: string; name: string }> = {
  // Calculus and Math courses
  'MAT 2322': { code: 'MAT 2322', name: 'Calculus III For Engineers' },
  'MAT 1320': { code: 'MAT 1320', name: 'Calculus I' },
  'MAT 1322': { code: 'MAT 1322', name: 'Calculus II' },
  'MAT 1341': { code: 'MAT 1341', name: 'Introduction to Linear Algebra' },
  'MAT 2384': { code: 'MAT 2384', name: 'Differential Equations and Numerical Methods' },
  'MAT 2377': { code: 'MAT 2377', name: 'Probability and Statistics for Engineers' },
  'MAT 1339': { code: 'MAT 1339', name: 'Introduction to Calculus and Vectors' },
  'MAT 1300': { code: 'MAT 1300', name: 'Mathematical Methods I' },
  'MAT 1302': { code: 'MAT 1302', name: 'Mathematical Methods II' },
  'MAT 1330': { code: 'MAT 1330', name: 'Calculus for the Life Sciences I' },
  'MAT 1332': { code: 'MAT 1332', name: 'Calculus for the Life Sciences II' },

  // Engineering / CS courses
  'CSI 2110': { code: 'CSI 2110', name: 'Data Structures And Algorithms' },
  'CEG 2136': { code: 'CEG 2136', name: 'Computer Architecture I' },
  'ELG 2138': { code: 'ELG 2138', name: 'Circuit Theory I' },
  'SEG 2105': { code: 'SEG 2105', name: 'Intro To Software Engineering' },
  'ENG 1112': { code: 'ENG 1112', name: 'Technical Report Writing' },
};

/**
 * Extracts a course code and friendly course name from a Brightspace event.
 * Inspects all event fields including title, description, categories, location, and url.
 * Prioritizes recognizing Calculus (MAT 2322 / Calculus III) for math labs and assignments.
 */
export function extractCourseInfo(
  title: string,
  description: string,
  extraContext?: { categories?: string; location?: string; url?: string; summary?: string }
): { courseCode: string; courseName: string } {
  const combined = [
    title,
    description,
    extraContext?.categories || '',
    extraContext?.location || '',
    extraContext?.url || '',
    extraContext?.summary || '',
  ].join(' ');

  const lower = combined.toLowerCase();

  // 1. Check for standard 3-4 letter code + 4 digits (e.g. MAT 2322, CSI 2110, MAT2322, MAT-2322)
  const codeMatch = combined.match(/\b([A-Z]{3,4})[\s\-_.]*(\d{4})\b/i);
  if (codeMatch) {
    const rawCode = `${codeMatch[1].toUpperCase()} ${codeMatch[2]}`;
    if (KNOWN_UOTTAWA_COURSES[rawCode]) {
      return {
        courseCode: KNOWN_UOTTAWA_COURSES[rawCode].code,
        courseName: KNOWN_UOTTAWA_COURSES[rawCode].name,
      };
    }
    if (codeMatch[1].toUpperCase() === 'MAT') {
      return {
        courseCode: rawCode,
        courseName: `${rawCode} Mathematics`,
      };
    }
    return {
      courseCode: rawCode,
      courseName: rawCode,
    };
  }

  // 2. Check for Calculus / Mathematics indicators (especially critical for lab submissions)
  const isCalculus =
    lower.includes('calculus') ||
    lower.includes('calcul ') ||
    lower.includes('calcul.') ||
    lower.includes('calc iii') ||
    lower.includes('calc 3') ||
    lower.includes('calc ii') ||
    lower.includes('calc 2') ||
    lower.includes('calc i') ||
    lower.includes('calc 1') ||
    lower.includes('multivariable') ||
    lower.includes('vector calculus') ||
    lower.includes('differential calculus') ||
    lower.includes('integral calculus') ||
    lower.includes('partial derivative') ||
    lower.includes('stokes') ||
    lower.includes("green's theorem") ||
    lower.includes('divergence theorem') ||
    lower.includes('line integral') ||
    lower.includes('surface integral') ||
    lower.includes('taylor series') ||
    lower.includes('integration by parts') ||
    lower.includes('maple') ||
    lower.includes('webwork') ||
    lower.includes('math lab');

  if (isCalculus) {
    if (lower.includes('calculus i') || lower.includes('calc 1') || lower.includes('calc i')) {
      return { courseCode: 'MAT 1320', courseName: 'Calculus I' };
    }
    if (lower.includes('calculus ii') || lower.includes('calc 2') || lower.includes('calc ii')) {
      return { courseCode: 'MAT 1322', courseName: 'Calculus II' };
    }
    if (lower.includes('linear algebra')) {
      return { courseCode: 'MAT 1341', courseName: 'Introduction to Linear Algebra' };
    }
    // Default engineering calculus course is MAT 2322 (Calculus III For Engineers)
    return {
      courseCode: 'MAT 2322',
      courseName: 'Calculus III For Engineers',
    };
  }

  // 3. Check other course subject keywords
  if (lower.includes('computer architecture') || lower.includes('wireshark') || lower.includes('ceg 2136') || lower.includes('ceg2136')) {
    return { courseCode: 'CEG 2136', courseName: 'Computer Architecture I' };
  }
  if (lower.includes('data structures') || lower.includes('avl tree') || lower.includes('csi 2110') || lower.includes('csi2110') || lower.includes('dijkstra')) {
    return { courseCode: 'CSI 2110', courseName: 'Data Structures And Algorithms' };
  }
  if (lower.includes('software engineering') || lower.includes('seg 2105') || lower.includes('seg2105') || lower.includes('mutation testing') || lower.includes('junit')) {
    return { courseCode: 'SEG 2105', courseName: 'Intro To Software Engineering' };
  }
  if (lower.includes('circuit theory') || lower.includes('elg 2138') || lower.includes('elg2138') || lower.includes('kirchhoff')) {
    return { courseCode: 'ELG 2138', courseName: 'Circuit Theory I' };
  }
  if (lower.includes('technical report') || lower.includes('eng 1112') || lower.includes('eng1112') || lower.includes('technical writing')) {
    return { courseCode: 'ENG 1112', courseName: 'Technical Report Writing' };
  }

  return {
    courseCode: 'uOttawa General',
    courseName: 'uOttawa General',
  };
}

/**
 * Extracts a course code from a Brightspace title or summary.
 */
export function extractCourseCode(text: string): string {
  return extractCourseInfo(text, '').courseCode;
}

/**
 * Sanitizes existing tasks to ensure that lab submissions or tasks
 * intended for Calculus have the correct class (MAT 2322 - Calculus III For Engineers).
 */
export function sanitizeTaskCourse(task: TaskItem): TaskItem {
  const combined = `${task.title} ${task.description || ''} ${task.courseCode || ''} ${task.courseName || ''}`.toLowerCase();
  
  const isLab = task.brightspaceType === 'lab' || combined.includes('lab') || combined.includes('submission');
  const isCalculus =
    combined.includes('calculus') ||
    combined.includes('calc') ||
    combined.includes('mat 2322') ||
    combined.includes('mat2322') ||
    combined.includes('mat 1320') ||
    combined.includes('mat1320') ||
    combined.includes('mat 1322') ||
    combined.includes('mat1322') ||
    combined.includes('mat 1341') ||
    combined.includes('mat1341') ||
    combined.includes('maple') ||
    combined.includes('vector field') ||
    combined.includes('partial derivative') ||
    combined.includes('stokes') ||
    combined.includes('integral') ||
    combined.includes('derivative');

  // If it's a lab submission for calculus, or an assignment for calculus with general/wrong courseCode
  if (isCalculus && (isLab || task.courseCode === 'uOttawa General' || task.courseCode === 'General' || !task.courseCode)) {
    const matMatch = combined.match(/\b(mat[\s\-_.]*\d{4})\b/i);
    let code = 'MAT 2322';
    if (matMatch) {
      code = matMatch[1].toUpperCase().replace(/[\s\-_.]+/, ' ');
    }
    const name =
      code === 'MAT 1320'
        ? 'Calculus I'
        : code === 'MAT 1322'
        ? 'Calculus II'
        : code === 'MAT 1341'
        ? 'Introduction to Linear Algebra'
        : 'Calculus III For Engineers';

    return {
      ...task,
      courseCode: code,
      courseName: name,
    };
  }

  // Ensure courseName is friendly for MAT 2322
  if (task.courseCode === 'MAT 2322' && (!task.courseName || task.courseName === 'MAT 2322' || task.courseName === 'uOttawa General')) {
    return {
      ...task,
      courseName: 'Calculus III For Engineers',
    };
  }

  return task;
}

function detectItemType(text: string): BrightspaceItemType {
  const lower = text.toLowerCase();
  if (lower.includes('project')) return 'project';
  if (lower.includes('quiz') || lower.includes('test') || lower.includes('midterm') || lower.includes('exam')) {
    return lower.includes('quiz') ? 'quiz' : 'exam';
  }
  if (lower.includes('lab') || lower.includes('practicum')) return 'lab';
  if (lower.includes('discussion') || lower.includes('forum')) return 'discussion';
  if (lower.includes('reading') || lower.includes('chapter')) return 'reading';
  return 'assignment';
}

/**
 * Parses raw iCalendar (ICS) string exported or streamed from uOttawa Brightspace
 */
export function parseBrightspaceIcs(icsContent: string): TaskItem[] {
  const lines = icsContent.split(/\r\n|\n|\r/);
  const tasks: TaskItem[] = [];

  let inEvent = false;
  let currentEvent: Record<string, string> = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle folded lines (ICS line continuation starting with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i].substring(1);
    }

    const trimmed = line.trim();

    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      inEvent = false;
      if (currentEvent.SUMMARY) {
        const title = currentEvent.SUMMARY.replace(/\\,/g, ',').replace(/\\;/g, ';');
        const description = (currentEvent.DESCRIPTION || '')
          .replace(/\\n/g, '\n')
          .replace(/\\,/g, ',')
          .replace(/\\;/g, ';');

        let dueDate = '';
        const rawDate = currentEvent['DTEND'] || currentEvent['DUE'];

        let parsedStartDate: Date | null = null;
        if (currentEvent['DTSTART']) {
          const match = currentEvent['DTSTART'].match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?/);
          if (match) {
            const [, y, m, d, h = '00', min = '00', s = '00'] = match;
            parsedStartDate = new Date(Date.UTC(+y, +m - 1, +d, +h, +min, +s));
          }
        }

        if (rawDate) {
          // Format like 20260320T235900Z or 20260320
          const match = rawDate.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?/);
          if (match) {
            const [, y, m, d, h = '23', min = '59', s = '00'] = match;
            const parsedDate = new Date(Date.UTC(+y, +m - 1, +d, +h, +min, +s));
            if (!isNaN(parsedDate.getTime())) {
              dueDate = parsedDate.toISOString();
            }
          }
        }

        const isStartEvent = title.toLowerCase().includes('starts') || description.toLowerCase().includes('starts ') || title.toLowerCase().includes('available');
        let startDateIso = undefined;
        const itemType = detectItemType(title + ' ' + description);

        if (isStartEvent && parsedStartDate) {
          startDateIso = parsedStartDate.toISOString();
          dueDate = ''; // Start events do not have a due date
        } else if (parsedStartDate && parsedStartDate.getTime() > Date.now()) {
          // If the assignment has a start date in the future, it is not yet available to the student
          // However, exempt labs and projects so they are always "put down"
          if (itemType !== 'lab' && itemType !== 'project') {
            continue; 
          }
        }

        const { courseCode, courseName } = extractCourseInfo(title, description, {
          categories: currentEvent['CATEGORIES'],
          location: currentEvent['LOCATION'],
          url: currentEvent['URL'],
          summary: currentEvent['SUMMARY'],
        });
        const brightspaceUrl = currentEvent['URL'] || `https://uottawa.brightspace.com/d2l/home`;
        const nowIso = new Date().toISOString();

        const isPractice = title.toLowerCase().includes('practice') || 
                           title.toLowerCase().includes('pratice') || 
                           description.toLowerCase().includes('practice');

        tasks.push({
          id: `brightspace-${currentEvent.UID || Math.random().toString(36).substring(2, 9)}`,
          title,
          description: description || `Course assignment imported from uOttawa Brightspace portal.`,
          courseCode,
          courseName,
          dueDate: dueDate ? dueDate : undefined,
          startDate: startDateIso,
          isOptional: (!dueDate && itemType !== 'lab' && itemType !== 'project') || isPractice,
          estimatedMinutes: itemType === 'exam' ? 120 : itemType === 'lab' ? 90 : 60,
          priority: ((!dueDate && itemType !== 'lab' && itemType !== 'project') || isPractice) ? 'low' : (itemType === 'exam' || itemType === 'assignment' ? 'high' : 'medium'),
          status: 'pending',
          source: 'brightspace',
          brightspaceType: itemType,
          brightspaceUrl,
          reminders: [
            { id: `rem-${Date.now()}-1`, minutesBefore: 60, triggered: false },
            { id: `rem-${Date.now()}-2`, minutesBefore: 1440, triggered: false },
          ],
          createdAt: nowIso,
          updatedAt: nowIso,
          syncStatus: 'synced',
        });
      }
      continue;
    }

    if (inEvent) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const keyPart = trimmed.substring(0, colonIdx);
        const valuePart = trimmed.substring(colonIdx + 1);
        const key = keyPart.split(';')[0]; // strip params like ;VALUE=DATE
        currentEvent[key] = valuePart;
      }
    }
  }

  return tasks;
}
