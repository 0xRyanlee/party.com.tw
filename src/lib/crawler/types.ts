export interface RawEvent {
    sourceId: string;
    originUrl: string;
    rawTitle: string;
    rawDescription?: string;
    rawDate?: string;
    rawLocation?: string;
    rawPrice?: string;
    rawImage?: string;
    metadata?: Record<string, any>;
}

export interface NormalizedEvent {
    title: string;
    description: string;
    date: string; // ISO Date string YYYY-MM-DD
    time: string; // HH:mm
    locationName: string;
    address: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    price?: number;
    currency?: string;
    tags: string[];
    organizerName: string;
    sourceUrl: string;
}

export interface CrawlerAdapter {
    sourceName: string;
    baseUrl: string;
    fetchEvents(): Promise<RawEvent[]>;
}

export interface EventProcessor {
    normalize(raw: RawEvent): Promise<NormalizedEvent | null>;
}
