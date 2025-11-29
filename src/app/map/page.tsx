'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';
import DualColumnLayout from '@/components/DualColumnLayout';
import MapComponent from '@/components/MapComponent';
import EventDetail from '@/components/EventDetail';

// Mock data
const mockEvents = [
  {
    id: '1',
    title: '週末咖啡小聚 - 聊聊科技與生活',
    type: 'meetup' as const,
    date: '11/20',
    time: '14:00',
    location: '台北市大安區信義路四段',
    distance: '1.2km',
    attendees: 8,
    capacity: 15,
    description: '一個輕鬆的週末午後，我們聚在一起聊聊科技、生活和夢想。無論你是開發者、設計師還是創業者，都歡迎加入我們的對話。',
    organizer: {
      name: '小王',
      avatar: 'W',
      rating: 4.8,
    },
  },
  {
    id: '2',
    title: 'UI/UX 設計工作坊',
    type: 'workshop' as const,
    date: '11/22',
    time: '19:00',
    location: '台北市松山區南京東路',
    distance: '2.5km',
    attendees: 12,
    capacity: 20,
    description: '深入學習 UI/UX 設計的最佳實踐。我們將通過實際案例和互動練習，幫助你提升設計技能。',
    organizer: {
      name: '設計師小李',
      avatar: 'L',
      rating: 4.9,
    },
  },
  {
    id: '3',
    title: '音樂節派對 🎵',
    type: 'event' as const,
    date: '11/25',
    time: '18:00',
    location: '台北市信義區市府路',
    distance: '3.8km',
    attendees: 45,
    capacity: 100,
    description: '一場盛大的音樂派對，匯聚了各種風格的音樂和藝術表演。準備好享受一個難忘的夜晚吧！',
    organizer: {
      name: '音樂節組委會',
      avatar: 'M',
      rating: 4.7,
    },
  },
  {
    id: '4',
    title: '快閃市集 - 手作文創',
    type: 'popup' as const,
    date: '11/23',
    time: '10:00',
    location: '台北市中正區羅斯福路',
    distance: '0.8km',
    attendees: 23,
    capacity: 50,
    description: '限時快閃市集，展示本地手作藝術家的創意作品。來發現獨特的文創商品吧！',
    organizer: {
      name: '文創小姐',
      avatar: 'C',
      rating: 4.6,
    },
  },
  {
    id: '5',
    title: '創業者早餐會',
    type: 'meetup' as const,
    date: '11/21',
    time: '08:00',
    location: '台北市大安區敦化南路',
    distance: '1.5km',
    attendees: 6,
    capacity: 10,
    description: '每週一次的創業者聚會，分享創業經驗和機會。早起的鳥兒有蟲吃！',
    organizer: {
      name: '創業導師',
      avatar: 'E',
      rating: 4.9,
    },
  },
  {
    id: '6',
    title: '攝影技巧分享會',
    type: 'workshop' as const,
    date: '11/24',
    time: '15:00',
    location: '台北市中山區中山北路',
    distance: '2.1km',
    attendees: 15,
    capacity: 25,
    description: '學習專業攝影技巧，從構圖到後期處理。適合初學者和進階攝影愛好者。',
    organizer: {
      name: '攝影師小張',
      avatar: 'Z',
      rating: 4.8,
    },
  },
];

export default function MapPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = mockEvents.find((e) => e.id === selectedEventId);

  const leftPanel = (
    <MapComponent
      events={mockEvents}
      onMarkerClick={setSelectedEventId}
      selectedEventId={selectedEventId}
    />
  );

  const rightPanel = <EventDetail event={selectedEvent} />;

  return (
    <>
      <Navigation />
      <FloatingActionButton />
      <div className="pt-16">
        <DualColumnLayout
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          onBackgroundClick={() => setSelectedEventId(null)}
        />
      </div>
    </>
  );
}
