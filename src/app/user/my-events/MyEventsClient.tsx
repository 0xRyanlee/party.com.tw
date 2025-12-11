'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, XCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Registration {
    id: string;
    status: string;
    checked_in: boolean;
    created_at: string;
    event: {
        id: string;
        title: string;
        description_short: string;
        start_time: string;
        end_time: string;
        venue_name: string;
        address: string;
        cover_image: string;
        category: string;
        tags: string[];
        capacity_total: number;
        registered_count: number;
        status: string;
    };
}

export default function MyEventsClient({ registrations }: { registrations: Registration[] }) {
    const router = useRouter();
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const handleCancelRegistration = async (registrationId: string, eventId: string) => {
        if (!confirm('確定要取消報名嗎？')) return;

        setCancellingId(registrationId);
        try {
            const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                alert('取消報名失敗，請稍後再試');
            }
        } catch (error) {
            console.error('Cancel registration error:', error);
            alert('取消報名失敗，請稍後再試');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status: string, checkedIn: boolean) => {
        if (checkedIn) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    已簽到
                </span>
            );
        }

        switch (status) {
            case 'confirmed':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        已確認
                    </span>
                );
            case 'waitlist':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        候補中
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        已取消
                    </span>
                );
            default:
                return null;
        }
    };

    const activeRegistrations = registrations.filter(r => r.status !== 'cancelled');
    const pastRegistrations = registrations.filter(r => r.status === 'cancelled' || new Date(r.event.end_time) < new Date());

    return (
        <>

            <div className="min-h-screen bg-background pt-24 pb-20">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">我的活動</h1>
                        <p className="text-text-secondary">管理您報名的所有活動</p>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">總報名數</div>
                            <div className="text-3xl font-bold">{registrations.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">進行中</div>
                            <div className="text-3xl font-bold text-blue-600">{activeRegistrations.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">已簽到</div>
                            <div className="text-3xl font-bold text-green-600">
                                {registrations.filter(r => r.checked_in).length}
                            </div>
                        </div>
                    </div>

                    {/* Active Events */}
                    {activeRegistrations.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold mb-6">進行中的活動</h2>
                            <div className="space-y-4">
                                {activeRegistrations.map((reg) => (
                                    <div
                                        key={reg.id}
                                        className="bg-white rounded-[16px] border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="md:flex">
                                            {/* Event Image */}
                                            <div
                                                className="h-48 md:h-auto md:w-64 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${reg.event.cover_image})` }}
                                            />

                                            {/* Event Details */}
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <Link
                                                            href={`/events/${reg.event.id}`}
                                                            className="text-xl font-bold hover:text-purple-600 transition-colors"
                                                        >
                                                            {reg.event.title}
                                                        </Link>
                                                        <p className="text-gray-600 mt-2 line-clamp-2">
                                                            {reg.event.description_short}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(reg.status, reg.checked_in)}
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(reg.event.start_time).toLocaleString('zh-TW', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        {reg.event.venue_name || reg.event.address}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Users className="w-4 h-4" />
                                                        {reg.event.registered_count} / {reg.event.capacity_total} 人已報名
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link href={`/events/${reg.event.id}`}>
                                                        <Button variant="outline" className="rounded-full">
                                                            查看詳情
                                                        </Button>
                                                    </Link>
                                                    {reg.status === 'confirmed' && !reg.checked_in && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleCancelRegistration(reg.id, reg.event.id)}
                                                            disabled={cancellingId === reg.id}
                                                            className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            {cancellingId === reg.id ? '取消中...' : '取消報名'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Events */}
                    {pastRegistrations.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">過往活動</h2>
                            <div className="space-y-4">
                                {pastRegistrations.map((reg) => (
                                    <div
                                        key={reg.id}
                                        className="bg-white rounded-[16px] border border-gray-100 overflow-hidden opacity-75"
                                    >
                                        <div className="md:flex">
                                            <div
                                                className="h-32 md:h-auto md:w-48 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${reg.event.cover_image})` }}
                                            />
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-gray-700">{reg.event.title}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {new Date(reg.event.start_time).toLocaleDateString('zh-TW')}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(reg.status, reg.checked_in)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {registrations.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📅</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">還沒有報名任何活動</h3>
                            <p className="text-gray-500 mb-6">探索精彩活動，開始您的社交之旅！</p>
                            <Link href="/events">
                                <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                                    探索活動
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
