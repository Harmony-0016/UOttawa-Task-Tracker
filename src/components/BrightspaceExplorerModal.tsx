import React, { useState } from 'react';
import { 
  Compass, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink, 
  LogIn, 
  LogOut, 
  Loader2, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BrightspaceSession, TaskItem } from '../types';
import { BrightspaceService } from '../services/brightspaceService';

interface BrightspaceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: BrightspaceSession;
  onSessionChange: (session: BrightspaceSession) => void;
  onImportTasks: (tasks: TaskItem[]) => void;
}

export const BrightspaceExplorerModal: React.FC<BrightspaceExplorerModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionChange,
  onImportTasks,
}) => {
  const [isExploring, setIsExploring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [discoveredTasks, setDiscoveredTasks] = useState<TaskItem[] | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleStartExploration = async () => {
    setIsExploring(true);
    setErrorMessage(null);
    setDiscoveredTasks(null);

    try {
      // Calls the Brightspace service which throws if not logged in
      const result = await BrightspaceService.exploreBrightspaceCourses();
      setDiscoveredTasks(result.tasks);
      setSelectedTaskIds(new Set(result.tasks.map((t) => t.id)));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to connect to uOttawa Brightspace portal.');
      }
    } finally {
      setIsExploring(false);
    }
  };

  const handleToggleLogin = () => {
    const updated = BrightspaceService.setLoggedIn(!session.isLoggedIn);
    onSessionChange(updated);
    setErrorMessage(null);
    setDiscoveredTasks(null);
  };

  const toggleSelectTask = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTaskIds(next);
  };

  const handleImportSelected = () => {
    if (!discoveredTasks) return;
    const toImport = discoveredTasks.filter((t) => selectedTaskIds.has(t.id));
    onImportTasks(toImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div 
        id="brightspace-explorer-dialog"
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#8f001a] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold">uOttawa Brightspace Explorer</h2>
              <p className="text-xs text-white/80">
                Discover assignments, quizzes, and course milestones from uottawa.brightspace.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Session Banner */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${session.isLoggedIn ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-rose-500 ring-4 ring-rose-100'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">
                    {session.isLoggedIn ? session.studentName : 'Not Authenticated'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${session.isLoggedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {session.isLoggedIn ? 'Brightspace Session Active' : 'Logged Out'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {session.isLoggedIn
                    ? `${session.studentEmail} • ID: ${session.studentId} • ${session.activeSemester}`
                    : 'No valid uOttawa single sign-on cookie found'}
                </p>
              </div>
            </div>

            {/* Login / Logout Toggle Button to test both requirements */}
            <button
              id="toggle-brightspace-session-btn"
              onClick={handleToggleLogin}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                session.isLoggedIn
                  ? 'text-zinc-600 hover:text-rose-600 hover:bg-zinc-200/50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {session.isLoggedIn ? (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Simulate Log Out</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In as Student</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt Mandated Error State if Not Logged In */}
          {errorMessage && (
            <div 
              id="brightspace-error-alert"
              className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-rose-900">Brightspace Authentication Error</h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleToggleLogin}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-900 bg-rose-200/80 hover:bg-rose-200 px-3 py-1 rounded transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In to uOttawa Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Courses Preview */}
          {!discoveredTasks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Active uOttawa Courses ({session.availableCourses.length})
                </span>
                <span className="text-xs text-zinc-400">Semester: Winter 2026</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {session.availableCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-800">{c.code}</div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[170px]">{c.name}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {c.activeTasksCount} tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovered Tasks List */}
          {discoveredTasks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-zinc-700">
                    Discovered {discoveredTasks.length} Brightspace Tasks & Deadlines
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (selectedTaskIds.size === discoveredTasks.length) {
                      setSelectedTaskIds(new Set());
                    } else {
                      setSelectedTaskIds(new Set(discoveredTasks.map((t) => t.id)));
                    }
                  }}
                  className="text-xs text-[#8f001a] hover:underline font-medium"
                >
                  {selectedTaskIds.size === discoveredTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg max-h-60 overflow-y-auto bg-white">
                {discoveredTasks.map((task) => {
                  const isSelected = selectedTaskIds.has(task.id);
                  const dueDateFormatted = new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleSelectTask(task.id)}
                      className={`p-3 flex items-start space-x-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-zinc-50/80' : 'hover:bg-zinc-50/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 rounded text-[#8f001a] focus:ring-[#8f001a]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">{task.courseCode}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-medium">
                            {task.brightspaceType?.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-zinc-500 ml-auto">{dueDateFormatted}</span>
                        </div>
                        <p className="text-xs font-medium text-zinc-800 truncate mt-0.5">{task.title}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <a
            href="https://uottawa.brightspace.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-800 inline-flex items-center gap-1 transition-colors"
          >
            <span>Open uOttawa Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors"
            >
              Cancel
            </button>

            {!discoveredTasks ? (
              <button
                id="run-exploration-btn"
                onClick={handleStartExploration}
                disabled={isExploring}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-[#8f001a] hover:bg-[#720014] text-white shadow-xs transition-all disabled:opacity-50"
              >
                {isExploring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Exploring Courses...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore & Fetch Tasks</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="import-brightspace-tasks-btn"
                onClick={handleImportSelected}
                disabled={selectedTaskIds.size === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Import {selectedTaskIds.size} Tasks to Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
