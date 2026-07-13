"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons in Next.js dynamically
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  sourceCoords: [number, number] | null;
  destCoords: [number, number] | null;
}

function MapUpdater({ sourceCoords, destCoords }: MapProps) {
  const map = useMap();
  useEffect(() => {
    if (sourceCoords && destCoords) {
      const bounds = L.latLngBounds([sourceCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else if (sourceCoords) {
      map.flyTo(sourceCoords, 10, { animate: true });
    } else if (destCoords) {
      map.flyTo(destCoords, 10, { animate: true });
    }
  }, [sourceCoords, destCoords, map]);
  return null;
}

export default function MapInner({ sourceCoords, destCoords }: MapProps) {
  const center: [number, number] = [20.5937, 78.9629]; // India Center

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={4} 
        scrollWheelZoom={true}
        className="w-full h-full bg-white"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {sourceCoords && <Marker position={sourceCoords} />}
        {destCoords && <Marker position={destCoords} />}
        {sourceCoords && destCoords && (
          <Polyline 
            positions={[sourceCoords, destCoords]} 
            pathOptions={{ color: '#0ea5e9', weight: 4, dashArray: '10, 10', className: 'animate-[pulse_2s_infinite]' }} 
          />
        )}
        <MapUpdater sourceCoords={sourceCoords} destCoords={destCoords} />
      </MapContainer>
    </div>
  );
}
