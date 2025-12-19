/**
 * Seed script for inserting real event data
 * Sources: Accupass, Meetup
 * Run with: npx tsx scripts/seed-events.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface EventData {
    title: string;
    description_short: string;
    description_long: string;
    category: string;
    venue_name: string;
    address: string;
    start_time: string;
    end_time: string;
    status: string;
    tags: string[];
    source_url: string;
    source_name: string;
    cover_image: string;
}

const events: EventData[] = [
    {
        title: '台北邁斯納劇團《賣火柴的小女孩》',
        description_short: '岸田國士戲劇獎首次得獎鉅作 台北邁斯納劇團經典作品《賣火柴》繁體中文版全台首演',
        description_long: '岸田國士戲劇獎首次得獎鉅作 台北邁斯納劇團經典作品《賣火柴》繁體中文版全台首演。台北邁斯納劇團 Instagram: theatremeisner',
        category: 'performance',
        venue_name: '嘉禾新村 - 日式眷場',
        address: '台灣台北市100中正區永春街131巷1號',
        start_time: '2025-12-19T19:30:00+08:00',
        end_time: '2025-12-19T21:00:00+08:00',
        status: 'published',
        tags: ['戲劇', '表演', '藝文', '台北邁斯納劇團'],
        source_url: 'https://accupass.com/event/2509140851092035206990',
        source_name: 'Accupass',
        cover_image: 'https://static.accupass.com/eventintro/2509140855295318890340.webp',
    },
    {
        title: '台北夜遊微醺雙層巴士 2.0 聖誕節篇 Taipei Night Tour',
        description_short: '加入我們的微醺派對！看看夜晚、喝著夜酒、行程簡報，個人也能參加',
        description_long: '已經看過台北幾個醜酒窖，漸漸沒有機會或在晴雨的二樓車上看台北的夜景嗎？加入我們的微醺派對！看看夜晚、喝著夜酒、行程簡報，個人也能參加。微醺派對三大享受：情調社交、迷離夜北。目前已超過 2,000 人報名 / 參加過此活動。',
        category: 'party',
        venue_name: '台北車站 M3 出口右側',
        address: '台灣台北市忠孝西路一段',
        start_time: '2025-12-27T20:45:00+08:00',
        end_time: '2025-12-27T23:30:00+08:00',
        status: 'published',
        tags: ['台北夜遊', '微醺巴士', '台北夜生活', '聖誕節'],
        source_url: 'https://accupass.com/event/2506230305481089434001',
        source_name: 'Accupass',
        cover_image: 'https://static.accupass.com/eventbanner/2511220940123614320690.jpg',
    },
    {
        title: 'CHRISTMAS PARTY (FREE) DINNER, EXCHANGE GIFT, GAMES, CHARITY',
        description_short: "Merry Christmas! Let's have fun together, exchange gift and play the games",
        description_long: "Merry Christmas! Let's have fun together, exchange gift and play the games and I would like to give reward for my hiking group members and a lot of gifts for you. We also do the charity to give second hand winter jacket for Indonesian fishermen and helping orphanage (optional).",
        category: 'party',
        venue_name: 'AROMA CAFE',
        address: '7樓, No. 36號, Guanqian Rd, Zhongzheng District, Taipei',
        start_time: '2025-12-20T18:00:00+08:00',
        end_time: '2025-12-20T21:00:00+08:00',
        status: 'published',
        tags: ['Christmas', 'Party', 'Free', 'Charity', 'Games'],
        source_url: 'https://www.meetup.com/easyhikingandfunactivities/events/312096408/',
        source_name: 'Meetup',
        cover_image: 'https://secure.meetupstatic.com/photos/event/5/7/a/5/highres_525959173.webp',
    },
    {
        title: 'CHRISTMAS LAND BANQIAO AND NANYA NIGHT MARKET',
        description_short: 'VISITING CHRISTMAS LAND AND URBAN WALKS TO NANYA NIGHT MARKET',
        description_long: '17.00-17.15 : gathering in banqiao MRT or train station EXIT 2 (outside). 17.30-18.30: circular trail for seeing the light After that we go inside the Christmas tree light. 18.30-19.30: free time visiting the stage, bazaar, Christmas tree etc. We will meet again in front of Christmas tree in banqiao mall at 19.30. 19.45-20.15 : go to nanya night market. 20.15-22.00 : night market time.',
        category: 'gathering',
        venue_name: 'Banqiao Train Station',
        address: 'No.7, Section 2, Xianmin Blvd, Banqiao District, New Taipei City',
        start_time: '2025-12-27T17:00:00+08:00',
        end_time: '2025-12-27T23:00:00+08:00',
        status: 'published',
        tags: ['Christmas', 'Night Market', 'Walking', 'Free', 'Banqiao'],
        source_url: 'https://www.meetup.com/easyhikingandfunactivities/events/312183204/',
        source_name: 'Meetup',
        cover_image: 'https://secure.meetupstatic.com/photos/event/d/a/b/1/highres_525995857.webp',
    },
    {
        title: '傷痛的地層 —— 歷史與身體的日常風景',
        description_short: '攝影師上原沙也加帶著她敏銳的視線，從冷靜走向日常風景，用影像揭接悄悄與歷史的痕跡',
        description_long: '攝影師上原沙也加帶著她敏銳的視線，從冷靜走向日常風景，用影像揭接悄悄與歷史的痕跡。她的作品《眠る木 / Sleeping Trees》像一部薄薄層層的記憶地圖，引領我們看見平凡場景中的深刻歷史與共鳴。這晚，她將與林討書一起分享創作過程與新作觀點，從影像如何呈現那些寫憶體聚落記憶情境出發，展開一場深度對談。',
        category: 'lecture',
        venue_name: '薄霧書店',
        address: '台灣台北市羅斯福路三段302號3樓',
        start_time: '2025-12-27T19:00:00+08:00',
        end_time: '2025-12-27T21:00:00+08:00',
        status: 'published',
        tags: ['攝影集', '攝影', '日本攝影師', '藝文', '講座'],
        source_url: 'https://accupass.com/event/2512150658067461050270',
        source_name: 'Accupass',
        cover_image: 'https://static.accupass.com/eventintro/2512160102201988168240.webp',
    },
];

async function seedEvents() {
    console.log('Seeding events...');

    for (const event of events) {
        const { data, error } = await supabase.from('events').insert(event).select();

        if (error) {
            console.error(`Failed to insert: ${event.title}`, error.message);
        } else {
            console.log(`Inserted: ${event.title}`);
        }
    }

    console.log('Done!');
}

seedEvents();
