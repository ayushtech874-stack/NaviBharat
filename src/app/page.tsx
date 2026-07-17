"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Compass, Calendar } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const handleScroll = () => {
        const header = document.getElementById('mainNav');
        if (header) {
           if (window.scrollY > 50) {
               header.classList.add('shadow-2xl dark:shadow-none');
               header.style.backgroundColor = 'rgba(12, 19, 36, 0.85)';
           } else {
               header.classList.remove('shadow-2xl dark:shadow-none');
               header.style.backgroundColor = 'rgba(12, 19, 36, 0.6)';
           }
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen relative flex flex-col font-sans bg-[#f0fdfa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-[#ffc174]/30">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-10 h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-teal-100 dark:border-teal-900 shadow-md transition-all duration-300" id="mainNav">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="font-bold text-xl sm:text-2xl text-[#f59e0b] tracking-tight flex items-center gap-2">
             <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-xl shadow-md" />
             NaviBharat
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/plan" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e] transition-colors duration-300">Plan Trip</Link>
          <Link href="/day-plan" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e] transition-colors duration-300">Plan Day</Link>
          <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e] transition-colors duration-300">Itineraries</Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          
          {user ? (
             <ProfileDropdown user={user} />
          ) : (
            <>
              <Link href="/login" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#ffc174] transition-colors">Log in</Link>
              <Link href="/signup">
                <button className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-slate-900 dark:text-slate-100 font-semibold text-sm scale-105 transition-transform hover:opacity-90">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 md:px-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img alt="Himalayas Landscape" className="w-full h-full object-cover opacity-60" src="/3d_india_home.png" />
          <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(circle at center, transparent 0%, #020617 85%), linear-gradient(to bottom, transparent 60%, #020617 100%)' }}></div>
        </div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          {/* Floating Icon */}
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-teal-100 dark:border-teal-900 backdrop-blur-md mb-8 animate-bounce shadow-[0_10px_25px_-5px_rgba(245,158,11,0.2)]">
             <img src="/logo-v2.png" className="w-14 h-14 rounded-xl object-contain drop-shadow-lg" alt="NaviBharat Logo" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[80px] font-extrabold text-slate-900 dark:text-slate-100 mb-6 leading-tight tracking-tight break-words">
            NaviBharat
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed font-medium">
            Discover the soul of India &amp; the world. Highly personalized, <span className="text-[#0f766e] font-bold">AI-curated journeys</span> designed for the modern explorer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/plan">
               <button className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 group flex items-center">
                 Plan your trip
                 <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </button>
            </Link>
            <Link href="/day-plan">
               <button className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-teal-100 dark:border-teal-900 shadow-xl px-8 py-4 rounded-2xl text-slate-900 dark:text-slate-100 font-bold text-lg transition-all hover:scale-105 active:scale-95 group flex items-center hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900 hover:text-[#0f766e]">
                 Plan your day
                 <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
               </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 md:px-10 bg-[#f0fdfa] dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">How NaviBharat Works</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-teal-100 dark:border-teal-900 p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                <MapPin className="text-[#f59e0b] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Set Requirements</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium opacity-80 leading-relaxed">
                Tell us your destination, budget, and travel style. Whether it's a spiritual retreat in Rishikesh or a luxe escape in Dubai.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-teal-100 dark:border-teal-900 p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[#4fdbc8]/20 border border-[#4fdbc8]/30 flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(79,219,200,0.3)] transition-all">
                <svg className="text-[#0f766e] w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M2 12h4"/><path d="m7.8 7.8-2.9-2.9"/><path d="m9 12 3-3 3 3-3 3-3-3Z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">AI Generation</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium opacity-80 leading-relaxed">
                Our neural engine processes thousands of data points to craft a unique itinerary optimized for your preferences.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-teal-100 dark:border-teal-900 p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                <Calendar className="text-[#f59e0b] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Review &amp; Travel</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium opacity-80 leading-relaxed">
                Fine-tune the details, sync with your calendar, and embark on a seamless journey guided by AI-powered real-time updates.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#4fdbc8]/10 rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      {/* Feedback Section */}
      <section className="py-24 px-4 md:px-10 bg-[#e2e8f0] border-t border-teal-50 dark:border-teal-900">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-12">We value your feedback</h2>
          <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-teal-100 dark:border-teal-900 p-8 md:p-12 rounded-[2rem] text-left shadow-2xl dark:shadow-none">
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-slate-600 dark:text-slate-300 ml-1">Name</label>
                <input 
                  type="text" 
                  value={feedbackName} 
                  onChange={(e) => setFeedbackName(e.target.value)} 
                  required 
                  className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none" 
                  placeholder="Your name" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-sm text-slate-600 dark:text-slate-300 ml-1">Message</label>
                <textarea 
                  value={feedbackMsg} 
                  onChange={(e) => setFeedbackMsg(e.target.value)} 
                  required 
                  className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none resize-none" 
                  placeholder="How can we make your journeys better?" 
                  rows={4}
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={feedbackStatus === "Sending..."} 
                className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-8 py-4 rounded-xl text-slate-900 dark:text-slate-100 font-bold text-lg hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {feedbackStatus === "Sending..." ? "Sending..." : "Send Feedback"}
              </button>
              {feedbackStatus && feedbackStatus !== "Sending..." && (
                <p className={`text-center text-sm font-bold mt-4 ${feedbackStatus.includes("success") ? "text-[#0f766e]" : "text-[#ffb4ab]"}`}>
                   {feedbackStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-10 bg-[#e2e8f0] border-t border-teal-100 dark:border-teal-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-start gap-6">
          <div className="flex flex-col gap-4">
            <span className="font-bold text-2xl text-[#f59e0b]">NaviBharat</span>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 opacity-60 max-w-xs leading-relaxed">
              Redefining global exploration through artificial intelligence and local heritage.
            </p>
          </div>
          <div className="flex justify-start md:justify-end w-full">
            <details className="group cursor-pointer relative">
              <summary className="list-none font-semibold text-sm text-[#ffc174] hover:text-[#f59e0b] transition-colors focus:outline-none flex items-center gap-2 select-none">
                About Creator
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </summary>
              <div className="absolute bottom-full mb-2 right-0 p-5 bg-white/90 backdrop-blur-xl border border-[#ffc174]/20 rounded-xl shadow-2xl dark:shadow-none text-left min-w-[240px] opacity-0 translate-y-2 group-open:opacity-100 group-open:translate-y-0 transition-all duration-300">
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Designed & Developed by</p>
                <p className="text-[#f59e0b] text-xl font-bold mt-1 tracking-wide">AYUSH</p>
                <div className="h-px w-full bg-white/10 my-3"></div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300/80">
                  <li className="flex items-center gap-2"><svg className="w-3 h-3 text-[#0f766e]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Full-Stack Engineering</li>
                  <li className="flex items-center gap-2"><svg className="w-3 h-3 text-[#0f766e]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> UI/UX Design</li>
                  <li className="flex items-center gap-2"><svg className="w-3 h-3 text-[#0f766e]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> AI Integration</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-teal-50 dark:border-teal-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 opacity-60">© {new Date().getFullYear()} NaviBharat AI. Explorers Welcome.</p>
        </div>
      </footer>


    </div>
  );
}
