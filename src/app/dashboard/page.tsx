"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Users, Wallet, Eye, Download, Trash2, PlusCircle, Compass, Navigation, Sun, Moon } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActionModal, { ModalType } from "@/components/ActionModal";
import ProfileDropdown from "@/components/ProfileDropdown";

// Define Trip interface based on backend Prisma schema
interface Trip {
  id: string;
  source: string;
  destination: string;
  days: number;
  nights: number;
  budget: number;
  travelers: number;
  travelStyle: string;
  createdAt: string;
  itineraries: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "alert" as ModalType,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK"
  });

  const showModal = (type: ModalType, title: string, message: string, onConfirm: () => void, confirmText = "OK") => {
    setModalState({ isOpen: true, type, title, message, onConfirm, confirmText });
  };
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchTrips = async () => {
      try {
        const res = await fetch("/api/user-trips", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
    
    // Check theme
    if (document.documentElement.classList.contains('light-mode')) {
      setIsLightMode(true);
    }
  }, [router]);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-mode');
      setIsLightMode(true);
    }
  };

  const handleDelete = (tripId: string) => {
    showModal("confirm", "Delete Itinerary?", "Are you sure you want to permanently delete this mapped journey?", async () => {
      closeModal();
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/trip/${tripId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setTrips(trips => trips.filter(t => t.id !== tripId));
          setTimeout(() => showModal("success", "Deleted", "Path cleared. The journey has been permanently deleted.", closeModal, "OK"), 300);
        } else {
          setTimeout(() => showModal("error", "Deletion Failed", "We encountered an issue removing this trip.", closeModal, "Close"), 300);
        }
      } catch (e) {
        setTimeout(() => showModal("error", "Network Error", "Could not connect to the server.", closeModal, "Close"), 300);
      }
    }, "Delete Trip");
  };

  const handleDownload = async (tripId: string) => {
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
        showModal("success", "Success", "Your itinerary PDF has been successfully generated and is downloading.", closeModal, "Great");
      } else {
        showModal("error", "Generation Failed", "Failed to generate the PDF document.", closeModal, "Close");
      }
    } catch {
      showModal("error", "Network Error", "Could not connect to the server while downloading.", closeModal, "Close");
    }
  };

  // A generic travel image placeholder
  const getImageUrl = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600&auto=format&fit=crop"
    ];
    return images[index % images.length];
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-100 overflow-x-hidden bg-slate-950 selection:bg-amber-200 selection:text-amber-900 pb-24">
      <ActionModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
      />
      
      {/* Background Image - Chandrashila */}
      <div className="fixed inset-0 z-0 bg-slate-950">
        <img 
          src="https://www.shutterstock.com/image-photo/different-views-chandratal-lake-4250mtr-himachal-260nw-2053943075.jpg" 
          alt="Chandratal Lake Background" 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Soft shadow overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95"></div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/50 border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-v2.png" alt="NaviBharat Logo" width={38} height={38} className="rounded-xl shadow-md group-hover:scale-105 transition-transform" />
            <span className="font-extrabold tracking-tight text-2xl text-amber-500 drop-shadow-md">NaviBharat</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-300 hover:text-amber-400 hover:bg-slate-900/50 rounded-xl transition-all">
               {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            {user && <ProfileDropdown user={user} />}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10 w-full max-w-6xl">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-white drop-shadow-md">
              Welcome back, <span className="text-amber-500 font-serif italic">{user?.name?.split(' ')[0] || "Explorer"}</span>! <span className="animate-pulse">👋</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium tracking-wide">Ready to design your next unforgettable adventure?</p>
          </div>
          <Link href="/plan">
            <Button size="lg" className="h-16 px-8 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.3)] rounded-2xl transition-all hover:scale-105 active:scale-95 border-0 flex items-center gap-3 w-full md:w-auto">
              <Compass className="h-6 w-6 text-slate-900" />
              Plan New Trip
            </Button>
          </Link>
        </div>

        <Separator className="mb-12 bg-white/10" />

        {/* Saved Itineraries Header */}
        <div className="flex flex-col mb-8 px-2">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white tracking-tight drop-shadow-lg">
            <Compass className="text-amber-500" size={32} />
            Your Saved Itineraries
          </h2>
          <p className="text-md text-slate-400 mt-2 font-medium">Revisit, download, or manage your crafted journeys.</p>
        </div>

        {/* Itinerary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <Compass className="text-amber-500 animate-spin mb-4" size={48} />
              <p className="text-xl text-slate-300 font-medium">Fetching your planned journeys...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium text-xl bg-slate-900/40 rounded-3xl border border-dashed border-slate-700 backdrop-blur-md">
              You haven't planned any trips yet. <br/>
              <span className="text-amber-500 mt-2 block">Click the big button above to start exploring!</span>
            </div>
          ) : (
            trips.map((trip, index) => (
              <Card key={trip.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group hover:bg-slate-900/80 transition-all duration-500 hover:-translate-y-2 rounded-3xl">
                <div className="h-56 relative overflow-hidden bg-slate-950 border-b border-white/5 flex flex-col justify-end p-6">
                  {/* Map Pattern Overlay */}
                  <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] group-hover:scale-110 group-hover:opacity-30 transition-all duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-slate-900 to-slate-950 z-0"></div>
                  
                  {/* Style Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-amber-500/90 text-slate-900 hover:bg-amber-400 border-0 shadow-lg backdrop-blur-sm font-bold text-xs uppercase tracking-widest px-3 py-1">
                      {trip.travelStyle}
                    </Badge>
                  </div>

                  {/* Connecting Flight/Route Map Element */}
                  <div className="relative z-10 w-full flex items-center justify-between mt-auto mb-2 px-2 group-hover:-translate-y-1 transition-transform duration-500">
                    {/* Source City */}
                    <div className="flex flex-col items-center w-1/3">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20 mb-2 border-2 border-slate-900 ring-2 ring-amber-500/30"></div>
                      <span className="text-white font-bold text-xs tracking-wider uppercase truncate w-full text-center">{trip.source || "Origin"}</span>
                    </div>

                    {/* Connecting SVG Path */}
                    <div className="flex-1 relative flex items-center justify-center -translate-y-3">
                      <svg className="w-full h-12 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
                         <path d="M 0 20 Q 50 -10 100 20" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="2" strokeDasharray="3 3" className="group-hover:stroke-[rgba(251,191,36,0.8)] transition-colors duration-500" />
                      </svg>
                      {/* Plane Icon translating up slightly */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20px] bg-slate-900 p-1.5 rounded-full border border-white/10 group-hover:text-white text-slate-400 transition-colors pointer-events-none group-hover:scale-110 duration-300">
                         <Navigation className="rotate-90 fill-amber-500 text-amber-500" size={14} />
                      </div>
                    </div>

                    {/* Destination City */}
                    <div className="flex flex-col items-center w-1/3">
                      <div className="w-4 h-4 rounded-full bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] z-20 mb-2 border-2 border-slate-900 flex items-center justify-center ring-2 ring-teal-400/30">
                         <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                      </div>
                      <span className="text-white font-bold text-xs tracking-wider uppercase truncate w-full text-center">{trip.destination}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-sm">
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                         <Calendar size={18} />
                      </div>
                      <span>{trip.days} Days<br/>{trip.nights} Nights</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                        <Users size={18} />
                      </div>
                      <span>{trip.travelers} Traveler{trip.travelers > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-200 font-bold bg-slate-950/50 col-span-2 p-3 rounded-xl border border-white/5 mt-2">
                       <Wallet size={18} className="text-green-500" />
                       <span className="text-base tracking-wide flex-1 text-right">₹{trip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                
                <div className="px-6 pb-6 mt-auto">
                  <div className="flex gap-3 w-full">
                    <Link href={`/itinerary/${trip.id}`} className="flex-1">
                      <Button variant="default" className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm h-12 rounded-xl transition-all shadow-md active:scale-95">
                        <Eye size={18} className="mr-2 text-amber-600" />
                        View Fully
                      </Button>
                    </Link>
                    <Button onClick={() => handleDownload(trip.id)} variant="outline" size="icon" title="Email/Download" className="h-12 w-12 border-white/10 bg-slate-950/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors">
                      <Download size={18} />
                    </Button>
                    <Button onClick={() => handleDelete(trip.id)} variant="outline" size="icon" title="Delete Trip" className="h-12 w-12 border-white/10 bg-slate-950/50 hover:bg-red-950/50 hover:text-red-400 text-slate-400 hover:border-red-500/30 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
          
          {/* Add New Card Slot */}
          <Link href="/plan" className="block focus:outline-none h-full">
            <Card className="h-full min-h-[420px] bg-slate-950/60 backdrop-blur-md border border-dashed border-white/20 hover:border-amber-500/50 flex flex-col items-center justify-center text-center p-8 cursor-pointer group rounded-3xl transition-all duration-500 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 shadow-inner">
                <Compass size={40} className="drop-shadow-md animate-[spin_10s_linear_infinite]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">Forge a New Journey</h3>
              <p className="text-slate-400 text-base font-medium max-w-[220px] leading-relaxed group-hover:text-amber-200/70 transition-colors">
                Uncharted destinations await. Dare to let AI chart your next adventure.
              </p>
            </Card>
          </Link>

        </div>
      </main>
    </div>
  );
}
