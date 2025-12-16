"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, Filter } from "lucide-react";
import Link from "next/link";
import GoogleMapView, { MapLocation } from "@/components/GoogleMapView";
import { mockEvents as events } from "@/lib/mock-data";
import EventDetailModal from "@/components/EventDetailModal";
import { Event } from "@/lib/mock-data";

export default function MapPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 將 mock events 轉換為 MapLocation 格式
  // 實際應用中應從 API 獲取真實座標
  const eventLocations: MapLocation[] = events.map((event, index) => ({
    id: event.id,
    name: event.title,
    address: event.location,
    // Mock 座標：分布在台北市區
    lat: 25.0330 + (Math.sin(index * 1.5) * 0.02),
    lng: 121.5654 + (Math.cos(index * 1.5) * 0.03),
    type: 'event',
    info: {
      title: event.title,
      description: event.description?.slice(0, 100) + '...',
      image: event.image,
      url: `/events/${event.id}`,
    },
  }));

  const handleLocationClick = (location: MapLocation) => {
    const event = events.find(e => e.id === location.id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  return (
    <div className="h-screen w-full relative bg-gray-100">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <Link href="/">
            <Button variant="secondary" size="icon" className="rounded-full bg-white/90 hover:bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" className="rounded-full bg-white/90 hover:bg-white shadow-sm font-medium text-black">
              <Filter className="w-4 h-4 mr-2" />
              篩選
            </Button>
            <Link href="/discover">
              <Button variant="secondary" className="rounded-full bg-white/90 hover:bg-white shadow-sm font-medium text-black">
                <List className="w-4 h-4 mr-2" />
                列表
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMapView
        locations={eventLocations}
        center={{ lat: 25.0330, lng: 121.5654 }}
        zoom={13}
        showUserLocation={true}
        allowFullscreen={true}
        height="100vh"
        onLocationClick={handleLocationClick}
        className="rounded-none"
      />

      {/* 活動數量提示 */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg text-sm font-medium">
        找到 {events.length} 個活動
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

