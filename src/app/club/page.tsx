"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, Search, Users, Shield, Zap, Crown, Plus, Settings, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ClubPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const myClubs = [
        {
            id: 1,
            name: "Taipei Tech Meetup",
            role: "Admin",
            members: 1240,
            type: "Public",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2940&auto=format&fit=crop"
        },
        {
            id: 2,
            name: "VIP Lounge",
            role: "Member",
            members: 56,
            type: "Private",
            image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=2940&auto=format&fit=crop"
        }
    ];

    const exploreClubs = [
        {
            id: 3,
            name: "Electronic Music Lovers",
            members: 3500,
            type: "Public",
            desc: "For those who live for the beat.",
            image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2940&auto=format&fit=crop",
            tags: ["Music", "Party"]
        },
        {
            id: 4,
            name: "Startup Founders",
            members: 890,
            type: "Private",
            desc: "Exclusive network for founders.",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2940&auto=format&fit=crop",
            tags: ["Business", "Networking"]
        },
        {
            id: 5,
            name: "Sound & Stage Vendor",
            members: 12,
            type: "Vendor",
            desc: "Professional equipment rental.",
            image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2940&auto=format&fit=crop",
            tags: ["Service", "Equipment"]
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">Clubs & Communities</h1>
                </div>
                <Button size="icon" variant="ghost">
                    <Plus className="w-6 h-6" />
                </Button>
            </header>

            <div className="container mx-auto px-4 py-6 space-y-8">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search clubs..."
                        className="w-full h-12 pl-10 pr-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>

                {/* My Clubs (Manage) */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-bold">My Clubs</h2>
                        <Button variant="link" className="text-emerald-600 text-sm h-auto p-0">Manage All</Button>
                    </div>
                    <div className="grid gap-4">
                        {myClubs.map((club) => (
                            <motion.div
                                key={club.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                    <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold truncate">{club.name}</h3>
                                        {club.type === 'Private' && <Shield className="w-3 h-3 text-purple-500" />}
                                    </div>
                                    <p className="text-sm text-gray-500">{club.members} members • <span className="text-emerald-600 font-medium">{club.role}</span></p>
                                </div>
                                <Link href={`/club/${club.id}/manage`}>
                                    <Button size="icon" variant="ghost" className="shrink-0">
                                        <Settings className="w-5 h-5 text-gray-400" />
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Explore (Discovery) */}
                <section>
                    <h2 className="text-lg font-bold mb-4 px-1">Explore Communities</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {exploreClubs.map((club) => (
                            <motion.div
                                key={club.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-md transition-all"
                            >
                                <div className="h-32 bg-gray-100 relative overflow-hidden">
                                    <img src={club.image} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 right-3">
                                        <Badge className={`
                                            ${club.type === 'Public' ? 'bg-emerald-500' : ''}
                                            ${club.type === 'Private' ? 'bg-purple-500' : ''}
                                            ${club.type === 'Vendor' ? 'bg-blue-500' : ''}
                                            text-white border-none
                                        `}>
                                            {club.type}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg mb-1">{club.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{club.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-sm text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{club.members}</span>
                                        </div>
                                        <Button size="sm" className="rounded-full bg-black text-white hover:bg-gray-800 px-6">
                                            Join
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Create Club CTA */}
                <section className="bg-gradient-to-br from-black to-gray-900 rounded-[32px] p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                    <div className="relative z-10">
                        <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h2 className="text-2xl font-bold mb-2">Start Your Own Club</h2>
                        <p className="text-gray-400 mb-6 max-w-xs mx-auto">Create a space for your community, manage events, and grow your tribe.</p>
                        <Button className="rounded-full bg-white text-black hover:bg-gray-200 px-8 h-12 font-bold">
                            Create Club
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
}
