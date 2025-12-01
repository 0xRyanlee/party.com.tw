'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types/schema';

export default function MyApplicationsPage() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 加載申請列表
    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            const url = filter === 'all'
                ? '/api/applications'
                : `/api/applications?status=${filter}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            setApplications(data.applications || []);
        } catch (err: any) {
            console.error('Error fetching applications:', err);
            setError(err.message || '加載申請失敗');
        } finally {
            setLoading(false);
        }
    };

    const getStatusCount = (status: ApplicationStatus | 'all'): number => {
        if (status === 'all') return applications.length;
        return applications.filter((app: any) => app.status === status).length;
    };

    const getStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        <Clock className="w-3 h-3" />
                        {t('applications.pending')}
                    </span>
                );
            case 'approved':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        {t('applications.approved')}
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <XCircle className="w-3 h-3" />
                        {t('applications.rejected')}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold mb-1">{t('applications.title')}</h1>
                    <p className="text-sm text-gray-500">{t('applications.subtitle')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                        {[
                            { key: 'all', label: t('applications.all') },
                            { key: 'pending', label: t('applications.pending') },
                            { key: 'approved', label: t('applications.approved') },
                            { key: 'rejected', label: t('applications.rejected') },
                        ].map((tab) => {
                            const isActive = filter === tab.key;
                            const count = getStatusCount(tab.key as ApplicationStatus | 'all');
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key as ApplicationStatus | 'all')}
                                    className={`flex items-center gap-2 py-4 border-b-2 transition-all whitespace-nowrap ${isActive
                                            ? 'border-black text-black font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${isActive
                                                ? 'bg-black text-white'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Applications List */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-4">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-3" />
                            <p className="text-gray-500">{t('applications.loading') || '載入中...'}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-700 mb-3">{error}</p>
                            <Button
                                onClick={fetchApplications}
                                variant="outline"
                                className="rounded-full"
                            >
                                重試
                            </Button>
                        </div>
                    )}

                    {/* Applications */}
                    {!loading && !error && applications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-[24px] border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">
                                        {application.event?.title || '活動名稱'}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span>
                                            {application.target_role_id
                                                ? `${t('applications.role')}: ${application.role?.role_type || '角色'}`
                                                : `${t('applications.resource')}: ${application.resource?.resource_type || '資源'}`}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {t('applications.eventDate')}: {
                                                application.event?.start_time
                                                    ? new Date(application.event.start_time).toLocaleDateString('zh-TW')
                                                    : 'N/A'
                                            }
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(application.status)}
                            </div>

                            {/* Message */}
                            {application.message && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        申請訊息
                                    </p>
                                    <p className="text-sm text-gray-600">{application.message}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                    {t('applications.appliedAt')}:{' '}
                                    {new Date(application.created_at).toLocaleDateString('zh-TW', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    {t('applications.viewEvent')}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {!loading && !error && applications.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                {filter !== 'all' ? t('applications.noFilteredApplications') : t('applications.noApplications')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {filter === 'all'
                                    ? t('applications.noApplicationsDesc')
                                    : t('applications.noFilteredApplications')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
