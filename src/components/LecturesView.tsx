import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, FileText, Upload, Plus, Trash2, X, Play, RefreshCw, Cpu } from 'lucide-react';
import { CourseMaterial, BrightspaceSession, TaskItem } from '../types';
import { CourseMaterialsService } from '../services/courseMaterialsService';

interface LecturesViewProps {
  session: BrightspaceSession;
  onExtractTasks: (material: CourseMaterial, base64Data: string) => Promise<void>;
}

export function LecturesView({ session, onExtractTasks }: LecturesViewProps) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const list = await CourseMaterialsService.getMaterials();
    setMaterials(list);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const courseId = activeCourseId !== 'ALL' ? activeCourseId : session.availableCourses[0]?.id || 'general';
      const title = file.name.replace(/\.[^/.]+$/, ""); // remove extension
      await CourseMaterialsService.addMaterial(courseId, title, 'pdf', file);
      await loadMaterials();
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this material?')) {
      await CourseMaterialsService.deleteMaterial(id);
      if (selectedMaterial?.id === id) {
        setSelectedMaterial(null);
        setObjectUrl(null);
      }
      await loadMaterials();
    }
  };

  const openMaterial = async (material: CourseMaterial) => {
    setSelectedMaterial(material);
    if (material.url.startsWith('idb://')) {
      const blob = await CourseMaterialsService.getMaterialBlob(material.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } else {
        alert('File not found in local storage.');
      }
    } else {
      setObjectUrl(material.url);
    }
  };

  const closeMaterial = () => {
    setSelectedMaterial(null);
    if (objectUrl && objectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl);
    }
    setObjectUrl(null);
  };

  const handleExtractTasks = async () => {
    if (!selectedMaterial || !objectUrl) return;
    setIsExtracting(true);
    try {
      const blob = await CourseMaterialsService.getMaterialBlob(selectedMaterial.id);
      if (!blob) throw new Error('Could not read file blob');
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          await onExtractTasks(selectedMaterial, base64);
        }
        setIsExtracting(false);
      };
    } catch (err) {
      console.error(err);
      alert('Failed to extract tasks');
      setIsExtracting(false);
    }
  };

  const filteredMaterials = activeCourseId === 'ALL' 
    ? materials 
    : materials.filter(m => m.courseId === activeCourseId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Lectures & Readings
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Upload slides and PDFs to extract reading tasks and assignments.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={activeCourseId}
            onChange={(e) => setActiveCourseId(e.target.value)}
          >
            <option value="ALL">All Courses</option>
            {session.availableCourses.map(c => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>

          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload PDF
          </button>
        </div>
      </div>

      {!selectedMaterial ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map(material => {
            const course = session.availableCourses.find(c => c.id === material.courseId);
            return (
              <div 
                key={material.id}
                onClick={() => openMaterial(material)}
                className="group relative bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer flex flex-col min-h-[160px]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, material.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="font-semibold text-zinc-900 line-clamp-2 mt-auto leading-tight">{material.title}</h3>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide ${course ? "bg-indigo-50 text-indigo-700" : "bg-zinc-100 text-zinc-600"}`}>
                    {course?.code || 'General'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                    {material.type}
                  </span>
                </div>
              </div>
            );
          })}
          
          {filteredMaterials.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              <BookOpen className="w-12 h-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900">No materials found</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-6">Upload syllabus PDFs or lecture slideshows to keep them organized and extract tasks.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload PDF
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col h-[75vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <button 
                onClick={closeMaterial}
                className="p-1.5 hover:bg-zinc-200 text-zinc-600 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                {selectedMaterial.title}
              </h3>
            </div>
            
            <button
              onClick={handleExtractTasks}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
              {isExtracting ? 'Scanning...' : 'Extract Reading Tasks via AI'}
            </button>
          </div>
          
          <div className="flex-1 bg-zinc-100/50 relative">
            {objectUrl && (
              <object 
                data={objectUrl} 
                type="application/pdf" 
                className="w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-zinc-500 mb-4">Your browser does not support embedded PDFs.</p>
                  <a href={objectUrl} download className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Download PDF</a>
                </div>
              </object>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
