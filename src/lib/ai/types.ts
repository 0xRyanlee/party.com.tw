export interface RawEvent {
    rawTitle: string;
    rawDescription?: string;
    rawDate?: string;
    rawLocation?: string;
    rawImage?: string;
    rawPrice?: string;
    originUrl: string;
}

export interface NormalizedEvent {
    title: string;
    description: string;
    date: string;
    time: string;
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    price: number;
    currency: string;
    tags: string[];
    organizerName: string;
    sourceUrl: string;
}

export interface EventProcessor {
    normalize(raw: RawEvent): Promise<NormalizedEvent | null>;
    checkCompliance(text: string): Promise<boolean>;
}
