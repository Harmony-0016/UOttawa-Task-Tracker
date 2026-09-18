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
function extractCourseCode(text: string): string {
  const match = text.match(/\b([A-Z]{3}\s*\d{4})\b/i);
  if (match) {
    return match[1].toUpperCase().replace(/\s+/, ' ');
  }
  return 'uOttawa General';
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

        const courseCode = extractCourseCode(title + ' ' + description);
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
          courseName: courseCode,
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
