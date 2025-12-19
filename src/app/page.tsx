import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import { Event } from '@/lib/mock-data';

// Helper to convert date to display format
function formatEventDate(dateStr: string): { date: string; dayOfWeek: string; time: string; fullDate: string } {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = dayNames[d.getDay()];
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return {
    date: `${month}/${day}`,
    dayOfWeek,
    time,
    fullDate: d.toISOString().split('T')[0],
  };
}

export default async function Home() {
  const supabase = await createClient();

  // Fetch published events from database
  const { data: dbEvents, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description_short,
      description_long,
      category,
      cover_image,
      venue_name,
      address,
      start_time,
      end_time,
      status,
      tags,
      organizer_id
    `)
    .eq('status', 'published')
    .order('start_time', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error fetching events:', error);
  }

  // Transform database events to Event format
  const events: Event[] = (dbEvents || []).map((e, index) => {
    const dateInfo = e.start_time ? formatEventDate(e.start_time) : {
      date: 'TBD',
      dayOfWeek: 'TBD',
      time: 'TBD',
      fullDate: '',
    };

    return {
      id: e.id,
      title: e.title || 'Untitled Event',
      description: e.description_short || e.description_long || '',
      location: e.venue_name || e.address || 'Location TBD',
      date: dateInfo.date,
      dayOfWeek: dateInfo.dayOfWeek,
      time: dateInfo.time,
      fullDate: dateInfo.fullDate,
      image: e.cover_image || '/images/placeholder-event.jpg',
      type: (e.category as Event['type']) || 'event',
      status: 'active' as const,
      tags: e.tags || [],
      format: 'indoor' as const,
      price: 'Free',
      distance: Math.random() * 5,
      isPromoted: index < 2,
      attributes: [],
      lat: 25.033,
      lng: 121.565,
      attendees: 0,
      capacity: 50,
      organizer: {
        id: e.organizer_id || 'unknown',
        name: 'Organizer',
        avatar: '/images/default-avatar.png',
        role: 'member' as const,
        verified: false,
      },
    };
  });

  return <HomeClient initialEvents={events} />;
}
