'use client';

import { useEffect, useRef } from 'react';

interface MapComponentProps {
  events: Array<{
    id: string;
    title: string;
    location: string;
    distance: string;
    attendees: number;
    capacity: number;
  }>;
  onMarkerClick?: (eventId: string) => void;
  selectedEventId?: string | null;
}

export default function MapComponent({
  events,
  onMarkerClick,
  selectedEventId,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Placeholder for Mapbox integration
    // For now, we'll show a simple grid-based map visualization
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full relative">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50" />

        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Map Markers */}
        <div className="absolute inset-0">
          {events.map((event, index) => {
            // Simple grid-based positioning
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = 20 + col * 30;
            const y = 20 + row * 30;

            return (
              <button
                key={event.id}
                onClick={() => onMarkerClick?.(event.id)}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  transition-all duration-300
                  ${selectedEventId === event.id ? 'scale-125 z-20' : 'scale-100 z-10'}
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                title={event.title}
              >
                {/* Marker Pin */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    shadow-lg transition-all
                    ${
                      selectedEventId === event.id
                        ? 'bg-primary text-white ring-4 ring-primary/30'
                        : 'bg-white text-primary border-2 border-primary hover:shadow-xl'
                    }
                  `}
                >
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>

                {/* Pulse Animation for Selected */}
                {selectedEventId === event.id && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-3 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-30">
                  <p className="font-bold text-sm line-clamp-1">{event.title}</p>
                  <p className="text-xs text-text-secondary">{event.distance}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
          <button className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
            <span className="text-lg">+</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
            <span className="text-lg">−</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-smooth">
            <span className="text-lg">📍</span>
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-30">
          <p className="text-sm font-bold mb-2">活動標記</p>
          <div className="space-y-1 text-xs text-text-secondary">
            <p>點擊標記查看詳情</p>
            <p>共 {events.length} 個活動</p>
          </div>
        </div>
      </div>
    </div>
  );
}
