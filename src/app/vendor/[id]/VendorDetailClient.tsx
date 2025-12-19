'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StructuredImage from '@/components/common/StructuredImage';
import VendorPortfolio from '@/components/VendorPortfolio';
import {
    Calendar,
    MapPin,
    MessageCircle,
    Share2,
    CheckCircle2,
    Globe,
    Instagram,
    Linkedin,
    ChevronLeft,
    ChevronRight,
    Star,
    Award,
    Users
} from 'lucide-react';
import Link from 'next/link';

interface VendorDetailClientProps {
    vendor: any;
    initialIsFollowing: boolean;
    isLoggedIn: boolean;
    eventCount: number;
    avgRating: number;
    totalReviews: number;
}

export default function VendorDetailClient({ vendor, initialIsFollowing, isLoggedIn, eventCount, avgRating, totalReviews }: VendorDetailClientProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const coverImages = vendor.cover_images && vendor.cover_images.length > 0
        ? vendor.cover_images
        : ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop'];

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % coverImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + coverImages.length) % coverImages.length);

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Immersive Header / Carousel */}
            <div className="relative h-[65vh] w-full overflow-hidden bg-neutral-900">
                <StructuredImage
                    src={coverImages[currentImageIndex]}
                    alt={vendor.display_name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    size="hero"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                {coverImages.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 pointer-events-none">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevImage}
                            className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md w-12 h-12"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextImage}
                            className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md w-12 h-12"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                )}

                {/* Top Actions */}
                <div className="absolute top-6 left-6 flex gap-3">
                    <Link href="/events">
                        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white text-black rounded-full shadow-lg backdrop-blur-md">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                {/* Profile Reveal */}
                <div className="absolute bottom-12 left-0 right-0">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] border-4 border-white overflow-hidden shadow-2xl bg-white">
                                    <StructuredImage
                                        src={vendor.profiles?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + vendor.display_name}
                                        alt={vendor.display_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {vendor.profiles?.role === 'admin' && (
                                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-2xl shadow-lg border-2 border-white">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2 mb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                                        {vendor.display_name}
                                    </h1>
                                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">
                                        Verified Host
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium">
                                    <span className="flex items-center gap-1.5 backdrop-blur-sm bg-black/10 px-3 py-1 rounded-full border border-white/10">
                                        <MapPin className="w-4 h-4" /> {vendor.location_name || 'Taipei, Taiwan'}
                                    </span>
                                    <span className="flex items-center gap-1.5 backdrop-blur-sm bg-black/10 px-3 py-1 rounded-full border border-white/10">
                                        <Award className="w-4 h-4" /> {eventCount}+ 場活動經驗
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-2">
                                <Button className="bg-white text-black hover:bg-neutral-100 rounded-full px-8 h-12 font-bold shadow-xl">
                                    <MessageCircle className="w-5 h-5 mr-2" /> 立即詢價
                                </Button>
                                <Button variant="outline" className="bg-black/20 border-white/30 text-white hover:bg-black/40 rounded-full w-12 h-12 p-0 backdrop-blur-md">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Left Column: Bio & Portfolio */}
                    <div className="lg:col-span-8 space-y-20">
                        {/* Bio / About */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 border-l-4 border-neutral-900 pl-6">
                                關於主辦方
                            </h2>
                            <p className="text-xl text-neutral-600 leading-relaxed font-medium">
                                {vendor.bio || '暫無詳細介紹。這是一位熱衷於打造高品質活動體驗的專業主辦方。'}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                                <div className="bg-neutral-50 p-6 rounded-[24px]">
                                    <div className="text-neutral-400 mb-2">服務類別</div>
                                    <div className="font-bold text-neutral-900">
                                        {vendor.categories?.length > 0 ? vendor.categories.join(', ') : '通用類'}
                                    </div>
                                </div>
                                <div className="bg-neutral-50 p-6 rounded-[24px]">
                                    <div className="text-neutral-400 mb-2">滿意度</div>
                                    <div className="font-bold text-neutral-900 flex items-center gap-1">
                                        {avgRating > 0 ? avgRating.toFixed(1) : '新進'} <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                    </div>
                                </div>
                                <div className="bg-neutral-50 p-6 rounded-[24px]">
                                    <div className="text-neutral-400 mb-2">評論數</div>
                                    <div className="font-bold text-neutral-900">{totalReviews}</div>
                                </div>
                                <div className="bg-neutral-50 p-6 rounded-[24px]">
                                    <div className="text-neutral-400 mb-2">成功合作</div>
                                    <div className="font-bold text-neutral-900">{eventCount}</div>
                                </div>
                            </div>
                        </section>

                        {/* Portfolio Section */}
                        <section>
                            <VendorPortfolio items={vendor.portfolio || []} />
                        </section>

                        {/* Public Reviews (Placeholder Integration) */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-bold tracking-tight text-neutral-900">客戶評價 Review</h2>
                                <Button variant="ghost" className="text-neutral-500 font-bold hover:bg-neutral-50">查看全部 →</Button>
                            </div>
                            <div className="grid gap-6">
                                {/* Sample Review */}
                                <div className="bg-neutral-50 p-8 rounded-[32px] space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-200" />
                                            <div>
                                                <div className="font-bold">Anson Chiu</div>
                                                <div className="text-xs text-neutral-400">2024年3月</div>
                                            </div>
                                        </div>
                                        <div className="flex text-orange-400">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-orange-400" />)}
                                        </div>
                                    </div>
                                    <p className="text-neutral-600 font-medium italic leading-relaxed">
                                        "配合非常愉快，從前期的場勘到現場的執行都非常專業，下次有大型派對一定會再合作。"
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Pricing & Contact */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Service Pricing Card */}
                            <div className="bg-neutral-900 text-white p-8 rounded-[40px] shadow-2xl space-y-8">
                                <div className="space-y-2">
                                    <div className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Pricing Model</div>
                                    <div className="text-4xl font-extrabold tracking-tighter">
                                        {vendor.pricing_min ? `NT$ ${vendor.pricing_min.toLocaleString()} — ${vendor.pricing_max?.toLocaleString() || '∞'}` : '預算面議'}
                                    </div>
                                    <p className="text-xs text-neutral-500 font-medium">基本服務起價，視需求細節調整</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold border-b border-neutral-800 pb-2">精選服務項目</h4>
                                    <ul className="space-y-3">
                                        {vendor.services?.map((s: any, idx: number) => (
                                            <li key={idx} className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm">{s.name}</div>
                                                    <div className="text-xs text-neutral-500">{s.description}</div>
                                                </div>
                                                <div className="text-sm font-bold opacity-80">{s.price || 'Ask'}</div>
                                            </li>
                                        ))}
                                        {(!vendor.services || vendor.services.length === 0) && (
                                            <li className="text-neutral-600 text-sm italic">尚未提供服務清單</li>
                                        )}
                                    </ul>
                                </div>

                                <Button className="w-full h-16 rounded-full bg-white text-black font-extrabold text-lg hover:bg-neutral-100 transition-all">
                                    發出合作邀請
                                </Button>
                            </div>

                            {/* Contact Links */}
                            <div className="bg-white border border-neutral-100 p-8 rounded-[32px] shadow-sm space-y-6">
                                <h4 className="font-bold text-neutral-900">官方連結</h4>
                                <div className="space-y-4">
                                    {vendor.contact_website && (
                                        <a href={vendor.contact_website} target="_blank" className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900 transition-colors">
                                            <Globe className="w-5 h-5 text-neutral-400" />
                                            <span className="font-medium">官方網站</span>
                                        </a>
                                    )}
                                    {vendor.social_instagram && (
                                        <a href={`https://instagram.com/${vendor.social_instagram.replace('@', '')}`} target="_blank" className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900 transition-colors">
                                            <Instagram className="w-5 h-5 text-neutral-400" />
                                            <span className="font-medium">Instagram</span>
                                        </a>
                                    )}
                                    {vendor.social_linkedin && (
                                        <a href={vendor.social_linkedin} target="_blank" className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900 transition-colors">
                                            <Linkedin className="w-5 h-5 text-neutral-400" />
                                            <span className="font-medium">LinkedIn</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
