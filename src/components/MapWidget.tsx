"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface MapProps {
  sourceCoords: [number, number] | null;
  destCoords: [number, number] | null;
}

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(14,165,233,0.1)_360deg)] rounded-full animate-[spin_4s_linear_infinite] origin-center opacity-30 pointer-events-none"></div>

      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4 z-10" />
      <span className="text-slate-400 font-mono text-xs uppercase tracking-widest z-10">
        Connecting to GeoSatellite...
      </span>
    </div>
  )
});

export default function MapWidget(props: MapProps) {
  return <MapInner {...props} />;
}
