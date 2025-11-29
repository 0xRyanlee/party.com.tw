import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Monitor, Home, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { Event } from '@/lib/mock-data';

interface EventCardProps {
  event: Event;
  variant?: 'list' | 'grid' | 'immersive';
  onClick?: () => void;
  className?: string;
}

export default function EventCard({ event, variant = 'grid', onClick, className }: EventCardProps) {
  const { t } = useLanguage();

  // Format Icon Logic
  const FormatIcon = {
    indoor: Home,
    outdoor: Trees,
    online: Monitor,
  }[event.format] || Home;

  return (
    <Card
      className={cn(
        "group cursor-pointer border-none overflow-hidden bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2940&auto=format&fit=crop'})` }}
        />

        {/* Type Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex flex-wrap gap-1 sm:gap-2">\n          <Badge className="backdrop-blur-md border-none bg-white/20 text-white hover:bg-white/30 text-[10px] sm:text-xs px-2 py-0.5">
          {t(`types.${event.type}` as any)}
        </Badge>
          {/* Format Badge */}
          <Badge className="backdrop-blur-md border-none bg-black/40 text-white hover:bg-black/50 flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5">
            <FormatIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {t(`formats.${event.format}` as any)}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-[#06C755] transition-colors">
          {event.title}
        </h3>

        {/* Attribute Badges */}
        <div className="flex flex-wrap gap-1.5">
          {event.attributes.slice(0, 3).map((attr) => (
            <span key={attr} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/5">
              {t(`attributes.${attr}` as any)}
            </span>
          ))}
          {event.attributes.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
              +{event.attributes.length - 3}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-400 pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{event.date} · {event.time}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="line-clamp-1 max-w-[120px]">{event.location}</span>
            </div>
            <span className="text-[#06C755] font-medium">{event.distance} km</span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-3">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{event.attendees} / {event.capacity} 人參加</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
