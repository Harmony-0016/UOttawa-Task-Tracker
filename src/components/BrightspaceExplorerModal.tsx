import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink, 
  Loader2, 
  Calendar,
  Layers,
  ArrowRight,
  Terminal,
  Upload,
  Link as LinkIcon,
  Flame,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { BrightspaceSession, TaskItem, ExplorationLogEntry } from '../types';
import { BrightspaceService } from '../services/brightspaceService';
import { isTaskUrgent } from '../utils/taskUtils';

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
  const [logs, setLogs] = useState<ExplorationLogEntry[]>([]);
  const [showFeedInput, setShowFeedInput] = useState(false);
  const [customFeedUrl, setCustomFeedUrl] = useState(session.feedUrl || '');
  const [showLogs, setShowLogs] = useState(true);

  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleStartExploration = async () => {
    setIsExploring(true);
    setErrorMessage(null);
    setDiscoveredTasks(null);
    setLogs([]);

    try {
      // Calls the Brightspace service which throws if not logged in
      const result = await BrightspaceService.exploreBrightspaceCourses((logEntry) => {
        setLogs((prev) => [...prev, logEntry]);
      });

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

  const handleSaveFeedUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = BrightspaceService.updateFeedUrl(customFeedUrl);
    onSessionChange(updated);
    setShowFeedInput(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          const parsed = BrightspaceService.parseUploadedIcs(content);
          if (parsed.length > 0) {
            setDiscoveredTasks(parsed);
            setSelectedTaskIds(new Set(parsed.map((t) => t.id)));
            setErrorMessage(null);
            setLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toLocaleTimeString(),
                level: 'success',
                message: `Imported ${parsed.length} coursework events from uploaded Brightspace calendar (.ics).`,
              },
            ]);
          } else {
            setErrorMessage('No valid assignments or calendar events found in the uploaded file.');
          }
        } catch (err) {
          setErrorMessage('Could not parse iCalendar file. Ensure it is exported from uOttawa Brightspace.');
        }
      }
    };
    reader.readAsText(file);
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
              <h2 className="text-base font-semibold">uOttawa Brightspace Portal Explorer</h2>
              <p className="text-xs text-white/80">
                Explore real courses, assignments, and due dates from uottawa.brightspace.com
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Session Banner */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">
                    {session.studentName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                    uOttawa SSO Active
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {session.studentEmail} • ID: {session.studentId} • {session.activeSemester}
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Mandated Error State if Not Logged In */}
          {errorMessage && (
            <div 
              id="brightspace-error-alert"
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-rose-900">Brightspace Error</h4>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Live Exploration Console / Logger */}
          {logs.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 font-mono text-xs overflow-hidden shadow-inner">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Brightspace Exploration Stream (uottawa.brightspace.com)</span>
                </div>
                <span className="text-[10px] text-zinc-500">{logs.length} events logged</span>
              </div>
              <div className="p-3 max-h-36 overflow-y-auto space-y-1 text-[11px] leading-relaxed">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                    <span
                      className={`shrink-0 font-bold ${
                        log.level === 'success'
                          ? 'text-emerald-400'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : log.level === 'error'
                          ? 'text-rose-400'
                          : 'text-sky-400'
                      }`}
                    >
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-zinc-200">{log.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* Real Brightspace Feed & ICS Options */}
          <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                Live Assignment Source
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedInput(!showFeedInput)}
                  className="text-xs text-[#8f001a] font-medium hover:underline"
                >
                  {showFeedInput ? 'Hide Feed Link' : 'Custom Brightspace Feed'}
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#8f001a] font-medium hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload .ics</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".ics"
                  className="hidden"
                />
              </div>
            </div>

            {showFeedInput && (
              <form onSubmit={handleSaveFeedUrl} className="pt-2 space-y-2 border-t border-zinc-200">
                <p className="text-[11px] text-zinc-500">
                  Optional: Paste your personal Brightspace calendar feed URL (found under Brightspace &gt; Calendar &gt; Settings &gt; Feeds):
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customFeedUrl}
                    onChange={(e) => setCustomFeedUrl(e.target.value)}
                    placeholder="https://uottawa.brightspace.com/d2l/le/calendar/feed/user/feed.ics?token=..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#8f001a]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#8f001a] text-white hover:bg-[#720014]"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Enrolled Courses Preview if no tasks explored yet */}
          {!discoveredTasks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Active uOttawa Courses ({session.availableCourses.length})
                </span>
                <span className="text-xs text-zinc-400">Semester: {session.activeSemester}</span>
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

          {/* Discovered Real Assignments List */}
          {discoveredTasks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-zinc-800">
                    Discovered {discoveredTasks.length} True Brightspace Assignments
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
                  className="text-xs text-[#8f001a] hover:underline font-semibold"
                >
                  {selectedTaskIds.size === discoveredTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl max-h-64 overflow-y-auto bg-white">
                {discoveredTasks.map((task) => {
                  const isSelected = selectedTaskIds.has(task.id);
                  const isUrgent = isTaskUrgent(task);
                  const hasValidDate = task.dueDate && !isNaN(new Date(task.dueDate).getTime());
                  const dueDateFormatted = hasValidDate ? new Date(task.dueDate!).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'Optional';

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleSelectTask(task.id)}
                      className={`p-3 flex items-start space-x-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50/50'
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
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-medium uppercase">
                            {task.brightspaceType}
                          </span>
                          {isUrgent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-rose-600" />
                              Urgent
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-500 ml-auto font-medium">{dueDateFormatted}</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5">{task.title}</p>
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
                    <span>Exploring Brightspace Portal...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore & Fetch Real Tasks</span>
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
                <span>Import {selectedTaskIds.size} True Assignments</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
