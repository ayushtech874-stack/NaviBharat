"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActionModal, { ModalType } from "@/components/ActionModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import DestinationImage from "@/components/DestinationImage";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [searchTerm, setSearchTerm] = useState("");

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
  }, [router]);

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

  return (
    <div className="bg-[#f0fdfa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans selection:bg-[#ffc174]/30 overflow-x-hidden">
      <ActionModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
      />

      {/* Background Atmospheric Effects */}
      {/* 3D Background Image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img src="/3d_india_dashboard.png" alt="3D Neon India Dashboard" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-[1px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-10 py-4 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100 dark:border-teal-900 shadow-lg shadow-[#ffc174]/10">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo-v2.png" alt="NaviBharat Logo" className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#ffc174] to-[#d97706] bg-clip-text text-transparent tracking-tight">NaviBharat</span>
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <ThemeToggle />
          
          {user && (
            <div className="scale-90 origin-right">
              <ProfileDropdown user={user} />
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-20 px-6 md:px-10 max-w-[1280px] mx-auto">
        {/* Welcome Hero */}
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 mb-4 rounded-full bg-[#4fdbc8]/10 text-[#0f766e] text-sm font-semibold border border-[#4fdbc8]/20">
                Premium AI Travel Planner
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || "Explorer"}!<br/>
                <span className="bg-gradient-to-r from-[#ffc174] to-[#d97706] bg-clip-text text-transparent">Ready to design your next unforgettable adventure?</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                Our AI is tuned to your preferences. Discover hidden gems and optimized routes across the subcontinent and beyond.
            </p>
          </div>
          <div>
            <Link href="/plan">
              <button className="shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-8 py-4 rounded-xl text-xl font-semibold text-[#2a1700] flex items-center gap-3 transition-all duration-300 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                  Plan New Trip
              </button>
            </Link>
          </div>
        </header>

        {/* Itineraries Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <svg className="text-[#ffc174]" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              Your Itineraries
              <span className="text-sm font-normal text-slate-600 dark:text-slate-300 bg-white/5 px-3 py-1 rounded-full ml-2 border border-teal-100 dark:border-teal-900">{trips.length} Saved</span>
            </h2>
            <div className="relative w-full md:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Search trips..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-slate-800 backdrop-blur-md border border-teal-100 dark:border-teal-900 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-600 dark:text-slate-300/50 focus:outline-none focus:border-[#ffc174]/50 transition-colors shadow-inner" />
            </div>
          </div>

          {/* Grid of Trip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {loading ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <svg className="text-[#f59e0b] animate-spin mb-4 w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">Fetching your planned journeys...</p>
              </div>
            ) : trips.length === 0 ? (
               <div className="col-span-full py-16 text-center text-slate-600 dark:text-slate-300 font-medium text-xl bg-white/40 dark:bg-slate-800/50 rounded-3xl border border-dashed border-white/20 dark:border-slate-700 backdrop-blur-md">
                 You haven't planned any trips yet. <br/>
                 <span className="text-[#f59e0b] mt-2 block">Click 'Plan New Trip' to start exploring!</span>
               </div>
            ) : (
              trips.filter(t => t.destination.toLowerCase().includes(searchTerm.toLowerCase())).map((trip) => (
                <div key={trip.id} className="group relative backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 dark:bg-slate-800/40 border border-teal-100 dark:border-teal-900 rounded-2xl p-1 hover:border-[#ffc174]/40 hover:bg-white/60 dark:hover:bg-slate-800/60 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-2xl dark:shadow-none hover:shadow-[#ffc174]/10 transition-all duration-500 overflow-hidden">
                  <div className="h-48 relative overflow-hidden bg-white dark:bg-slate-900 rounded-t-2xl">
                    <DestinationImage destination={trip.destination} />
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-[#4fdbc8]/90 backdrop-blur-md text-[#020617] shadow-lg px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                        {trip.travelStyle}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 relative z-20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center w-1/3">
                        <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1 truncate">{trip.source}</p>
                        <p className="text-2xl font-bold text-[#ffc174] truncate">{trip.source.substring(0,3).toUpperCase()}</p>
                      </div>
                      <div className="flex-1 px-2 flex flex-col items-center">
                        <svg className="text-slate-600 dark:text-slate-300 w-5 h-5 mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.6.2 1.2.8 1.3l5.7 1.5 2.5 7.5c.2.5.6.8 1.2.7l3.3-1.2c.5-.2.8-.6.7-1.1z"/><path d="M3 21h18"/></svg>
                        <div className="w-full border-t border-dashed border-white/20 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f0fdfa] dark:bg-slate-800 px-2 rounded-full text-[#ffc174]">
                             <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m19 9-7-4-7 4"/><path d="m21 13-9-5-9 5"/><path d="m23 17-11-6-11 6"/></svg>
                          </div>
                        </div>
                      </div>
                      <div className="text-center w-1/3">
                        <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1 truncate">{trip.destination}</p>
                        <p className="text-2xl font-bold text-[#ffc174] truncate">{trip.destination.substring(0,3).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <svg className="text-[#0f766e] w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span className="text-base">{trip.days} Days / {trip.nights} Nights</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <svg className="text-[#0f766e] w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span className="text-base">{trip.travelers} Travelers</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-semibold bg-white/5 p-2 rounded-lg border border-teal-50 dark:border-teal-900">
                        <svg className="text-[#0f766e] w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        <span className="text-base">Budget: ₹{trip.budget.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-teal-50 dark:border-teal-900">
                      <Link href={`/itinerary/${trip.id}`}>
                        <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#ffc174] transition-colors cursor-pointer">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span className="text-sm font-semibold">View</span>
                        </button>
                      </Link>
                      <button onClick={() => handleDownload(trip.id)} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#0f766e] transition-colors cursor-pointer">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        <span className="text-sm font-semibold">Download</span>
                      </button>
                      <button onClick={() => handleDelete(trip.id)} className="flex items-center gap-2 text-[#ffb4ab] hover:text-red-400 transition-colors cursor-pointer">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* New Journey Card (Empty State Style) */}
            <Link href="/plan" className="block focus:outline-none">
              <div className="h-full min-h-[420px] backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 dark:bg-slate-800/40 border-2 border-dashed border-teal-100 dark:border-teal-900 rounded-2xl flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-[#ffc174]/50 hover:bg-white/80 dark:hover:bg-slate-800/80 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 transition-all duration-500 shadow-lg">
                <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#ffc174]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-16 h-16 text-[#ffc174] relative z-10 group-hover:rotate-180 transition-transform duration-1000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2 tracking-wide">Forge a New Journey</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-[200px] mb-8 group-hover:text-[#ffc174] transition-colors">
                    The world is wide. Let our AI map your path.
                </p>
                <div className="w-12 h-12 rounded-full bg-white/5 border border-teal-100 dark:border-teal-900 flex items-center justify-center text-[#ffc174] group-hover:bg-[#ffc174] group-hover:text-[#2a1700] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300">
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </div>
              </div>
            </Link>

          </div>
        </section>



      </main>

    </div>
  );
}
