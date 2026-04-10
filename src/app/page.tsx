"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Compass, Calendar, Globe2, Navigation, Sun, Moon } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function Home() {
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (document.documentElement.classList.contains('light-mode')) {
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-mode');
      setIsLightMode(true);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus("Sending...");
    try {
      const res = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: feedbackName, feedback: feedbackMsg }),
      });
      if (res.ok) {
        setFeedbackStatus("Sent successfully!");
        setFeedbackName("");
        setFeedbackMsg("");
      } else {
        const data = await res.json();
        setFeedbackStatus(data.error || "Failed to send");
      }
    } catch {
      setFeedbackStatus("Failed to send");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-100 overflow-x-hidden bg-slate-950 selection:bg-amber-200 selection:text-amber-900">
      
      {/* Background Image - Chandrashila */}
      <div className="fixed inset-0 z-0 bg-slate-950">
        <img 
          src="https://www.shutterstock.com/image-photo/different-views-chandratal-lake-4250mtr-himachal-260nw-2053943075.jpg" 
          alt="Chandratal Lake Background" 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Soft shadow overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90"></div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/50 border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-v2.png" alt="NaviBharat Logo" width={38} height={38} className="rounded-xl shadow-md group-hover:scale-105 transition-transform" />
            <span className="font-extrabold tracking-tight text-2xl text-amber-500 drop-shadow-md">NaviBharat</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-300 hover:text-amber-400 hover:bg-slate-900/50 rounded-xl transition-all">
               {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            {user ? (
              <ProfileDropdown user={user} />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-900/50 rounded-xl transition-all">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-900/20 px-6 rounded-xl border-0 transition-all hover:scale-105 active:scale-95">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-8 md:pt-16 pb-12 min-h-[80vh] px-4">
        
        {/* Clean Logo UI instead of oversized frame */}
        <div className="mb-8 animate-in zoom-in slide-in-from-bottom-8 duration-1000">
           <div className="bg-slate-950/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
             <Image src="/logo-v2.png" alt="NaviBharat Logo" width={80} height={80} className="rounded-2xl drop-shadow-xl" priority />
           </div>
        </div>

        {/* Catchy Font Title matching Signup Theme */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-amber-500 tracking-widest mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col items-center text-center leading-tight">
           <span className="text-4xl md:text-6xl mb-2 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] font-sans">भारत दर्शन</span>
           NaviBharat
        </h1>
        
        <h4 className="text-lg md:text-2xl text-slate-100 font-serif italic max-w-3xl text-center mx-auto mb-10 font-bold tracking-wide bg-slate-950/80 px-8 py-4 rounded-full backdrop-blur-3xl shadow-2xl border border-white/20 leading-relaxed">
          Discover the soul of India & the world. <br className="hidden md:block"/> Highly personalized, AI-curated journeys.
        </h4>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
          <Link href="/plan">
            <Button size="lg" className="h-16 px-10 text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.3)] rounded-2xl w-full sm:w-auto transition-all hover:scale-105 active:scale-95 border-0 flex items-center gap-3">
              <Compass className="h-6 w-6" />
              Plan your trip
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Preview */}
      <section className="relative z-10 py-24 bg-slate-950/95 border-t border-white/10 backdrop-blur-2xl">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white tracking-tight">How NaviBharat Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 p-10 rounded-3xl border border-white/10 shadow-2xl text-center hover:bg-slate-900/80 transition-all hover:-translate-y-2 group">
              <div className="mx-auto bg-amber-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
                <MapPin size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white tracking-wide">1. Set Requirements</h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">Enter your destination, dates, budget, and deepest travel preferences.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-slate-900/60 p-10 rounded-3xl border border-white/10 shadow-2xl text-center hover:bg-slate-900/80 transition-all hover:-translate-y-2 group mt-0 md:mt-8">
              <div className="mx-auto bg-amber-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
                <Compass size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white tracking-wide">2. AI Generation</h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">Our engine crafts the perfect day-by-day itinerary including hidden gems.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-slate-900/60 p-10 rounded-3xl border border-white/10 shadow-2xl text-center hover:bg-slate-900/80 transition-all hover:-translate-y-2 group mt-0 md:mt-16">
              <div className="mx-auto bg-amber-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
                <Calendar size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white tracking-wide">3. Review & Travel</h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">Review costs, print your PDF, and get ready for an unforgettable trip.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feedback Section */}
      <section className="relative z-10 py-16 bg-slate-900 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-amber-500 tracking-tight">We value your feedback</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Help us improve NaviBharat! Share your thoughts or feature requests with us.</p>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-left bg-slate-950/50 p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-300 uppercase tracking-wide">Name</label>
              <input id="name" type="text" placeholder="Your Name" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)} required className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-bold text-slate-300 uppercase tracking-wide">Message</label>
              <textarea id="feedback" placeholder="Tell us how we can do better..." rows={4} value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)} required className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium resize-none"></textarea>
            </div>
            <Button type="submit" disabled={feedbackStatus === "Sending..."} className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold h-12 rounded-xl text-lg mt-2 transition-transform active:scale-95">
              {feedbackStatus === "Sending..." ? "Sending..." : "Send Feedback"}
            </Button>
            {feedbackStatus && feedbackStatus !== "Sending..." && (
              <p className={`text-center text-sm font-bold mt-2 ${feedbackStatus.includes("success") ? "text-teal-400" : "text-red-400"}`}>{feedbackStatus}</p>
            )}
          </form>
        </div>
      </section>

      <footer className="relative z-10 bg-slate-950 py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center text-slate-500 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} NaviBharat by SmartTrip AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
