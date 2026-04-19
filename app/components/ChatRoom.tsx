'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChatRoom({ eventId, user }: { eventId: string, user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch existing messages & Listen for new ones
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat:${eventId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `event_id=eq.${eventId}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert([
      { 
        event_id: eventId, 
        user_id: user.id, 
        user_email: user.email, 
        content: newMessage 
      }
    ]);

    if (!error) setNewMessage('');
  }

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-inner overflow-hidden border dark:border-slate-700">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] font-black text-slate-400 uppercase mb-1 px-2">
              {msg.user_id === user.id ? 'You' : msg.user_email?.split('@')[0]}
            </span>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm font-medium ${
              msg.user_id === user.id 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white dark:bg-slate-700 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-sm transition-transform active:scale-90">
          SEND
        </button>
      </form>
    </div>
  );
}