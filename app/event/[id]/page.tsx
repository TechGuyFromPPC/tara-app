'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import Link from 'next/link';
import ChatRoom from '@/app/components/ChatRoom';

export default function EventDetails() {
  const { id } = useParams();
  const { user, darkMode } = useTheme();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (user) checkJoinedStatus();
  }, [id, user]);

  async function fetchEvent() {
    const { data } = await supabase.from('events').select('*, participants(count)').eq('id', id).single();
    if (data) setEvent(data);
    setLoading(false);
  }

  async function checkJoinedStatus() {
    const { data } = await supabase.from('participants').select('*').eq('event_id', id).eq('user_id', user?.id).single();
    if (data) setIsJoined(true);
  }

  async function handleJoin() {
    if (!user) { router.push('/login'); return; }
    const { error } = await supabase.from('participants').insert([{ event_id: id, user_id: user.id }]);
    if (!error) { setIsJoined(true); fetchEvent(); }
  }

  if (loading || !event) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[.5em]">Loading Tara!...</div>;

  return (
    <main className={`min-h-screen p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-10 text-[10px] font-black text-blue-600 hover:translate-x-[-4px] transition-transform uppercase tracking-widest">
          ← Back to Tara!
        </Link>

        <div className="relative h-[400px] rounded-[4rem] overflow-hidden shadow-2xl mb-12">
          <img src={event.image_url || 'https://via.placeholder.com/1200'} className="w-full h-full object-cover" />
          <div className="absolute top-8 left-8 flex gap-3">
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-2.5 rounded-3xl shadow-xl flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  {event.participants?.[0]?.count || 0} Going
                </span>
             </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-12">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.85]">{event.title}</h1>
            <p className="text-white/60 font-black mt-4 uppercase tracking-widest text-xs">📍 {event.location}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className={`p-12 rounded-[3.5rem] ${darkMode ? 'bg-slate-800' : 'bg-white shadow-xl shadow-slate-200/50'}`}>
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6 italic">The Vibe</h3>
              <p className="text-xl leading-relaxed opacity-90 font-medium">{event.description}</p>
            </div>
            {showChat && <ChatRoom eventId={id as string} user={user} />}
          </div>

          <div className="space-y-6">
             {isJoined ? (
               <button onClick={() => setShowChat(!showChat)} className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all uppercase italic">
                 {showChat ? 'Hide Chat' : '💬 Chat Room'}
               </button>
             ) : (
               <button onClick={handleJoin} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-8 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all uppercase">
                 Join Now
               </button>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}