"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

interface CategoryFilterProps {
    tags: string[];
    activeTag: string;
    onSelectTag: (tag: string) => void;
}

export default function CategoryFilter({ tags, activeTag, onSelectTag }: CategoryFilterProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative group">
            {/* Left Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none md:hidden" />

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 px-4 sm:px-0 scrollbar-hide -mx-4 sm:mx-0"
            >
                <button
                    onClick={() => onSelectTag('All')}
                    className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95",
                        activeTag === 'All'
                            ? "bg-black text-white shadow-md"
                            : "bg-white text-zinc-600 border border-gray-200 hover:bg-gray-50"
                    )}
                >
                    全部
                </button>

                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => onSelectTag(tag)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95",
                            activeTag === tag
                                ? "bg-black text-white shadow-md"
                                : "bg-white text-zinc-600 border border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        #{tag}
                    </button>
                ))}
            </div>

            {/* Right Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none md:hidden" />
        </div>
    );
}
