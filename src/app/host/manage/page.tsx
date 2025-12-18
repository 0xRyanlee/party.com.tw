"use client";

import { useState } from 'react';
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Users, Briefcase, Check, X, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

type TabType = 'registrations' | 'applications';

// Mock data for applications
const mockApplications = [
    {
        id: '1',
        eventTitle: 'Summer Music Festival',
        applicant: {
            name: 'John Doe',
            avatar: null,
            vendorId: 'vendor-123', // 關聯的 Vendor ID
        },
        type: 'role' as const,
        roleType: 'Photographer',
        message: '我有5年活動攝影經驗，擅長捕捉現場氛圍和精彩瞬間。',
        contactInfo: 'john@example.com',
        status: 'pending' as const,
        appliedAt: '2024-11-28',
    },
    {
        id: '2',
        eventTitle: 'Tech Meetup #42',
        applicant: {
            name: 'Jane Smith',
            avatar: null,
            vendorId: 'vendor-456', // 關聯的 Vendor ID
        },
        type: 'resource' as const,
        resourceType: 'Venue',
        message: '我們可以提供100人的共享空間，包含投影設備和音響。',
        contactInfo: '+886 912-345-678',
        status: 'pending' as const,
        appliedAt: '2024-11-27',
    },
];

export default function HostManage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('registrations');

    const handleApprove = (applicationId: string) => {
        // TODO: Implement API call
        void applicationId;
    };

    const handleReject = (applicationId: string) => {
        // TODO: Implement API call
        void applicationId;
    };

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
                    {mockApplications.filter(a => a.status === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {mockApplications.filter(a => a.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'registrations' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder={t('host.manage.searchPlaceholder')}
                                className="pl-9 rounded-full bg-gray-50 border-transparent focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Ticket Type</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium">Guest User {i}</td>
                                        <td className="px-6 py-4">Early Bird</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Paid</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="secondary" className="rounded-full h-8 text-xs">
                                                {t('host.manage.checkIn')}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {mockApplications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-[24px] border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    {/* Event & Type Badge */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="font-semibold text-lg">
                                            {application.eventTitle}
                                        </h3>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            {application.type === 'role' ? '🎯 角色' : '🤝 資源'}
                                        </span>
                                    </div>


                                    {/* Applicant Info */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="font-semibold text-gray-600">
                                                    {application.applicant.name[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{application.applicant.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    申請 {application.type === 'role' ? application.roleType : application.resourceType}
                                                </p>
                                            </div>
                                        </div>
                                        {/* 查看合作方頁面入口 */}
                                        {application.applicant.vendorId && (
                                            <Link
                                                href={`/vendor/${application.applicant.vendorId}`}
                                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                查看頁面
                                            </Link>
                                        )}
                                    </div>

                                    {/* Message */}
                                    {application.message && (
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-gray-700">
                                                {application.message}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contact Info */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            {application.contactInfo.includes('@') ? (
                                                <Mail className="w-4 h-4" />
                                            ) : (
                                                <Phone className="w-4 h-4" />
                                            )}
                                            <span>{application.contactInfo}</span>
                                        </div>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">
                                            {new Date(application.appliedAt).toLocaleDateString('zh-TW')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
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
                            </div>
                        </div>
                    ))}

                    {mockApplications.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            暫無合作申請
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
