export interface Organizer {
    id: string;
    name: string;
    avatar?: string;
    role: 'member' | 'vendor' | 'supplier';
    verified?: boolean;
}

export interface Event {
    id: string;
    title: string;
    type:
    // 社交類
    | 'gathering' | 'meetup' | 'networking' | 'party' | 'rave' | 'potluck'
    // 學習類
    | 'workshop' | 'lecture' | 'conference' | 'seminar' | 'book_club' | 'language_exchange'
    // 運動類
    | 'sport' | 'marathon' | 'hiking' | 'climbing' | 'running' | 'yoga' | 'cycling' | 'swimming' | 'basketball' | 'volleyball' | 'badminton' | 'tennis' | 'gym'
    // 藝文類
    | 'exhibition' | 'performance' | 'concert' | 'movie' | 'theater' | 'gallery'
    // 創業/科技類
    | 'hackathon' | 'startup' | 'demo_day' | 'tech_talk'
    // 生活類
    | 'popup' | 'flea_market' | 'farmers_market' | 'food_tour' | 'wine_tasting' | 'coffee_tasting'
    // 特殊類
    | 'retreat' | 'coholding' | 'meeting' | 'training_camp' | 'expo' | 'festival'
    // 主題類
    | 'women_only' | 'lgbtq_friendly' | 'singles' | 'board_game' | 'mahjong' | 'card_game' | 'video_game'
    // 通用
    | 'event' | 'other';
    format: 'indoor' | 'outdoor' | 'online';
    attributes: string[]; // e.g., ['free', 'pet_friendly']
    date: string; // Display date e.g. "Today", "Nov 25"
    fullDate: string; // ISO date for sorting e.g. "2023-11-24"
    dayOfWeek: string; // e.g. "Mon", "Tue"
    time: string;
    location: string;
    lat: number;
    lng: number;
    distance: number; // km
    attendees: number;
    capacity: number;
    image: string;
    tags: string[];
    description: string;
    price: string;
    organizer: Organizer; // Changed from string to Organizer object
    vendors?: Organizer[]; // Optional array of vendors/suppliers
    isPromoted?: boolean;
    status: 'active' | 'pending' | 'draft' | 'expired' | 'published';
    // Source information for aggregated events
    sourceUrl?: string;  // Original URL where event was sourced from
    sourceName?: string; // Name of the source platform (e.g., "Meetup", "Accupass")
    content_images?: string[]; // Additional content images (max 3, plus main image = 4 total)
}

export const mockEvents: Event[] = [
    {
        id: '1',
        title: '週五下班小酌 - 信義區',
        status: 'active',
        type: 'party',
        format: 'indoor',
        attributes: ['public', 'pay_at_door', 'adults_only'],
        date: 'Today',
        fullDate: '2023-11-24',
        dayOfWeek: 'Fri',
        time: '19:30',
        location: 'Draft Land, Xinyi',
        lat: 25.0355,
        lng: 121.5645,
        distance: 0.3,
        attendees: 12,
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=2874&auto=format&fit=crop',
        tags: ['Social', 'Drinks', 'Nightlife'],
        description: '下班後的輕鬆時光，認識新朋友！',
        price: 'NT$ 300',
        organizer: {
            id: 'org1',
            name: 'Party.com.tw',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PT',
            role: 'member',
            verified: true,
        },
        vendors: [
            {
                id: 'vendor1',
                name: 'DJ Mike',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                role: 'vendor',
            },
            {
                id: 'vendor2',
                name: '花藝工作室',
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Flower',
                role: 'vendor',
            },
        ],
        isPromoted: true,
    },
    {
        id: '2',
        title: 'React 開發者交流會',
        status: 'active',
        type: 'meetup',
        format: 'indoor',
        attributes: ['public', 'free', 'english'],
        date: 'Tomorrow',
        fullDate: '2023-11-25',
        dayOfWeek: 'Sat',
        time: '14:00',
        location: 'AppWorks, Taipei',
        lat: 25.0426,
        lng: 121.5649,
        distance: 1.5,
        attendees: 45,
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2940&auto=format&fit=crop',
        tags: ['Tech', 'Coding', 'Networking'],
        description: '每月一次的 React 開發者聚會，這次邀請到資深工程師分享 Next.js 14 的實戰經驗。',
        price: 'Free',
        organizer: { id: 'org2', name: 'React Taiwan', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RT', role: 'member', verified: true },
    },
    {
        id: '3',
        title: '台北數位遊牧聚會',
        status: 'pending',
        type: 'gathering',
        format: 'outdoor',
        attributes: ['public', 'free', 'pet_friendly'],
        date: 'Nov 26',
        fullDate: '2023-11-26',
        dayOfWeek: 'Sun',
        time: '06:00',
        location: 'Dajia Riverside Park',
        lat: 25.0753,
        lng: 121.5525,
        distance: 2.8,
        attendees: 8,
        capacity: 15,
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2940&auto=format&fit=crop',
        tags: ['Sports', 'Running', 'Morning'],
        description: '享受清晨的陽光與微風，一起在河濱公園慢跑 5K。',
        price: 'Free',
        organizer: { id: 'org3', name: 'Taipei Runners', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TR', role: 'member' },
    },
    {
        id: '4',
        title: 'React 台灣年會 2023',
        status: 'active',
        type: 'workshop',
        format: 'indoor',
        attributes: ['public', 'prepaid'],
        date: 'Nov 27',
        fullDate: '2023-11-27',
        dayOfWeek: 'Mon',
        time: '10:00',
        location: 'Simple Kaffa',
        lat: 25.0445,
        lng: 121.5295,
        distance: 0.8,
        attendees: 6,
        capacity: 8,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop',
        tags: ['Coffee', 'Workshop', 'Lifestyle'],
        description: '從選豆到沖煮，專業咖啡師手把手教學，帶你進入手沖咖啡的世界。',
        price: '$800',
        organizer: { id: 'org7', name: 'Art Space Taipei', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS', role: 'supplier', verified: true },
    },
    {
        id: '5',
        title: '產品經理交流夜',
        status: 'draft',
        type: 'meetup',
        format: 'indoor',
        attributes: ['public', 'free_reservation'],
        date: 'Nov 28',
        fullDate: '2023-11-28',
        dayOfWeek: 'Tue',
        time: '19:00',
        location: 'Eslite Bookstore',
        lat: 25.0378,
        lng: 121.5652,
        distance: 1.2,
        attendees: 15,
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2940&auto=format&fit=crop',
        tags: ['Books', 'Business', 'Learning'],
        description: '本週導讀《精實創業》，歡迎創業者與對創業有興趣的朋友一起交流。',
        price: '$200',
        organizer: { id: 'org3', name: 'Taipei Runners', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TR', role: 'member' },
    },
    {
        id: '6',
        title: 'Techno 地下派對',
        status: 'active',
        type: 'party',
        format: 'indoor',
        attributes: ['public', 'door', 'adults_only'],
        date: 'Nov 29',
        fullDate: '2023-11-29',
        dayOfWeek: 'Wed',
        time: '20:00',
        location: 'Blue Note Taipei',
        lat: 25.0195,
        lng: 121.5298,
        distance: 2.0,
        attendees: 30,
        capacity: 60,
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2874&auto=format&fit=crop',
        tags: ['Music', 'Jazz', 'Nightlife'],
        description: '台北最經典的爵士樂現場，今晚有特別嘉賓演出。',
        price: '$600',
        organizer: { id: 'org6', name: 'Taipei Food Lovers', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TF', role: 'member' },
    },
    {
        id: '7',
        title: '瑜伽伸展放鬆',
        status: 'active',
        type: 'workshop',
        format: 'indoor',
        attributes: ['public', 'prepaid', 'lady_free'],
        date: 'Nov 30',
        fullDate: '2023-11-30',
        dayOfWeek: 'Thu',
        time: '19:30',
        location: 'Yoga Space',
        lat: 25.0418,
        lng: 121.5503,
        distance: 1.0,
        attendees: 10,
        capacity: 12,
        image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2940&auto=format&fit=crop',
        tags: ['Sports', 'Yoga', 'Wellness'],
        description: '透過瑜伽伸展釋放一整天的壓力，適合所有程度的學員。',
        price: '$400',
        organizer: { id: 'org5', name: 'Yoga with Love', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=YL', role: 'vendor' },
    },
];

export const tags = ['All', 'Social', 'Tech', 'Sports', 'Music', 'Art', 'Food', 'Business', 'Lifestyle'];
