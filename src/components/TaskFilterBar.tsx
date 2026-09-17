import React from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Calendar as CalendarIcon, 
  CloudOff, 
  Layers,
  AlertTriangle,
  Flame,
  SlidersHorizontal
} from 'lucide-react';
import { FilterOptions, BrightspaceCourse, TaskPriority } from '../types';

interface TaskFilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  courses: BrightspaceCourse[];
  onOpenCreateTask: () => void;
  onDownloadIcs: () => void;
  offlineModifiedCount: number;
  urgentCount: number;
  onOpenUrgentInspector: () => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFilterChange,
  courses,
  onOpenCreateTask,
  onDownloadIcs,
  offlineModifiedCount,
  urgentCount,
  onOpenUrgentInspector,
}) => {
  const isUrgentActive = filters.onlyUrgent || filters.priorityFilter === 'high';

  const handleToggleUrgent = () => {
    if (filters.onlyUrgent) {
      onFilterChange({
        ...filters,
        onlyUrgent: false,
        priorityFilter: 'ALL',
      });
    } else {
      onFilterChange({
        ...filters,
        onlyUrgent: true,
        priorityFilter: 'ALL',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs space-y-3">
      {/* Top Row: Search, Urgent Inspector, & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="task-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search assignments, quizzes, labs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#8f001a] focus:border-transparent"
          />
        </div>

        {/* Action Buttons: Urgent Inspector, Export ICS & New Task */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Dedicated Urgent Items Selector Button */}
          <button
            id="open-urgent-inspector-btn"
            onClick={onOpenUrgentInspector}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              urgentCount > 0
                ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
            }`}
            title="Inspect all urgent assignments and deadlines"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${urgentCount > 0 ? 'text-rose-600' : 'text-zinc-400'}`} />
            <span>Select Urgent Items</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              urgentCount > 0 ? 'bg-rose-600 text-white' : 'bg-zinc-200 text-zinc-600'
            }`}>
              {urgentCount}
            </span>
          </button>

          <button
            id="export-calendar-filter-btn"
            onClick={onDownloadIcs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 shadow-2xs transition-colors"
            title="Download iCalendar (.ics) file to sync with Google Calendar"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">Export to</span> Calendar (.ics)
          </button>

          <button
            id="create-task-btn"
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#8f001a] hover:bg-[#720014] text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Bottom Filter Chips: Urgent Quick Toggle, Courses, Priority, Date Range, Status */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-100 text-xs">
        <span className="text-zinc-400 font-medium flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filter:
        </span>

        {/* Quick Urgent Only Filter Button */}
        <button
          id="toggle-urgent-filter-chip"
          onClick={handleToggleUrgent}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
            filters.onlyUrgent
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-200'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${filters.onlyUrgent ? 'text-white' : 'text-rose-600'}`} />
          <span>Urgent Only</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filters.onlyUrgent ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900 font-bold'
          }`}>
            {urgentCount}
          </span>
        </button>

        {/* Course Dropdown */}
        <select
          id="course-filter-select"
          value={filters.courseFilter}
          onChange={(e) => onFilterChange({ ...filters, courseFilter: e.target.value })}
          className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-xs text-zinc-700 focus:ring-1 focus:ring-[#8f001a]"
        >
          <option value="ALL">All Courses</option>
          {courses.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
          <option value="Personal">Personal</option>
        </select>

        {/* Priority Filter Dropdown */}
        <select
          id="priority-filter-select"
          value={filters.priorityFilter}
          onChange={(e) => onFilterChange({ 
            ...filters, 
            priorityFilter: e.target.value as FilterOptions['priorityFilter'],
            onlyUrgent: e.target.value === 'high' ? false : filters.onlyUrgent,
          })}
          className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-xs text-zinc-700 focus:ring-1 focus:ring-[#8f001a]"
        >
          <option value="ALL">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Date Range Chips */}
        <div className="flex items-center bg-zinc-100 rounded-md p-0.5 border border-zinc-200">
          {(['ALL', 'today', 'upcoming', 'overdue'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onFilterChange({ ...filters, dateRange: range })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                filters.dateRange === range
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {range === 'ALL' ? 'All Dates' : range}
            </button>
          ))}
        </div>

        {/* Status Chips */}
        <div className="flex items-center bg-zinc-100 rounded-md p-0.5 border border-zinc-200">
          {(['ALL', 'active', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange({ ...filters, statusFilter: status })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                filters.statusFilter === status
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {status === 'ALL' ? 'All Status' : status}
            </button>
          ))}
        </div>

        {/* Reset Filters if any active */}
        {(filters.onlyUrgent || filters.courseFilter !== 'ALL' || filters.statusFilter !== 'ALL' || filters.priorityFilter !== 'ALL' || filters.dateRange !== 'ALL' || filters.searchQuery) && (
          <button
            onClick={() => onFilterChange({
              searchQuery: '',
              courseFilter: 'ALL',
              statusFilter: 'ALL',
              priorityFilter: 'ALL',
              sourceFilter: 'ALL',
              dateRange: 'ALL',
              onlyUrgent: false,
            })}
            className="text-[11px] text-zinc-500 hover:text-zinc-800 underline px-1"
          >
            Clear filters
          </button>
        )}

        {/* Offline Modified Indicator */}
        {offlineModifiedCount > 0 && (
          <div 
            className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 font-medium"
            title={`${offlineModifiedCount} task(s) created or edited offline`}
          >
            <CloudOff className="w-3 h-3 text-amber-700" />
            <span>{offlineModifiedCount} offline edit(s) pending sync</span>
          </div>
        )}
      </div>
    </div>
  );
};
