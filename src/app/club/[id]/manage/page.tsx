"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, UserCog, Search, MoreHorizontal, Loader2, Crown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Club {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    club_type: 'public' | 'private' | 'vendor';
    is_active: boolean;
    owner_id: string;
}

interface Member {
    id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'moderator' | 'member';
    nickname: string | null;
    joined_at: string;
    user: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        email: string | null;
    };
}

export default function ClubManagePage() {
    const router = useRouter();
    const params = useParams();
    const clubId = params.id as string;

    const [activeTab, setActiveTab] = useState("settings");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const [club, setClub] = useState<Club | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 獲取俱樂部資料
    const fetchClub = useCallback(async () => {
        try {
            const response = await fetch(`/api/clubs/${clubId}`);
            if (!response.ok) {
                toast.error('找不到該俱樂部');
                router.push('/club');
                return;
            }
            const data = await response.json();
            setClub(data);

            // 檢查是否為 owner
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user && data.owner_id === user.id) {
                setIsOwner(true);
            } else if (data.membership?.role === 'owner' || data.membership?.role === 'admin') {
                setIsOwner(true);
            } else {
                toast.error('您沒有管理權限');
                router.push(`/club/${clubId}`);
            }
        } catch (error) {
            console.error('Error fetching club:', error);
            toast.error('載入失敗');
        }
    }, [clubId, router]);

    // 獲取成員列表
    const fetchMembers = useCallback(async () => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    }, [clubId]);

    useEffect(() => {
        fetchClub();
        fetchMembers();
    }, [fetchClub, fetchMembers]);

    // 儲存變更
    const handleSave = async () => {
        if (!club) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/clubs/${clubId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: club.name,
                    description: club.description,
                    club_type: club.club_type,
                }),
            });

            if (response.ok) {
                toast.success('儲存成功');
            } else {
                const data = await response.json();
                toast.error(data.error || '儲存失敗');
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    // 角色顯示
    const getRoleBadge = (role: string) => {
        const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
            owner: { label: '負責人', variant: 'default' },
            admin: { label: '管理員', variant: 'secondary' },
            moderator: { label: '版主', variant: 'outline' },
            member: { label: '成員', variant: 'outline' },
        };
        const config = roleMap[role] || roleMap.member;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    // 過濾成員
    const filteredMembers = members.filter(m =>
        m.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </main>
        );
    }

    if (!club || !isOwner) {
        return (
            <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500">無權限訪問</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-zinc-100 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">管理俱樂部</h1>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-black text-white hover:bg-zinc-800"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    儲存變更
                </Button>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-full h-12">
                        <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">設定</TabsTrigger>
                        <TabsTrigger value="members" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">成員 ({members.length})</TabsTrigger>
                    </TabsList>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>基本資訊</CardTitle>
                                <CardDescription>更新俱樂部的公開資訊。</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">俱樂部名稱</Label>
                                    <Input
                                        id="name"
                                        value={club.name}
                                        onChange={(e) => setClub({ ...club, name: e.target.value })}
                                        className="bg-zinc-50 border-zinc-200 rounded-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">俱樂部簡介</Label>
                                    <Textarea
                                        id="desc"
                                        value={club.description || ''}
                                        onChange={(e) => setClub({ ...club, description: e.target.value })}
                                        className="bg-zinc-50 border-zinc-200 min-h-[100px] rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">俱樂部類型</Label>
                                        <p className="text-sm text-zinc-500">
                                            {club.club_type === 'public' && '公開 - 任何人可加入'}
                                            {club.club_type === 'private' && '私密 - 需要審核'}
                                            {club.club_type === 'vendor' && '服務商 - 商業用途'}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{club.club_type}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                <Input
                                    placeholder="搜尋成員..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white border-zinc-200 rounded-full"
                                />
                            </div>
                            <Button variant="outline" className="rounded-full">
                                <UserCog className="w-4 h-4 mr-2" />
                                邀請
                            </Button>
                        </div>

                        {filteredMembers.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zinc-500">沒有找到成員</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={member.user?.avatar_url || ''} />
                                                <AvatarFallback>
                                                    {member.user?.full_name?.[0] || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {member.user?.full_name || '未知用戶'}
                                                    </h3>
                                                    {member.role === 'owner' && (
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                    {getRoleBadge(member.role)}
                                                </div>
                                                {member.nickname && (
                                                    <p className="text-sm text-zinc-500">
                                                        暱稱: {member.nickname}
                                                    </p>
                                                )}
                                                <p className="text-xs text-zinc-400">
                                                    加入於 {new Date(member.joined_at).toLocaleDateString('zh-TW')}
                                                </p>
                                            </div>
                                        </div>
                                        {member.role !== 'owner' && (
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
