
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Github, Ghost, Terminal, BookOpen } from 'lucide-react';

export const LoginPage = () => {
  const { signInWithGoogle, signInGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dots flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Initializing Core Systems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dots flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 mx-auto flex items-center justify-center font-black text-4xl text-white border-2 border-black shadow-[6px_6px_0px_0px_#000] mb-4">
            S
          </div>
          <h1 className="text-4xl font-black text-white font-mono tracking-tighter">SEMESTER<span className="text-indigo-500">FLOW</span></h1>
          <p className="text-gray-500 font-mono text-sm mt-2">Advanced Academic Trajectory System</p>
        </div>

        {/* Login Card */}
        <div className="retro-card p-8 bg-gray-900 border-indigo-500 shadow-[8px_8px_0px_0px_#6366f1]">
          <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-700 pb-4">
            <Terminal className="w-5 h-5 text-green-400" />
            <h2 className="font-bold text-white font-mono uppercase">Access Protocol</h2>
          </div>

          <div className="space-y-4">
            <button 
              onClick={signInWithGoogle}
              className="retro-btn w-full bg-white text-black py-4 font-bold uppercase flex items-center justify-center gap-3 hover:bg-gray-200 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>

            <button 
              onClick={signInGuest}
              className="retro-btn w-full bg-gray-800 text-gray-300 border-gray-600 py-3 font-bold uppercase flex items-center justify-center gap-3 hover:bg-gray-700 hover:text-white"
            >
              <Ghost className="w-5 h-5" />
              Continue as Guest
            </button>
          </div>

          <div className="mt-8 text-[10px] font-mono text-gray-600 text-center leading-relaxed">
            By initiating session, you agree to the storage of academic data within the Firestore Neural Network.
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 opacity-50">
           <BookOpen className="w-6 h-6 text-gray-600" />
           <div className="w-1 h-6 bg-gray-800"></div>
           <div className="font-mono text-xs text-gray-500 uppercase pt-1">v2.5.0 • System Online</div>
        </div>
      </div>
    </div>
  );
};
