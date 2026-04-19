'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, useTheme } from "../lib/ThemeContext"; 
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <ThemeProvider>
          <LayoutInner>{children}</LayoutInner>
        </ThemeProvider>
      </body>
    </html>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-50">
        <Link href="/" className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">Tara!</Link>
        <div className="flex items-center gap-3">
          {!user ? (
            <Link href="/login" className="text-[10px] font-black uppercase bg-blue-600 text-white px-5 py-2 rounded-full">Sign In</Link>
          ) : (
            <button onClick={handleLogout} className="text-[10px] font-black uppercase text-red-500 border border-red-500/20 px-4 py-2 rounded-full">Logout</button>
          )}
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 flex-col p-8 sticky top-0 h-screen border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Link href="/" className="text-4xl font-black italic tracking-tighter text-blue-600 uppercase mb-12">Tara!</Link>
        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">🌎 Explore</Link>
          <Link href="/create" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">➕ Host Event</Link>
        </nav>
        {user && (
          <button onClick={handleLogout} className="mt-auto w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-red-50 text-red-600 dark:bg-red-900/10">Logout</button>
        )}
      </aside>

      {/* MAIN CONTENT + FOOTER */}
      <main className="flex-1 flex flex-col min-h-screen w-full">
        {/* Children content area */}
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10">
          {children}
        </div>

        {/* FOOTER SECTION */}
        <footer className="w-full border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-blue-600">Tara!</h3>
              <p className="max-w-xs text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                The ultimate community hub for Puerto Princesa City. Connect, explore, and host local events.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</p>
                <Link href="/" className="block text-[10px] font-bold uppercase hover:text-blue-600 transition-colors">Explore</Link>
                <Link href="/create" className="block text-[10px] font-bold uppercase hover:text-blue-600 transition-colors">Host Event</Link>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support</p>
                <Link href="#" className="block text-[10px] font-bold uppercase hover:text-blue-600 transition-colors">Safety</Link>
                <Link href="#" className="block text-[10px] font-bold uppercase hover:text-blue-600 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Tara! PPC. All rights reserved.</p>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter italic">Made with ❤️ in Puerto Princesa</p>
          </div>
        </footer>
      </main>
    </div>
  );
}