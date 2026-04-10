"use client";

import { useState, useEffect } from "react";

const images = [
  "https://images.unsplash.com/photo-1544384119-943fcfb64426?q=80&w=2000&auto=format&fit=crop", // Himalayas
  "https://images.unsplash.com/photo-1516629986386-fcd798b76255?q=80&w=2000&auto=format&fit=crop"  // Spiti / Mountains
];

export default function BackgroundSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-slate-900 shadow-inner">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt="Scenic Background"
            className="w-full h-full object-cover object-center scale-105"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  );
}
