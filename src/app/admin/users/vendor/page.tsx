'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
    Building2, Check, X, Mail, ExternalLink, Globe,
    Phone, RefreshCw, AlertCircle, FileText
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

interface VendorApplication {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    company_name: string;
    service_type: string;
    website: string | null;
    phone: string | null;
    portfolio_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function VendorReviewPage() {
    const [applications, setApplications] = useState<VendorApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
    const supabase = createClient();

    const fetchApplications = async () => {
        setIsLoading(true);

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .or('role.eq.vendor_pending,role.eq.vendor');

        if (error) {
            console.error('Error fetching Vendor applications:', error);
            setIsLoading(false);
            return;
        }

        const apps: VendorApplication[] = (profiles || []).map((p: any) => ({
            id: p.id,
            user_id: p.id,
            full_name: p.full_name || '未設定',
            email: p.email || '',
            avatar_url: p.avatar_url,
            company_name: p.company_name || '未填寫',
            service_type: p.service_type || '未分類',
            website: p.website || null,
            phone: p.phone || null,
            portfolio_url: p.portfolio_url || null,
            status: p.role === 'vendor' ? 'approved' : p.role === 'vendor_rejected' ? 'rejected' : 'pending',
            created_at: p.created_at,
        }));

        setApplications(apps);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedApp) return;

        const newRole = action === 'approve' ? 'vendor' : 'user';

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', selectedApp.user_id);

        if (error) {
            toast.error('操作失敗');
            return;
        }

        toast.success(action === 'approve' ? 'Vendor 認證已通過' : '申請已拒絕');
        setDialogOpen(false);
        fetchApplications();
    };

    const openDialog = (app: VendorApplication, action: 'approve' | 'reject') => {
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

    const pendingCount = applications.filter(a => a.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6" />
                        Vendor 審核
                    </h2>
                    <p className="text-gray-500">審核 Vendor 認證申請</p>
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
                            <p>暫無 Vendor 認證申請</p>
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
                                                    {app.company_name[0]?.toUpperCase() || 'V'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{app.company_name}</p>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <p className="text-sm text-gray-500">{app.full_name} · {app.email}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span>{app.service_type}</span>
                                                {app.website && (
                                                    <a href={app.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-500">
                                                        <Globe className="w-3 h-3" />
                                                        網站
                                                    </a>
                                                )}
                                                {app.portfolio_url && (
                                                    <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-500">
                                                        <FileText className="w-3 h-3" />
                                                        作品集
                                                    </a>
                                                )}
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
                            {dialogAction === 'approve' ? '確認通過 Vendor 認證' : '確認拒絕申請'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogAction === 'approve'
                                ? `確定要通過 ${selectedApp?.company_name} 的 Vendor 認證嗎？`
                                : `確定要拒絕 ${selectedApp?.company_name} 的申請嗎？`}
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
