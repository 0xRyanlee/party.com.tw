'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import {
    Building2, Search, RefreshCw, Users, Lock, Globe,
    AlertTriangle, Trash2, Eye, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';

interface Club {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    is_private: boolean;
    owner_id: string;
    owner_name: string;
    member_count: number;
    status: 'active' | 'pending' | 'suspended' | 'dissolved';
    warning_count: number;
    created_at: string;
}

export default function ClubManagementPage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'private' | 'public'>('all');
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'warn' | 'dissolve'>('warn');
    const supabase = createClient();

    const fetchClubs = async () => {
        setIsLoading(true);

        const { data: clubsData, error } = await supabase
            .from('clubs')
            .select(`
                *,
                profiles!clubs_owner_id_fkey(full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clubs:', error);
            setIsLoading(false);
            return;
        }

        // 獲取每個俱樂部的成員數
        const clubsWithMembers: Club[] = await Promise.all(
            (clubsData || []).map(async (club: any) => {
                const { count } = await supabase
                    .from('club_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('club_id', club.id);

                return {
                    id: club.id,
                    name: club.name,
                    description: club.description,
                    cover_image: club.cover_image,
                    is_private: club.is_private || false,
                    owner_id: club.owner_id,
                    owner_name: club.profiles?.full_name || '未知',
                    member_count: count || 0,
                    status: club.status || 'active',
                    warning_count: club.warning_count || 0,
                    created_at: club.created_at,
                };
            })
        );

        setClubs(clubsWithMembers);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    const filteredClubs = clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' ||
            (filterType === 'private' && club.is_private) ||
            (filterType === 'public' && !club.is_private);
        return matchesSearch && matchesFilter;
    });

    const handleAction = async (action: 'warn' | 'dissolve') => {
        if (!selectedClub) return;

        if (action === 'warn') {
            const { error } = await supabase
                .from('clubs')
                .update({ warning_count: (selectedClub.warning_count || 0) + 1 })
                .eq('id', selectedClub.id);

            if (error) {
                toast.error('警告發送失敗');
                return;
            }
            toast.success('已發送警告');
        } else {
            const { error } = await supabase
                .from('clubs')
                .update({ status: 'dissolved' })
                .eq('id', selectedClub.id);

            if (error) {
                toast.error('解散操作失敗');
                return;
            }
            toast.success('俱樂部已解散');
        }

        setDialogOpen(false);
        fetchClubs();
    };

    const openDialog = (club: Club, action: 'warn' | 'dissolve') => {
        setSelectedClub(club);
        setDialogAction(action);
        setDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">正常</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">待審核</Badge>;
            case 'suspended':
                return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">暫停</Badge>;
            case 'dissolved':
                return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">已解散</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6" />
                        俱樂部管理
                    </h2>
                    <p className="text-gray-500">管理平台上的所有俱樂部</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchClubs} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{clubs.length}</p>
                        <p className="text-sm text-gray-500">總俱樂部數</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-blue-600">{clubs.filter(c => !c.is_private).length}</p>
                        <p className="text-sm text-gray-500">公開</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-purple-600">{clubs.filter(c => c.is_private).length}</p>
                        <p className="text-sm text-gray-500">私密</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-red-600">{clubs.filter(c => c.warning_count > 0).length}</p>
                        <p className="text-sm text-gray-500">有警告</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="搜尋俱樂部..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                    {['all', 'public', 'private'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as 'all' | 'private' | 'public')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filterType === type
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-600 hover:text-black'
                                }`}
                        >
                            {type === 'all' ? '全部' : type === 'public' ? '公開' : '私密'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Private Club Warning */}
            <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-purple-900">私密俱樂部風險提示</p>
                            <p className="text-sm text-purple-700 mt-1">
                                私密俱樂部內容不對外公開。平台不對俱樂部內容負責，請提醒成員自行甄別訊息真實性，警惕詐騙。
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clubs List */}
            <Card>
                <CardHeader>
                    <CardTitle>俱樂部列表</CardTitle>
                    <CardDescription>共 {filteredClubs.length} 個俱樂部</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredClubs.map((club) => (
                            <div
                                key={club.id}
                                className={`flex items-center justify-between p-4 rounded-xl ${club.status === 'dissolved'
                                    ? 'bg-gray-100 opacity-60'
                                    : 'bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden">
                                        {club.cover_image ? (
                                            <img src={club.cover_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{club.name}</p>
                                            {club.is_private ? (
                                                <Lock className="w-3.5 h-3.5 text-purple-500" />
                                            ) : (
                                                <Globe className="w-3.5 h-3.5 text-blue-500" />
                                            )}
                                            {getStatusBadge(club.status)}
                                            {club.warning_count > 0 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {club.warning_count} 警告
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            負責人：{club.owner_name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {club.member_count} 成員
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {club.status !== 'dissolved' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-amber-500 hover:bg-amber-50"
                                                onClick={() => openDialog(club, 'warn')}
                                            >
                                                <AlertTriangle className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-500 hover:bg-red-50"
                                                onClick={() => openDialog(club, 'dissolve')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button size="sm" variant="ghost" asChild>
                                        <Link href={`/club/${club.id}`}>
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogAction === 'warn' ? '發送警告' : '解散俱樂部'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogAction === 'warn'
                                ? `確定要向「${selectedClub?.name}」發送警告嗎？多次警告將導致俱樂部被解散。`
                                : `確定要解散「${selectedClub?.name}」嗎？此操作無法撤銷，所有成員都將被移除。`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            className={dialogAction === 'warn' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={() => handleAction(dialogAction)}
                        >
                            {dialogAction === 'warn' ? '確認警告' : '確認解散'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
