"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, Gift, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommunityLeadPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 text-white hover:bg-white/10">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Community Lead</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Lead the Vibe</h2>
                    <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
                        Become a Community Lead and help shape the future of nightlife and social events in your city.
                    </p>
                </div>

                <div className="grid gap-6 mb-12">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Users className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Build Your Tribe</h3>
                        <p className="text-gray-400 text-sm">Create and curate events that bring people together. You are the heart of the community.</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Gift className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Exclusive Perks</h3>
                        <p className="text-gray-400 text-sm">Get free access to premium events, exclusive merchandise, and special partner offers.</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Recognition</h3>
                        <p className="text-gray-400 text-sm">Earn the "Community Lead" badge on your profile and get featured on our homepage.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-b from-white/10 to-transparent p-8 rounded-3xl text-center border border-white/10">
                    <h3 className="text-2xl font-bold mb-4">Ready to apply?</h3>
                    <p className="text-gray-400 mb-8 text-sm">
                        We are looking for passionate individuals who love connecting people.
                        No professional experience required.
                    </p>
                    <Button className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 font-bold text-lg">
                        Apply Now
                    </Button>
                </div>
            </div>
        </main>
    );
}
