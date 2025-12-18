"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Users, Briefcase, Check, X, Mail, Phone, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

type TabType = 'registrations' | 'applications';

interface HostRegistration {
    id: string;
    event_id: string;
    attendee_name: string;
    attendee_email: string;
    status: string;
    checked_in: boolean;
    event?: {
        title: string;
    };
}

interface HostApplication {
    id: string;
    event_id: string;
    status: string;
    message?: string;
    contact_info?: string;
    created_at: string;
    target_role_id?: string;
    target_resource_id?: string;
    event?: {
        title: string;
    };
    applicant?: {
        full_name: string;
        avatar_url?: string;
        email: string;
    };
    role?: {
        role_type: string;
    };
    resource?: {
        resource_type: string;
    };
}


export default function HostManage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('registrations');

    const [registrations, setRegistrations] = useState<HostRegistration[]>([]);
    const [applications, setApplications] = useState<HostApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [regRes, appRes] = await Promise.all([
                fetch('/api/host/registrations'),
                fetch('/api/applications?isHost=true')
            ]);

            if (regRes.ok) {
                const regData = await regRes.json();
                setRegistrations(regData.registrations || []);
            }

            if (appRes.ok) {
                const appData = await appRes.json();
                setApplications(appData.applications || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: '載入失敗',
                description: '請稍後再試',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (applicationId: string) => {
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });

            if (res.ok) {
                toast({ title: '已核准申請' });
                fetchData();
            } else {
                throw new Error('核准失敗');
            }
        } catch (error) {
            toast({ title: '操作失敗', variant: 'destructive' });
        }
    };

    const handleReject = async (applicationId: string) => {
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });

            if (res.ok) {
                toast({ title: '已拒絕申請' });
                fetchData();
            } else {
                throw new Error('拒絕失敗');
            }
        } catch (error) {
            toast({ title: '操作失敗', variant: 'destructive' });
        }
    };

    const handleCheckIn = async (registrationId: string, eventId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkin' })
            });

            if (res.ok) {
                toast({ title: '簽到成功' });
                fetchData();
            } else {
                throw new Error('簽到失敗');
            }
        } catch (error) {
            toast({ title: '簽到失敗', variant: 'destructive' });
        }
    };

    const filteredRegistrations = registrations.filter(r =>
        r.attendee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.attendee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredApplications = applications.filter(a =>
        a.applicant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('host.manage.title')}</h1>
                <Button variant="outline" className="rounded-full gap-2">
                    <Download className="w-4 h-4" /> {t('host.manage.export')}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${activeTab === 'registrations'
                        ? 'border-black text-black font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    活動報名
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all relative ${activeTab === 'applications'
                        ? 'border-black text-black font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Briefcase className="w-4 h-4" />
                    合作申請
                    {applications.filter(a => a.status === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {applications.filter(a => a.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>載入中...</p>
                </div>
            ) : activeTab === 'registrations' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder={t('host.manage.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 rounded-full bg-gray-50 border-transparent focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">活動</th>
                                    <th className="px-6 py-3">姓名 / Email</th>
                                    <th className="px-6 py-3">狀態</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{reg.event?.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{reg.attendee_name}</p>
                                            <p className="text-xs text-gray-500">{reg.attendee_email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${reg.checked_in
                                                ? 'bg-blue-100 text-blue-700'
                                                : reg.status === 'confirmed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {reg.checked_in ? '已簽到' : reg.status === 'confirmed' ? '已報名' : reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!reg.checked_in && reg.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="rounded-full h-8 text-xs"
                                                    onClick={() => handleCheckIn(reg.id, reg.event_id)}
                                                >
                                                    {t('host.manage.checkIn')}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-[24px] border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="font-semibold text-lg">
                                            {application.event?.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${application.target_role_id ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {application.target_role_id ? `🎯 ${application.role?.role_type || '角色'}` : `🤝 ${application.resource?.resource_type || '資源'}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                {application.applicant?.avatar_url ? (
                                                    <img src={application.applicant.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-semibold text-gray-600">
                                                        {application.applicant?.full_name?.[0] || 'U'}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{application.applicant?.full_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    申請 {application.target_role_id ? '合作夥伴' : '提供資源'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {application.message && (
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-gray-700">
                                                {application.message}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <span>{application.applicant?.email || application.contact_info}</span>
                                        </div>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">
                                            {new Date(application.created_at).toLocaleDateString('zh-TW')}
                                        </span>
                                    </div>
                                </div>

                                {application.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleReject(application.id)}
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full border-gray-300 hover:border-red-500 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleApprove(application.id)}
                                            size="icon"
                                            className="rounded-full bg-black hover:bg-gray-800 text-white"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                {application.status !== 'pending' && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${application.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {application.status === 'approved' ? '已核准' : '已拒絕'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredApplications.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            暫無合作申請
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
