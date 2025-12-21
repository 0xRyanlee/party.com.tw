'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Ticket, Plus, Copy, Check, Trash2, Edit2,
    RefreshCw, AlertCircle, Users, Calendar, Percent, Gift, Clock
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Coupon {
    id: string;
    code: string;
    type: 'discount_percent' | 'discount_fixed' | 'free' | 'membership_days' | 'buy_one_get_one';
    value: number;
    type_label: string;
    limit_count: number | null;
    used_count: number;
    limit_time: string | null;
    limit_user_type: 'all' | 'new' | 'existing';
    status: 'active' | 'expired' | 'exhausted';
    created_at: string;
}

const mockCoupons: Coupon[] = [
    {
        id: '1',
        code: 'WELCOME2024',
        type: 'discount_percent',
        value: 20,
        type_label: '20% 折扣',
        limit_count: 100,
        used_count: 45,
        limit_time: '2024-12-31',
        limit_user_type: 'new',
        status: 'active',
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        code: 'FREETICKET',
        type: 'free',
        value: 1,
        type_label: '免費入場',
        limit_count: 50,
        used_count: 50,
        limit_time: null,
        limit_user_type: 'all',
        status: 'exhausted',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: '3',
        code: 'PLUS7DAYS',
        type: 'membership_days',
        value: 7,
        type_label: '贈送 7 天 Plus',
        limit_count: null,
        used_count: 23,
        limit_time: '2025-01-31',
        limit_user_type: 'all',
        status: 'active',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: '4',
        code: 'BOGO2024',
        type: 'buy_one_get_one',
        value: 1,
        type_label: '買一送一',
        limit_count: 20,
        used_count: 5,
        limit_time: null,
        limit_user_type: 'existing',
        status: 'active',
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
];

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formType, setFormType] = useState<Coupon['type']>('discount_percent');
    const [formValue, setFormValue] = useState('');
    const [formLimitCount, setFormLimitCount] = useState('');
    const [formLimitTime, setFormLimitTime] = useState('');
    const [formUserType, setFormUserType] = useState<Coupon['limit_user_type']>('all');

    const resetForm = () => {
        setFormCode('');
        setFormType('discount_percent');
        setFormValue('');
        setFormLimitCount('');
        setFormLimitTime('');
        setFormUserType('all');
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormCode(code);
    };

    const getTypeLabel = (type: Coupon['type'], value: number) => {
        switch (type) {
            case 'discount_percent':
                return `${value}% 折扣`;
            case 'discount_fixed':
                return `折扣 NT$${value}`;
            case 'free':
                return '免費入場';
            case 'membership_days':
                return `贈送 ${value} 天 Plus`;
            case 'buy_one_get_one':
                return '買一送一';
            default:
                return '未知';
        }
    };

    const handleCreate = () => {
        if (!formCode || !formValue) {
            toast.error('請填寫優惠碼和數值');
            return;
        }

        const newCoupon: Coupon = {
            id: Date.now().toString(),
            code: formCode.toUpperCase(),
            type: formType,
            value: parseInt(formValue),
            type_label: getTypeLabel(formType, parseInt(formValue)),
            limit_count: formLimitCount ? parseInt(formLimitCount) : null,
            used_count: 0,
            limit_time: formLimitTime || null,
            limit_user_type: formUserType,
            status: 'active',
            created_at: new Date().toISOString(),
        };

        setCoupons(prev => [newCoupon, ...prev]);
        toast.success('優惠碼已創建');
        setDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast.success('優惠碼已刪除');
    };

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success('已複製優惠碼');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">有效</Badge>;
            case 'expired':
                return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">已過期</Badge>;
            case 'exhausted':
                return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">已用完</Badge>;
            default:
                return null;
        }
    };

    const getTypeIcon = (type: Coupon['type']) => {
        switch (type) {
            case 'discount_percent':
            case 'discount_fixed':
                return <Percent className="w-4 h-4" />;
            case 'free':
                return <Ticket className="w-4 h-4" />;
            case 'membership_days':
                return <Calendar className="w-4 h-4" />;
            case 'buy_one_get_one':
                return <Gift className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Ticket className="w-6 h-6" />
                        優惠碼管理
                    </h2>
                    <p className="text-gray-500">創建和管理優惠碼</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLoading(true)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button size="sm" onClick={() => setDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        新建優惠碼
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{coupons.length}</p>
                        <p className="text-sm text-gray-500">總優惠碼</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-green-600">{coupons.filter(c => c.status === 'active').length}</p>
                        <p className="text-sm text-gray-500">有效中</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-blue-600">{coupons.reduce((sum, c) => sum + c.used_count, 0)}</p>
                        <p className="text-sm text-gray-500">總使用次數</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-purple-600">{coupons.filter(c => c.type === 'buy_one_get_one').length}</p>
                        <p className="text-sm text-gray-500">買一送一</p>
                    </CardContent>
                </Card>
            </div>

            {/* Coupons List */}
            <Card>
                <CardHeader>
                    <CardTitle>優惠碼列表</CardTitle>
                    <CardDescription>共 {coupons.length} 個優惠碼</CardDescription>
                </CardHeader>
                <CardContent>
                    {coupons.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>暫無優惠碼</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {coupons.map((coupon) => (
                                <div
                                    key={coupon.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center">
                                            {getTypeIcon(coupon.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <code className="font-mono font-bold text-lg">{coupon.code}</code>
                                                <button onClick={() => copyCode(coupon.code, coupon.id)}>
                                                    {copiedId === coupon.id ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                                    )}
                                                </button>
                                                {getStatusBadge(coupon.status)}
                                            </div>
                                            <p className="text-sm text-gray-500">{coupon.type_label}</p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                                {coupon.limit_count && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {coupon.used_count}/{coupon.limit_count}
                                                    </span>
                                                )}
                                                {!coupon.limit_count && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        已用 {coupon.used_count} 次
                                                    </span>
                                                )}
                                                {coupon.limit_time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        至 {coupon.limit_time}
                                                    </span>
                                                )}
                                                <span>
                                                    {coupon.limit_user_type === 'new' ? '新用戶' : coupon.limit_user_type === 'existing' ? '老用戶' : '全體'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(coupon.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>新建優惠碼</DialogTitle>
                        <DialogDescription>設定優惠碼類型和使用限制</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">優惠碼</label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={formCode}
                                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                    placeholder="WELCOME2024"
                                    className="font-mono"
                                />
                                <Button variant="outline" onClick={generateCode}>
                                    隨機生成
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">類型</label>
                            <Select value={formType} onValueChange={(v) => setFormType(v as Coupon['type'])}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="discount_percent">百分比折扣</SelectItem>
                                    <SelectItem value="discount_fixed">固定金額折扣</SelectItem>
                                    <SelectItem value="free">免費入場</SelectItem>
                                    <SelectItem value="membership_days">贈送會員天數</SelectItem>
                                    <SelectItem value="buy_one_get_one">買一送一</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                {formType === 'discount_percent' ? '折扣比例 (%)' :
                                    formType === 'discount_fixed' ? '折扣金額 (NT$)' :
                                        formType === 'membership_days' ? '天數' : '數量'}
                            </label>
                            <Input
                                type="number"
                                value={formValue}
                                onChange={(e) => setFormValue(e.target.value)}
                                placeholder={formType === 'discount_percent' ? '20' : '100'}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">使用次數限制</label>
                                <Input
                                    type="number"
                                    value={formLimitCount}
                                    onChange={(e) => setFormLimitCount(e.target.value)}
                                    placeholder="無限制"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">有效期限</label>
                                <Input
                                    type="date"
                                    value={formLimitTime}
                                    onChange={(e) => setFormLimitTime(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">限制用戶</label>
                            <Select value={formUserType} onValueChange={(v) => setFormUserType(v as Coupon['limit_user_type'])}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全體用戶</SelectItem>
                                    <SelectItem value="new">僅新用戶</SelectItem>
                                    <SelectItem value="existing">僅老用戶</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleCreate}>
                            創建優惠碼
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
