"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, MapPin, Clock, Tag, Star, Info, Car, Train, Footprints, Calendar } from "lucide-react";

export default function DayItineraryPage() {
  const router = useRouter();
  const [dayPlan, setDayPlan] = useState<any>(null);
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("currentDayPlan");
    const p = sessionStorage.getItem("currentDayParams");
    if (data && p) {
      setDayPlan(JSON.parse(data));
      setParams(JSON.parse(p));
    } else {
      router.push("/day-plan");
    }
  }, [router]);

  const handleDownload = () => {
    window.print();
  };

  if (!dayPlan) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Loading...</div>;

  const renderTransitIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes('walk')) return <Footprints className="w-4 h-4 text-slate-500" />;
    if (m.includes('metro') || m.includes('train')) return <Train className="w-4 h-4 text-[#f59e0b]" />;
    return <Car className="w-4 h-4 text-[#0f766e]" />;
  };

  const renderTag = (tag: string) => {
    if (tag === "Must Visit") return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200 uppercase">{tag}</span>;
    if (tag === "Underrated") return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200 uppercase">{tag}</span>;
    return <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-300 uppercase">{tag}</span>;
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-sans pb-20">
      
      {/* Nav */}
      <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-white/80 backdrop-blur-xl border-b border-teal-100 shadow-sm print:hidden">
        <button onClick={() => router.push("/day-plan")} className="flex items-center gap-2 text-slate-600 hover:text-[#0f766e] font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Planner
        </button>
        <button onClick={handleDownload} className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </nav>

      <main className="max-w-4xl mx-auto mt-10 px-4 print:mt-0 print:p-0">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">{dayPlan.day_title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium mb-6">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#0f766e]" /> {params.city}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#f59e0b]" /> {params.date}</span>
              <span className="bg-teal-100 text-[#0f766e] px-3 py-1 rounded-full text-sm font-bold border border-teal-200">
                 Est. Total Budget: {dayPlan.total_estimated_budget}
              </span>
            </div>
            {params.vibes?.length > 0 && (
               <div className="flex gap-2">
                 {params.vibes.map((v: string) => (
                   <span key={v} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{v}</span>
                 ))}
               </div>
            )}
          </div>
        </div>

        <div className="relative border-l-2 border-teal-200 ml-6 md:ml-8 pl-8 space-y-12">
           {dayPlan.places?.map((place: any, idx: number) => (
             <div key={idx} className="relative group">
                <div className="absolute -left-[41px] bg-white border-2 border-[#0f766e] w-5 h-5 rounded-full mt-1 group-hover:scale-125 transition-transform group-hover:bg-[#0f766e]"></div>
                
                {/* Transit Details above the card */}
                {place.transit_from_previous && (
                  <div className="mb-4 bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center gap-3 text-sm text-slate-700 w-fit">
                     {renderTransitIcon(place.transit_from_previous.mode)}
                     <span className="font-bold">{place.transit_from_previous.mode}</span>
                     <span>•</span>
                     <span className="text-[#0f766e] font-semibold">{place.transit_from_previous.duration}</span>
                     {place.transit_from_previous.traffic_note && (
                       <>
                         <span>•</span>
                         <span className="italic text-slate-500">{place.transit_from_previous.traffic_note}</span>
                       </>
                     )}
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                     <div>
                       <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                         {place.name} 
                         {renderTag(place.tag)}
                       </h2>
                       <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {place.time}</span>
                          <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> {place.ticket_cost}</span>
                          {place.opening_hours && <span>Hours: {place.opening_hours}</span>}
                       </div>
                     </div>
                     <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">AI Rating</span>
                        <div className="flex items-center gap-1 font-extrabold text-2xl text-amber-600">
                           {place.popularity_rating} <Star className="w-5 h-5 fill-amber-500 text-amber-500 mb-1" />
                        </div>
                     </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-4">
                     {place.description}
                  </p>

                  <div className="bg-slate-50 border-l-4 border-[#f59e0b] p-4 rounded-r-xl">
                     <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1 text-sm">
                       <Info className="w-4 h-4 text-[#f59e0b]" /> Deep Trivia / Significance
                     </h4>
                     <p className="text-sm text-slate-600 italic">
                        "{place.significance}"
                     </p>
                  </div>

                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}
