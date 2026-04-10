"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

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

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans text-slate-100 overflow-hidden bg-slate-950">
      
      {/* Background Image - Varanasi */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <img 
          src="https://www.shutterstock.com/image-photo/varanasi-uttar-pradesh-india-cityscape-skyline-260nw-2534614269.jpg" 
          alt="Varanasi Skyline Background" 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Soft shadow overlay for legibility matching signup exactly */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90"></div>
      </div>

      {/* Top Left Logo Nav */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-20 bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-2xl">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-v2.png" alt="NaviBharat Logo" width={32} height={32} className="rounded-lg shadow-sm" />
          <span className="font-extrabold tracking-tight text-lg text-amber-500 drop-shadow-md">NaviBharat</span>
        </Link>
      </div>

      {/* Center Top: Bharat Darshan & Atithi Devo Bhava */}
      <div className="absolute top-8 left-0 w-full flex flex-col items-center justify-center z-10 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] mb-4 flex flex-col items-center">
          <span className="text-xl mb-1 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">भारत दर्शन</span>
          Bharat Darshan
        </h2>
        
        {/* Sanskrit Quote */}
        <div className="mt-2 flex flex-col items-center gap-1">
          <h3 className="text-2xl md:text-3xl font-serif font-black text-white drop-shadow-2xl">अतिथिदेवो भव:</h3>
          <h4 className="text-xs md:text-sm text-cyan-200/90 font-serif italic max-w-2xl font-bold tracking-wide bg-slate-950/90 px-6 py-1.5 rounded-full backdrop-blur-3xl shadow-2xl border border-white/20">
            "The guest is equivalent to God."
          </h4>
        </div>
      </div>

      {/* Login Form Card */}
      <Card className="w-full max-w-sm xl:max-w-md shadow-2xl border border-white/20 bg-slate-950/90 backdrop-blur-3xl z-10 rounded-3xl overflow-hidden ring-1 ring-black/40 mt-[36rem] xl:mt-[24rem] transition-all hover:bg-slate-950/95">
        <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600"></div>
        
        <CardHeader className="text-center pb-2 pt-6 relative z-10">
          <CardTitle className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Welcome Back</CardTitle>
          <CardDescription className="text-slate-300 font-medium mt-1 text-sm">Log in to access your saved itineraries and plan new trips.</CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 px-6 xl:px-8">
          <form onSubmit={handleEmailLogin} className="space-y-4 mt-2">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-slate-300 font-bold uppercase text-[10px] tracking-widest drop-shadow-sm">Email Address</Label>
              <Input id="email" type="email" placeholder="explorer@example.com" required className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-amber-500 rounded-xl hover:border-white/30 font-medium shadow-inner" />
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="password" className="text-slate-300 font-bold uppercase text-[10px] tracking-widest drop-shadow-sm">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-amber-500 rounded-xl hover:border-white/30 font-medium shadow-inner" />
            </div>
            
            <Button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-xl transition-all h-12 rounded-xl font-bold mt-4 border-0 text-lg">
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {status && (
            <div className={`mt-4 py-3 px-4 ${status.includes('failed') || status.includes('Error') ? 'bg-red-950/80 text-red-100 border-red-800' : 'bg-teal-950/80 text-teal-100 border-teal-800'} rounded-xl text-xs flex justify-center font-bold animate-in fade-in slide-in-from-top-2 border shadow-inner`}>
              <span className="flex-1 text-center">{status}</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center bg-slate-950/50 p-5 rounded-b-3xl border-t border-white/10 relative z-10 mt-4 backdrop-blur-md">
          <div className="text-xs text-slate-300 font-medium tracking-wide">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-amber-500 hover:text-amber-400 font-bold transition-colors ml-1 drop-shadow-md">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
