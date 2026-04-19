'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import Link from 'next/link';

// Added your missing categories here
const CATEGORIES = ['All', 'Joined', 'Music', 'Nature', 'Sports', 'Food', 'Social', 'General'];

export default function Home() {
  const { darkMode, toggleDarkMode, user } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let query = supabase.from('events').select('*, participants(count)');

      if (selectedFilter === 'Joined' && user) {
        const { data: joined } = await supabase.from('participants').select('event_id').eq('user_id', user.id);
        const ids = joined?.map(j => j.event_id) || [];
        query = query.in('id', ids);
      } else if (selectedFilter !== 'All' && selectedFilter !== 'Joined') {
        query = query.eq('category', selectedFilter);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setEvents(data || []);
      setLoading(false);
    }
    fetchData();
  }, [selectedFilter, user]);

  const topEvents = events.slice(0, 2); // For now, let's treat the 2 newest as "Top"

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 hidden md:flex flex-col p-8 sticky top-0 h-screen border-r border-slate-200/10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-blue-600 tracking-tighter italic">Tara!</h1>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedFilter(cat)}
              className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-black transition-all ${
                selectedFilter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-blue-500/10'
              }`}>
              {cat === 'All' ? '🏠 Home' : cat === 'Joined' ? '✅ My List' : `• ${cat}`}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200/10">
          {user ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black text-white">{user.email?.charAt(0).toUpperCase()}</div>
              <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black text-red-500 uppercase">Logout ✕</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-black text-blue-600 mb-4 block">SIGN IN</Link>
          )}
          <button onClick={toggleDarkMode} className="w-full p-3 rounded-xl bg-slate-200/10 text-[10px] font-black uppercase tracking-widest">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </aside>

      {/* --- MAIN FEED --- */}
      <main className="flex-1 p-6 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-5xl font-black tracking-tighter uppercase">Explore</h2>
          <Link href="/create" className="bg-blue-600 text-white px-8 py-4 rounded-full font-black shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
            + New Activity
          </Link>
        </header>

        {/* TOP EVENTS SECTION */}
        {selectedFilter === 'All' && topEvents.length > 0 && (
          <section className="mb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">🔥 Top Picks in PPC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topEvents.map(event => (
                <Link href={`/event/${event.id}`} key={`top-${event.id}`} className="relative h-64 rounded-[3rem] overflow-hidden group shadow-2xl">
                  <img src={event.image_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                    <span className="text-[10px] font-black text-blue-400 uppercase mb-2">{event.category}</span>
                    <h4 className="text-2xl font-black text-white uppercase italic">{event.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* REGULAR FEED */}
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">✨ Latest Activities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Link href={`/event/${event.id}`} key={event.id} className="group">
              <div className={`h-full rounded-[2.5rem] overflow-hidden border-2 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
                <div className="relative h-52 overflow-hidden">
                  <img src={event.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-2xl shadow-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-700 dark:text-slate-200 uppercase">{event.participants?.[0]?.count || 0} Joined</span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{event.category}</span>
                  <h3 className="text-xl font-black mt-3 truncate uppercase italic">{event.title}</h3>
                  <p className="text-slate-400 text-[10px] font-bold mt-2 flex items-center gap-1">
  📍 {event.location} • 📅 {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-2">📍 {event.location}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}