"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Loader2, Send, MapPin, Calendar, Camera } from "lucide-react";
import MapWidget from "@/components/MapWidget";

const vibesList = ["Historical", "Food", "Nature", "Shopping", "Spiritual", "Art & Culture", "Photography", "Relaxation"];

export default function DayPlanPage() {
  const router = useRouter();
  
  // State
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(false);
  const [cityInfo, setCityInfo] = useState<{ extract?: string, image?: string } | null>(null);
  const [cityCoords, setCityCoords] = useState<[number, number] | null>(null);

  const [presentCity, setPresentCity] = useState("");
  const [presentCitySuggestions, setPresentCitySuggestions] = useState<any[]>([]);
  const [showPresentCityDropdown, setShowPresentCityDropdown] = useState(false);
  const [selectedPresentCity, setSelectedPresentCity] = useState(false);
  const [specificArea, setSpecificArea] = useState("");

  const [date, setDate] = useState("");
  const [presentLocation, setPresentLocation] = useState("");
  const [presentCoords, setPresentCoords] = useState<[number, number] | null>(null);
  const [vibes, setVibes] = useState<string[]>([]);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Debounced City Fetch
  useEffect(() => {
    if (selectedCity) {
      setSelectedCity(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (city.length > 2) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=5&countrycodes=in`);
          const data = await res.json();
          if (data && data.length > 0) {
             setCitySuggestions(data);
             setShowCityDropdown(true);
             setCityCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
             setCitySuggestions([]);
             setCityCoords(null);
          }
        } catch (e) {}

        // Fetch Wiki
        try {
          const query = city.split(',')[0].trim();
          const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
          if (wikiRes.ok) {
             const wikiData = await wikiRes.json();
             setCityInfo({ 
                extract: wikiData.extract, 
                image: wikiData.thumbnail?.source 
             });
          } else {
             setCityInfo(null);
          }
        } catch (e) { setCityInfo(null); }
      } else {
         setCitySuggestions([]);
         setShowCityDropdown(false);
         setCityInfo(null);
         setCityCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [city]);

  // Debounced Present City Fetch
  useEffect(() => {
    if (selectedPresentCity) {
      setSelectedPresentCity(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (presentCity.length > 2) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(presentCity)}&limit=5&countrycodes=in`);
          const data = await res.json();
          if (data && data.length > 0) {
             setPresentCitySuggestions(data);
             setShowPresentCityDropdown(true);
          } else {
             setPresentCitySuggestions([]);
          }
        } catch (e) {}
      } else {
         setPresentCitySuggestions([]);
         setShowPresentCityDropdown(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [presentCity]);

  // Debounced Present Location Fetch
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (presentLocation.length > 2) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(presentLocation)}&limit=1&countrycodes=in`);
          const data = await res.json();
          if (data && data[0]) {
             setPresentCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
             setPresentCoords(null);
          }
        } catch (e) { setPresentCoords(null); }
      } else {
         setPresentCoords(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [presentLocation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleVibe = (v: string) => {
    if (vibes.includes(v)) setVibes(vibes.filter(x => x !== v));
    else if (vibes.length < 3) setVibes([...vibes, v]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !city) return;
    
    const newMessages = [...chatMessages, { role: 'user', content: currentInput } as const];
    setChatMessages(newMessages);
    setCurrentInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/day-plan-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city, date, presentLocation: presentLocation + " in " + presentCity, specificArea, vibes,
          messages: newMessages,
          sessionId: chatSessionId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages([...newMessages, { role: 'ai', content: data.reply }]);
        if (data.sessionId && !chatSessionId) {
          setChatSessionId(data.sessionId);
        }
      } else {
        setChatMessages([...newMessages, { role: 'ai', content: "Oops, my circuits got tangled. Could you repeat that?" }]);
      }
    } catch {
      setChatMessages([...newMessages, { role: 'ai', content: "Network error. Let's try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateFinal = async () => {
    if (!city) return alert("Please select a city first!");
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-day-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city, date, presentLocation: presentLocation + " in " + presentCity, specificArea, vibes, chatHistory: chatMessages
        })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('currentDayPlan', JSON.stringify(data));
        sessionStorage.setItem('currentDayParams', JSON.stringify({ city, date, presentLocation, vibes }));
        router.push("/day-itinerary/new");
      } else {
        alert("Failed to generate day plan. Try again.");
        setIsGenerating(false);
      }
    } catch {
      alert("Network Error");
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#f0fdfa] flex flex-col items-center justify-center text-slate-900 p-4 relative">
        <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-8">
          <Loader2 className="w-16 h-16 text-[#0f766e] animate-spin" />
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-800">Curating the Perfect Day...</h2>
            <p className="text-slate-600">Analyzing traffic, fetching timings, and ranking the best spots in {city || "your city"}.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen pt-24 pb-12 px-4 sm:px-6 md:px-10 font-sans relative">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-10 h-20 bg-white/80 backdrop-blur-xl border-b border-teal-100 shadow-sm left-0 right-0">
        <Link href="/" className="font-bold text-xl sm:text-2xl text-[#f59e0b] tracking-tight flex items-center gap-2">
           <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-xl shadow-md" />
           NaviBharat
        </Link>
        <div className="flex gap-6">
           <Link href="/plan" className="text-slate-600 font-semibold text-sm hover:text-[#0f766e]">Plan Trip</Link>
           <span className="text-[#0f766e] font-bold border-b-2 border-[#0f766e] pb-1 text-sm">Plan Day</span>
           <Link href="/dashboard" className="text-slate-600 font-semibold text-sm hover:text-[#0f766e]">Itineraries</Link>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-teal-50">
            <h1 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <Compass className="text-[#f59e0b]" /> Plan Your Day
            </h1>
            
            <div className="space-y-5">
              
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Present City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f766e]" />
                  <input type="text" value={presentCity} onChange={e => { setPresentCity(e.target.value); setShowPresentCityDropdown(true); }} placeholder="Which city are you currently in?" className="w-full bg-[#f0fdfa] border border-teal-100 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:border-[#0f766e] outline-none" />
                  {showPresentCityDropdown && presentCitySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-teal-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {presentCitySuggestions.map((sug, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 border-b border-teal-50 last:border-none" onClick={() => { setSelectedPresentCity(true); setPresentCity(sug.display_name); setShowPresentCityDropdown(false); }}>
                           {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Present Location</label>
                <input type="text" value={presentLocation} onChange={e => setPresentLocation(e.target.value)} placeholder="e.g. Paharganj Hotel, or just 'Central'" className="w-full bg-[#f0fdfa] border border-teal-100 rounded-xl py-3 px-4 text-slate-800 focus:border-[#0f766e] outline-none" />
              </div>

              <div className="relative mt-8 pt-6 border-t border-teal-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destination City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f59e0b]" />
                  <input type="text" value={city} onChange={e => { setCity(e.target.value); setShowCityDropdown(true); }} placeholder="Where do you want to travel?" className="w-full bg-[#fffbef] border border-amber-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:border-[#f59e0b] outline-none" />
                  {showCityDropdown && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-amber-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {citySuggestions.map((sug, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-amber-50 cursor-pointer text-sm text-slate-700 border-b border-amber-50 last:border-none" onClick={() => { setSelectedCity(true); setCity(sug.display_name); setShowCityDropdown(false); }}>
                           {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specific Area (Optional)</label>
                <input type="text" value={specificArea} onChange={e => setSpecificArea(e.target.value)} placeholder="e.g. Chandni Chowk, or 'Anywhere in city'" className="w-full bg-[#fffbef] border border-amber-200 rounded-xl py-3 px-4 text-slate-800 focus:border-[#f59e0b] outline-none" />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0f766e] pointer-events-none z-10" />
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} className="relative w-full bg-white border-2 border-teal-100 hover:border-teal-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-bold focus:border-[#0f766e] focus:ring-4 focus:ring-teal-50 outline-none transition-all cursor-pointer shadow-sm [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">The Vibe (Max 3)</label>
                <div className="flex flex-wrap gap-2">
                  {vibesList.map(v => (
                    <button key={v} onClick={() => toggleVibe(v)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${vibes.includes(v) ? 'bg-[#f59e0b] text-white shadow-md' : 'bg-[#f0fdfa] text-slate-600 border border-teal-100 hover:border-[#0f766e]'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {cityInfo && (
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-teal-50 flex flex-col items-center text-center">
              {cityInfo.image ? (
                <img src={cityInfo.image} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-md" alt={city} />
              ) : (
                <div className="w-full h-40 bg-teal-50 rounded-2xl mb-4 flex items-center justify-center">
                   <Camera className="w-8 h-8 text-teal-200" />
                </div>
              )}
              <h3 className="font-bold text-lg text-slate-800 mb-2">{city.split(',')[0]}</h3>
              <p className="text-xs text-slate-500 line-clamp-3">{cityInfo.extract}</p>
            </div>
          )}

          {/* Map Widget */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-teal-50 h-64 relative">
             <div className="absolute inset-0 z-0">
                <MapWidget sourceCoords={presentCoords} destCoords={cityCoords} />
             </div>
             <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {presentCoords && <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#f59e0b] shadow-sm border border-[#f59e0b]/20">Present: {presentLocation}</span>}
                {cityCoords && <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#0f766e] shadow-sm border border-[#0f766e]/20">Target: {city.split(',')[0]}</span>}
             </div>
          </div>

        </div>

        {/* Right Column: Chatbot & Action */}
        <div className="lg:col-span-7 flex flex-col h-[700px]">
          <div className="bg-white flex-grow rounded-3xl shadow-xl border border-teal-50 flex flex-col overflow-hidden relative">
            
            {/* Chat Header */}
            <div className="bg-[#0f766e] p-4 text-white flex items-center gap-3">
               <img src="/logo-v2.png" className="w-8 h-8 rounded-full bg-white p-1" />
               <div>
                 <h3 className="font-bold">Navi Guide</h3>
                 <p className="text-xs text-teal-100">Your local expert for {city ? city.split(',')[0] : 'the day'}</p>
               </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-6 overflow-y-auto bg-[#f8fafc] space-y-4">
              <div className="flex justify-start">
                 <div className="bg-white border border-teal-100 text-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm text-sm">
                   Hi there! Tell me what specific area you want to explore, or any specific monuments, food spots, or movies you love. I'll help draft your day!
                 </div>
              </div>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm text-sm ${msg.role === 'user' ? 'bg-[#0f766e] text-white rounded-tr-sm' : 'bg-white border border-teal-100 text-slate-700 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-teal-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-teal-200 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-teal-50">
              <form onSubmit={handleSendMessage} className="relative">
                <input type="text" value={currentInput} onChange={e => setCurrentInput(e.target.value)} placeholder="Type a message..." className="w-full bg-[#f0fdfa] border border-teal-100 rounded-full py-3 pl-4 pr-12 text-sm focus:border-[#0f766e] outline-none" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0f766e] text-white rounded-full flex items-center justify-center hover:bg-[#0d9488] transition-colors">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
            
            {/* Absolute Overlay if City not selected */}
            {!city && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="bg-white p-6 rounded-2xl shadow-xl border border-teal-100 text-center">
                    <Compass className="w-8 h-8 text-[#f59e0b] mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Select a destination city to start chatting!</p>
                 </div>
               </div>
            )}
          </div>

          <button onClick={handleGenerateFinal} className="mt-6 w-full py-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white rounded-2xl font-bold shadow-xl shadow-[#f59e0b]/20 hover:scale-[1.01] transition-transform">
            Approve & Generate Itinerary
          </button>
        </div>

      </div>
    </div>
  );
}
