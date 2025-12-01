import { NormalizedEvent } from "./types";
import { createHash } from "crypto";

export type EventStatus = 'draft' | 'verified' | 'published' | 'rejected';

export interface EnrichedEvent extends NormalizedEvent {
    hash: string;
    status: EventStatus;
    confidenceScore: number;
    complianceCheckPassed: boolean;
}

export class CrawlerWorkflow {
    /**
     * Generates a unique hash for the event based on title, date, and location.
     * This is used for deduplication.
     */
    static generateHash(event: NormalizedEvent): string {
        const data = `${event.title.trim().toLowerCase()}|${event.date}|${event.locationName.trim().toLowerCase()}`;
        return createHash('md5').update(data).digest('hex');
    }

    /**
     * Checks if the event is a duplicate.
     * In a real app, this would query the database.
     * For MVP, we'll use an in-memory Set.
     */
    private existingHashes = new Set<string>();

    async isDuplicate(hash: string): Promise<boolean> {
        // TODO: Replace with DB query
        // const existing = await supabase.from('events').select('id').eq('hash', hash).single();
        return this.existingHashes.has(hash);
    }

    /**
     * Processes a normalized event through the workflow:
     * 1. Generate Hash
     * 2. Check Deduplication
     * 3. Assign Initial Status (Draft)
     */
    async process(event: NormalizedEvent): Promise<EnrichedEvent | null> {
        const hash = CrawlerWorkflow.generateHash(event);

        if (await this.isDuplicate(hash)) {
            console.log(`Duplicate event found: ${event.title}`);
            return null;
        }

        this.existingHashes.add(hash);

        return {
            ...event,
            hash,
            status: 'draft', // All crawled events start as draft for manual verification
            confidenceScore: 0.8, // Mock score
            complianceCheckPassed: true // Assumed true after AI processing
        };
    }
}
