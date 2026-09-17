import React from 'react';
import { X, Calendar, Download, RefreshCw, Compass, CheckCircle2, GraduationCap } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <h2 className="text-base font-semibold">How to Use the Tracker</h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-700">
          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#8f001a]" />
              1. Import from Brightspace
            </h3>
            <p className="mb-2">Click <strong>Explore Brightspace</strong> to load your active coursework. You can either use a direct Brightspace login OR upload an <strong>.ics</strong> file directly downloaded from the Brightspace Calendar.</p>
          </div>

          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              2. Optional Tasks & Start Dates
            </h3>
            <p className="mb-2">If you manually add a task or import one that doesn't have a due date (e.g. a module that simply "Starts"), it will automatically be marked as <strong>Optional / Low Priority</strong>. Its start date will be preserved if available.</p>
          </div>

          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-emerald-600" />
              3. Sync with Google Calendar
            </h3>
            <p className="mb-2">Go to the <strong>Calendar Timeline</strong> tab or click <strong>Export (.ics)</strong> on the top banner. You can download all your tasks and import them straight into Google Calendar, Apple Calendar, or Outlook.</p>
          </div>

          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              4. Track Your Courses
            </h3>
            <p className="mb-2">Head to the <strong>uOttawa Courses</strong> tab to view a breakdown of your current semester and organize tasks exclusively by class.</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-[#8f001a] text-white hover:bg-[#720014] transition-colors">
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
