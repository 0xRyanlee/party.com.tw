"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Image as ImageIcon, Megaphone } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        events: 0,
        users: 0,
        banners: 0,
        announcements: 0,
    });
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            const { count: eventsCount } = await supabase
                .from("events")
                .select("*", { count: "exact", head: true });

            const { count: usersCount } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });

            const { count: bannersCount } = await supabase
                .from("banners")
                .select("*", { count: "exact", head: true });

            const { count: announcementsCount } = await supabase
                .from("announcements")
                .select("*", { count: "exact", head: true });

            setStats({
                events: eventsCount || 0,
                users: usersCount || 0,
                banners: bannersCount || 0,
                announcements: announcementsCount || 0,
            });
        };

        fetchStats();
    }, [supabase]);

    const statCards = [
        { label: "Total Events", value: stats.events, icon: Calendar, color: "text-blue-500" },
        { label: "Total Users", value: stats.users, icon: Users, color: "text-green-500" },
        { label: "Active Banners", value: stats.banners, icon: ImageIcon, color: "text-purple-500" },
        { label: "Announcements", value: stats.announcements, icon: Megaphone, color: "text-orange-500" },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.label}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
