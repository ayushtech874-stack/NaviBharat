"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Compass, Calendar } from "lucide-react";
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
    
    const handleScroll = () => {
        const header = document.getElementById('mainNav');
        if (header) {
           if (window.scrollY > 50) {
               header.classList.add('shadow-2xl');
               header.style.backgroundColor = 'rgba(12, 19, 36, 0.85)';
           } else {
               header.classList.remove('shadow-2xl');
               header.style.backgroundColor = 'rgba(12, 19, 36, 0.6)';
           }
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className="min-h-screen relative flex flex-col font-sans bg-[#020617] text-[#dce1fb] overflow-x-hidden selection:bg-[#ffc174]/30">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-10 h-20 bg-[#0c1324]/60 backdrop-blur-xl border-b border-white/10 shadow-md transition-all duration-300" id="mainNav">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-2xl text-[#f59e0b] tracking-tight flex items-center gap-2">
             <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-xl shadow-md" />
             NaviBharat
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/plan" className="text-[#d8c3ad] font-semibold text-sm hover:text-[#4fdbc8] transition-colors duration-300">Explore</Link>
          <Link href="/dashboard" className="text-[#d8c3ad] font-semibold text-sm hover:text-[#4fdbc8] transition-colors duration-300">Itineraries</Link>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="text-[#d8c3ad] hover:text-[#ffc174] transition-all duration-300 transform hover:scale-110">
            {isLightMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
          </button>
          
          {user ? (
             <ProfileDropdown user={user} />
          ) : (
            <>
              <Link href="/login" className="text-[#d8c3ad] font-semibold text-sm hover:text-[#ffc174] transition-colors">Log in</Link>
              <Link href="/signup">
                <button className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] px-6 py-2.5 rounded-xl text-white font-semibold text-sm scale-105 transition-transform hover:opacity-90">
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
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-bounce shadow-[0_10px_25px_-5px_rgba(245,158,11,0.2)]">
             <img src="/logo-v2.png" className="w-14 h-14 rounded-xl object-contain drop-shadow-lg" alt="NaviBharat Logo" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-[#dce1fb] mb-6 leading-tight tracking-tight">
            NaviBharat
          </h1>
          <p className="text-lg md:text-xl text-[#d8c3ad] mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed font-medium">
            Discover the soul of India &amp; the world. Highly personalized, <span className="text-[#4fdbc8] font-bold">AI-curated journeys</span> designed for the modern explorer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/plan">
               <button className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] px-10 py-5 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 group flex items-center">
                 Plan your trip
                 <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 md:px-10 bg-[#020617] relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#dce1fb] mb-4">How NaviBharat Works</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                <MapPin className="text-[#f59e0b] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#dce1fb] mb-4">Set Requirements</h3>
              <p className="text-[#d8c3ad] font-medium opacity-80 leading-relaxed">
                Tell us your destination, budget, and travel style. Whether it's a spiritual retreat in Rishikesh or a luxe escape in Dubai.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[#4fdbc8]/20 border border-[#4fdbc8]/30 flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(79,219,200,0.3)] transition-all">
                <svg className="text-[#4fdbc8] w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M2 12h4"/><path d="m7.8 7.8-2.9-2.9"/><path d="m9 12 3-3 3 3-3 3-3-3Z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-[#dce1fb] mb-4">AI Generation</h3>
              <p className="text-[#d8c3ad] font-medium opacity-80 leading-relaxed">
                Our neural engine processes thousands of data points to craft a unique itinerary optimized for your preferences.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                <Calendar className="text-[#f59e0b] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#dce1fb] mb-4">Review &amp; Travel</h3>
              <p className="text-[#d8c3ad] font-medium opacity-80 leading-relaxed">
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
      <section className="py-24 px-4 md:px-10 bg-[#070d1f] border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#dce1fb] mb-12">We value your feedback</h2>
          <div className="backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 p-8 md:p-12 rounded-[2rem] text-left shadow-2xl">
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-[#d8c3ad] ml-1">Name</label>
                <input 
                  type="text" 
                  value={feedbackName} 
                  onChange={(e) => setFeedbackName(e.target.value)} 
                  required 
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-[#dce1fb] focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none" 
                  placeholder="Your name" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-sm text-[#d8c3ad] ml-1">Message</label>
                <textarea 
                  value={feedbackMsg} 
                  onChange={(e) => setFeedbackMsg(e.target.value)} 
                  required 
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-[#dce1fb] focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all outline-none resize-none" 
                  placeholder="How can we make your journeys better?" 
                  rows={4}
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={feedbackStatus === "Sending..."} 
                className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-8 py-4 rounded-xl text-white font-bold text-lg hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {feedbackStatus === "Sending..." ? "Sending..." : "Send Feedback"}
              </button>
              {feedbackStatus && feedbackStatus !== "Sending..." && (
                <p className={`text-center text-sm font-bold mt-4 ${feedbackStatus.includes("success") ? "text-[#4fdbc8]" : "text-[#ffb4ab]"}`}>
                   {feedbackStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-10 bg-[#070d1f] border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-start gap-6">
          <div className="flex flex-col gap-4">
            <span className="font-bold text-2xl text-[#f59e0b]">NaviBharat</span>
            <p className="text-sm font-medium text-[#d8c3ad] opacity-60 max-w-xs leading-relaxed">
              Redefining global exploration through artificial intelligence and local heritage.
            </p>
          </div>
          <div className="flex justify-start md:justify-end w-full">
            <details className="group cursor-pointer relative">
              <summary className="list-none font-semibold text-sm text-[#ffc174] hover:text-[#f59e0b] transition-colors focus:outline-none flex items-center gap-2 select-none">
                About Creator
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </summary>
              <div className="absolute bottom-full mb-2 right-0 p-5 bg-[#0c1324]/90 backdrop-blur-xl border border-[#ffc174]/20 rounded-xl shadow-2xl text-left min-w-[240px] opacity-0 translate-y-2 group-open:opacity-100 group-open:translate-y-0 transition-all duration-300">
                <p className="text-[#d8c3ad] text-sm font-medium">Designed & Developed by</p>
                <p className="text-[#f59e0b] text-xl font-bold mt-1 tracking-wide">AYUSH</p>
                <div className="h-px w-full bg-white/10 my-3"></div>
                <ul className="space-y-2 text-xs text-[#d8c3ad]/80">
                  <li className="flex items-center gap-2"><svg className="w-3 h-3 text-[#4fdbc8]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Full-Stack Engineering</li>
                  <li className="flex items-center gap-2"><svg className="w-3 h-3 text-[#4fdbc8]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> UI/UX Design</li>
                  <li className="flex items-center gap-2"><svg className="w-3 h-3 text-[#4fdbc8]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> AI Integration</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-[#d8c3ad] opacity-60">© {new Date().getFullYear()} NaviBharat AI. Explorers Welcome.</p>
        </div>
      </footer>


    </div>
  );
}
