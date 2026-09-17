import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Calendar, CheckCircle2, ShieldCheck, Download, Layers, AlertCircle } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const LandingScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2 text-zinc-900">
          <Calendar className="w-5 h-5 text-red-700" />
          <span className="font-semibold tracking-tight">uOttawa Tasks</span>
        </div>
        <div className="flex items-center gap-3">
          <PWAInstallButton />
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900 transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-200">
          <Calendar className="w-10 h-10 text-red-800" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-4">
          Master your Brightspace schedule.
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mb-10 leading-relaxed">
          Sync your uOttawa assignments, organize your coursework, and stay ahead of deadlines. Completely private and secured with cloud sync across all your devices.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <Layers className="w-6 h-6 text-blue-600 mb-4" />
            <h3 className="font-semibold text-zinc-900 mb-2">Cloud Sync</h3>
            <p className="text-sm text-zinc-600">Access your tasks from your laptop, phone, or tablet anywhere, seamlessly.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-4" />
            <h3 className="font-semibold text-zinc-900 mb-2">Offline Ready</h3>
            <p className="text-sm text-zinc-600">Install the Progressive Web App (PWA) to view your tasks even without an internet connection.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-purple-600 mb-4" />
            <h3 className="font-semibold text-zinc-900 mb-2">Privacy First</h3>
            <p className="text-sm text-zinc-600">Your Brightspace feed links and personal tasks are completely isolated and secured to your account.</p>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-zinc-400 text-sm border-t border-zinc-200 bg-white">
        &copy; {new Date().getFullYear()} uOttawa Unofficial Tools. Secure Cloud Enabled.
      </footer>
    </div>
  );
};
