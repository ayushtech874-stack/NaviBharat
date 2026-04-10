"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Clock, Download, Share2, CheckCircle2, RefreshCw, Sun, Sunset, Moon, Sparkles, Utensils, IndianRupee, Bed, Car, Ticket, Navigation, Mail } from "lucide-react";
import MapWidget from "@/components/MapWidget";
import ActionModal, { ModalType } from "@/components/ActionModal";

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [tripParams, setTripParams] = useState<any>(null);
  const [destImage, setDestImage] = useState<string>("https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000&auto=format&fit=crop"); // Default Taj Mahal or Indian theme
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState<string | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  const [promptEmail, setPromptEmail] = useState("");
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "alert" as ModalType,
    title: "",
    message: "",
    onConfirm: (val?: string) => {},
    confirmText: "OK",
    inputPlaceholder: ""
  });

  const showModal = (
    type: ModalType, title: string, message: string, 
    onConfirm: (val?: string) => void, confirmText = "OK", extraConfig?: any
  ) => {
    setModalState({ 
      isOpen: true, type, title, message, onConfirm, confirmText, 
      inputPlaceholder: extraConfig?.inputPlaceholder || ""
    });
  };
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  useEffect(() => {
    if (tripParams?.destination) {
      const query = tripParams.destination.split(',')[0].trim();
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
        .then(res => res.ok ? res.json() : null)
        .then(wikiData => {
           if (wikiData?.thumbnail?.source) setDestImage(wikiData.thumbnail.source);
        }).catch(e => console.error("Wikipedia fetch failed", e));
        
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
        .then(res => res.json())
        .then(data => {
           if (data && data[0]) setDestCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }).catch(e => console.error("Geocoding fetch failed", e));
    }
  }, [tripParams?.destination]);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        if (id === 'new') {
          // Load from session storage
          const storedItinerary = sessionStorage.getItem('currentItinerary');
          const storedParams = sessionStorage.getItem('currentTripParams');
          
          if (storedItinerary && storedParams) {
            setItineraryData(JSON.parse(storedItinerary));
            setTripParams(JSON.parse(storedParams));
          } else {
            router.push('/plan');
          }
          setLoading(false);
        } else {
          // Fetch from API
          const token = localStorage.getItem('token');
          if (!token) {
            router.push('/login');
            return;
          }
          const res = await fetch(`/api/trip/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.trip && data.trip.itineraries.length > 0) {
              setItineraryData(data.trip.itineraries[0].fullItineraryJson);
              setTripParams({
                destination: data.trip.destination,
                days: data.trip.days,
                cost: data.trip.itineraries[0].totalCost,
                travelStyle: data.trip.travelStyle
              });
            } else {
              router.push('/dashboard');
            }
          } else {
            router.push('/dashboard');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load itinerary", err);
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id, router]);

  const handleConfirm = async () => {
    if (id !== 'new') return; // Already saved
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showModal("alert", "Login Required", "Please log in to save your trip and unlock all features.", () => router.push('/login'), "Go to Login");
        setSaving(false);
        return;
      }

      const res = await fetch('/api/confirm-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tripData: tripParams,
          itineraryData: itineraryData
        })
      });

      if (res.ok) {
        sessionStorage.removeItem('currentItinerary');
        sessionStorage.removeItem('currentTripParams');
        showModal("success", "Trip Saved", "Your itinerary has been seamlessly saved to your dashboard.", () => router.push('/dashboard'), "View Dashboard");
      } else {
        const err = await res.json();
        showModal("error", "Save Failed", err.error || 'Failed to confirm trip', closeModal, "Close");
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      showModal("error", "Network Error", 'Could not connect to the server to save your trip.', closeModal, "Close");
      setSaving(false);
    }
  };

  const executeEmailSend = async (emailToUse: string) => {
    setEmailing(true);
    closeModal();
    try {
      const res = await fetch('/api/send-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          destination: tripParams.destination,
          itineraryData,
          tripParams
        })
      });

      if (res.ok) {
        showModal("success", "Itinerary Sent!", `Check ${emailToUse} for your PDF copy.`, closeModal, "Awesome");
      } else {
        const data = await res.json();
        showModal("error", "Delivery Failed", data.error || "Failed to send email. Ensure your RESEND_API_KEY is correct.", closeModal, "Close");
      }
    } catch (e) {
      console.error(e);
      showModal("error", "Network Error", "Could not connect to the server to send email.", closeModal, "Close");
    }
    setEmailing(false);
  };

  const handleEmailItinerary = () => {
    const token = localStorage.getItem('token');
    let userEmail = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload.email || '';
      } catch (e) {}
    }

    if (userEmail) {
      executeEmailSend(userEmail);
    } else {
      setPromptEmail("");
      showModal("prompt", "Receive PDF via Email", "Where should we send your travel PDF?", (val) => {
        if (val) executeEmailSend(val);
      }, "Send PDF", { inputPlaceholder: "explorer@example.com" });
    }
  };

  const handleDownloadPdf = async () => {
    const tripId = window.location.pathname.split('/').pop() || 'new';
    if (tripId === 'new' || !tripId) {
       showModal("alert", "Not Saved Yet", "Please click 'Confirm Trip' to save this itinerary first before downloading the PDF!", closeModal, "Got it");
       return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/download-itinerary/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NaviBharat_${tripId.substring(0,6)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showModal("success", "Download Started", "Your PDF document is ready.", closeModal, "Great");
      } else {
        showModal("error", "Generation Failed", "Failed to generate PDF document.", closeModal, "Close");
      }
    } catch {
      showModal("error", "Network Error", "Network error while downloading PDF.", closeModal, "Close");
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatStatus("Tweaking itinerary...");
    
    try {
      const res = await fetch("/api/adjust-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentItinerary: itineraryData, prompt: chatInput })
      });
      if (res.ok) {
        const data = await res.json();
        setItineraryData(data);
        setChatInput("");
        setChatStatus("Successfully tweaked!");
        setTimeout(() => setChatStatus(null), 3000);
      } else {
        const data = await res.json();
        setChatStatus(data.error || "Failed to tweak");
      }
    } catch {
      setChatStatus("Network error tweaking itinerary");
    }
    setChatLoading(false);
  };

  if (loading || !itineraryData) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-300">Loading your perfect trip...</div>;
  }

  return (
    <div className="min-h-screen pb-20 relative bg-black text-white" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(/logo-v2.png)', backgroundRepeat: 'repeat', backgroundSize: '150px' }}>
      <ActionModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
        inputValue={modalState.type === "prompt" ? promptEmail : undefined}
        inputPlaceholder={modalState.inputPlaceholder}
        onInputChange={setPromptEmail}
        isLoading={emailing || saving}
      />
      {/* Header / Hero */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-slate-900 overflow-hidden">
        <img 
          src={destImage}
          alt={tripParams?.destination || "Destination"}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        
        {/* Top Nav */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
          <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
            <Navigation size={16} className="text-white rotate-270" />
            <span className="text-sm font-medium text-white">Back</span>
          </Link>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPdf} size="sm" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
              <Download size={16} className="mr-2" /> Download PDF
            </Button>
            <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
              <Share2 size={16} className="mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 w-full p-6 lg:p-10 z-10">
          <div className="container mx-auto">
            <Badge className="bg-teal-500/80 hover:bg-teal-500 text-white border-0 mb-3 backdrop-blur-sm">
              AI Generated Itinerary
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight">
              {tripParams?.destination || "Your Trip"}
            </h1>
            <div className="flex flex-wrap gap-4 text-slate-200 mt-4">
              <div className="flex items-center gap-1.5"><Calendar size={18} /> {tripParams?.days ? `${tripParams.days} Days` : "Custom"}</div>
              <div className="flex items-center gap-1.5 text-teal-300 font-bold"><IndianRupee size={18} /> {itineraryData?.estimated_cost?.total || "Custom"} Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Actions */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center overflow-x-auto gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-[500px]">
             <TabsList className="bg-slate-900/50 border border-white/20 p-1.5 rounded-2xl h-14 w-full shadow-inner shadow-black backdrop-blur-xl shrink-0">
                <TabsTrigger value="timeline" className="rounded-xl h-10 w-full text-sm md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white text-slate-400 transition-all data-[state=active]:shadow-[0_0_15px_rgba(245,158,11,0.5)]">Timeline</TabsTrigger>
                <TabsTrigger value="overview" className="rounded-xl h-10 w-full text-sm md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-teal-500 data-[state=active]:text-white text-slate-400 transition-all data-[state=active]:shadow-[0_0_15px_rgba(20,184,166,0.5)]">Overview</TabsTrigger>
                <TabsTrigger value="budget" className="rounded-xl h-10 w-full text-sm md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white text-slate-400 transition-all data-[state=active]:shadow-[0_0_15px_rgba(59,130,246,0.5)]">Costs</TabsTrigger>
             </TabsList>
          </Tabs>
          
          <div className="hidden md:flex gap-3">
            <Button variant="outline" className="text-white bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white transition-colors">
              <RefreshCw size={16} className="mr-2" /> Regenerate
            </Button>
            <Button onClick={handleEmailItinerary} disabled={emailing} variant="outline" className="text-white bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white transition-colors">
              <Mail size={16} className="mr-2" /> {emailing ? "Sending..." : "Email PDF"}
            </Button>
            <Button variant="outline" className="text-white bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white transition-colors">
              <Download size={16} className="mr-2" /> Download
            </Button>
            {id === 'new' && (
              <Button disabled={saving} onClick={handleConfirm} className="bg-teal-600 hover:bg-teal-700 text-white">
                <CheckCircle2 size={16} className="mr-2" /> {saving ? "Saving..." : "Confirm Trip"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none hidden md:block">
        <div className="relative">
          {chatStatus && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-teal-500/90 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg text-white pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
               {chatStatus}
            </div>
          )}
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.8)] shadow-amber-900/20 border-2 border-amber-500/50 bg-slate-900/90 backdrop-blur-xl overflow-hidden rounded-full pointer-events-auto transition-transform hover:scale-[1.02] duration-300">
            <form onSubmit={handleChatSubmit} className="flex flex-row items-center p-2 pl-6 gap-3">
              <Sparkles className="text-amber-500 shrink-0" size={24} />
              <input 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask AI to modify budget, add new places, or tweak schedule..." 
                className="flex-1 h-12 bg-transparent text-white px-2 outline-none transition-colors text-sm md:text-base font-medium placeholder-slate-400"
              />
              <Button type="submit" disabled={chatLoading} className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold transition-all active:scale-95 flex items-center justify-center p-0 shadow-lg shrink-0 border-0">
                {chatLoading ? <RefreshCw size={20} className="animate-spin" /> : <Navigation size={20} className="rotate-90 ml-1 text-white" />}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Main Timeline View */}
          <div className="md:col-span-2 space-y-8">
            
            {activeTab === "timeline" && (
              <div className="space-y-10">
                {itineraryData.itinerary?.map((day: any) => (
                  <div key={day.day} className="relative">
                    {/* Day Header */}
                    <div className="flex items-center gap-4 mb-6 sticky top-20 bg-black/60 py-2 z-20 backdrop-blur-sm">
                      <div className="bg-teal-600 text-white flex flex-col items-center justify-center h-16 w-16 rounded-2xl shadow-md shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider">Day</span>
                        <span className="text-2xl font-bold leading-none">{day.day}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Day {day.day} Plan</h2>
                      </div>
                    </div>

                    {/* Timeline Line */}
                    <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-white/20 z-0"></div>

                    {/* Timeline Items */}
                    <div className="space-y-8 relative z-10 pl-4">
                      {day.activities?.map((activity: any, idx: number) => {
                         const lowerTime = activity.time_of_day?.toLowerCase() || '';
                         const isMorning = lowerTime.includes('morning');
                         const isAfternoon = lowerTime.includes('afternoon');
                         const isNight = lowerTime.includes('night');
                         
                         return (
                        <div key={idx} className="flex gap-6 relative">
                          <div className="flex flex-col items-center mt-6">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-950 shadow-sm flex items-center justify-center shrink-0 -translate-x-1.5 z-10 ring-1 ring-slate-800">
                              {isMorning ? <Sun className="text-amber-500" size={16} /> :
                               isAfternoon ? <Sunset className="text-orange-500" size={16} /> :
                               isNight ? <Moon className="text-indigo-500" size={16} /> :
                               <MapPin className="text-teal-500" size={16} />}
                            </div>
                          </div>
                          
                          <Card className="flex-1 shadow-lg border-white/10 bg-slate-900/60 backdrop-blur-md text-white overflow-hidden hover:bg-slate-900/80 hover:shadow-xl hover:border-white/20 transition-all group">
                            <div className="flex flex-col sm:flex-row">
                              <CardContent className="p-5 flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-xl font-bold text-amber-500 capitalize">{activity.time_of_day}</h3>
                                    <h4 className="text-lg font-semibold text-white mt-1">{activity.place}</h4>
                                  </div>
                                  <div className="text-xs bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10 font-medium text-slate-300 flex flex-col items-end gap-1">
                                    <span className="flex items-center gap-1.5 text-teal-400"><Navigation size={12}/> {activity.travel_time_from_prev} travel</span>
                                    <span className="flex items-center gap-1.5 text-blue-400"><Clock size={12}/> {activity.time_to_spend_there}</span>
                                  </div>
                                </div>
                                <Separator className="bg-white/10" />
                                <p className="text-slate-300 text-sm leading-relaxed">
                                  {activity.description}
                                </p>
                                {activity.historical_significance && (
                                  <div className="mt-3 bg-slate-950/50 p-2.5 rounded-lg border border-amber-500/20 text-xs text-slate-300">
                                    <span className="text-amber-500 font-bold block mb-1">Did you know?</span>
                                    {activity.historical_significance}
                                  </div>
                                )}
                                {activity.transport_to_place && (
                                  <div className="mt-2 text-xs flex items-center gap-1.5 text-teal-400 font-medium">
                                    <Car size={14} /> Transit: {activity.transport_to_place}
                                  </div>
                                )}
                              </CardContent>
                            </div>
                          </Card>
                        </div>
                      )})}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="bg-black/60 text-white border-white/10">
                  <CardHeader>
                    <CardTitle>Trip Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {tripParams?.destination} trip planned for {tripParams?.days} days.
                      {itineraryData?.cultural_experiences?.join(', ')}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                  <Card className="bg-black/60 text-white border-l-white/10 border-r-white/10 border-b-white/10 border-t-4 border-t-amber-400">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={20} /> Hidden Gems
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {itineraryData?.hidden_gems?.map((g: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /> {g}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/60 text-white border-l-white/10 border-r-white/10 border-b-white/10 border-t-4 border-t-orange-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="text-orange-500" size={20} /> Food to Try
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {itineraryData?.food_recommendations?.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "budget" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                
                {itineraryData?.transit_options && itineraryData.transit_options.length > 0 && (
                  <Card className="bg-slate-900/60 backdrop-blur-md text-white border-white/10 shadow-lg">
                    <CardHeader className="pb-3 border-b border-white/10">
                      <CardTitle className="text-xl flex items-center gap-2 text-amber-500">
                        <Navigation size={20} className="rotate-90" /> Source to Destination Transit
                      </CardTitle>
                      <CardDescription className="text-yellow-500/80 text-xs mt-1">
                        * Note: Travel expenses from your Source to the Destination are NOT included in the Local Budget below. Please add your preferred transit option to your total planning separately.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid sm:grid-cols-3 gap-4">
                        {itineraryData.transit_options.map((opt: any, i: number) => (
                          <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center hover:border-amber-500/50 transition-colors">
                             <div className="font-bold text-slate-200 mb-1">{opt.mode}</div>
                             <div className="text-amber-400 font-black text-lg mb-1">{opt.estimated_cost}</div>
                             <div className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> {opt.duration}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-black/60 text-white border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl">Local Estimated Costs</CardTitle>
                    <CardDescription>Breakdown based on standard pricing for {tripParams?.travelers || 2} traveler(s).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 bg-teal-50 dark:bg-teal-950/30 rounded-xl flex items-center justify-between border border-teal-100 dark:border-teal-900">
                      <div>
                        <p className="text-sm font-semibold text-teal-800 dark:text-teal-400 uppercase tracking-wider">Total Output</p>
                        <h3 className="text-3xl font-extrabold text-teal-900 dark:text-teal-300">{itineraryData?.estimated_cost?.total || "N/A"}</h3>
                      </div>
                      <IndianRupee size={48} className="text-teal-200 dark:text-teal-900/50" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Bed size={20} /></div>
                          <span className="font-semibold text-slate-200">Stay & Accommodation</span>
                        </div>
                        <span className="font-bold">{itineraryData?.estimated_cost?.stay || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg"><Utensils size={20} /></div>
                          <span className="font-semibold text-slate-200">Food & Dining</span>
                        </div>
                        <span className="font-bold">{itineraryData?.estimated_cost?.food || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Car size={20} /></div>
                          <span className="font-semibold text-slate-200">Local Transport</span>
                        </div>
                        <span className="font-bold">{itineraryData?.estimated_cost?.transport || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Ticket size={20} /></div>
                          <span className="font-semibold text-slate-200">Entry Fees & Activities</span>
                        </div>
                        <span className="font-bold">{itineraryData?.estimated_cost?.entry_fees || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {itineraryData?.budget_saving_tips && itineraryData.budget_saving_tips.length > 0 && (
                  <Card className="bg-emerald-950/20 text-emerald-100 border-emerald-500/20 shadow-lg">
                    <CardHeader className="pb-3 border-b border-emerald-900/50 mb-4">
                       <CardTitle className="text-xl flex items-center gap-2 text-emerald-400">
                         <IndianRupee size={20} /> Budget Hacks & Savings
                       </CardTitle>
                       <CardDescription className="text-emerald-200/60">
                         Smart money-saving tips tailored for your specific trip style and destination.
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                         {itineraryData.budget_saving_tips.map((tip: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
                             <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
                               <CheckCircle2 size={12} />
                             </div>
                             <span className="leading-relaxed">{tip}</span>
                           </li>
                         ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Mini Map & Quick Summary */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-40 space-y-6">
              <Card className="shadow-md border-white/10 bg-black/60 text-white">
                <div className="h-[250px] w-full bg-[#0f172a] rounded-t-xl relative overflow-hidden flex items-center justify-center p-1">
                   <div className="absolute inset-0 bg-black z-0 pointer-events-none rounded-t-xl overflow-hidden shrink-0">
                      <MapWidget sourceCoords={null} destCoords={destCoords} />
                   </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-4">Quick Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Destination</span>
                      <span className="font-medium text-right">{tripParams?.destination}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-300">Duration</span>
                      <span className="font-medium text-right">{tripParams?.days} Days</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-300">Style</span>
                      <span className="font-medium text-right">{tripParams?.travelStyle || "Standard"}</span>
                    </div>
                  </div>
                  
                  {id === 'new' && (
                    <Button disabled={saving} onClick={handleConfirm} className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-500/20">
                      <CheckCircle2 size={16} className="mr-2" /> {saving ? "Saving..." : "Confirm Trip"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Action Bar (Sticky Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-white/10 z-50 flex gap-2">
          <Button onClick={handleEmailItinerary} disabled={emailing} variant="outline" className="flex-1 bg-black">
            <Mail size={18} className={emailing ? "animate-pulse text-teal-500" : ""} />
          </Button>
          <Button variant="outline" className="flex-1 bg-black">
            <Download size={18} />
          </Button>
          <Button variant="outline" className="flex-1 bg-black">
            <RefreshCw size={18} />
          </Button>
          {id === 'new' && (
            <Button disabled={saving} onClick={handleConfirm} className="flex-2 bg-teal-600 hover:bg-teal-700 text-white px-8">
              {saving ? "..." : "Confirm"}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
