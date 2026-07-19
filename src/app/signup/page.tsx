"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Get form values
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Save token and user details to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setError("Google Signup coming soon! Needs a Google Client ID configured.");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50 rounded-full bg-white/40 dark:bg-slate-900/40 border border-teal-100 dark:border-teal-900 backdrop-blur-md shadow-lg shadow-[#ffc174]/10">
        <ThemeToggle />
      </div>

      {/* 3D Background Image */}
      <div className="fixed inset-0 z-0">
        <img src="/3d_india_home.png" alt="Himalayas Dashboard Background" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-[#0f172a]/60 to-[#0c1324] backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content Container */}
      <main className="w-full max-w-[480px] px-4 md:px-0 z-10 my-12">
        {/* Signup Shell */}
        <div className="bg-[#f8fafc] dark:bg-[#0f172a]/60 backdrop-blur-2xl border border-teal-100 dark:border-teal-900 rounded-3xl p-8 md:p-10 flex flex-col items-center shadow-2xl dark:shadow-none">
          {/* Brand Identity */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <Link href="/" className="flex flex-col items-center group cursor-pointer">
              <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-16 h-16 rounded-2xl shadow-lg mb-2 group-hover:scale-105 transition-transform" />
              <h1 className="text-4xl font-bold text-[#ffc174] tracking-tight">NaviBharat</h1>
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Join the Adventure</h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-[320px] mx-auto">Create your account to start planning your next journey.</p>
          </div>

          {/* Form Section */}
          <form className="w-full space-y-5" onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-1">Full Name</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 group-focus-within:text-[#ffc174] transition-colors w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none" id="name" name="name" placeholder="Enter your full name" type="text" required />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-1">Email Address</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 group-focus-within:text-[#ffc174] transition-colors w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none" id="email" name="email" placeholder="you@example.com" type="email" required />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-1">Password</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 group-focus-within:text-[#ffc174] transition-colors w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none" id="password" name="password" placeholder="••••••••" type="password" required />
              </div>
            </div>

            {error && (
              <div className="py-3 px-4 bg-[#93000a]/80 text-[#ffdad6] rounded-xl text-xs justify-center flex font-bold border border-[#93000a] shadow-inner">
                <span className="flex-1 text-center">{error}</span>
              </div>
            )}

            {success && (
              <div className="py-3 px-4 bg-[#003f38]/80 text-[#71f8e4] rounded-xl text-xs text-center font-bold animate-in fade-in slide-in-from-top-2 border border-[#04b4a2] shadow-inner">
                Account created successfully! Redirecting...
              </div>
            )}

            {/* Primary CTA */}
            <button disabled={loading} className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#613b00] font-bold text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] mt-4 transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:shadow-none">
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="text-xs font-medium text-[#a08e7a] uppercase tracking-widest">or</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>

            {/* Social Login */}
            <button onClick={handleGoogleSignup} type="button" className="w-full flex items-center justify-center gap-3 border border-teal-100 dark:border-teal-900 bg-white/5 py-4 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-800/10 transition-all active:scale-95 cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              Sign up with Google
            </button>
          </form>

          {/* Login Redirect */}
          <div className="mt-10 text-center">
            <p className="text-base text-slate-600 dark:text-slate-300">
              Already have an account? 
              <Link className="text-[#ffc174] font-bold hover:underline underline-offset-4 transition-all ml-1" href="/login">Log In</Link>
            </p>
          </div>
        </div>

        {/* Footer / AI Hint */}
        <div className="mt-8 flex flex-col items-center gap-4 animate-pulse">
          <div className="flex items-center gap-2 bg-[#4fdbc8]/10 border border-[#4fdbc8]/20 px-4 py-2 rounded-full">
            <svg className="w-5 h-5 text-[#0f766e]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            <span className="text-[#0f766e] text-xs font-medium">AI-Powered personalized itineraries await</span>
          </div>
        </div>
      </main>


    </div>
  );
}
