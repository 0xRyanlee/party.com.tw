import { CrawlerAdapter, RawEvent } from "./types";

export class WitchHouseAdapter implements CrawlerAdapter {
    sourceName = "Witch House (女巫店)";
    baseUrl = "http://www.witchhouse.org/";

    async fetchEvents(): Promise<RawEvent[]> {
        // In a real implementation, this would use 'fetch' and 'cheerio' 
        // to parse the HTML from this.baseUrl.

        // Mocking the response for PoC
        return [
            {
                sourceId: "wh-001",
                originUrl: "http://www.witchhouse.org/program/20231201",
                rawTitle: "Jazz Night at Witch House",
                rawDescription: "A wonderful night of jazz improvisation.",
                rawDate: "2023-12-01",
                rawLocation: "女巫店 Witch House",
                rawPrice: "350 TWD",
                rawImage: "https://images.unsplash.com/photo-1514525253440-b393452e3383"
            },
            {
                sourceId: "wh-002",
                originUrl: "http://www.witchhouse.org/program/20231202",
                rawTitle: "Indie Rock Weekend",
                rawDescription: "Local indie bands taking the stage.",
                rawDate: "2023-12-02",
                rawLocation: "女巫店 Witch House",
                rawPrice: "400 TWD",
                rawImage: "https://images.unsplash.com/photo-1501612780327-45045538702b"
            }
        ];
    }
}
