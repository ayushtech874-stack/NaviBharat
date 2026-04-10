"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Navigation } from "lucide-react";

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

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans text-slate-100 overflow-hidden bg-slate-950">
      
      {/* Background Image - Chandrashila */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <img 
          src="https://image.shutterstock.com/image-photo/elevated-view-ancient-key-monastery-flanked-600nw-1619025229.jpg" 
          alt="Ancient Key Monastery" 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Soft shadow overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90"></div>
      </div>

      {/* Top Left Logo Nav */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-20 bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-2xl">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-v2.png" alt="NaviBharat Logo" width={32} height={32} className="rounded-lg shadow-sm" />
          <span className="font-extrabold tracking-tight text-lg text-amber-500 drop-shadow-md">NaviBharat</span>
        </Link>
      </div>

      {/* Center Top: Bharat Darshan */}
      <div className="absolute top-8 left-0 w-full flex flex-col items-center justify-center z-10 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] mb-2 flex flex-col items-center">
          <span className="text-xl mb-1 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">भारत दर्शन</span>
          Bharat Darshan
        </h2>
        <h4 className="text-sm text-center text-white font-serif italic max-w-2xl font-bold tracking-wide bg-slate-950/90 px-6 py-2 rounded-full backdrop-blur-3xl shadow-2xl border border-white/20">
          Echoes of an ancient civilization, where every stone tells a story of unparalleled cultural glory.
        </h4>
      </div>

      {/* Left side: Mysterious Monuments */}
      <div className="absolute hidden xl:flex flex-col items-end left-8 top-1/2 -translate-y-1/2 z-0 w-[280px] 2xl:w-[320px] gap-8 mt-12">
        
        {/* Monument 1 (Chittorgarh Fort placeholder) */}
        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 w-full transform hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.8)] group">
          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 ring-1 ring-white/10">
             <img src="https://media.istockphoto.com/id/2223818400/photo/an-isolated-ancient-temple-stands-against-the-backdrop-of-a-moody-storm-lit-sky-at-dusk-in.jpg?s=612x612&w=0&k=20&c=sVlTRYPzHwoCv-uWqRh3vUMrc3DKf2NjA5tqcZnLKpA=" alt="Mysterious Indian Monument" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <h4 className="text-sm text-cyan-100 font-serif italic tracking-wide text-center px-2 py-1 font-medium bg-slate-900/50 rounded-lg drop-shadow-md">"The pinnacle of Rajputana valor."</h4>
        </div>

        {/* Monument 2 (Taj Mahal user request) */}
        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 w-full transform hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.8)] group">
           <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 ring-1 ring-white/10">
             <img src="https://images.unsplash.com/photo-1545562083-c583d014b4f2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kaWFuJTIwbW9udW1lbnR8ZW58MHx8MHx8fDA%3D" alt="Mysterious Indian Monument" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <h4 className="text-sm text-cyan-100 font-serif italic tracking-wide text-center px-2 py-1 font-medium bg-slate-900/50 rounded-lg drop-shadow-md">"An immortal testament to eternal love."</h4>
        </div>
      </div>

      {/* Right side: Mysterious Monuments */}
      <div className="absolute hidden xl:flex flex-col items-start right-8 top-1/2 -translate-y-1/2 z-0 w-[280px] 2xl:w-[320px] gap-8 mt-12">
        
        {/* Monument 3 (Mysore Palace user request) */}
        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 w-full transform hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.8)] group">
          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 ring-1 ring-white/10">
             <img src="https://images.unsplash.com/photo-1659126574791-13313aa424bd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TXlzb3JlJTIwUGFsYWNlfGVufDB8fDB8fHww" alt="Mysterious Indian Monument" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <h4 className="text-sm text-cyan-100 font-serif italic tracking-wide text-center px-2 py-1 font-medium bg-slate-900/50 rounded-lg drop-shadow-md">"Grandeur woven with a million lights."</h4>
        </div>

        {/* Monument 4 (Raigad Fort user request) */}
        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 w-full transform hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.8)] group">
           <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 ring-1 ring-white/10">
             <img src="https://images.unsplash.com/photo-1560756769-068d6638b559?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFpZ2FkJTIwZm9ydHxlbnwwfHwwfHx8MA%3D%3D" alt="Mysterious Indian Monument" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <h4 className="text-sm text-cyan-100 font-serif italic tracking-wide text-center px-2 py-1 font-medium bg-slate-900/50 rounded-lg drop-shadow-md">"The majestic capital of the Maratha Empire."</h4>
        </div>
      </div>

      {/* Signup Form Card */}
      <Card className="w-full max-w-sm xl:max-w-md shadow-2xl border border-white/20 bg-slate-950/90 backdrop-blur-3xl z-10 rounded-3xl overflow-hidden ring-1 ring-black/40 mt-[36rem] xl:mt-[24rem] transition-all hover:bg-slate-950/95">
        <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600"></div>
        
        <CardHeader className="text-center pb-2 pt-6 relative z-10">
          <CardTitle className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Begin Your Journey</CardTitle>
          <CardDescription className="text-slate-300 font-medium mt-1 text-sm">Join NaviBharat to weave your ultimate travel experience.</CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 px-6 xl:px-8">
          <form onSubmit={handleSignup} className="space-y-4 mt-2">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="name" className="text-slate-300 font-bold uppercase text-[10px] tracking-widest drop-shadow-sm">Full Name</Label>
              <Input id="name" type="text" placeholder="Enter your full name" required className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-amber-500 rounded-xl hover:border-white/30 font-medium shadow-inner" />
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-slate-300 font-bold uppercase text-[10px] tracking-widest drop-shadow-sm">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email address" required className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-amber-500 rounded-xl hover:border-white/30 font-medium shadow-inner" />
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="password" className="text-slate-300 font-bold uppercase text-[10px] tracking-widest drop-shadow-sm">Password</Label>
              <Input id="password" type="password" placeholder="Create a secure password" required className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-amber-500 rounded-xl hover:border-white/30 font-medium shadow-inner" />
            </div>
            
            <Button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-xl transition-all h-12 rounded-xl font-bold mt-4 border-0 text-lg">
              {loading ? "Forging Account..." : "Start Exploring"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 py-3 px-4 bg-red-950/80 text-red-100 rounded-xl text-xs justify-center flex font-bold border border-red-800 shadow-inner">
              <span className="flex-1 text-center">{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 py-3 px-4 bg-teal-950/80 text-teal-100 rounded-xl text-xs text-center font-bold animate-in fade-in slide-in-from-top-2 border border-teal-800 shadow-inner">
              Account created successfully! Redirecting...
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center bg-slate-950/50 p-5 rounded-b-3xl border-t border-white/10 relative z-10 mt-4 backdrop-blur-md">
          <div className="text-xs text-slate-300 font-medium tracking-wide">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-500 hover:text-amber-400 font-bold transition-colors ml-1 drop-shadow-md">
              Log in instead
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
