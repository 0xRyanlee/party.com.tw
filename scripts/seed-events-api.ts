/**
 * Seed script for inserting real event data via local API
 * Sources: Accupass, Meetup
 * Run with: npx tsx scripts/seed-events-api.ts (while dev server is running)
 */

interface EventPayload {
    title: string;
    descriptionShort: string;
    descriptionLong: string;
    category: string;
    venueName: string;
    address: string;
    startTime: string;
    endTime: string;
    status: string;
    tags: string[];
    externalLink: string;
    coverImage: string;
}

const events: EventPayload[] = [
    {
        title: '台北邁斯納劇團《賣火柴的小女孩》',
        descriptionShort: '岸田國士戲劇獎首次得獎鉅作 台北邁斯納劇團經典作品《賣火柴》繁體中文版全台首演',
        descriptionLong: '岸田國士戲劇獎首次得獎鉅作 台北邁斯納劇團經典作品《賣火柴》繁體中文版全台首演。來源: Accupass',
        category: 'performance',
        venueName: '嘉禾新村 - 日式眷場',
        address: '台灣台北市100中正區永春街131巷1號',
        startTime: '2025-12-19T19:30:00.000Z',
        endTime: '2025-12-19T21:00:00.000Z',
        status: 'published',
        tags: ['戲劇', '表演', '藝文'],
        externalLink: 'https://accupass.com/event/2509140851092035206990',
        coverImage: 'https://static.accupass.com/eventintro/2509140855295318890340.webp',
    },
    {
        title: '台北夜遊微醺雙層巴士 2.0 聖誕節篇',
        descriptionShort: '加入我們的微醺派對！看看夜晚、喝著夜酒，個人也能參加',
        descriptionLong: '已經看過台北夜景了嗎？加入微醺派對！情調社交、迷離夜北。目前已超過 2,000 人報名。來源: Accupass',
        category: 'party',
        venueName: '台北車站 M3 出口右側',
        address: '台灣台北市忠孝西路一段',
        startTime: '2025-12-27T12:45:00.000Z',
        endTime: '2025-12-27T15:30:00.000Z',
        status: 'published',
        tags: ['台北夜遊', '微醺', '聖誕節'],
        externalLink: 'https://accupass.com/event/2506230305481089434001',
        coverImage: 'https://static.accupass.com/eventbanner/2511220940123614320690.jpg',
    },
    {
        title: 'CHRISTMAS PARTY (FREE) DINNER, EXCHANGE GIFT',
        descriptionShort: "Merry Christmas! Let's have fun together, exchange gift and play games",
        descriptionLong: "Free Christmas party with dinner, gift exchange, games and charity. We also help Indonesian fishermen. 來源: Meetup",
        category: 'party',
        venueName: 'AROMA CAFE',
        address: '7樓, No. 36號, Guanqian Rd, Zhongzheng District, Taipei',
        startTime: '2025-12-20T10:00:00.000Z',
        endTime: '2025-12-20T13:00:00.000Z',
        status: 'published',
        tags: ['Christmas', 'Party', 'Free', 'Charity'],
        externalLink: 'https://www.meetup.com/easyhikingandfunactivities/events/312096408/',
        coverImage: 'https://secure.meetupstatic.com/photos/event/5/7/a/5/highres_525959173.webp',
    },
    {
        title: 'CHRISTMAS LAND BANQIAO AND NANYA NIGHT MARKET',
        descriptionShort: 'VISITING CHRISTMAS LAND AND URBAN WALKS TO NANYA NIGHT MARKET',
        descriptionLong: '17:00 集合板橋車站 → 聖誕燈飾 → 夜市美食。來源: Meetup',
        category: 'gathering',
        venueName: 'Banqiao Train Station',
        address: 'No.7, Section 2, Xianmin Blvd, Banqiao District, New Taipei City',
        startTime: '2025-12-27T09:00:00.000Z',
        endTime: '2025-12-27T15:00:00.000Z',
        status: 'published',
        tags: ['Christmas', 'Night Market', 'Walking', 'Free'],
        externalLink: 'https://www.meetup.com/easyhikingandfunactivities/events/312183204/',
        coverImage: 'https://secure.meetupstatic.com/photos/event/d/a/b/1/highres_525995857.webp',
    },
    {
        title: '傷痛的地層 —— 歷史與身體的日常風景',
        descriptionShort: '攝影師上原沙也加創作分享會',
        descriptionLong: '攝影師上原沙也加帶著敏銳視線，從冷靜走向日常風景，用影像揭接歷史的痕跡。來源: Accupass',
        category: 'lecture',
        venueName: '薄霧書店',
        address: '台灣台北市羅斯福路三段302號3樓',
        startTime: '2025-12-27T11:00:00.000Z',
        endTime: '2025-12-27T13:00:00.000Z',
        status: 'published',
        tags: ['攝影', '日本攝影師', '藝文', '講座'],
        externalLink: 'https://accupass.com/event/2512150658067461050270',
        coverImage: 'https://static.accupass.com/eventintro/2512160102201988168240.webp',
    },
];

async function seedEvents() {
    console.log('Seeding events via local API...');
    const baseUrl = 'http://localhost:3000';
    const seedSecret = 'party-seed-2024';

    for (const event of events) {
        try {
            const response = await fetch(`${baseUrl}/api/seed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${seedSecret}`
                },
                body: JSON.stringify(event),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`Failed: ${event.title}`, data.error);
            } else {
                console.log(`Inserted: ${event.title}`);
            }
        } catch (error: any) {
            console.error(`Error: ${event.title}`, error.message);
        }
    }

    console.log('Done!');
}

seedEvents();
