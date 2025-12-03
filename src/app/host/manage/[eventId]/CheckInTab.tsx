'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    UserCheck,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Mail,
    Phone
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Registration {
    id: string;
    attendee_name: string;
    attendee_email: string;
    attendee_phone: string;
    status: string;
    checked_in: boolean;
    checked_in_at?: string;
    created_at: string;
}

export default function CheckInTab({ eventId }: { eventId: string }) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [checkingIn, setCheckingIn] = useState<string | null>(null);

    useEffect(() => {
        fetchRegistrations();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchRegistrations, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await fetch(`/api/events/${eventId}/registrations?status=confirmed`);
            const data = await response.json();

            if (response.ok) {
                setRegistrations(data.registrations || []);
            }
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (registrationId: string) => {
        setCheckingIn(registrationId);
        try {
            const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkin' }),
            });

            if (response.ok) {
                // Update local state immediately for better UX
                setRegistrations(prev => prev.map(reg =>
                    reg.id === registrationId
                        ? { ...reg, checked_in: true, checked_in_at: new Date().toISOString() }
                        : reg
                ));
            }
        } catch (error) {
            console.error('Check-in failed:', error);
        } finally {
            setCheckingIn(null);
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            reg.attendee_name.toLowerCase().includes(searchLower) ||
            reg.attendee_email.toLowerCase().includes(searchLower)
        );
    });

    const stats = {
        total: registrations.length,
        checkedIn: registrations.filter(r => r.checked_in).length,
        pending: registrations.filter(r => !r.checked_in).length,
        checkInRate: registrations.length > 0
            ? Math.round((registrations.filter(r => r.checked_in).length / registrations.length) * 100)
            : 0,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[16px] border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">總報名數</span>
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-[16px] border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-700 font-medium">已簽到</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-900">{stats.checkedIn}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-[16px] border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-orange-700 font-medium">待簽到</span>
                        <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-orange-900">{stats.pending}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-[16px] border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-700 font-medium">簽到率</span>
                        <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{stats.checkInRate}%</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-[16px] border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="搜尋姓名或 Email 快速簽到..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 rounded-xl"
                    />
                </div>
            </div>

            {/* Check-in List */}
            <div className="bg-white rounded-[16px] border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
                        <p className="text-gray-600">載入中...</p>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-2">🔍</div>
                        <p className="text-gray-600">
                            {search ? '找不到符合的參與者' : '尚無已確認的報名'}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>參與者</TableHead>
                                <TableHead>聯絡資訊</TableHead>
                                <TableHead>報名時間</TableHead>
                                <TableHead>簽到時間</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.map((reg) => (
                                <TableRow
                                    key={reg.id}
                                    className={reg.checked_in ? 'bg-green-50/50' : ''}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {reg.checked_in ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-300" />
                                            )}
                                            {reg.attendee_name}
                                        </div>
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
                                    <TableCell className="text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(reg.created_at).toLocaleDateString('zh-TW')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {reg.checked_in && reg.checked_in_at ? (
                                            <div className="text-green-700 font-medium">
                                                {new Date(reg.checked_in_at).toLocaleTimeString('zh-TW', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!reg.checked_in && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleCheckIn(reg.id)}
                                                disabled={checkingIn === reg.id}
                                                className="rounded-lg bg-green-600 hover:bg-green-700"
                                            >
                                                {checkingIn === reg.id ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        簽到中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="w-3 h-3 mr-1" />
                                                        簽到
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        {reg.checked_in && (
                                            <span className="text-sm text-green-600 font-medium">
                                                ✓ 已簽到
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Auto-refresh indicator */}
            <div className="text-center text-xs text-gray-500">
                <Clock className="w-3 h-3 inline mr-1" />
                每 10 秒自動更新
            </div>
        </div>
    );
}
