import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Bell, AlertCircle, Plus, Trash2, CloudOff } from 'lucide-react';
import { TaskItem, TaskPriority, TaskReminder } from '../types';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  taskToEdit?: TaskItem | null;
  isOnline: boolean;
  availableCourses: Array<{ code: string; name: string }>;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  isOnline,
  availableCourses,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('CSI 2110');
  const [courseName, setCourseName] = useState('Data Structures and Algorithms');
  const [dueDateStr, setDueDateStr] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [reminders, setReminders] = useState<TaskReminder[]>([
    { id: 'rem-1', minutesBefore: 60, triggered: false },
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCourseCode(taskToEdit.courseCode);
      setCourseName(taskToEdit.courseName);
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 60);
      setPriority(taskToEdit.priority);
      setReminders(taskToEdit.reminders.length > 0 ? taskToEdit.reminders : [{ id: 'rem-1', minutesBefore: 60, triggered: false }]);

      // Format ISO to YYYY-MM-DDTHH:mm for datetime-local input
      if (taskToEdit.dueDate) {
        const d = new Date(taskToEdit.dueDate);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        setDueDateStr(localISOTime);
      } else {
        setDueDateStr('');
      }
    } else {
      setTitle('');
      setDescription('');
      setCourseCode('CSI 2110');
      setCourseName('Data Structures and Algorithms');
      setEstimatedMinutes(60);
      setPriority('medium');
      setReminders([{ id: `rem-${Date.now()}`, minutesBefore: 60, triggered: false }]);

      // Default due tomorrow at 11:59 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 0, 0);
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
      setDueDateStr(localISOTime);
    }
    setValidationError(null);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (selectedCode: string) => {
    setCourseCode(selectedCode);
    const found = availableCourses.find((c) => c.code === selectedCode);
    if (found) {
      setCourseName(found.name);
    }
  };

  const handleAddReminder = () => {
    setReminders([
      ...reminders,
      { id: `rem-${Date.now()}`, minutesBefore: 1440, triggered: false },
    ]);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleReminderMinutesChange = (id: string, minutes: number) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, minutesBefore: minutes, triggered: false } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Please enter a task title.');
      return;
    }

    const isoDate = dueDateStr ? new Date(dueDateStr).toISOString() : undefined;
    const now = new Date().toISOString();

    const taskPayload: TaskItem = {
      id: taskToEdit ? taskToEdit.id : `manual-task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      courseCode: courseCode.trim() || 'General',
      courseName: courseName.trim() || 'Coursework',
      dueDate: isoDate,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      priority,
      status: taskToEdit ? taskToEdit.status : 'pending',
      source: taskToEdit ? taskToEdit.source : 'manual',
      brightspaceType: taskToEdit?.brightspaceType,
      brightspaceUrl: taskToEdit?.brightspaceUrl,
      reminders,
      completedAt: taskToEdit?.completedAt,
      createdAt: taskToEdit ? taskToEdit.createdAt : now,
      updatedAt: now,
      isOfflineModified: !isOnline,
      isOfflineCreated: !taskToEdit && !isOnline,
    };

    onSave(taskPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div 
        id="task-editor-dialog"
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-semibold">
              {taskToEdit ? 'Edit Task (Offline Supported)' : 'Create New Task'}
            </h2>
            {!isOnline && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-normal">
                <CloudOff className="w-3 h-3" />
                Offline Mode
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lab 5 Submission, Midterm Review, Reading Notes"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#8f001a] focus:border-transparent"
            />
          </div>

          {/* Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Course Code
              </label>
              <select
                id="task-course-select"
                value={courseCode}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8f001a]"
              >
                {availableCourses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
                <option value="Personal">Personal / Extra-curricular</option>
                <option value="Other">Other uOttawa Course</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Priority Level
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8f001a]"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Due Date & Time (Optional)</span>
              </label>
              <input
                id="task-due-date-input"
                type="datetime-local"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#8f001a]"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Est. Duration (Minutes)</span>
              </label>
              <input
                id="task-estimated-mins-input"
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#8f001a]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Description & Notes
            </label>
            <textarea
              id="task-description-input"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add requirements, rubric notes, zoom links, or submission details..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#8f001a]"
            />
          </div>

          {/* Automated Reminders Configuration */}
          <div className="pt-2 border-t border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-sky-600" />
                <span>Automated Desktop Reminders</span>
              </span>
              <button
                type="button"
                onClick={handleAddReminder}
                className="text-xs text-[#8f001a] hover:text-[#720014] font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Alert</span>
              </button>
            </div>

            <div className="space-y-2">
              {reminders.map((r, index) => (
                <div key={r.id} className="flex items-center gap-2 bg-zinc-50 p-2 rounded-md border border-zinc-200">
                  <span className="text-xs text-zinc-500 font-medium">Alert {index + 1}:</span>
                  <select
                    value={r.minutesBefore}
                    onChange={(e) => handleReminderMinutesChange(r.id, Number(e.target.value))}
                    className="text-xs px-2 py-1 rounded border border-zinc-300 bg-white flex-1"
                  >
                    <option value={15}>15 minutes before due date</option>
                    <option value={30}>30 minutes before due date</option>
                    <option value={60}>1 hour before due date</option>
                    <option value={120}>2 hours before due date</option>
                    <option value={1440}>1 day (24 hours) before due date</option>
                    <option value={2880}>2 days before due date</option>
                  </select>

                  {reminders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReminder(r.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Triggers Windows notification chime sound and desktop notifications before the deadline.
            </p>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-task-button"
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-md bg-[#8f001a] hover:bg-[#720014] text-white shadow-xs transition-colors"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
