"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Plus, Crown, Users, Settings, Shield } from "lucide-react";
import ClubCard from "@/components/club/ClubCard";
import { createClient } from "@/lib/supabase/client";

interface Club {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    club_type: 'public' | 'private' | 'vendor';
    member_count: number;
    tags: string[];
    owner_id: string;
    owner?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

interface MyClub extends Club {
    role: string;
}

export default function ClubPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [myClubs, setMyClubs] = useState<MyClub[]>([]);
    const [exploreClubs, setExploreClubs] = useState<Club[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchClubs = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();

        // 獲取當前用戶
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        try {
            // 獲取我的 Clubs
            if (user) {
                const myResponse = await fetch(`/api/clubs?my=true`);
                if (myResponse.ok) {
                    const myData = await myResponse.json();

                    // 獲取用戶在每個 Club 的角色
                    const { data: memberships } = await supabase
                        .from('club_members')
                        .select('club_id, role')
                        .eq('user_id', user.id);

                    const roleMap = new Map((memberships || []).map((m: { club_id: string; role: string }) => [m.club_id, m.role]));

                    const enrichedMyClubs = myData.map((club: Club) => ({
                        ...club,
                        role: club.owner_id === user.id ? 'Owner' : (roleMap.get(club.id) || 'Member'),
                    }));

                    setMyClubs(enrichedMyClubs);
                }
            }

            // 獲取探索 Clubs
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            const exploreResponse = await fetch(`/api/clubs?type=public${searchParam}`);
            if (exploreResponse.ok) {
                const exploreData = await exploreResponse.json();
                setExploreClubs(exploreData);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    return (
        <main className="min-h-screen bg-zinc-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-zinc-100 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">俱樂部</h1>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => router.push('/club/create')}
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </header>

            <div className="container mx-auto px-4 py-6 space-y-8">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="搜尋俱樂部..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white rounded-full border border-zinc-100 shadow-sm"
                    />
                </div>

                {/* My Clubs */}
                {currentUserId && myClubs.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-lg font-bold">我的俱樂部</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {myClubs.map((club) => (
                                <motion.div
                                    key={club.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden"
                                    onClick={() => router.push(`/club/${club.id}`)}
                                >
                                    {/* Cover Image */}
                                    <div className="h-28 bg-zinc-100 relative">
                                        {club.cover_image ? (
                                            <img src={club.cover_image} alt={club.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
                                                <Crown className="w-10 h-10 text-zinc-400" />
                                            </div>
                                        )}
                                        {/* Role Badge */}
                                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                                            {club.role === 'Owner' ? '👑 負責人' : club.role === 'Admin' ? '管理員' : '成員'}
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold truncate flex-1">{club.name}</h3>
                                            {club.club_type === 'private' && <Shield className="w-4 h-4 text-purple-500" />}
                                        </div>
                                        {club.description && (
                                            <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{club.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3 text-zinc-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {club.member_count}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-zinc-500 hover:text-black -mr-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/club/${club.id}/manage`);
                                                }}
                                            >
                                                <Settings className="w-4 h-4 mr-1" />
                                                管理
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Explore */}
                <section>
                    <h2 className="text-lg font-bold mb-4 px-1">探索社群</h2>
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-zinc-100 animate-pulse">
                                    <div className="h-32 bg-zinc-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-zinc-200 rounded w-3/4" />
                                        <div className="h-4 bg-zinc-100 rounded w-full" />
                                        <div className="h-4 bg-zinc-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : exploreClubs.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {exploreClubs.map((club) => (
                                <motion.div
                                    key={club.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                >
                                    <ClubCard club={club} showOwner />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Crown className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500">尚無俱樂部</p>
                            <p className="text-sm text-zinc-400">成為第一個創建者！</p>
                        </div>
                    )}
                </section>

                {/* Create Club CTA */}
                <section className="bg-gradient-to-br from-black to-zinc-900 rounded-3xl p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                    <div className="relative z-10">
                        <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h2 className="text-2xl font-bold mb-2">創建您的俱樂部</h2>
                        <p className="text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
                            為您的社群創建專屬空間，<br className="sm:hidden" />管理活動並擴大影響力。
                        </p>
                        <Button
                            className="rounded-full bg-white text-black hover:bg-zinc-200 px-8 h-12 font-bold"
                            onClick={() => router.push('/club/create')}
                        >
                            創建俱樂部
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
}
