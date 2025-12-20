'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PosterGenerator from '@/components/PosterGenerator';
import { Button } from '@/components/ui/button';
import { Palette, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PosterPageContent() {
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(true);

    // Pre-fill from URL params if available
    const eventData = {
        title: searchParams.get('title') || '',
        subtitle: searchParams.get('subtitle') || '',
        venueName: searchParams.get('venue') || '',
        startTime: searchParams.get('date') || '',
    };

    return (
        <>
            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            為您的活動製作精美海報
                        </h2>
                        <p className="text-gray-500">
                            選擇模板、自訂內容，一鍵下載分享
                        </p>
                    </div>

                    {/* Open Generator Button when modal is closed */}
                    {!isOpen && (
                        <div className="flex justify-center">
                            <Button
                                onClick={() => setIsOpen(true)}
                                size="lg"
                                className="rounded-full gap-2 shadow-lg"
                            >
                                <Palette className="w-5 h-5" />
                                開始製作海報
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Poster Generator Modal */}
            <PosterGenerator
                event={eventData}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}

export default function PosterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/host/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        <span>返回</span>
                    </Link>
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        海報生成器
                    </h1>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            }>
                <PosterPageContent />
            </Suspense>
        </div>
    );
}
