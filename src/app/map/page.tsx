"use client";

import { Map, Marker, Overlay } from "pigeon-maps";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, Navigation } from "lucide-react";
import Link from "next/link";
import { mockEvents as events } from "@/lib/mock-data";
import EventDetailModal from "@/components/EventDetailModal";
import { Event } from "@/lib/mock-data";

export default function MapPage() {
  const { t } = useLanguage();
  const [center, setCenter] = useState<[number, number]>([25.0330, 121.5654]);
  const [zoom, setZoom] = useState(13);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Mock coordinates for events (distribute them around Taipei)
  const eventLocations = events.map((event, index) => ({
    ...event,
    lat: 25.0330 + (Math.random() - 0.5) * 0.05,
    lng: 121.5654 + (Math.random() - 0.5) * 0.05,
  }));

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
            <Link href="/events">
              <Button variant="secondary" className="rounded-full bg-white/90 hover:bg-white shadow-sm font-medium text-black">
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Map
        height={window.innerHeight}
        defaultCenter={center}
        defaultZoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center);
          setZoom(zoom);
        }}
      >
        {eventLocations.map((event) => (
          <Marker
            key={event.id}
            width={50}
            anchor={[event.lat, event.lng]}
            color={selectedEvent?.id === event.id ? "#10b981" : "#ef4444"}
            onClick={() => setSelectedEvent(event)}
          />
        ))}

        {/* Selected Event Overlay Card */}
        {selectedEvent && (
          <Overlay anchor={[selectedEvent.lat, selectedEvent.lng]} offset={[120, 260]}>
            <div className="bg-white p-3 rounded-2xl shadow-xl w-60 pointer-events-auto transform transition-all hover:scale-105">
              <div
                className="h-24 w-full bg-cover bg-center rounded-xl mb-2"
                style={{ backgroundImage: `url(${selectedEvent.image})` }}
              />
              <h3 className="font-bold text-sm truncate">{selectedEvent.title}</h3>
              <p className="text-xs text-gray-500 truncate mb-2">{selectedEvent.location}</p>
              <Button
                size="sm"
                className="w-full rounded-lg bg-black text-white text-xs h-8"
                onClick={() => setSelectedEvent(selectedEvent)} // Re-trigger to ensure modal opens if logic changes
              >
                View Details
              </Button>
            </div>
          </Overlay>
        )}
      </Map>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
