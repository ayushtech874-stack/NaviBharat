"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Share2, Navigation, Mail, Sun, Sunset, Moon, Sparkles, MapPin, IndianRupee, Clock, Bed, Utensils, Car, Ticket, CheckCircle2 } from "lucide-react";
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
  const [destImage, setDestImage] = useState<string>("https://lh3.googleusercontent.com/aida-public/AB6AXuBtzG0DUlk-3hLVjD6XE2YsSs2VR7j6m_Ak2voFb582kg_RyENjCWYepmFXMWXgGG8xrCCL-uYE7IfOr3_oX_K8XSrAO7ZQ3hh4z1MDRf6iiWjCkVIXfogxcUXZ9vmiYDV7RNNhSyq_FNBDsLu7Lnqm1eHxKALU5-EYXE71wsSGy6DCKOkwzqmpyyMubEhvhDrast_OljMU3_CpwfhIQE3MTQX5WVyY45PyrNsOV5NSPhYU9iJ9o3LpcGMETNGpagBGDoJ4DR-Ymo0");
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
    const handleScroll = () => {
        const header = document.getElementById('headerNav');
        if (header) {
           if (window.scrollY > 50) {
               header.classList.add('py-2');
               header.classList.remove('py-4');
           } else {
               header.classList.add('py-4');
               header.classList.remove('py-2');
           }
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        showModal("error", "Delivery Failed", data.error || "Failed to send email.", closeModal, "Close");
      }
    } catch (e) {
      console.error(e);
      showModal("error", "Network Error", "Could not connect to the server.", closeModal, "Close");
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
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Itinerary link copied to clipboard!');
  };


  const handleDownloadPdf = async () => {
    const tripId = id;
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
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
            <div className="animate-spin text-[#14b8a6]">
                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-[#020617] text-[#dce1fb] font-sans selection:bg-[#ffc174]/30 min-h-screen relative pb-32">
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
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 py-4 bg-[#0c1324]/60 backdrop-blur-xl border-b border-white/10 shadow-sm transition-all duration-300" id="headerNav">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f172a]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-sm text-[#ffc174] font-semibold text-sm">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f172a]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-sm text-[#dce1fb] font-semibold text-sm">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 ml-2">
             <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-lg shadow-sm hidden md:block" />
             <span className="text-xl font-bold text-[#d97706] hidden lg:block">NaviBharat</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
            <Download size={18} className="text-[#dce1fb]" />
            <span className="font-semibold text-sm">Download PDF</span>
          </button>
          <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0f172a]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
            <Share2 size={18} className="text-[#dce1fb]" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <img alt="Destination" className="w-full h-full object-cover" src={destImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-10 pb-12 md:pb-16 flex flex-col items-start max-w-[1280px] mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#04b4a2]/20 text-[#4fdbc8] border border-[#4fdbc8]/20 mb-4 animate-pulse">
            <Sparkles size={16} className="fill-current text-[#4fdbc8]" />
            <span className="text-xs font-semibold uppercase tracking-wider">AI Generated Itinerary</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white tracking-tight">{tripParams?.destination || "Your Trip"}</h1>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2 text-[#d8c3ad]">
              <svg className="w-6 h-6 text-[#ffc174]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
              <span className="text-lg">{tripParams?.days ? `${tripParams.days} Days` : "Custom"}</span>
            </div>
            <div className="flex items-center gap-2 text-[#d8c3ad]">
              <IndianRupee size={24} className="text-[#ffc174]" />
              <span className="text-lg">{itineraryData?.estimated_cost?.total || "Custom"} Total</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Bar */}
      <nav className="sticky top-[72px] z-40 px-4 md:px-10 bg-[#020617]/80 backdrop-blur-md border-y border-white/5 py-4">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-1 rounded-2xl shadow-sm overflow-x-auto w-full md:w-auto">
            <button onClick={() => setActiveTab("timeline")} className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'timeline' ? 'bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white shadow-lg shadow-[#d97706]/20 scale-105' : 'text-[#d8c3ad] hover:text-white'}`}>Timeline</button>
            <button onClick={() => setActiveTab("overview")} className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'overview' ? 'bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white shadow-lg shadow-[#d97706]/20 scale-105' : 'text-[#d8c3ad] hover:text-white'}`}>Overview</button>
            <button onClick={() => setActiveTab("budget")} className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'budget' ? 'bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white shadow-lg shadow-[#d97706]/20 scale-105' : 'text-[#d8c3ad] hover:text-white'}`}>Costs</button>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={handleEmailItinerary} disabled={emailing} className="hidden md:flex items-center gap-2 text-[#d8c3ad] hover:text-white transition-colors px-4 text-sm font-semibold">
              <Mail size={18} /> {emailing ? "Sending..." : "Email PDF"}
            </button>
            {id === 'new' && (
               <button disabled={saving} onClick={handleConfirm} className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-[#04b4a2] to-[#0d9488] text-[#003731] font-bold text-sm shadow-lg shadow-[#4fdbc8]/10 hover:scale-[1.02] active:scale-95 transition-all">
                  {saving ? "Saving..." : "Confirm Trip"}
               </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Timeline & Content Tabs */}
        <div className="lg:col-span-8 space-y-12 min-h-[500px]">
          
          {activeTab === "timeline" && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {itineraryData.itinerary?.map((day: any) => (
                  <div key={day.day} className="space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 flex-shrink-0 bg-[#4fdbc8] rounded-xl flex flex-col items-center justify-center text-[#003731] shadow-lg shadow-[#4fdbc8]/20">
                           <span className="text-xs font-semibold uppercase">Day</span>
                           <span className="text-2xl font-bold leading-none">{day.day}</span>
                        </div>
                        <div>
                           <h2 className="text-3xl font-bold text-white">Day {day.day} Plan</h2>
                           <p className="text-[#d8c3ad] mt-1">Starting your journey at the heart of {tripParams?.destination?.split(',')[0]}.</p>
                        </div>
                     </div>
                     
                     <div className="relative pl-8 md:pl-12 border-l-2 border-slate-800 ml-8 space-y-10">
                        {day.activities?.map((activity: any, idx: number) => {
                           const lowerTime = activity.time_of_day?.toLowerCase() || '';
                           const isMorning = lowerTime.includes('morning');
                           const isAfternoon = lowerTime.includes('afternoon');
                           
                           // Determine color scheme based on time of day
                           const scheme = isMorning ? { dot: 'bg-[#d97706]', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]', badgeBg: 'bg-[#d97706]/20', badgeText: 'text-[#d97706]', icon: Sun } :
                                          isAfternoon ? { dot: 'bg-[#f59e0b]', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]', badgeBg: 'bg-[#f59e0b]/20', badgeText: 'text-[#f59e0b]', icon: Sunset } :
                                          { dot: 'bg-indigo-500', glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]', badgeBg: 'bg-indigo-500/20', badgeText: 'text-indigo-400', icon: Moon };

                           const Icon = scheme.icon;

                           return (
                              <div key={idx} className="relative group">
                                 {/* Dot */}
                                 <div className={`absolute -left-[41px] md:-left-[57px] top-4 w-6 h-6 rounded-full border-4 border-[#020617] ${scheme.dot} z-10 group-hover:scale-125 transition-transform duration-300`}></div>
                                 
                                 {/* Card */}
                                 <div className={`bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl ${scheme.glow} transition-all duration-300`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                       <div className="flex items-center gap-3">
                                          <span className={`px-3 py-1 rounded-lg ${scheme.badgeBg} ${scheme.badgeText} text-sm font-semibold capitalize flex items-center gap-1.5`}>
                                             <Icon size={14} /> {activity.time_of_day}
                                          </span>
                                          <h3 className="text-xl font-bold text-white">{activity.place}</h3>
                                       </div>
                                       <div className="flex items-center gap-4 text-[#d8c3ad]/70 text-sm font-medium">
                                          {activity.travel_time_from_prev && (
                                             <span className="flex items-center gap-1"><Navigation size={14}/> {activity.travel_time_from_prev} travel</span>
                                          )}
                                          {activity.time_to_spend_there && (
                                             <span className="flex items-center gap-1"><Clock size={14}/> {activity.time_to_spend_there}</span>
                                          )}
                                       </div>
                                    </div>
                                    <p className="text-[#d8c3ad] leading-relaxed mb-6">
                                       {activity.description}
                                    </p>
                                    
                                    {activity.historical_significance && (
                                       <div className="p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/10 flex gap-4">
                                          <Sparkles size={20} className="text-[#ffb95f] shrink-0 mt-0.5" />
                                          <div>
                                             <span className="text-sm font-semibold text-[#ffc174] block mb-1">Did you know?</span>
                                             <p className="text-sm text-[#d8c3ad]/90 italic">{activity.historical_significance}</p>
                                          </div>
                                       </div>
                                    )}
                                    {activity.transport_to_place && (
                                       <div className="mt-4 flex gap-2 flex-wrap">
                                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d8c3ad] flex items-center gap-1.5"><Car size={12}/> {activity.transport_to_place}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Trip Overview</h3>
                  <p className="text-[#d8c3ad] leading-relaxed text-lg">
                    {tripParams?.destination} trip planned for {tripParams?.days} days. 
                    {itineraryData?.cultural_experiences?.length > 0 && ` Expect to experience: ${itineraryData.cultural_experiences.join(', ')}.`}
                  </p>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl border-t-4 border-t-[#d97706] shadow-xl">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="text-[#d97706]" size={20}/> Hidden Gems</h3>
                     <ul className="space-y-3">
                        {itineraryData?.hidden_gems?.map((g: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 text-[#d8c3ad] text-sm leading-relaxed">
                              <div className="w-2 h-2 rounded-full bg-[#d97706] shrink-0 mt-1.5"></div> {g}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl border-t-4 border-t-[#d97706] shadow-xl">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Utensils className="text-[#d97706]" size={20}/> Food to Try</h3>
                     <ul className="space-y-3">
                        {itineraryData?.food_recommendations?.map((f: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 text-[#d8c3ad] text-sm leading-relaxed">
                              <div className="w-2 h-2 rounded-full bg-[#d97706] shrink-0 mt-1.5"></div> {f}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {itineraryData?.transit_options && itineraryData.transit_options.length > 0 && (
                  <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
                     <div className="border-b border-white/10 pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[#ffc174] flex items-center gap-2"><Navigation className="rotate-90" size={20}/> Source to Destination Transit</h3>
                        <p className="text-xs text-[#d8c3ad] mt-2 opacity-80">* Travel expenses from Source to Destination are separate from Local Budget.</p>
                     </div>
                     <div className="grid sm:grid-cols-3 gap-4">
                        {itineraryData.transit_options.map((opt: any, i: number) => (
                           <div key={i} className="bg-[#020617]/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center hover:border-[#ffc174]/50 transition-colors">
                              <div className="font-bold text-[#dce1fb] mb-1">{opt.mode}</div>
                              <div className="text-[#ffc174] font-black text-lg mb-1">{opt.estimated_cost}</div>
                              <div className="text-xs text-[#d8c3ad] flex items-center gap-1"><Clock size={12}/> {opt.duration}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl">
                  <h3 className="text-2xl font-bold text-white mb-1">Local Estimated Costs</h3>
                  <p className="text-sm text-[#d8c3ad] mb-8">Breakdown based on standard pricing for {tripParams?.travelers || 2} traveler(s).</p>
                  
                  <div className="p-6 bg-[#04b4a2]/10 rounded-2xl flex items-center justify-between border border-[#04b4a2]/20 mb-8">
                     <div>
                        <p className="text-sm font-semibold text-[#4fdbc8] uppercase tracking-wider">Total Output</p>
                        <h3 className="text-3xl font-extrabold text-white mt-1">{itineraryData?.estimated_cost?.total || "N/A"}</h3>
                     </div>
                     <IndianRupee size={48} className="text-[#4fdbc8]/50" />
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-[#020617]/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Bed size={20} /></div>
                           <span className="font-semibold text-white">Stay & Accommodation</span>
                        </div>
                        <span className="font-bold text-white">{itineraryData?.estimated_cost?.stay || "N/A"}</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-[#020617]/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-[#d97706]/20 text-[#d97706] rounded-lg"><Utensils size={20} /></div>
                           <span className="font-semibold text-white">Food & Dining</span>
                        </div>
                        <span className="font-bold text-white">{itineraryData?.estimated_cost?.food || "N/A"}</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-[#020617]/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Car size={20} /></div>
                           <span className="font-semibold text-white">Local Transport</span>
                        </div>
                        <span className="font-bold text-white">{itineraryData?.estimated_cost?.transport || "N/A"}</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-[#020617]/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-[#4fdbc8]/20 text-[#4fdbc8] rounded-lg"><Ticket size={20} /></div>
                           <span className="font-semibold text-white">Entry Fees & Activities</span>
                        </div>
                        <span className="font-bold text-white">{itineraryData?.estimated_cost?.entry_fees || "N/A"}</span>
                     </div>
                  </div>
               </div>

               {itineraryData?.budget_saving_tips && itineraryData.budget_saving_tips.length > 0 && (
                  <div className="bg-[#4fdbc8]/10 border border-[#4fdbc8]/20 p-6 rounded-3xl shadow-xl">
                     <div className="border-b border-[#4fdbc8]/20 pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[#4fdbc8] flex items-center gap-2"><IndianRupee size={20} /> Budget Hacks & Savings</h3>
                        <p className="text-sm text-[#4fdbc8]/80 mt-1">Smart money-saving tips tailored for your specific trip style.</p>
                     </div>
                     <ul className="space-y-4">
                        {itineraryData.budget_saving_tips.map((tip: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 text-sm md:text-base text-[#dce1fb]">
                              <div className="w-6 h-6 rounded-full bg-[#4fdbc8]/20 flex items-center justify-center text-[#4fdbc8] shrink-0 mt-0.5 border border-[#4fdbc8]/30">
                                 <CheckCircle2 size={12} />
                              </div>
                              <span className="leading-relaxed">{tip}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}
            </div>
          )}

        </div>

        {/* Right: Summary Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-40 h-fit space-y-6">
          <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Map Placeholder */}
            <div className="h-48 w-full bg-[#191f31] relative overflow-hidden group">
               <div className="absolute inset-0 pointer-events-none opacity-80 z-0">
                  <MapWidget sourceCoords={null} destCoords={destCoords} />
               </div>
               <div className="absolute inset-0 bg-[#020617]/20 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            
            <div className="p-8">
               <h3 className="text-xl font-bold text-white mb-6">Quick Summary</h3>
               <div className="space-y-6 text-sm font-semibold text-[#d8c3ad]">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span>Destination</span>
                     <span className="text-white font-bold">{tripParams?.destination?.split(',')[0]}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span>Duration</span>
                     <span className="text-white font-bold">{tripParams?.days} Days</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span>Style</span>
                     <span className="px-3 py-1 rounded-full bg-[#04b4a2]/20 text-[#4fdbc8] text-xs font-bold border border-[#04b4a2]/20">{tripParams?.travelStyle || "Standard"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                     <span>Travelers</span>
                     <span className="text-white font-bold">{tripParams?.travelers || 2} Explorers</span>
                  </div>
               </div>
               {id === 'new' && (
                  <button disabled={saving} onClick={handleConfirm} className="w-full mt-10 py-4 rounded-2xl bg-gradient-to-r from-[#04b4a2] to-[#0d9488] text-[#003731] font-bold text-sm shadow-lg shadow-[#4fdbc8]/20 hover:scale-[1.02] active:scale-95 transition-all">
                     {saving ? "Saving..." : "Confirm Trip"}
                  </button>
               )}
            </div>
          </div>
          

        </aside>

      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50">
         {chatStatus && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#04b4a2]/90 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg text-[#003731] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
               {chatStatus}
            </div>
         )}
         <form onSubmit={handleChatSubmit} className="bg-[#0f172a]/80 backdrop-blur-2xl p-2 rounded-full flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#ffc174]/20 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-12 h-12 flex-shrink-0 bg-[#f59e0b]/20 rounded-full flex items-center justify-center text-[#ffc174]">
               {chatLoading ? <Sparkles size={24} className="animate-pulse" /> : <Sparkles size={24} />}
            </div>
            <input 
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
               disabled={chatLoading}
               className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-[#d8c3ad]/50 text-sm md:text-base font-semibold px-2 outline-none disabled:opacity-50" 
               placeholder="Ask AI to tweak this itinerary..." 
               type="text"
            />
            <button type="submit" disabled={chatLoading} className="w-12 h-12 flex-shrink-0 bg-[#d97706] rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all shadow-lg shadow-[#d97706]/30 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
               <Navigation size={20} className="rotate-90 ml-0.5" />
            </button>
         </form>
      </div>
      

    </div>
  );
}
