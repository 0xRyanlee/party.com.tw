"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-white text-black pb-20">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Terms & Disclaimer</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl prose prose-gray">
                <h3>1. Disclaimer of Liability</h3>
                <p>
                    Party Aggregator serves as a platform for information aggregation and community connection.
                    We do not organize or supervise the events listed on our platform unless explicitly stated.
                    Participation in any event is at your own risk.
                </p>

                <h3>2. User Conduct</h3>
                <p>
                    Users are expected to behave respectfully and responsibly. Harassment, hate speech, or
                    any form of illegal activity will result in immediate account suspension.
                </p>

                <h3>3. Content Accuracy</h3>
                <p>
                    While we strive to ensure the accuracy of event information, we cannot guarantee that all
                    details (time, location, price) are always up-to-date. Please verify with the organizer
                    before attending.
                </p>

                <h3>4. Privacy Policy</h3>
                <p>
                    We value your privacy. Your personal data will only be used to improve your experience
                    on our platform and will never be sold to third parties without your consent.
                </p>

                <div className="h-12" />
                <p className="text-sm text-gray-400">Last updated: November 24, 2023</p>
            </div>
        </main>
    );
}
