"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Star, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function HeroCarousel() {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            id: "guide",
            type: "guide",
            bgClass: "bg-black",
            content: (
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium w-fit mb-6 backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>The #1 Party App in Taiwan</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                        {t('home.heroTitle')}
                    </h1>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-md">
                        {t('home.heroSubtitle')}
                    </p>
                    <div className="flex items-center gap-4">
                        <Button className="rounded-full h-12 px-8 bg-white text-black hover:bg-gray-200 font-bold text-base transition-all hover:scale-105">
                            {t('home.exploreBtn')}
                        </Button>
                        <Button variant="outline" className="rounded-full h-12 px-6 border-white/20 text-white hover:bg-white/10 hover:text-white font-medium backdrop-blur-sm">
                            How it works
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: "ad",
            type: "ad",
            bgClass: "bg-gradient-to-br from-indigo-900 via-purple-900 to-black",
            content: (
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-medium w-fit mb-6 backdrop-blur-sm border border-yellow-400/20">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>Featured Partner</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                        Uber One
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            Ride in Style
                        </span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-md">
                        Get 50% off your first 3 rides to any event listed on Party Aggregator. Arrive safely and party hard.
                    </p>
                    <Button className="rounded-full h-12 px-8 bg-yellow-400 text-black hover:bg-yellow-500 font-bold text-base transition-all hover:scale-105 border-none">
                        Claim Offer
                    </Button>
                </div>
            )
        },
        {
            id: "hot",
            type: "event",
            bgClass: "bg-gradient-to-br from-rose-900 via-red-900 to-black",
            content: (
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium w-fit mb-6 backdrop-blur-sm border border-rose-500/20">
                        <Info className="w-3 h-3" />
                        <span>Trending Now</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                        Rooftop Jazz
                        <br />
                        <span className="text-rose-500">Night Live</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-md">
                        Experience the best jazz in Taipei with a stunning view of 101. Limited tickets available for this Friday.
                    </p>
                    <div className="flex items-center gap-4">
                        <Button className="rounded-full h-12 px-8 bg-rose-600 text-white hover:bg-rose-700 font-bold text-base transition-all hover:scale-105 border-none">
                            Get Tickets
                        </Button>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-200" />
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] text-white font-medium">
                                +42
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="relative w-full h-[500px] md:h-[400px] rounded-[32px] overflow-hidden mb-12 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 ${slides[currentIndex].bgClass}`}
                >
                    {/* Background Pattern/Image Placeholder */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                    {slides[currentIndex].content}
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-6 left-8 md:left-12 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Buttons (Hidden on mobile, visible on hover) */}
            <div className="absolute bottom-6 right-8 md:right-12 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full w-10 h-10 border-white/20 bg-black/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full w-10 h-10 border-white/20 bg-black/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
