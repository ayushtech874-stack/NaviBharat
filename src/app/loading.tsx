"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Loading() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-900 dark:bg-slate-950">
      <div className="relative w-64 h-64 md:w-96 md:h-96 animate-pulse duration-1000">
        <Image 
          src="/monuments.png" 
          alt="Indian Monuments Loading" 
          fill 
          className="object-contain opacity-80"
          priority
        />
      </div>
      <div className="mt-8 text-2xl font-semibold tracking-widest text-teal-800 dark:text-teal-400 animate-pulse">
        <span>Navi Bharat</span>
      </div>
      <div className="mt-6 flex gap-3">
        <div className="w-3 h-3 rounded-full bg-orange-500 animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-3 h-3 rounded-full bg-slate-400 animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 animate-[bounce_1s_infinite_400ms]"></div>
      </div>
    </div>
  );
}
