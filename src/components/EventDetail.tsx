'use client';

import { Calendar, MapPin, Users, Star } from 'lucide-react';

interface EventDetailProps {
  event?: {
    id: string;
    title: string;
    type: 'meetup' | 'workshop' | 'event' | 'popup';
    date: string;
    time: string;
    location: string;
    description: string;
    capacity: number;
    attendees: number;
    organizer: {
      name: string;
      avatar: string;
      rating: number;
    };
    image?: string;
  };
}

export default function EventDetail({ event }: EventDetailProps) {
  if (!event) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-text-secondary">
          <p className="text-lg">選擇一個活動查看詳情</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Image */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
        <Calendar className="w-16 h-16 text-white/50" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title & Type */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface text-xs font-medium mb-3">
            <Calendar className="w-3 h-3" />
            <span>{event.type}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        </div>

        {/* Key Info */}
        <div className="space-y-3 p-4 bg-surface rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">日期時間</p>
              <p className="font-medium">{event.date} {event.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">地點</p>
              <p className="font-medium">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">參與人數</p>
              <p className="font-medium">{event.attendees}/{event.capacity} 人</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold mb-3">活動介紹</h2>
          <p className="text-text-secondary leading-relaxed">{event.description}</p>
        </div>

        {/* Organizer */}
        <div className="p-4 bg-surface rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary mb-3">組織者</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white font-bold">
              {event.organizer.avatar}
            </div>
            <div className="flex-1">
              <p className="font-medium">{event.organizer.name}</p>
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{event.organizer.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees Preview */}
        <div>
          <h3 className="text-lg font-bold mb-3">參與者</h3>
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-white text-sm font-bold border-2 border-background"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {event.attendees > 5 && (
              <div className="w-10 h-10 rounded-full bg-surface border-2 border-border flex items-center justify-center text-xs font-bold text-text-secondary">
                +{event.attendees - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-border space-y-3">
        <button className="w-full px-6 py-3 bg-neutral-900 text-white rounded-full font-semibold shadow-md hover:bg-neutral-800 transition-colors">
          報名參加
        </button>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-3 bg-surface text-text-primary rounded-full font-semibold hover:bg-neutral-100 transition-colors">
            分享
          </button>
          <button className="flex-1 px-4 py-3 bg-surface text-text-primary rounded-full font-semibold hover:bg-neutral-100 transition-colors">
            收藏
          </button>
        </div>
      </div>
    </div>
  );
}
