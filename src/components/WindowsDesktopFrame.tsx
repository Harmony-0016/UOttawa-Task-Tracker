import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  RefreshCw, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  Minus, 
  Square, 
  X,
  GraduationCap
} from 'lucide-react';
import { BrightspaceSession } from '../types';

interface WindowsDesktopFrameProps {
  isOnline: boolean;
  isSyncing: boolean;
  unreadNotificationsCount: number;
  session: BrightspaceSession;
  activeTab: 'tasks' | 'calendar' | 'courses';
  onTabChange: (tab: 'tasks' | 'calendar' | 'courses') => void;
  onOpenNotifications: () => void;
  onOpenBrightspaceModal: () => void;
  onManualSync: () => void;
  children: React.ReactNode;
}

export const WindowsDesktopFrame: React.FC<WindowsDesktopFrameProps> = ({
  isOnline,
  isSyncing,
  unreadNotificationsCount,
  session,
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenBrightspaceModal,
  onManualSync,
  children,
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#f3f4f6] text-zinc-800 font-sans select-none overflow-hidden">
      {/* Windows 11 Acrylic Titlebar */}
      <header className="h-10 bg-[#e5e7eb]/80 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-3 shrink-0 z-30">
        {/* Left: Window Identity & uOttawa Branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded bg-[#8f001a] flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-800 tracking-tight flex items-center gap-1.5">
            uOttawa Task & Calendar Synchronizer
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600 border border-zinc-300">
              Brightspace D2L
            </span>
          </span>
        </div>

        {/* Center: Offline/Online Status Pill & Quick Sync */}
        <div className="flex items-center space-x-2">
          <div
            id="network-status-indicator"
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
            title={isOnline ? 'System is online. Tasks sync with local storage.' : 'Operating offline. Changes saved locally.'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
            <span>{isOnline ? 'Online (Connected)' : 'Offline Mode'}</span>
          </div>

          <button
            id="titlebar-sync-button"
            onClick={onManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded transition-colors"
            title="Refresh and sync local task queue"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-zinc-900' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Right: Notification Bell & Windows Window Controls */}
        <div className="flex items-center space-x-1">
          <button
            id="notification-center-btn"
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
            title="Open Reminder & Notification Center"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Windows Minimize / Maximize / Close Buttons */}
          <div className="flex items-center ml-2 border-l border-zinc-200 pl-1">
            <button
              className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 rounded transition-colors"
              title="Minimize"
              onClick={() => {}}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 rounded transition-colors"
              title="Maximize"
              onClick={() => {}}
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-rose-600 hover:text-white rounded transition-colors"
              title="Close Application"
              onClick={() => {}}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Bar (Windows 11 Tab Header) */}
      <nav className="h-11 bg-white border-b border-zinc-200/80 px-4 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center space-x-1">
          <button
            id="nav-tab-tasks"
            onClick={() => onTabChange('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'tasks'
                ? 'bg-zinc-100 text-zinc-900 font-semibold border border-zinc-200'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8f001a]" />
            <span>Daily Tasks</span>
          </button>

          <button
            id="nav-tab-calendar"
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'calendar'
                ? 'bg-zinc-100 text-zinc-900 font-semibold border border-zinc-200'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Calendar Timeline</span>
          </button>

          <button
            id="nav-tab-courses"
            onClick={() => onTabChange('courses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'courses'
                ? 'bg-zinc-100 text-zinc-900 font-semibold border border-zinc-200'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
            <span>uOttawa Courses</span>
          </button>
        </div>

        {/* Brightspace Exploration CTA Button */}
        <div className="flex items-center space-x-2">
          <button
            id="explore-brightspace-btn"
            onClick={onOpenBrightspaceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#8f001a] hover:bg-[#720014] text-white shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 animate-pulse" />
            <span>Explore Brightspace</span>
            {session.isLoggedIn && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" title="Brightspace session active" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-auto bg-[#fafafa] p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
