'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase'; // Ensure this path matches your setup
import { User } from '@supabase/supabase-js';

// 1. Define what our "Brain" remembers
const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  user: null as User | null,
  loading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- PART A: THEME LOGIC ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setDarkMode(true);

    // --- PART B: AUTH LOGIC ---
    // Check if a user is already logged in when the app starts
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    // Listen for changes (e.g., when a user logs in or out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, user, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. The "Hook" to use this in any page
export const useTheme = () => useContext(ThemeContext);