const fs = require('fs');
let text = fs.readFileSync('src/utils/taskUtils.ts', 'utf8');

text = text.replace(
/const courseCode = extractCourseCode\(title \+ ' ' \+ description\);[\s\S]*?priority: !dueDate \? 'low' : \(itemType === 'exam' \|\| itemType === 'assignment' \? 'high' : 'medium'\),/,
`const courseCode = extractCourseCode(title + ' ' + description);
        const itemType = detectItemType(title + ' ' + description);
        const brightspaceUrl = currentEvent['URL'] || \`https://uottawa.brightspace.com/d2l/home\`;
        const nowIso = new Date().toISOString();

        const isPractice = title.toLowerCase().includes('practice') || 
                           title.toLowerCase().includes('pratice') || 
                           description.toLowerCase().includes('practice');

        tasks.push({
          id: \`brightspace-\${currentEvent.UID || Math.random().toString(36).substring(2, 9)}\`,
          title,
          description: description || \`Course assignment imported from uOttawa Brightspace portal.\`,
          courseCode,
          courseName: courseCode,
          dueDate: dueDate ? dueDate : undefined,
          startDate: startDateIso,
          isOptional: !dueDate || isPractice,
          estimatedMinutes: itemType === 'exam' ? 120 : itemType === 'lab' ? 90 : 60,
          priority: (!dueDate || isPractice) ? 'low' : (itemType === 'exam' || itemType === 'assignment' ? 'high' : 'medium'),`
);

fs.writeFileSync('src/utils/taskUtils.ts', text);
console.log("Replaced successfully with regex");
