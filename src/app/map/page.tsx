"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import GoogleMapView, { MapLocation } from "@/components/GoogleMapView";
import EventDetailModal from "@/components/EventDetailModal";
import { createClient } from "@/lib/supabase/client";

// 定義 Supabase 活動類型
interface SupabaseEvent {
  id: string;
  title: string;
  description_short?: string;
  description_long?: string;
  cover_image?: string;
  venue_name?: string;
  address?: string;
  gps_lat?: number;
  gps_lng?: number;
  start_time?: string;
  end_time?: string;
  status?: string;
  tags?: string[];
}

// 轉換為前端 Event 類型
interface MapEvent {
  id: string;
  title: string;
  description?: string;
  image?: string;
  location: string;
  date?: string;
  time?: string;
  tags: string[];
  status?: string;
  lat?: number;
  lng?: number;
}

export default function MapPage() {
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 從 Supabase 獲取活動
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .not('gps_lat', 'is', null)
        .not('gps_lng', 'is', null)
        .order('start_time', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching events:', error);
        setIsLoading(false);
        return;
      }

      // 轉換數據格式
      const mappedEvents: MapEvent[] = (data || []).map((event: SupabaseEvent) => ({
        id: event.id,
        title: event.title,
        description: event.description_short || event.description_long?.substring(0, 100),
        image: event.cover_image,
        location: event.venue_name || event.address || '未知地點',
        date: event.start_time ? new Date(event.start_time).toLocaleDateString('zh-TW') : undefined,
        time: event.start_time ? new Date(event.start_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : undefined,
        tags: event.tags || [],
        status: event.status,
        lat: event.gps_lat,
        lng: event.gps_lng,
      }));

      setEvents(mappedEvents);
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  // 將活動轉換為 MapLocation 格式
  const eventLocations: MapLocation[] = events
    .filter(event => event.lat && event.lng)
    .map(event => ({
      id: event.id,
      name: event.title,
      address: event.location,
      lat: event.lat!,
      lng: event.lng!,
      type: 'event',
      info: {
        title: event.title,
        description: event.description || '',
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

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>載入活動中...</span>
          </div>
        </div>
      )}

      {/* Google Map */}
      {!isLoading && (
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
      )}

      {/* 活動數量提示 */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg text-sm font-medium">
        {isLoading ? '載入中...' : `找到 ${eventLocations.length} 個活動`}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent as any}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}


