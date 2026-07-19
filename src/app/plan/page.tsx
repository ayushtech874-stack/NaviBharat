"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Compass, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/theme-toggle";

const MapWidget = dynamic(() => import("@/components/MapWidget"), { ssr: false });

const preferencesOptions = ["Adventure", "Cultural", "Food", "Nature", "Wellness", "Relaxation", "Nightlife", "Historical"];

export default function PlanTripPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  
  const [daysMode, setDaysMode] = useState<"preset" | "custom">("preset");
  const [presetDays, setPresetDays] = useState("7 Days");
  const [customDays, setCustomDays] = useState("");

  const [budget, setBudget] = useState([65000]); // Per Head Budget
  const [travelers, setTravelers] = useState(2);
  const [preferences, setPreferences] = useState<string[]>(["Adventure"]);
  const [style, setStyle] = useState("Standard");

  // Geolocation & Wiki State
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destInfo, setDestInfo] = useState<{ extract?: string, image?: string } | null>(null);

  const [sourceSuggestions, setSourceSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [selectedSource, setSelectedSource] = useState(false);
  const [selectedDest, setSelectedDest] = useState(false);

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      if (preferences.length < 4) {
        setPreferences([...preferences, pref]);
      }
    }
  };

  const finalDays = daysMode === "preset" ? parseInt(presetDays) || 7 : parseInt(customDays) || 7;
  const perHeadBudget = budget[0];
  const totalGroupBudget = perHeadBudget * travelers;

  // Debounced Nominatim Fetch for Source
  useEffect(() => {
    if (selectedSource) {
      setSelectedSource(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (source.length > 2) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}&limit=5&countrycodes=in`);
          const data = await res.json();
          if (data && data.length > 0) {
             setSourceSuggestions(data);
             setShowSourceDropdown(true);
             setSourceCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
             setSourceSuggestions([]);
             setSourceCoords(null);
          }
        } catch (e) { console.error("Geocoding failed", e); }
      } else {
         setSourceSuggestions([]);
         setShowSourceDropdown(false);
         setSourceCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [source]);

  // Debounced Nominatim & Wikipedia Fetch for Destination
  useEffect(() => {
    if (selectedDest) {
      setSelectedDest(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (destination.length > 2) {
        // Fetch Coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=5&countrycodes=in`);
          const data = await res.json();
          if (data && data.length > 0) {
             setDestSuggestions(data);
             setShowDestDropdown(true);
             setDestCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
             setDestSuggestions([]);
             setDestCoords(null);
          }
        } catch (e) { console.error("Geocoding failed", e); }

        // Fetch Wiki
        try {
          const query = destination.split(',')[0].trim();
          const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
          if (wikiRes.ok) {
             const wikiData = await wikiRes.json();
             setDestInfo({ 
                extract: wikiData.extract, 
                image: wikiData.thumbnail?.source 
             });
          } else {
             setDestInfo(null);
          }
        } catch (e) {
          console.error("Wiki fetch failed", e);
          setDestInfo(null);
        }
      } else {
         setDestSuggestions([]);
         setShowDestDropdown(false);
         setDestCoords(null);
         setDestInfo(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) return;
    setIsGenerating(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          source, destination, days: finalDays, budget: perHeadBudget, travelers, preferences, travel_style: style
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentItinerary', JSON.stringify(data));
          sessionStorage.setItem('currentTripParams', JSON.stringify({source, destination, days: finalDays, budget: perHeadBudget, travelers, preferences, travelStyle: style}));
        }
        router.push("/itinerary/new");
      } else {
        setIsGenerating(false);
        const err = await res.json();
        alert(err.error || "Failed to generate itinerary. Check API keys in .env!");
      }
    } catch (error) {
      setIsGenerating(false);
      alert("Network Error communicating with backend.");
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#f0fdfa] dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 p-4 relative">
        {destInfo?.image ? (
          <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-1000" style={{backgroundImage: `url(${destInfo.image})`}}></div>
        ) : (
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 transition-opacity duration-1000"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#f0fdfa]/80 to-transparent"></div>
        
        <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-8">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-t-4 border-[#14b8a6] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-[#f59e0b] animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass size={40} className="text-[#14b8a6] animate-pulse" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900 dark:text-slate-100">Crafting Your Dream Journey...</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5 text-[#14b8a6]" />
              Plotting trails towards {destination || "your destination"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0fdfa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#ffc174] selection:text-[#472a00] min-h-screen relative">
      {/* Full Page Background */}
      <div className="fixed inset-0 z-0">
        <img alt="3D Neon Grid Map of India" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" src="/3d_india_dashboard.png" />
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-[2px]"></div>
      </div>

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100 dark:border-teal-900 shadow-md h-20 flex justify-between items-center px-4 sm:px-6 md:px-10">
        <div className="flex items-center gap-2 sm:gap-8">
          <Link href="/" className="font-bold text-xl sm:text-3xl tracking-tight text-[#ffc174] flex items-center gap-2">
             <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-lg shadow-sm" />
             <span className="hidden sm:inline">NaviBharat</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e] transition-colors duration-300">Dashboard</Link>
            <span className="text-[#ffc174] font-bold border-b-2 border-[#ffc174] pb-1 text-sm">Trip Planner</span>
            <Link href="/profile" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e] transition-colors duration-300">Profile</Link>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <ThemeToggle />
          
          <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-[#ffb4ab] transition-colors px-4 py-2 font-semibold text-sm">Cancel</Link>
          <Link href="/profile">
             <svg className="w-6 h-6 text-[#ffc174] cursor-pointer hover:scale-105 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-24 px-4 sm:px-6 md:px-10 max-w-[1280px] mx-auto">
        {/* Hero Header */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-slate-100 max-w-3xl mx-auto leading-tight">Embark on an Epic Indian Odyssey</h1>
        </header>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Expedition Logistics */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-teal-100 dark:border-teal-900 rounded-3xl p-8 border-t-4 border-t-[#4fdbc8]/50 shadow-2xl dark:shadow-none">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-slate-100">Expedition Logistics</h2>
              <div className="space-y-8">
                {/* Origin & Destination */}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full relative">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Origin</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ffc174] shadow-[0_0_8px_rgba(255,193,116,0.6)]"></span>
                      <input required type="text" value={source} onChange={e => { setSource(e.target.value); setShowSourceDropdown(true); }} placeholder="e.g. New Delhi, India" className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-4 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#ffc174] focus:ring-0 transition-all outline-none shadow-inner" />
                      {showSourceDropdown && sourceSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl shadow-2xl dark:shadow-none max-h-60 overflow-y-auto">
                          {sourceSuggestions.map((sug, idx) => (
                            <div key={idx} className="px-4 py-3 hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-900 dark:text-slate-100 border-b border-teal-50 dark:border-teal-900 last:border-none transition-colors" onClick={() => {
                               setSelectedSource(true);
                               setSource(sug.display_name);
                               setSourceCoords([parseFloat(sug.lat), parseFloat(sug.lon)]);
                               setShowSourceDropdown(false);
                            }}>
                               {sug.display_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 pt-6 hidden md:block opacity-50">
                     <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                  <div className="w-full relative">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Destination</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4fdbc8] shadow-[0_0_8px_rgba(79,219,200,0.6)]"></span>
                      <input required type="text" value={destination} onChange={e => { setDestination(e.target.value); setShowDestDropdown(true); }} placeholder="Where to?" className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-4 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#4fdbc8] focus:ring-0 transition-all outline-none shadow-inner" />
                      {showDestDropdown && destSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl shadow-2xl dark:shadow-none max-h-60 overflow-y-auto">
                          {destSuggestions.map((sug, idx) => (
                            <div key={idx} className="px-4 py-3 hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-900 dark:text-slate-100 border-b border-teal-50 dark:border-teal-900 last:border-none transition-colors" onClick={() => {
                               setSelectedDest(true);
                               setDestination(sug.display_name);
                               setDestCoords([parseFloat(sug.lat), parseFloat(sug.lon)]);
                               setShowDestDropdown(false);
                            }}>
                               {sug.display_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Party & Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-800/50 rounded-xl border border-teal-50 dark:border-teal-900">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Travel Party</span>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-teal-100 dark:border-teal-900 hover:bg-white/5 text-[#ffc174]">-</button>
                      <span className="font-bold text-lg min-w-[20px] text-center">{travelers.toString().padStart(2, '0')}</span>
                      <button type="button" onClick={() => setTravelers(travelers + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-teal-100 dark:border-teal-900 hover:bg-white/5 text-[#ffc174]">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-800/50 rounded-xl border border-teal-50 dark:border-teal-900">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Projected Cost</span>
                    <span className="bg-[#4fdbc8]/20 text-[#0f766e] px-4 py-1 rounded-full font-bold">₹{totalGroupBudget.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Per Person Budget</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[#ffc174]">₹</span>
                      <input type="number" value={perHeadBudget} onChange={e => setBudget([parseInt(e.target.value) || 0])} className="bg-transparent border-b border-[#ffc174] text-right font-bold text-2xl w-32 focus:ring-0 py-0 px-1 outline-none text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                  <input type="range" min="5000" max="500000" step="1000" value={perHeadBudget} onChange={e => setBudget([parseInt(e.target.value)])} className="w-full h-1.5 bg-[#2e3447] rounded-lg appearance-none cursor-pointer accent-[#ffc174]" />
                </div>

                {/* Duration & Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Trip Duration</label>
                    <div className="flex flex-col gap-2">
                      <select value={daysMode === "custom" ? "custom" : presetDays} onChange={e => {
                        if (e.target.value === "custom") {
                          setDaysMode("custom");
                        } else {
                          setDaysMode("preset");
                          setPresetDays(e.target.value);
                        }
                      }} className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-4 px-4 text-slate-900 dark:text-slate-100 focus:border-[#ffc174] focus:ring-0 transition-all appearance-none outline-none">
                        <option value="3 Days">3 Days</option>
                        <option value="5 Days">5 Days</option>
                        <option value="7 Days">7 Days</option>
                        <option value="10 Days">10 Days</option>
                        <option value="14 Days">14 Days</option>
                        <option value="21 Days">21 Days</option>
                        <option value="custom">Custom...</option>
                      </select>
                      {daysMode === "custom" && (
                        <input type="number" placeholder="Enter number of days" value={customDays} onChange={e => setCustomDays(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-4 px-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-900 dark:text-slate-100/20 focus:border-[#ffc174] focus:ring-0 transition-all outline-none" min="1" max="90" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Travel Style</label>
                    <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-4 px-4 text-slate-900 dark:text-slate-100 focus:border-[#ffc174] focus:ring-0 transition-all appearance-none outline-none">
                      <option value="Luxury">Luxury</option>
                      <option value="Comfort">Comfort</option>
                      <option value="Boutique">Boutique</option>
                      <option value="Budget">Budget</option>
                      <option value="Backpacker">Backpacker</option>
                    </select>
                  </div>
                </div>

                {/* The Vibe */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                     <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">The Vibe</label>
                     <span className="text-xs text-slate-600 dark:text-slate-300">{preferences.length}/4 selected</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {preferencesOptions.map(pref => {
                       const isActive = preferences.includes(pref);
                       return (
                          <button 
                             key={pref} 
                             type="button" 
                             onClick={() => togglePreference(pref)}
                             className={`px-6 py-2 rounded-full font-bold transition-all ${isActive ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-lg shadow-[#f59e0b]/20' : 'border border-teal-100 dark:border-teal-900 hover:border-[#4fdbc8] hover:text-[#0f766e] text-slate-900 dark:text-slate-100'}`}
                          >
                             {pref}
                          </button>
                       )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={!source || !destination} className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#04b4a2] to-[#0d9488] text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] shadow-inner disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                  Generate Itinerary
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Map Preview */}
          <div className="col-span-12 lg:col-span-4 sticky top-28">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl overflow-hidden border border-teal-100 dark:border-teal-900 h-[700px] flex flex-col shadow-2xl dark:shadow-none relative">
              <div className="flex-grow relative bg-[#f0fdfa] dark:bg-slate-900 overflow-hidden">
                
                {/* Embedded Map Widget */}
                <div className="absolute inset-0 z-0">
                   <MapWidget sourceCoords={sourceCoords} destCoords={destCoords} />
                </div>
                
                <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
                
                {/* Map Marker Mockup/Fallback Info if destCoords isn't loaded but destination exists */}
                {destination && !destCoords && (
                   <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
                      <div className="w-4 h-4 bg-[#ffc174] rounded-full animate-ping absolute"></div>
                      <div className="w-4 h-4 bg-[#ffc174] rounded-full relative shadow-[0_0_15px_rgba(255,193,116,1)]"></div>
                      <span className="mt-2 bg-[#f8fafc] dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-semibold border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-slate-100">{destination}</span>
                   </div>
                )}

                {/* Wikipedia Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent">
                  {destInfo ? (
                     <div className="flex gap-4 items-start pointer-events-auto bg-white/50 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-teal-50 dark:border-teal-900 shadow-xl">
                        {destInfo.image && (
                           <img src={destInfo.image} className="w-20 h-20 rounded-xl object-cover border border-white/20 shadow-lg" alt={destination} />
                        )}
                        <div className="flex-1">
                           <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{destination}</h3>
                           <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                              {destInfo.extract}
                           </p>
                           <span className="text-[10px] text-slate-900 dark:text-slate-100/40 mt-2 block uppercase tracking-widest">Data via Wikipedia</span>
                        </div>
                     </div>
                  ) : destination ? (
                     <div className="flex gap-4 items-center justify-center p-4">
                         <Loader2 className="animate-spin text-[#0f766e] w-6 h-6" />
                         <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Gathering intel...</span>
                     </div>
                  ) : (
                     <div className="text-center p-4">
                         <span className="text-slate-900 dark:text-slate-100/40 text-xs uppercase tracking-widest font-semibold border border-teal-100 dark:border-teal-900 px-4 py-2 rounded-full">Awaiting Destination</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
