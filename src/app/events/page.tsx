import { createClient } from '@/lib/supabase/server';
import { Event } from '@/lib/mock-data';
import EventsClient from './EventsClient';

export default async function EventsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
  }

  const events: Event[] = data ? data.map((dbEvent: any) => {
    const startDate = new Date(dbEvent.start_time);
    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'short' });
    const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Calculate price display
    let priceDisplay = 'Free';
    if (dbEvent.ticket_types && dbEvent.ticket_types.length > 0) {
      const prices = dbEvent.ticket_types.map((t: any) => Number(t.price));
      const minPrice = Math.min(...prices);
      priceDisplay = minPrice === 0 ? 'Free' : `$${minPrice}`;
    }

    return {
      id: dbEvent.id,
      title: dbEvent.title,
      type: dbEvent.category || 'event',
      format: 'indoor',
      attributes: dbEvent.tags || [],
      date: dateStr,
      fullDate: dbEvent.start_time.split('T')[0],
      dayOfWeek: dayOfWeek,
      time: timeStr,
      location: dbEvent.venue_name || dbEvent.address || 'TBD',
      lat: dbEvent.gps_lat || 25.0330,
      lng: dbEvent.gps_lng || 121.5654,
      distance: 0,
      attendees: dbEvent.registered_count || 0,
      capacity: dbEvent.capacity_total || 100,
      image: dbEvent.cover_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2940&auto=format&fit=crop',
      tags: dbEvent.tags || [],
      description: dbEvent.description_short || '',
      price: priceDisplay,
      organizer: {
        id: dbEvent.organizer_id || 'unknown',
        name: dbEvent.organizer_name || 'Organizer',
        avatar: dbEvent.organizer_avatar,
        role: 'member',
        verified: dbEvent.organizer_verified
      },
      isPromoted: false
    };
  }) : [];

  return <EventsClient initialEvents={events} />;
}
