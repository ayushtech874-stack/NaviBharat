"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Loader2, Send, MapPin, Calendar, Camera } from "lucide-react";
import MapWidget from "@/components/MapWidget";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  const [date, setDate] = useState("");
  const [presentLocation, setPresentLocation] = useState("");
  const [presentLocationSuggestions, setPresentLocationSuggestions] = useState<any[]>([]);
  const [showPresentLocationDropdown, setShowPresentLocationDropdown] = useState(false);
  const [selectedPresentLocation, setSelectedPresentLocation] = useState(false);
  const [presentCoords, setPresentCoords] = useState<[number, number] | null>(null);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isLeftPanelComplete = Boolean(presentCity && presentLocation && city && date);

  const getLocalDate = (dStr: string) => {
    if (!dStr) return null;
    const [y, m, d] = dStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

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
    if (selectedPresentLocation) {
      setSelectedPresentLocation(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (presentLocation.length > 2) {
        try {
          const query = presentCity ? `${presentLocation} ${presentCity}` : presentLocation;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
          const data = await res.json();
          if (data && data.length > 0) {
             setPresentLocationSuggestions(data);
             setShowPresentLocationDropdown(true);
             setPresentCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
             setPresentLocationSuggestions([]);
             setPresentCoords(null);
          }
        } catch (e) { setPresentCoords(null); }
      } else {
         setPresentLocationSuggestions([]);
         setShowPresentLocationDropdown(false);
         setPresentCoords(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [presentLocation, presentCity]);

  useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      chatEndRef.current.parentElement.scrollTo({
        top: chatEndRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (isLeftPanelComplete && chatMessages.length === 0) {
      setChatMessages([{
        role: 'ai',
        content: "Hi! I see you're ready to plan your trip. What kind of vibe are you looking for today? (e.g. Historical, Food, Nature, Shopping, or something else!)"
      }]);
    }
  }, [isLeftPanelComplete, chatMessages.length]);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setPresentCoords([latitude, longitude]);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setPresentLocation(data.display_name);
            setPresentCity(data.address?.city || data.address?.state_district || data.address?.state || "Unknown");
          }
        } catch(e) {}
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
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
          city, date, presentLocation: presentLocation + " in " + presentCity,
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
          city, date, presentLocation: presentLocation + " in " + presentCity, chatHistory: chatMessages
        })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('currentDayPlan', JSON.stringify(data));
        sessionStorage.setItem('currentDayParams', JSON.stringify({ city, date, presentLocation }));
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
      <div className="min-h-screen bg-[#f0fdfa] dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 p-4 relative">
        <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-8">
          <Loader2 className="w-16 h-16 text-[#0f766e] animate-spin" />
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">Curating the Perfect Day...</h2>
            <p className="text-slate-600 dark:text-slate-300">Analyzing traffic, fetching timings, and ranking the best spots in {city || "your city"}.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pt-24 pb-12 px-4 sm:px-6 md:px-10 font-sans relative">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-10 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100 dark:border-teal-900 shadow-sm left-0 right-0">
        <Link href="/" className="font-bold text-xl sm:text-2xl text-[#f59e0b] tracking-tight flex items-center gap-2">
           <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-xl shadow-md" />
           NaviBharat
        </Link>
        <div className="flex gap-6">
           <Link href="/plan" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e]">Plan Trip</Link>
           <span className="text-[#0f766e] font-bold border-b-2 border-[#0f766e] pb-1 text-sm">Plan Day</span>
           <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-[#0f766e]">Itineraries</Link>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Inputs */}
        <div className="lg:col-span-5 space-y-6">

          {/* Map Widget moved to Top */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-teal-50 dark:border-teal-900 h-64 relative">
             <div className="absolute inset-0 z-0">
                <MapWidget sourceCoords={presentCoords} destCoords={cityCoords} />
             </div>
             <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {presentCoords && <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#f59e0b] shadow-sm border border-[#f59e0b]/20">Present: {presentLocation}</span>}
                {cityCoords && <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#0f766e] shadow-sm border border-[#0f766e]/20">Target: {city.split(',')[0]}</span>}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-teal-50 dark:border-teal-900">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Compass className="text-[#f59e0b]" /> Plan Your Day
            </h1>
            
            <div className="space-y-5">
              
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Present City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f766e]" />
                  <input type="text" value={presentCity} onChange={e => { setPresentCity(e.target.value); setShowPresentCityDropdown(true); }} placeholder="Which city are you currently in?" className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-slate-100 focus:border-[#0f766e] outline-none" />
                  {showPresentCityDropdown && presentCitySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 rounded-xl shadow-2xl dark:shadow-none max-h-60 overflow-y-auto">
                      {presentCitySuggestions.map((sug, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-teal-50 dark:bg-teal-900/30 cursor-pointer text-sm text-slate-700 border-b border-teal-50 dark:border-teal-900 last:border-none" onClick={() => { setSelectedPresentCity(true); setPresentCity(sug.display_name); setShowPresentCityDropdown(false); }}>
                           {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Present Location</label>
                  <button type="button" onClick={handleGetCurrentLocation} className="text-xs font-bold text-[#0f766e] hover:text-teal-800 underline flex items-center gap-1">
                    <Compass className="w-3 h-3" /> Auto-Locate
                  </button>
                </div>
                <div className="relative">
                  <input type="text" value={presentLocation} onChange={e => { setPresentLocation(e.target.value); setShowPresentLocationDropdown(true); }} placeholder="e.g. Paharganj Hotel, or just 'Central'" className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 focus:border-[#0f766e] outline-none" />
                  {showPresentLocationDropdown && presentLocationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 rounded-xl shadow-2xl dark:shadow-none max-h-60 overflow-y-auto">
                      {presentLocationSuggestions.map((sug, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-teal-50 dark:bg-teal-900/30 cursor-pointer text-sm text-slate-700 border-b border-teal-50 dark:border-teal-900 last:border-none" onClick={() => { setSelectedPresentLocation(true); setPresentLocation(sug.display_name); setShowPresentLocationDropdown(false); }}>
                           {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative mt-8 pt-6 border-t border-teal-100 dark:border-teal-900">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Destination City</label>
                  {presentCity && (
                    <button type="button" onClick={() => {setCity(presentCity); setSelectedCity(true);}} className="text-xs font-bold text-[#0f766e] hover:text-teal-800 underline">Same as present city</button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f59e0b]" />
                  <input type="text" value={city} onChange={e => { setCity(e.target.value); setShowCityDropdown(true); }} placeholder="Where do you want to travel?" className="w-full bg-[#fffbef] dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-slate-100 focus:border-[#f59e0b] outline-none" />
                  {showCityDropdown && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-xl shadow-2xl dark:shadow-none max-h-60 overflow-y-auto">
                      {citySuggestions.map((sug, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-100 border-b border-amber-50 dark:border-slate-800 last:border-none" onClick={() => { setSelectedCity(true); setCity(sug.display_name); setShowCityDropdown(false); }}>
                           {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f766e] z-10 pointer-events-none" />
                  <DatePicker
                    selected={getLocalDate(date)}
                    onChange={(d: Date | null) => {
                      if (d) {
                        const offset = d.getTimezoneOffset();
                        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
                        setDate(localDate.toISOString().split('T')[0]);
                      } else {
                        setDate("");
                      }
                    }}
                    placeholderText="Select a date"
                    className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-slate-100 font-medium focus:border-[#0f766e] outline-none"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                  />
                </div>
              </div>

            </div>
          </div>

          {cityInfo && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-teal-50 dark:border-teal-900 flex flex-col items-center text-center">
              {cityInfo.image ? (
                <img src={cityInfo.image} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-md" alt={city} />
              ) : (
                <div className="w-full h-40 bg-teal-50 dark:bg-teal-900/30 rounded-2xl mb-4 flex items-center justify-center">
                   <Camera className="w-8 h-8 text-teal-200" />
                </div>
              )}
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{city.split(',')[0]}</h3>
              <p className="text-xs text-slate-500 line-clamp-3">{cityInfo.extract}</p>
            </div>
          )}

        </div>

        {/* Right Column: Chatbot & Action */}
        <div className="lg:col-span-7 flex flex-col h-[700px]">
          <div className="bg-white dark:bg-slate-900 flex-grow rounded-3xl shadow-xl border border-teal-50 dark:border-teal-900 flex flex-col overflow-hidden relative">
            
            {/* Chat Header */}
            <div className="bg-[#0f766e] p-4 text-white flex items-center gap-3">
               <img src="/logo-v2.png" className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 p-1" />
               <div>
                 <h3 className="font-bold">Navi Guide</h3>
                 <p className="text-xs text-teal-100">Your local expert for {city ? city.split(',')[0] : 'the day'}</p>
               </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-6 overflow-y-auto bg-[#f8fafc] dark:bg-slate-900 space-y-4">
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 text-slate-700 px-5 py-4 rounded-3xl rounded-tl-sm max-w-[85%] shadow-sm text-base leading-relaxed">
                   {isLeftPanelComplete 
                     ? "Awesome! Your basic details are set. Which specific area, monument, or activity are you most excited to explore first?"
                     : "Hi there! Please fill out the Day Plan details on the left (Present City, Location, Destination, Date) to unlock our chat!"}
                 </div>
              </div>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-5 py-4 rounded-3xl max-w-[85%] shadow-sm text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#0f766e] text-white rounded-tr-sm' : 'bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-teal-200 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies */}
            {chatMessages.length > 0 && isLeftPanelComplete && (
              <div className="px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 flex gap-2 overflow-x-auto no-scrollbar border-t border-teal-50 dark:border-teal-900">
                {['Budget: ₹2000', 'Half Day plan', 'Street Food spots', 'Skip Temples'].map(qr => (
                  <button key={qr} type="button" onClick={() => setCurrentInput(qr)} className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 rounded-full text-sm font-bold text-[#0f766e] hover:bg-teal-50 dark:bg-teal-900/30 shadow-sm transition-colors">
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-teal-50 dark:border-teal-900 relative">
              {!isLeftPanelComplete && (
                <div className="absolute inset-0 z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">Fill the left panel to unlock chat</span>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative">
                <input type="text" value={currentInput} onChange={e => setCurrentInput(e.target.value)} placeholder="Type a message..." className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-full py-3 pl-4 pr-12 text-sm focus:border-[#0f766e] outline-none" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0f766e] text-white rounded-full flex items-center justify-center hover:bg-[#0d9488] transition-colors">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
            
            {/* Absolute Overlay if City not selected */}
            {!city && (
               <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-teal-100 dark:border-teal-900 text-center">
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
