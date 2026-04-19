'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import Link from 'next/link';

export default function CreateActivity() {
  const router = useRouter();
  const { user, darkMode } = useTheme();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 16));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return alert("Please login first");
    setLoading(true);

    try {
      let finalImageUrl = '';

      // 1. Upload the file to the 'event-images' bucket
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get the public URL for the record
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      // 3. Save everything to the 'events' table
    const { error: insertError } = await supabase.from('events').insert([
  { 
    title, 
    description, 
    category, 
    location, 
    image_url: finalImageUrl, 
    user_id: user.id,
    event_date: eventDate // This fixes the 'null' error
  }
]);

      if (insertError) throw insertError;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`min-h-screen p-6 flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`max-w-xl w-full p-10 rounded-[3rem] shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
          ← Cancel
        </Link>

        <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-8">Host an Activity</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Event Name</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunset Yoga"
              className={`w-full px-6 py-4 rounded-2xl border-2 focus:border-blue-500 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">The Vibe</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell us more..."
              className={`w-full px-6 py-4 rounded-2xl border-2 focus:border-blue-500 outline-none transition-all resize-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
          </div>

          {/* Photo Upload - THE CORE CHANGE */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Cover Photo</label>
            <div className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all ${darkMode ? 'border-slate-600 hover:border-blue-500' : 'border-slate-200 hover:border-blue-500'}`}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <div className="space-y-2">
                <p className="text-sm font-black text-blue-500 uppercase tracking-widest">
                  {file ? '✅ ' + file.name : '📸 Click to Upload'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">JPG, PNG or WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>
<div>
  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">When is the Tara?</label>
  <input 
    required 
    type="datetime-local" 
    value={eventDate} 
    onChange={(e) => setEventDate(e.target.value)}
    className={`w-full px-6 py-4 rounded-2xl border-2 focus:border-blue-500 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} 
  />
</div>
          <div className="grid grid-cols-2 gap-4">
            <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
              className={`px-6 py-4 rounded-2xl border-2 outline-none ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className={`px-6 py-4 rounded-2xl border-2 outline-none ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
              {['General', 'Music', 'Nature', 'Sports', 'Food', 'Social'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <button disabled={loading} type="submit"
            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'Uploading Tara!...' : 'Post Activity'}
          </button>
        </form>
      </div>
    </main>
  );
}