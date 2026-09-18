const fs = require('fs');
let content = fs.readFileSync('src/utils/taskUtils.ts', 'utf8');
content = content.replace(
  /export function isTaskObscenelyOverdue[\s\S]*?return hoursOverdue > 168; \/\/ More than 7 days overdue\n}/,
  `export function isTaskObscenelyOverdue(task: TaskItem): boolean {
  const now = Date.now();

  // Check due date
  if (task.dueDate) {
    const dueTime = new Date(task.dueDate).getTime();
    if (!isNaN(dueTime)) {
      const hoursOverdue = (now - dueTime) / (1000 * 60 * 60);
      return hoursOverdue > 168; // More than 7 days overdue
    }
  }

  // Check start date for optional/start events
  if (task.startDate) {
    const startTime = new Date(task.startDate).getTime();
    if (!isNaN(startTime)) {
      const hoursSinceStart = (now - startTime) / (1000 * 60 * 60);
      return hoursSinceStart > 168; // Started more than 7 days ago
    }
  }
  
  // Fallback for extremely old tasks from years ago
  const createdTime = new Date(task.createdAt).getTime();
  if (!isNaN(createdTime)) {
    const daysSinceCreation = (now - createdTime) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 365) return true;
  }

  return false;
}`
);
fs.writeFileSync('src/utils/taskUtils.ts', content);
