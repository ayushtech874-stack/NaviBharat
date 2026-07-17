"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStatus("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setStatus("Google Login coming soon! Needs a Google Client ID configured.");
  };

  return (
    <div className="min-h-screen bg-[#f0fdfa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans relative px-4 overflow-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50 rounded-full bg-white/40 dark:bg-slate-900/40 border border-teal-100 dark:border-teal-900 backdrop-blur-md shadow-lg shadow-[#ffc174]/10">
        <ThemeToggle />
      </div>

      {/* 3D Background Image */}
      <div className="fixed inset-0 z-0">
        <img src="/3d_india_home.png" alt="Himalayas Dashboard Background" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#0f172a]/60 to-[#f0fdfa] backdrop-blur-[2px]"></div>
      </div>
      
      <main className="w-full max-w-[480px] z-10 py-12">
        {/* Logo Area */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-12 h-12 rounded-xl shadow-lg shadow-[#f59e0b]/20 group-hover:scale-105 transition-transform" />
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffc174] to-[#d97706]">
                NaviBharat
            </h1>
          </Link>
        </div>
        
        {/* Main Card */}
        <div className="rounded-[2rem] p-8 md:p-10 shadow-2xl dark:shadow-none relative overflow-hidden bg-[#f8fafc] dark:bg-slate-900/60 backdrop-blur-2xl border border-teal-100 dark:border-teal-900">
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffc174]/5 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 text-center mb-10">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Welcome Back, Explorer</h2>
            <p className="text-base text-slate-600 dark:text-slate-300">Log in to plan your next adventure.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input className="w-full h-14 bg-[#e2e8f0] border border-teal-50 dark:border-teal-900 rounded-xl pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-600 dark:text-slate-300/40 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all duration-200" id="email" name="email" placeholder="explorer@navibharat.ai" type="email" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input className="w-full h-14 bg-[#e2e8f0] border border-teal-50 dark:border-teal-900 rounded-xl pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-600 dark:text-slate-300/40 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all duration-200" id="password" name="password" placeholder="••••••••" type="password" required />
              </div>
            </div>

            {status && (
              <div className={`py-3 px-4 ${status.includes('failed') || status.includes('Error') ? 'bg-[#93000a]/80 text-[#ffdad6]' : 'bg-[#003f38]/80 text-[#71f8e4]'} rounded-xl text-xs flex justify-center font-bold animate-in fade-in slide-in-from-top-2 border border-teal-100 dark:border-teal-900 shadow-inner`}>
                <span className="flex-1 text-center">{status}</span>
              </div>
            )}
            
            <div className="pt-2">
              <button disabled={loading} className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-[#2a1700] text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:scale-100" type="submit">
                <span>{loading ? "Logging in..." : "Login"}</span>
                {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
              </button>
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-teal-100 dark:border-teal-900"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-slate-600 dark:text-slate-300/60 uppercase tracking-widest">or continue with</span>
              <div className="flex-grow border-t border-teal-100 dark:border-teal-900"></div>
            </div>
            
            <button onClick={handleGoogleLogin} className="w-full h-14 bg-white/5 border border-teal-100 dark:border-teal-900 hover:bg-white/10 dark:hover:bg-slate-800/10 text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-3" type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-base text-slate-600 dark:text-slate-300">
              Don't have an account?{" "}
              <Link className="text-[#0f766e] text-sm font-semibold hover:underline decoration-2 underline-offset-4 transition-all" href="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
        
        {/* Aesthetic Footer Elements */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4fdbc8]/10 border border-[#4fdbc8]/20 rounded-full">
            <svg className="w-4 h-4 text-[#0f766e]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            <span className="text-xs font-medium text-[#0f766e]">AI-Powered Travel Intelligence</span>
          </div>
        </div>
      </main>
    </div>
  );
}
