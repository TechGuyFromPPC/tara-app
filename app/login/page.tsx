'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { darkMode } = useTheme();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Check your email for the confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/');
    }
    setLoading(false);
  };

  const bgClass = darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900';

  return (
  <main className={`min-h-screen flex flex-col p-6 transition-all ${bgClass}`}>
    {/* 1. Back Button - Always at the top left */}
    <div className="w-full max-w-5xl mx-auto">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-500/5 transition-all w-fit"
      >
        ← Back to Home
      </Link>
    </div>

    {/* 2. Centering Container - Pushes the box to the middle of the remaining space */}
    <div className="flex-1 flex items-center justify-center">
      <div className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl transition-colors ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <h1 className="text-3xl font-black text-blue-600 mb-2">
          {isSignUp ? 'Join the Hub' : 'Welcome Back'}
        </h1>
        
        {/* ... Rest of your form code stays the same ... */}
        
        <p className="text-slate-400 text-sm mb-8">
          {isSignUp ? 'Create an account to start joining events.' : 'Log in to see your joined activities.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:border-blue-600 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:border-blue-600 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  </main>
); 
}