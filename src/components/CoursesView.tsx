import React from 'react';
import { 
  GraduationCap, 
  ExternalLink, 
  BookOpen, 
  User, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  Plus 
} from 'lucide-react';
import { BrightspaceSession, TaskItem } from '../types';

interface CoursesViewProps {
  session: BrightspaceSession;
  tasks: TaskItem[];
  onExploreBrightspace: () => void;
  onCreateTaskForCourse: (courseCode: string, courseName: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  session,
  tasks,
  onExploreBrightspace,
  onCreateTaskForCourse,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8f001a]">
              uOttawa Faculty of Engineering / Arts & Sciences
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mt-1">
            Enrolled Courses & Brightspace Portals
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Semester: {session.activeSemester} • Connected to uottawa.brightspace.com
          </p>
        </div>

        <button
          onClick={onExploreBrightspace}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-[#8f001a] hover:bg-[#720014] text-white shadow-xs transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Scan Courses for Tasks</span>
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {session.availableCourses.map((course) => {
          const courseTasks = tasks.filter((t) => t.courseCode === course.code && t.status !== 'completed');
          const completedCourseTasks = tasks.filter((t) => t.courseCode === course.code && t.status === 'completed');

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-4 h-4 rounded-full shadow-2xs"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="text-sm font-bold text-zinc-900">{course.code}</span>
                  </div>
                  <a
                    href={`https://uottawa.brightspace.com/d2l/home`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#8f001a] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Brightspace Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h3 className="text-sm font-semibold text-zinc-800 mt-2">
                  {course.name}
                </h3>

                <div className="flex items-center space-x-2 text-xs text-zinc-500 mt-2">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Instructor: {course.instructor}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-zinc-600">
                    <span className="font-semibold text-zinc-900">{courseTasks.length} pending</span>
                    <span>•</span>
                    <span className="text-zinc-500">{completedCourseTasks.length} completed</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <button
                  onClick={() => onCreateTaskForCourse(course.code, course.name)}
                  className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 flex items-center gap-1 py-1 px-2 rounded hover:bg-zinc-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8f001a]" />
                  <span>Add Course Task</span>
                </button>

                <span className="text-[11px] text-zinc-400">
                  {course.unreadAnnouncements} announcements
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
