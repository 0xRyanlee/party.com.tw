"use client";

import { Map, Marker } from "pigeon-maps";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  height?: number;
  zoom?: number;
}

export default function MapComponent({
  latitude,
  longitude,
  locationName = "Event Location",
  height = 300,
  zoom = 15
}: MapComponentProps) {

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height }}>
        <Map
          height={height}
          defaultCenter={[latitude, longitude]}
          defaultZoom={zoom}
        >
          <Marker width={50} anchor={[latitude, longitude]} color="#10b981" />
        </Map>

        {/* Overlay Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="sm"
            className="bg-white text-black hover:bg-gray-100 shadow-md rounded-full"
            onClick={handleOpenGoogleMaps}
          >
            <Navigation className="w-4 h-4 mr-2 text-emerald-600" />
            Navigate
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{locationName}</span>
        </div>
        <div className="text-xs font-mono text-gray-400">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
