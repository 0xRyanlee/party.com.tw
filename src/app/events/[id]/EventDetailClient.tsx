'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Event } from '@/lib/mock-data';
import { Calendar, MapPin, Share2, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import RegistrationModal from '@/components/RegistrationModal';
import QuickRegisterButton from '@/components/QuickRegisterButton';
import AuthModal from '@/components/AuthModal';
import StructuredImage from '@/components/common/StructuredImage';
import EventReviews from '@/components/EventReviews';
import ReviewPromptModal from '@/components/ReviewPromptModal';
import { useEffect } from 'react';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import ChatRoom from '@/components/ChatRoom';

interface EventDetailClientProps {
    event: Event;
    isLoggedIn: boolean;
    currentUserId: string;
    initialIsRegistered: boolean;
    rawStartTime: string;
    rawEndTime: string;
}

export default function EventDetailClient({
    event,
    isLoggedIn,
    currentUserId,
    initialIsRegistered,
    rawStartTime,
    rawEndTime
}: EventDetailClientProps) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);
    const [showReviewPrompt, setShowReviewPrompt] = useState(false);

    const handleFollow = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsFollowingLoading(true);
        try {
            const response = await fetch('/api/follows', {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followingId: event.organizer.id }),
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setIsFollowingLoading(false);
        }
    };

    const { history, addToHistory } = useBrowsingHistory();

    const now = new Date();
    const startTime = new Date(rawStartTime);
    const endTime = new Date(rawEndTime);
    const windowStart = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (isLoggedIn && event.organizer.id) {
                try {
                    const response = await fetch(`/api/follows?followingId=${event.organizer.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setIsFollowing(data.following);
                    }
                } catch (error) {
                    console.error('Check follow status error:', error);
                }
            }
        };

        checkFollowStatus();

        // Add to browsing history
        if (event) {
            addToHistory({
                id: event.id,
                title: event.title,
                image: event.image,
                date: event.date,
                location: event.location,
                tags: event.tags,
            });
        }
    }, [isLoggedIn, event.organizer.id, event, addToHistory]);

    // 活動結束後評價提示
    const isEventEnded = now > endTime;
    useEffect(() => {
        // 檢查是否應該顯示評價提示：活動已結束、用戶已登入、已報名、未評價過、未跳過過
        if (isEventEnded && isLoggedIn && isRegistered) {
            const hasSkipped = localStorage.getItem(`review_skipped_${event.id}`);
            const hasReviewed = localStorage.getItem(`review_submitted_${event.id}`);
            if (!hasSkipped && !hasReviewed) {
                // 延遲 1 秒顯示，避免頁面載入時立即彈出
                const timer = setTimeout(() => setShowReviewPrompt(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [isEventEnded, isLoggedIn, isRegistered, event.id]);

    const handleReviewSubmitted = () => {
        localStorage.setItem(`review_submitted_${event.id}`, 'true');
    };

    // Swiss Vibe: Large radii, monochrome palette, high contrast
    return (
        <div className="min-h-screen bg-white pb-24 font-sans">


            {/* Hero Section */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                <StructuredImage
                    src={event.image}
                    alt={event.title}
                    size="hero"
                    aspectRatio="auto"
                    className="absolute inset-0 w-full h-full grayscale-[20%]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

                <div className="absolute top-24 left-4 md:left-8 z-10">
                    <Link href="/events">
                        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white text-black rounded-full shadow-sm backdrop-blur-md">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-6 md:p-10">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-full px-4 py-1.5 text-sm font-medium border-none">
                                    {t(`types.${event.type}` as any)}
                                </Badge>
                                {event.attributes.map(attr => (
                                    <Badge key={attr} variant="outline" className="text-neutral-600 border-neutral-200 rounded-full px-4 py-1.5 text-sm font-medium">
                                        {attr}
                                    </Badge>
                                ))}
                            </div>

                            {/* Enhanced Source/Ref Information */}
                            {event.sourceName && event.sourceUrl && (
                                <div className="flex items-center gap-2 mb-2 p-2 px-4 bg-orange-50 border border-orange-100 rounded-2xl w-fit">
                                    <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                                    <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">自動化同步來源</span>
                                    <span className="text-neutral-300">|</span>
                                    <a
                                        href={event.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-orange-600 hover:text-orange-700 underline flex items-center gap-1"
                                    >
                                        {event.sourceName} 原文鏈接 →
                                    </a>
                                </div>
                            )}

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex items-center gap-4 text-neutral-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> {event.attendees} 人已報名
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="text-3xl font-bold text-neutral-950 tracking-tight">{event.price}</div>
                            {event.capacity && (
                                <div className="text-sm text-neutral-500 font-medium bg-neutral-100 px-3 py-1 rounded-full">
                                    剩餘 {event.capacity - (event.attendees || 0)} 席
                                </div>
                            )}
                            {/* CTA next to price */}
                            <QuickRegisterButton
                                eventId={event.id}
                                eventTitle={event.title}
                                isLoggedIn={isLoggedIn}
                                isAlreadyRegistered={isRegistered}
                                onLoginRequired={() => setIsAuthModalOpen(true)}
                                onSuccess={() => setIsRegistered(true)}
                                size="default"
                                className="hidden md:flex rounded-full px-6"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 mt-6 border-b border-neutral-100 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all shrink-0 ${activeTab === 'info'
                            ? 'border-neutral-900 text-neutral-900'
                            : 'border-transparent text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        活動詳情
                    </button>
                    {((isRegistered && now >= windowStart && now <= windowEnd) ||
                        (isLoggedIn && currentUserId === event.organizer.id)) && (
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'chat'
                                    ? 'border-neutral-900 text-neutral-900'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                                    }`}
                            >
                                Room 303 <span className={`flex h-2 w-2 rounded-full ${now > windowEnd ? 'bg-neutral-400' : 'bg-green-500'}`} />
                            </button>
                        )}
                </div>

                <div className="grid lg:grid-cols-12 gap-8 mt-8">
                    {/* Left Column: Details or Chat */}
                    <div className="lg:col-span-8 space-y-8">
                        {activeTab === 'info' ? (
                            <>
                                {/* Card 1: Basic Info - 基本訊息 */}
                                <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
                                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                                        基本訊息
                                    </h2>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Date & Time */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-neutral-500">時間</p>
                                                <p className="font-semibold text-neutral-900">{event.fullDate}</p>
                                                <p className="text-sm text-neutral-600">{event.time}</p>
                                            </div>
                                        </div>

                                        {/* Capacity */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-neutral-500">人數</p>
                                                <p className="font-semibold text-neutral-900">{event.attendees} 人已報名</p>
                                                {event.capacity && (
                                                    <p className="text-sm text-neutral-600">剩餘 {event.capacity - (event.attendees || 0)} 席</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-3 col-span-2">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-neutral-500">地點</p>
                                                <p className="font-semibold text-neutral-900">{event.location}</p>
                                                <button className="text-xs text-neutral-500 hover:text-neutral-700 font-medium mt-1 underline">
                                                    在地圖上查看
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {event.tags && event.tags.length > 0 && (
                                        <div className="pt-4 border-t border-neutral-100">
                                            <p className="text-sm text-neutral-500 mb-2">標籤</p>
                                            <div className="flex flex-wrap gap-2">
                                                {event.tags.map((tag: string) => (
                                                    <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Conditions/Attributes */}
                                    {event.attributes && event.attributes.length > 0 && (
                                        <div className="pt-4 border-t border-neutral-100">
                                            <p className="text-sm text-neutral-500 mb-2">報名條件</p>
                                            <div className="flex flex-wrap gap-2">
                                                {event.attributes.map((attr: string) => (
                                                    <span key={attr} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                                                        {attr}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card 2: Details - 詳情介紹 */}
                                <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
                                    <h2 className="text-xl font-bold tracking-tight text-neutral-900">詳情介紹</h2>

                                    {/* Description */}
                                    <div className="prose prose-neutral max-w-none text-neutral-600 whitespace-pre-line leading-relaxed">
                                        {event.description}
                                    </div>

                                    {/* Content Images Gallery (max 3 images) */}
                                    {event.content_images && event.content_images.length > 0 && (
                                        <div className="pt-4 border-t border-neutral-100">
                                            <p className="text-sm text-neutral-500 mb-3">活動照片</p>
                                            <div className={`grid gap-3 ${event.content_images.length === 1 ? 'grid-cols-1' :
                                                event.content_images.length === 2 ? 'grid-cols-2' :
                                                    'grid-cols-3'
                                                }`}>
                                                {event.content_images.slice(0, 3).map((img: string, idx: number) => (
                                                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden bg-neutral-100">
                                                        <StructuredImage
                                                            src={img}
                                                            alt={`${event.title} 照片 ${idx + 1}`}
                                                            size="card"
                                                            aspectRatio="auto"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA at the bottom */}
                                    <div className="pt-4 border-t border-neutral-100">
                                        <QuickRegisterButton
                                            eventId={event.id}
                                            eventTitle={event.title}
                                            isLoggedIn={isLoggedIn}
                                            isAlreadyRegistered={isRegistered}
                                            onLoginRequired={() => setIsAuthModalOpen(true)}
                                            onSuccess={() => setIsRegistered(true)}
                                            size="lg"
                                            className="w-full md:w-auto rounded-full px-8"
                                        />
                                    </div>
                                </div>

                                {/* Reviews Section */}
                                <div className="pt-8 border-t border-neutral-100">
                                    <EventReviews
                                        eventId={event.id}
                                        isLoggedIn={isLoggedIn}
                                        canReview={isLoggedIn && isRegistered}
                                    />
                                </div>
                            </>
                        ) : (
                            <ChatRoom
                                eventId={event.id}
                                currentUserId={currentUserId}
                                eventStartTime={rawStartTime}
                                eventEndTime={rawEndTime}
                                isOrganizer={isLoggedIn && currentUserId === event.organizer.id}
                            />
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Organizer Card */}
                        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                            <h3 className="font-bold mb-6 text-xs uppercase tracking-widest text-neutral-400">HOSTED BY</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-14 h-14 rounded-full bg-neutral-200 bg-cover bg-center border border-neutral-100"
                                    style={{ backgroundImage: `url(${event.organizer.avatar})` }}
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <Link href={`/vendor/${event.organizer.id}`} className="hover:underline">
                                            <h4 className="font-bold text-lg text-neutral-900">{event.organizer.name}</h4>
                                        </Link>
                                        {event.organizer.verified && (
                                            <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-500 font-medium">已舉辦 5 場活動</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={isFollowing ? "outline" : "default"}
                                    onClick={handleFollow}
                                    disabled={isFollowingLoading}
                                    className={`flex-1 rounded-full font-bold tracking-tight ${!isFollowing ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-900'
                                        }`}
                                >
                                    {isFollowing ? '已關注' : '關注主辦方'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-full border-neutral-200 hover:bg-neutral-50 font-bold tracking-tight text-neutral-900"
                                    onClick={() => {
                                        if (event.organizer.id) {
                                            window.location.href = `mailto:contact@party.com?subject=Contact Organizer: ${event.organizer.name}`;
                                        }
                                    }}
                                >
                                    聯絡
                                </Button>
                            </div>
                        </div>

                        {/* Ticket Info (Desktop) */}
                        <div className="hidden lg:block bg-neutral-900 p-8 rounded-3xl shadow-xl text-white sticky top-24">
                            <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-6">
                                <span className="text-neutral-400 font-medium">目前的票價</span>
                                <span className="text-3xl font-bold tracking-tight text-white">{event.price}</span>
                            </div>
                            <div className="space-y-4">
                                <QuickRegisterButton
                                    eventId={event.id}
                                    eventTitle={event.title}
                                    isLoggedIn={isLoggedIn}
                                    isAlreadyRegistered={isRegistered}
                                    onLoginRequired={() => setIsAuthModalOpen(true)}
                                    onSuccess={() => setIsRegistered(true)}
                                    size="lg"
                                    className="w-full h-14 text-lg"
                                />
                                <p className="text-xs text-center text-neutral-500 font-medium">
                                    剩餘名額: {event.capacity - (event.attendees || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-neutral-100 lg:hidden z-50 safe-area-bottom pb-8">
                <div className="flex gap-4">
                    <Button variant="outline" size="icon" className="rounded-full w-14 h-14 shrink-0 border-neutral-200 bg-white">
                        <Share2 className="w-5 h-5 text-neutral-900" />
                    </Button>
                    <QuickRegisterButton
                        eventId={event.id}
                        eventTitle={event.title}
                        isLoggedIn={isLoggedIn}
                        isAlreadyRegistered={isRegistered}
                        onLoginRequired={() => setIsAuthModalOpen(true)}
                        onSuccess={() => setIsRegistered(true)}
                        size="lg"
                        className="flex-1 h-14 text-lg"
                    />
                </div>
            </div>

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                eventId={event.id}
                eventTitle={event.title}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Review Prompt Modal - 活動結束後邀請評價 */}
            <ReviewPromptModal
                isOpen={showReviewPrompt}
                onClose={() => setShowReviewPrompt(false)}
                eventId={event.id}
                eventTitle={event.title}
                eventImage={event.image}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </div >
    );
}
