import { CrawlerAdapter, EventProcessor, NormalizedEvent } from "./types";
import { CrawlerWorkflow, EnrichedEvent } from "./workflow";

export class Crawler {
    private adapters: CrawlerAdapter[] = [];
    private processor: EventProcessor;
    private workflow: CrawlerWorkflow;

    constructor(processor: EventProcessor) {
        this.processor = processor;
        this.workflow = new CrawlerWorkflow();
    }

    registerAdapter(adapter: CrawlerAdapter) {
        this.adapters.push(adapter);
    }

    async run(): Promise<EnrichedEvent[]> {
        console.log(`Starting crawl with ${this.adapters.length} adapters...`);
        const validEvents: EnrichedEvent[] = [];

        for (const adapter of this.adapters) {
            try {
                console.log(`Crawling ${adapter.sourceName}...`);
                const rawEvents = await adapter.fetchEvents();
                console.log(`Fetched ${rawEvents.length} raw events from ${adapter.sourceName}`);

                for (const raw of rawEvents) {
                    try {
                        const normalized = await this.processor.normalize(raw);
                        if (normalized) {
                            const enriched = await this.workflow.process(normalized);
                            if (enriched) {
                                validEvents.push(enriched);
                            }
                        }
                    } catch (error) {
                        console.error(`Error processing event from ${adapter.sourceName}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Error crawling ${adapter.sourceName}:`, error);
            }
        }

        console.log(`Crawl finished. Total valid (non-duplicate) events: ${validEvents.length}`);
        return validEvents;
    }
}
