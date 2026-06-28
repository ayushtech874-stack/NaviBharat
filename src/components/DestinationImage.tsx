"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

export default function DestinationImage({ destination, className = "" }: { destination: string, className?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Clean destination string for search (e.g., "Paris, France" -> "Paris")
    const searchQuery = destination.split(',')[0].trim();
    
    const fetchImage = async () => {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail && data.thumbnail.source && isMounted) {
            setImageUrl(data.thumbnail.source);
          }
        }
      } catch (err) {
        console.error("Error fetching Wikipedia image:", err);
      }
    };
    
    fetchImage();
    
    return () => {
      isMounted = false;
    };
  }, [destination]);

  if (imageUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img src={imageUrl} alt={destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent opacity-80" />
      </div>
    );
  }

  // Fallback if no image found
  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <MapPin size={48} className="text-[#f59e0b]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-90" />
    </div>
  );
}
