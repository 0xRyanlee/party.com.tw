'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
    Shield, Check, X, Mail, ExternalLink, Instagram,
    Youtube, Twitter, Users, RefreshCw, AlertCircle
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

interface KOLApplication {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    profession: string;
    social_platform: string;
    social_handle: string;
    follower_count: number;
    content_category: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    notes: string | null;
}

export default function KOLReviewPage() {
    const [applications, setApplications] = useState<KOLApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<KOLApplication | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
    const supabase = createClient();

    const fetchApplications = async () => {
        setIsLoading(true);

        // 從 profiles 獲取 KOL 申請者（role = 'kol_pending' 或有 kol_application）
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .or('role.eq.kol_pending,role.eq.kol');

        if (error) {
            console.error('Error fetching KOL applications:', error);
            setIsLoading(false);
            return;
        }

        // 轉換為應用格式（假設有額外的欄位）
        const apps: KOLApplication[] = (profiles || []).map((p: any) => ({
            id: p.id,
            user_id: p.id,
            full_name: p.full_name || '未設定',
            email: p.email || '',
            avatar_url: p.avatar_url,
            profession: p.profession || '未填寫',
            social_platform: p.social_platform || 'instagram',
            social_handle: p.social_handle || '',
            follower_count: p.follower_count || 0,
            content_category: p.content_category || '未分類',
            status: p.role === 'kol' ? 'approved' : p.role === 'kol_rejected' ? 'rejected' : 'pending',
            created_at: p.created_at,
            notes: p.kol_notes || null,
        }));

        setApplications(apps);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedApp) return;

        const newRole = action === 'approve' ? 'kol' : 'user';

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', selectedApp.user_id);

        if (error) {
            toast.error('操作失敗');
            return;
        }

        // 發送郵件通知（TODO：實際發送）
        console.log(`Email notification to: ${selectedApp.email}, action: ${action}`);

        toast.success(action === 'approve' ? 'KOL 認證已通過' : '申請已拒絕');
        setDialogOpen(false);
        fetchApplications();
    };

    const openDialog = (app: KOLApplication, action: 'approve' | 'reject') => {
        setSelectedApp(app);
        setDialogAction(action);
        setDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">待審核</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">已通過</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">已拒絕</Badge>;
            default:
                return null;
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'instagram':
                return <Instagram className="w-4 h-4" />;
            case 'youtube':
                return <Youtube className="w-4 h-4" />;
            case 'twitter':
                return <Twitter className="w-4 h-4" />;
            default:
                return <ExternalLink className="w-4 h-4" />;
        }
    };

    const pendingCount = applications.filter(a => a.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        KOL 審核
                    </h2>
                    <p className="text-gray-500">審核 KOL 認證申請</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchApplications} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                        <p className="text-sm text-gray-500">待審核</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'approved').length}</p>
                        <p className="text-sm text-gray-500">已通過</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-red-600">{applications.filter(a => a.status === 'rejected').length}</p>
                        <p className="text-sm text-gray-500">已拒絕</p>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List */}
            <Card>
                <CardHeader>
                    <CardTitle>申請列表</CardTitle>
                    <CardDescription>共 {applications.length} 個申請</CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>暫無 KOL 認證申請</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                            {app.avatar_url ? (
                                                <img src={app.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                    {app.full_name[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{app.full_name}</p>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <p className="text-sm text-gray-500">{app.email}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    {getPlatformIcon(app.social_platform)}
                                                    @{app.social_handle || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {app.follower_count.toLocaleString()} 粉絲
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {app.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 hover:bg-red-50"
                                                    onClick={() => openDialog(app, 'reject')}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => openDialog(app, 'approve')}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button size="sm" variant="ghost" asChild>
                                            <a href={`mailto:${app.email}`}>
                                                <Mail className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogAction === 'approve' ? '確認通過 KOL 認證' : '確認拒絕申請'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogAction === 'approve'
                                ? `確定要通過 ${selectedApp?.full_name} 的 KOL 認證嗎？`
                                : `確定要拒絕 ${selectedApp?.full_name} 的申請嗎？`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            className={dialogAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={() => handleAction(dialogAction)}
                        >
                            {dialogAction === 'approve' ? '確認通過' : '確認拒絕'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
