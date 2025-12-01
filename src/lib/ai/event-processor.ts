import { EventProcessor, NormalizedEvent, RawEvent } from "./types";

export class MockAIEventProcessor implements EventProcessor {
    async normalize(raw: RawEvent): Promise<NormalizedEvent | null> {
        // In a real scenario, this would call an LLM API (OpenAI/Gemini)
        // to intelligently parse unstructured text.

        // For MVP/PoC, we use simple heuristics.

        console.log(`[MockAI] Processing: ${raw.rawTitle}`);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            title: raw.rawTitle,
            description: raw.rawDescription || "No description available.",
            date: raw.rawDate || new Date().toISOString().split('T')[0],
            time: "19:00", // Default mock time
            locationName: raw.rawLocation || "TBD",
            address: raw.rawLocation || "Taipei, Taiwan",
            latitude: 25.0330, // Default to Taipei 101
            longitude: 121.5654,
            imageUrl: raw.rawImage,
            price: raw.rawPrice ? parseInt(raw.rawPrice.replace(/[^0-9]/g, '')) || 0 : 0,
            currency: "TWD",
            tags: ["Music", "Live"], // Mock tags
            organizerName: "Unknown Organizer",
            sourceUrl: raw.originUrl
        };
    }

    /**
     * Simulates a compliance check.
     * In reality, this would check for PII (Personal Identifiable Information)
     * or inappropriate content using AI.
     */
    async checkCompliance(text: string): Promise<boolean> {
        // Mock: Fail if text contains "private" or "phone number"
        if (text.toLowerCase().includes("private party") || text.toLowerCase().includes("09xx-xxx-xxx")) {
            return false;
        }
        return true;
    }
}
