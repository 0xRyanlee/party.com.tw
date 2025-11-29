'use client';

import { Button } from '@/components/ui/button';

export default function FloatingActionButton() {
  return (
    <Button
      size="icon"
      className="
        fixed bottom-8 right-8 z-50
        w-14 h-14 rounded-full
        bg-accent hover:bg-accent/90 text-surface
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-105 active:scale-95
        text-2xl
      "
      aria-label="發起小聚"
    >
      +
    </Button>
  );
}
