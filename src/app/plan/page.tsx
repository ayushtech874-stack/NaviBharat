"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Map, Sparkles, Wand2, Compass, Loader2, Globe2 } from "lucide-react";
import MapWidget from "@/components/MapWidget";

const preferencesOptions = ["Adventure", "Relaxation", "Cultural", "Food", "Nightlife", "Nature", "Shopping", "Historical"];

export default function PlanTripPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  
  const [daysMode, setDaysMode] = useState<"preset" | "custom">("preset");
  const [presetDays, setPresetDays] = useState("3");
  const [customDays, setCustomDays] = useState("");

  const [budget, setBudget] = useState([50000]); // Per Head Budget
  const [travelers, setTravelers] = useState(2);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [style, setStyle] = useState("Standard");

  // Geolocation & Wiki State
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destInfo, setDestInfo] = useState<{ extract?: string, image?: string } | null>(null);

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      if (preferences.length < 4) {
        setPreferences([...preferences, pref]);
      }
    }
  };

  const finalDays = daysMode === "preset" ? parseInt(presetDays) : parseInt(customDays) || 3;
  const perHeadBudget = budget[0];
  const totalGroupBudget = perHeadBudget * travelers;

  // Debounced Nominatim Fetch for Source
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (source.length > 2) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}&limit=1`);
          const data = await res.json();
          if (data && data[0]) {
             setSourceCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
             setSourceCoords(null);
          }
        } catch (e) { console.error("Geocoding failed", e); }
      } else {
         setSourceCoords(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [source]);

  // Debounced Nominatim & Wikipedia Fetch for Destination
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destination.length > 2) {
        // Fetch Coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
          const data = await res.json();
          if (data && data[0]) {
             setDestCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
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
         setDestCoords(null);
         setDestInfo(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleSurpriseMe = () => {
    setSource("Mumbai, India");
    setDestination("Jaipur, India");
    setDaysMode("preset");
    setPresetDays("5");
    setBudget([80000]);
    setTravelers(2);
    setPreferences(["Cultural", "Historical", "Food"]);
    setStyle("Luxury");
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        {destInfo?.image ? (
          <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-1000" style={{backgroundImage: `url(${destInfo.image})`}}></div>
        ) : (
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 transition-opacity duration-1000"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        
        <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-t-4 border-teal-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-blue-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass size={40} className="text-teal-400 animate-pulse" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Crafting Your Dream Journey...</h2>
            <p className="text-slate-300 text-lg flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5 text-teal-500" />
              Plotting trails towards {destination || "your destination"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 relative overflow-hidden font-sans">
      
      {/* Spiti Valley Background */}
      <div className="fixed inset-0 w-full h-full z-[-2] bg-slate-950">
        <img 
          src="https://images.unsplash.com/photo-1652514284048-a297d43ab05d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8U3BpdGklMjB2YWxsZXl8ZW58MHx8MHx8fDA%3D" 
          alt="Spiti Valley Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80"></div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/40/70 backdrop-blur-xl bg-slate-950/70 border-b border-white/10/50 border-slate-800/50 shadow-sm transition-all duration-500">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="NaviBharat Logo" width={32} height={32} className="rounded" />
            <span className="font-bold text-lg text-teal-800 text-teal-400">NaviBharat</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-rose-50 hover:text-rose-600 hover:bg-rose-950/30">Cancel</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10 transition-all duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-center md:text-left">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-800 from-teal-300 to-blue-400">
                Embark on an Epic Indian Odyssey
              </h1>
              <p className="text-slate-300 text-lg md:text-xl font-medium">Let our AI craft a soulful journey tailored uniquely to your desires.</p>
            </div>
            <Button onClick={handleSurpriseMe} className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:via-orange-400 hover:to-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-400/50 rounded-full px-8 py-6 text-md font-bold transition-all hover:scale-105 active:scale-95 duration-300 group">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]"></span>
              <Sparkles className="mr-2 h-5 w-5 text-amber-200 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Inspire Me</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-7 xl:col-span-8">
              <form onSubmit={handleGenerate}>
                <Card className="shadow-2xl border-white/40 border-slate-800/60 bg-slate-900/40/95 bg-slate-900/90 backdrop-blur-2xl rounded-3xl overflow-hidden ring-1 ring-black/5 ring-white/10 transition-all duration-500">
                  <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500"></div>
                  
                  <CardHeader className="pb-4 pt-8 px-8">
                    <CardTitle className="text-2xl flex items-center gap-3 font-bold text-slate-100">
                      <div className="w-10 h-10 rounded-full bg-teal-100 bg-teal-900/50 flex flex-col items-center justify-center text-teal-600 text-teal-400 shadow-inner">
                        <Map size={20} />
                      </div>
                      Expedition Logistics
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="px-8 pb-8 pt-2 space-y-10">
                    
                    {/* Destinations Input Group */}
                    <div className="grid md:grid-cols-2 gap-8 relative">
                      {/* Connection Graphic between inputs (desktop only) */}
                      <div className="hidden md:block absolute top-[28px] left-[calc(50%-1.5rem)] w-12 h-0.5 border-t-2 border-dashed border-slate-300 border-slate-700">
                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                      </div>
                      
                      <div className="space-y-3 group">
                        <Label htmlFor="source" className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-ping"></div> Origin
                        </Label>
                        <Input 
                          id="source" 
                          placeholder="Source" 
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          className="h-14 bg-slate-950 text-white border-white/10 shadow-sm text-lg transition-all focus:ring-2 focus:ring-blue-500/50 rounded-xl"
                        />
                      </div>
                      <div className="space-y-3 group">
                        <Label htmlFor="destination" className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-teal-500 group-hover:animate-ping"></div> Destination
                        </Label>
                        <Input 
                          id="destination" 
                          placeholder="Destination" 
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="h-14 bg-slate-950 text-white border-white/10 shadow-sm text-lg transition-all focus:ring-2 focus:ring-teal-500/50 rounded-xl"
                        />
                      </div>
                    </div>

                    <Separator className="bg-slate-800/50 bg-slate-800" />

                    {/* Financials & People */}
                    <div className="space-y-6 bg-slate-900/30 bg-slate-900/30 p-6 rounded-2xl border border-slate-100 border-slate-800/80">
                      
                      {/* Travelers & Layout top row */}
                      <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <Label className="text-sm font-bold uppercase text-slate-300">Travel Party</Label>
                          <div className="flex items-center gap-3 bg-slate-950 text-white border-white/10 border rounded-xl p-2 h-14 shadow-sm w-full max-w-[200px]">
                            <Button type="button" variant="ghost" className="h-10 w-10 text-white hover:text-slate-200 rounded-lg hover:bg-slate-800/50" onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</Button>
                            <span className="flex-1 text-center font-bold text-xl text-white">{travelers} <span className="text-sm font-normal text-slate-400 ml-1">pax</span></span>
                            <Button type="button" variant="ghost" className="h-10 w-10 text-white hover:text-slate-200 rounded-lg hover:bg-slate-800/50" onClick={() => setTravelers(travelers + 1)}>+</Button>
                          </div>
                        </div>

                        <div className="space-y-3 flex-1 flex flex-col sm:items-end">
                          <Label className="text-sm font-bold uppercase text-slate-300 w-full sm:text-right">Projected Cost</Label>
                          <div className="bg-teal-50 bg-teal-950/30 text-teal-800 text-teal-300 px-4 py-2 rounded-xl border border-teal-100 border-teal-900 w-full inline-block text-left sm:text-right">
                             <div className="text-xs font-semibold uppercase opacity-70 mb-1">Total For {travelers} Group</div>
                             <div className="text-2xl font-black">₹{totalGroupBudget.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      </div>

                      {/* Slider Control */}
                      <div className="space-y-5 pt-4">
                        <div className="flex justify-between items-center bg-slate-950 border-white/10 p-3 rounded-xl border shadow-sm">
                           <Label className="text-sm font-bold text-slate-300 block pl-2">Per Person Budget</Label>
                           <div className="flex items-center gap-2">
                             <span className="text-slate-300 font-medium">₹</span>
                             <Input 
                               type="number" 
                               min="0" 
                               max="5000000"
                               value={perHeadBudget}
                               onChange={(e) => setBudget([parseInt(e.target.value) || 0])}
                               className="w-32 h-10 font-bold text-white bg-slate-900 border-white/10 text-right pr-4 focus:ring-1 focus:ring-teal-500"
                             />
                           </div>
                        </div>
                        
                        <div className="px-2">
                          <Slider 
                            defaultValue={[50000]} 
                            max={5000000} 
                            step={1000} 
                            value={budget}
                            onValueChange={(val) => setBudget(val as number[])}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                            <span>₹0</span>
                            <span>₹50 Lakhs (Max)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Duration & Style */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wide text-slate-300">Trip Duration</Label>
                        <Select value={daysMode === "preset" ? presetDays : "custom"} onValueChange={(v) => {
                          if (v === "custom") {
                            setDaysMode("custom");
                          } else {
                            setDaysMode("preset");
                            setPresetDays(v || "3");
                          }
                        }}>
                          <SelectTrigger className="h-14 bg-slate-950 text-white border-white/10 shadow-sm rounded-xl text-md">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Days (Weekend Express)</SelectItem>
                            <SelectItem value="3">3 Days (Long Weekend)</SelectItem>
                            <SelectItem value="5">5 Days (Standard Tour)</SelectItem>
                            <SelectItem value="7">7 Days (Full Week)</SelectItem>
                            <SelectItem value="10">10 Days (Deep Dive)</SelectItem>
                            <SelectItem value="14">14 Days (Two Weeks)</SelectItem>
                            <SelectItem value="custom" className="font-bold text-teal-600">Enter Custom Days...</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {daysMode === "custom" && (
                          <div className="animate-in slide-in-from-top-2 fade-in duration-300 mt-3 pt-2">
                             <div className="relative">
                               <Input 
                                  type="number" 
                                  min="1" 
                                  max="365"
                                  placeholder="e.g. 12"
                                  className="h-14 font-bold text-white bg-slate-950 border-white/10 text-lg rounded-xl pr-16"
                               />
                               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Days</span>
                             </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="style" className="text-sm font-bold uppercase tracking-wide text-slate-300">Travel Style</Label>
                        <Select value={style} onValueChange={(val) => setStyle(val || '')}>
                          <SelectTrigger className="h-14 bg-slate-950 text-white border-white/10 shadow-sm rounded-xl text-md">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Budget">Backpacker / Budget</SelectItem>
                            <SelectItem value="Standard">Standard / Comfort</SelectItem>
                            <SelectItem value="Luxury">Luxury / Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator className="bg-slate-800/50 bg-slate-800" />

                    {/* Emotional Motivators (Preferences) */}
                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <Label className="text-sm font-bold uppercase tracking-wide text-slate-300">The Vibe</Label>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-800/50 bg-slate-800 rounded-md text-slate-300">{preferences.length}/4 limit</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {preferencesOptions.map((pref) => {
                          const isSelected = preferences.includes(pref);
                          return (
                            <div 
                              key={pref}
                              onClick={() => togglePreference(pref)}
                              className={`
                                cursor-pointer px-6 py-2.5 text-sm font-bold rounded-full transition-all border select-none 
                                ${isSelected 
                                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 border-amber-400/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105' 
                                  : 'bg-slate-900/50 backdrop-blur-sm border-white/10 text-slate-300 hover:border-slate-500 hover:bg-slate-800'}
                                active:scale-95
                              `}
                            >
                              {pref}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-6 relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="relative w-full h-16 text-xl font-black tracking-wide rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:via-teal-400 hover:to-cyan-500 text-white shadow-xl border border-teal-400/30 transition-all active:scale-[0.98] overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={!source || !destination}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] peer-hover:animate-[shimmer_2s_infinite]"></span>
                        <Wand2 className="mr-3 h-6 w-6 animate-pulse text-teal-100" />
                        <span className="drop-shadow-md">Forge Your Masterpiece</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Live Geographic & History Side Panel */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <Card className="shadow-2xl border-white/40 border-slate-800/60 bg-[#0f172a] rounded-3xl overflow-hidden sticky top-24 min-h-[500px] h-[calc(100vh-180px)] xl:h-[750px] flex flex-col ring-1 ring-black/10 transition-all duration-500">
                
                {/* Header */}
                <CardHeader className="bg-slate-900/70 backdrop-blur-xl border-b border-white/10 pb-4 shrink-0 z-20 pointer-events-none">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-2">
                    <Globe2 size={18} className="text-blue-400 mb-0.5 animate-pulse" />
                    Geo-Spatial Link
                  </CardTitle>
                </CardHeader>
                
                {/* Embedded Map Widget */}
                <CardContent className="p-0 flex-1 relative flex flex-col">
                  
                  {/* Dynamic Map Underlay */}
                  <div className="absolute inset-0 z-0 bg-[#0f172a]">
                     <MapWidget sourceCoords={sourceCoords} destCoords={destCoords} />
                  </div>

                  {/* Glass Overlay Data Card for the Destination */}
                  <div className="relative z-10 flex-1 flex flex-col justify-end pointer-events-none p-4">
                     {destInfo && destInfo.extract ? (
                       <div className="bg-slate-900/80 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-700 pointer-events-auto">
                           {destInfo.image && (
                              <div className="w-full h-32 relative rounded-xl overflow-hidden mb-4 ring-1 ring-white/20">
                                 <Image src={destInfo.image} alt="Destination" fill className="object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                 <h3 className="absolute bottom-3 left-4 text-white font-black text-xl tracking-wide drop-shadow-md">
                                   {destination}
                                 </h3>
                              </div>
                           )}
                           
                           {!destInfo.image && (
                              <h3 className="text-teal-400 font-bold text-lg mb-2 border-b border-white/10 pb-2">
                                {destination}
                              </h3>
                           )}

                           <div className="flex items-center gap-2 mb-2">
                             <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                             <h4 className="font-bold text-white text-xs uppercase tracking-widest text-slate-400">Cultural Intel</h4>
                           </div>
                           
                           <p className="text-slate-200 text-sm leading-relaxed line-clamp-4 overflow-hidden">
                              {destInfo.extract}
                           </p>

                           <p className="text-xs text-slate-300 mt-3 flex justify-end">Data via Wikipedia</p>
                       </div>
                     ) : (
                       // Empty state UI if no data yet
                       (!source && !destination) && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in duration-1000 bg-slate-900/40 backdrop-blur-sm">
                           <div className="w-24 h-24 mb-6 relative">
                             <div className="absolute inset-0 border-2 border-slate-700 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
                             <Map className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                           </div>
                           <h3 className="text-2xl font-bold text-slate-300 mb-2 font-mono tracking-widest">AWAITING COORDS</h3>
                         </div>
                       )
                     )}
                  </div>

                  {/* Decorative corner brackets (News UI vibe) */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-slate-700/80 rounded-tl-lg pointer-events-none z-10"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-slate-700/80 rounded-tr-lg pointer-events-none z-10"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-slate-700/80 rounded-bl-lg pointer-events-none z-10"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-slate-700/80 rounded-br-lg pointer-events-none z-10"></div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
