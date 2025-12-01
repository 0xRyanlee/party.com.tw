import { Crawler } from "../src/lib/crawler/core";
import { MockAIEventProcessor } from "../src/lib/ai/event-processor";
import { WitchHouseAdapter } from "../src/lib/crawler/adapters/witch-house";

async function main() {
    const processor = new MockAIEventProcessor();
    const crawler = new Crawler(processor);

    crawler.registerAdapter(new WitchHouseAdapter());

    console.log("🚀 Starting Crawler PoC...");
    const events = await crawler.run();

    console.log("\n✅ Crawl Complete!");
    console.log(JSON.stringify(events, null, 2));
}

main().catch(console.error);
