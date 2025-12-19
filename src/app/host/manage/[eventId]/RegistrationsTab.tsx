'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Loader2,
    Mail,
    Phone,
    Calendar
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Registration {
    id: string;
    attendee_name: string;
    attendee_email: string;
    attendee_phone: string;
    status: 'confirmed' | 'pending' | 'rejected' | 'cancelled' | 'waitlist';
    checked_in: boolean;
    checkin_code?: string;
    created_at: string;
    waitlist_position?: number;
}

export default function RegistrationsTab({ eventId }: { eventId: string }) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchRegistrations();
    }, [statusFilter]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`/api/events/${eventId}/registrations?${params}`);
            const data = await response.json();

            if (response.ok) {
                setRegistrations(data.registrations || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchRegistrations();
    };

    const handleCheckIn = async (registrationId: string) => {
        try {
            const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkin' }),
            });

            if (response.ok) {
                fetchRegistrations();
            }
        } catch (error) {
            console.error('Check-in failed:', error);
        }
    };

    const handleApprove = async (registrationId: string) => {
        try {
            const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            });

            if (response.ok) {
                fetchRegistrations();
            }
        } catch (error) {
            console.error('Approve failed:', error);
        }
    };

    const handleReject = async (registrationId: string) => {
        try {
            const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject' }),
            });

            if (response.ok) {
                fetchRegistrations();
            }
        } catch (error) {
            console.error('Reject failed:', error);
        }
    };

    const exportToCSV = () => {
        const headers = ['姓名', 'Email', '電話', '狀態', '已簽到', '報名時間'];
        const rows = registrations.map(reg => [
            reg.attendee_name,
            reg.attendee_email,
            reg.attendee_phone || '-',
            getStatusText(reg.status),
            reg.checked_in ? '是' : '否',
            new Date(reg.created_at).toLocaleString('zh-TW'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `registrations_${eventId}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-neutral-900 text-white';
            case 'pending':
                return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
            case 'waitlist':
                return 'bg-neutral-100 text-neutral-500';
            case 'rejected':
                return 'bg-red-50 text-red-600';
            case 'cancelled':
                return 'bg-neutral-50 text-neutral-400';
            default:
                return 'bg-neutral-50 text-neutral-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return '已確認';
            case 'pending':
                return '待審核';
            case 'waitlist':
                return '候補';
            case 'rejected':
                return '已拒絕';
            case 'cancelled':
                return '已取消';
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="text-sm text-neutral-500 font-medium mb-1">總報名數</div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">{total}</div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="text-sm text-neutral-500 font-medium mb-1">已確認</div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                        {registrations.filter(r => r.status === 'confirmed').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="text-sm text-neutral-500 font-medium mb-1">候補名單</div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                        {registrations.filter(r => r.status === 'waitlist').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="text-sm text-neutral-500 font-medium mb-1">已簽到</div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                        {registrations.filter(r => r.checked_in).length}
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="搜尋姓名或 Email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 rounded-xl"
                            />
                        </div>
                        <Button onClick={handleSearch} className="rounded-xl">
                            搜尋
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] rounded-xl">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="狀態篩選" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部狀態</SelectItem>
                                <SelectItem value="confirmed">已確認</SelectItem>
                                <SelectItem value="pending">待審核</SelectItem>
                                <SelectItem value="waitlist">候補</SelectItem>
                                <SelectItem value="cancelled">已取消</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={exportToCSV}
                            className="rounded-xl"
                            disabled={registrations.length === 0}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            導出 CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-[32px] border border-neutral-100 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
                        <p className="text-gray-600">載入中...</p>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-2">📋</div>
                        <p className="text-gray-600">尚無報名資料</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>姓名</TableHead>
                                <TableHead>簽到碼</TableHead>
                                <TableHead>聯絡資訊</TableHead>
                                <TableHead>狀態</TableHead>
                                <TableHead>簽到</TableHead>
                                <TableHead>報名時間</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-medium">
                                        {reg.attendee_name}
                                        {reg.status === 'waitlist' && reg.waitlist_position && (
                                            <span className="ml-2 text-xs text-orange-600">
                                                #{reg.waitlist_position}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs font-mono bg-neutral-50 px-2 py-1 rounded border border-neutral-100">
                                            {reg.checkin_code || '-'}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Mail className="w-3 h-3" />
                                                {reg.attendee_email}
                                            </div>
                                            {reg.attendee_phone && (
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Phone className="w-3 h-3" />
                                                    {reg.attendee_phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                                            {getStatusText(reg.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {reg.checked_in ? (
                                            <CheckCircle className="w-5 h-5 text-neutral-900" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-300" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-neutral-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(reg.created_at).toLocaleDateString('zh-TW')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {!reg.checked_in && reg.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCheckIn(reg.id)}
                                                    className="rounded-lg"
                                                >
                                                    簽到
                                                </Button>
                                            )}
                                            {reg.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleApprove(reg.id)}
                                                        className="rounded-full text-neutral-900 hover:bg-neutral-100"
                                                    >
                                                        批准
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReject(reg.id)}
                                                        className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        拒絕
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
