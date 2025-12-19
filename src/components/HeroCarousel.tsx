"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

interface HeroEvent {
    id: string;
    title: string;
    location: string;
    date: string;
    imageUrl?: string;
    tags?: string[];
}

interface HeroBanner {
    id: string;
    title: string;
    imageUrl?: string;
    linkUrl?: string;
}

interface HeroCarouselProps {
    events?: HeroEvent[];
    banners?: HeroBanner[];
}

interface CarouselSlide {
    id: string;
    title: string;
    location?: string;
    date?: string;
    imageUrl?: string;
    tags?: string[];
    linkUrl?: string;
    type: 'event' | 'banner';
}

export default function HeroCarousel({ events, banners }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 混合模式：Banners 優先顯示，然後是活動
    const slides: CarouselSlide[] = useMemo(() => {
        const bannerSlides: CarouselSlide[] = (banners || []).map(b => ({
            id: b.id,
            title: b.title,
            imageUrl: b.imageUrl,
            linkUrl: b.linkUrl,
            type: 'banner' as const,
        }));

        const eventSlides: CarouselSlide[] = (events || []).map(e => ({
            id: e.id,
            title: e.title,
            location: e.location,
            date: e.date,
            imageUrl: e.imageUrl,
            tags: e.tags,
            type: 'event' as const,
        }));

        const combined = [...bannerSlides, ...eventSlides];

        // 如果沒有任何內容，顯示預設
        if (combined.length === 0) {
            return [
                { id: "1", title: "探索城市精彩活動", location: "台北 / 新北", date: "每天更新", tags: ["社交", "工作坊"], type: 'event' as const },
                { id: "2", title: "即將舉辦的熱門活動", location: "全台各地", date: "本週精選", tags: ["音樂", "藝術"], type: 'event' as const },
            ];
        }

        return combined;
    }, [events, banners]);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

    return (
        <div className="relative w-full h-[20vh] min-h-[120px] max-h-[180px] md:h-auto md:aspect-[16/9] lg:aspect-[21/9] rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-8 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
                >
                    {/* Background Image */}
                    {slides[currentIndex].imageUrl && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url(${slides[currentIndex].imageUrl})` }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6 lg:p-10">
                        {/* Tags */}
                        {slides[currentIndex].tags && (
                            <div className="flex flex-wrap gap-1.5 mb-2 md:mb-3">
                                {slides[currentIndex].tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 md:px-3 md:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] md:text-xs text-white"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h2 className="text-lg md:text-2xl lg:text-4xl font-bold text-white mb-1.5 md:mb-3 leading-tight line-clamp-1 md:line-clamp-none">
                            {slides[currentIndex].title}
                        </h2>

                        {/* Meta Info - only for events */}
                        {slides[currentIndex].location && (
                            <div className="hidden md:flex items-center gap-4 text-white/80 text-sm mb-4">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {slides[currentIndex].location}
                                </span>
                                {slides[currentIndex].date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {slides[currentIndex].date}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* CTA Button */}
                        {slides.length > 0 && (
                            <Link
                                href={slides[currentIndex].type === 'banner' && slides[currentIndex].linkUrl
                                    ? slides[currentIndex].linkUrl!
                                    : `/events/${slides[currentIndex].id}`}
                                className="hidden md:inline-block"
                                target={slides[currentIndex].type === 'banner' && slides[currentIndex].linkUrl?.startsWith('http') ? '_blank' : undefined}
                            >
                                <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6">
                                    {slides[currentIndex].type === 'banner' ? '了解更多' : '查看詳情'}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                            ? "w-8 bg-white"
                            : "w-2 bg-white/40 hover:bg-white/60"
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                    onClick={goToPrev}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors pointer-events-auto"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={goToNext}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors pointer-events-auto"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
