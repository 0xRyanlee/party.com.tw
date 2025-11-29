import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/lib/mock-data';

export default function EventsPage() {
  return (
    <>
      <Navigation />
      <FloatingActionButton />

      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-4xl font-semibold text-text-primary">探索活動</h1>
            <p className="text-text-secondary">發現身邊的精彩聚會</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['全部', '小聚', '小會', '小活動', '小快閃'].map((filter) => (
              <Button
                key={filter}
                variant={filter === '全部' ? 'default' : 'outline'}
                size="sm"
                className={filter === '全部' ? 'bg-accent hover:bg-accent/90' : ''}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
