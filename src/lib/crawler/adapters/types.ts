export interface RawEvent {
    sourceId: string;
    originUrl: string;
    rawTitle: string;
    rawDescription?: string;
    rawDate?: string;
    rawLocation?: string;
    rawPrice?: string;
    rawImage?: string;
}

export interface CrawlerAdapter {
    sourceName: string;
    baseUrl: string;
    fetchEvents(): Promise<RawEvent[]>;
}
